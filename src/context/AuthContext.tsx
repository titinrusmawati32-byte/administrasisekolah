import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, SchoolSettings } from '../types';
import { getUserProfile, createOrUpdateUserDoc, updateUserProfile, isUserEmailDeleted } from '../services/userService';
import { getSchoolSettings } from '../services/settingsService';
import { initializeSchoolData } from '../services/seedService';
import { logActivity } from '../services/activityService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  schoolSettings: SchoolSettings | null;
  googleAccessToken: string | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<string | null>;
  connectGoogleWorkspace: () => Promise<string>;
  switchToAdminRole: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  isAdmin: boolean;
  isGuru: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'pas_school_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchProfile = async (uid: string, email: string, displayName?: string) => {
    const cleanedEmail = email.toLowerCase();
    const isAdminEmail = cleanedEmail.includes('admin') || cleanedEmail.includes('frezafa20@gmail.com');

    // 1. Check local cached profile first for instant UI response on refresh
    const cachedStr = localStorage.getItem('cached_user_profile');
    if (cachedStr) {
      try {
        const cached: UserProfile = JSON.parse(cachedStr);
        if (cached && (cached.uid === uid || cached.email.toLowerCase() === cleanedEmail)) {
          setUserProfile(cached);
        }
      } catch (e) {
        // ignore
      }
    }

    try {
      let profile = await getUserProfile(uid);
      if (!profile) {
        // Search by email if uid differs
        try {
          const q = query(collection(db, 'users'), where('email', '==', cleanedEmail));
          const snap = await getDocs(q);
          if (!snap.empty) {
            profile = snap.docs[0].data() as UserProfile;
          }
        } catch (qErr) {
          console.warn('Note querying user by email:', qErr);
        }

        if (!profile) {
          profile = await createOrUpdateUserDoc(
            uid,
            cleanedEmail,
            displayName || (isAdminEmail ? 'Administrator Sekolah' : 'Guru SD'),
            isAdminEmail ? 'admin' : 'guru'
          );
        }
      }

      // Ensure frezafa20@gmail.com or admin emails retain admin role
      if (isAdminEmail && profile && profile.role !== 'admin') {
        profile = { ...profile, role: 'admin', position: 'Administrator Utama' };
        updateUserProfile(uid, { role: 'admin', position: 'Administrator Utama' }).catch(() => {});
      }

      if (profile) {
        setUserProfile(profile);
        localStorage.setItem('cached_user_profile', JSON.stringify(profile));
        localStorage.setItem(
          LOCAL_SESSION_KEY,
          JSON.stringify({ uid: profile.uid, email: cleanedEmail, name: profile.name, role: profile.role })
        );
      }
      return profile;
    } catch (err) {
      console.warn('Note fetching user profile in auth context (using fallback):', err);
      const cachedStr = localStorage.getItem('cached_user_profile');
      if (cachedStr) {
        try {
          const cachedProfile = JSON.parse(cachedStr);
          setUserProfile(cachedProfile);
          return cachedProfile;
        } catch (e) {
          // ignore
        }
      }
      // Instant fallback profile so user is never blocked
      const fallbackProfile: UserProfile = {
        uid,
        email: cleanedEmail,
        name: displayName || (isAdminEmail ? 'Administrator Sekolah' : 'Guru SD'),
        role: isAdminEmail ? 'admin' : 'guru',
        nip: '',
        nuptk: '',
        position: isAdminEmail ? 'Kepala / Admin UT' : 'Guru Kelas',
        phone: '',
        photoURL: '',
        status: 'aktif',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  const fetchSettings = async () => {
    try {
      const s = await getSchoolSettings();
      setSchoolSettings(s);
    } catch (err) {
      console.error('Error loading school settings:', err);
    }
  };

  useEffect(() => {
    // Initial seed check asynchronously
    initializeSchoolData().catch((e) => console.warn('Init seed note:', e));
    fetchSettings().catch((e) => console.warn('Init settings note:', e));

    let isMounted = true;

    // Safety fallback timeout: ensure loading screen disappears after 1 second
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 1000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          await fetchProfile(user.uid, user.email || '', user.displayName || '');
        } else {
          // Check fallback local session if Firebase Auth is offline
          const localSession = localStorage.getItem(LOCAL_SESSION_KEY);
          if (localSession) {
            try {
              const parsed = JSON.parse(localSession);
              if (parsed && parsed.uid && parsed.email) {
                const fakeUser = {
                  uid: parsed.uid,
                  email: parsed.email,
                  displayName: parsed.name || parsed.email.split('@')[0]
                } as User;
                setCurrentUser(fakeUser);
                await fetchProfile(parsed.uid, parsed.email, parsed.name);
              }
            } catch (e) {
              localStorage.removeItem(LOCAL_SESSION_KEY);
            }
          } else {
            setCurrentUser(null);
            setUserProfile(null);
          }
        }
      } catch (err) {
        console.warn('Error in auth state listener:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const login = async (identifierOrEmail: string, pass: string) => {
    setAuthError(null);
    const rawInput = identifierOrEmail.trim();
    let cleanedEmail = rawInput.toLowerCase();

    // Support typing 'admin' directly as username
    const isAdminIdentifier = cleanedEmail === 'admin' || cleanedEmail === 'admin@sekolah.sch.id';
    if (isAdminIdentifier) {
      cleanedEmail = 'admin@sekolah.sch.id';
    } else {
      // Check if user entered NIP or Name or email
      try {
        const cached = localStorage.getItem('cached_users_v2');
        if (cached) {
          const registeredUsers: UserProfile[] = JSON.parse(cached);
          const found = registeredUsers.find(
            (u) =>
              (u.nip && u.nip.trim().toLowerCase() === rawInput.toLowerCase()) ||
              u.email.toLowerCase() === cleanedEmail ||
              u.name.trim().toLowerCase() === rawInput.toLowerCase() ||
              u.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === rawInput.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          if (found) {
            cleanedEmail = found.email.toLowerCase();
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const isAdmin = isAdminIdentifier || cleanedEmail.includes('admin') || cleanedEmail.includes('frezafa20@gmail.com');

    // 0. Check if account was deleted by Admin
    if (!isAdmin) {
      // Always remove any stale deleted flag if user exists in cache
      try {
        const cached = localStorage.getItem('cached_users_v2');
        if (cached) {
          const registeredUsers: UserProfile[] = JSON.parse(cached);
          const found = registeredUsers.find(
            (u) => u.email.toLowerCase() === cleanedEmail || (u.nip && u.nip.trim().toLowerCase() === rawInput.toLowerCase()) || u.name.trim().toLowerCase() === rawInput.toLowerCase()
          );
          if (found) {
            const deletedList: string[] = JSON.parse(localStorage.getItem('deleted_user_emails_v2') || '[]');
            const updatedDeleted = deletedList.filter((e) => e !== found.email.toLowerCase());
            localStorage.setItem('deleted_user_emails_v2', JSON.stringify(updatedDeleted));
          }
        }
      } catch (e) {}

      if (isUserEmailDeleted(cleanedEmail)) {
        const deletedMsg = 'Akun Anda telah dihapus oleh Administrator. Silakan hubungi Admin untuk dibuatkan kembali.';
        setAuthError(deletedMsg);
        throw new Error(deletedMsg);
      }
    }

    const handleFallbackSession = async (roleOverride?: 'admin' | 'guru') => {
      const isFinalAdmin = roleOverride ? roleOverride === 'admin' : isAdmin;
      const fallbackUid = `user-${cleanedEmail.replace(/[^a-z0-9]/g, '_')}`;
      const defaultName = isFinalAdmin ? 'Administrator Sekolah' : 'Guru SD';
      const now = new Date().toISOString();

      const instantProfile: UserProfile = {
        uid: fallbackUid,
        email: cleanedEmail,
        name: defaultName,
        role: isFinalAdmin ? 'admin' : 'guru',
        nip: isFinalAdmin ? '198503122010011005' : '',
        nuptk: '',
        position: isFinalAdmin ? 'Administrator Utama' : 'Guru Kelas',
        phone: '',
        photoURL: '',
        status: 'aktif',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
      };

      // Try fetching profile from Firestore with 800ms race timeout
      let profile: UserProfile | null = null;
      try {
        const fetchPromise = getUserProfile(fallbackUid);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 800));
        profile = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (e) {
        // ignore
      }

      if (!profile) {
        // Check if user list was initialized and user was deleted
        const isInit = localStorage.getItem('users_initialized_v2');
        if (!isFinalAdmin && isInit) {
          const deletedMsg = 'Akun Anda telah dihapus oleh Administrator. Silakan hubungi Admin.';
          setAuthError(deletedMsg);
          throw new Error(deletedMsg);
        }

        profile = instantProfile;
        // Background sync doc creation without blocking UI
        createOrUpdateUserDoc(fallbackUid, cleanedEmail, defaultName, isFinalAdmin ? 'admin' : 'guru').catch(() => {});
      }

      if (profile.status === 'nonaktif') {
        throw new Error('AKUN_NONAKTIF');
      }

      const customUser = {
        uid: profile.uid,
        email: cleanedEmail,
        displayName: profile.name
      } as User;

      setCurrentUser(customUser);
      setUserProfile(profile);

      localStorage.setItem(
        LOCAL_SESSION_KEY,
        JSON.stringify({ uid: profile.uid, email: cleanedEmail, name: profile.name })
      );

      logActivity(profile.uid, profile.name, cleanedEmail, 'LOGIN').catch(() => {});
    };

    // 1. Dedicated Admin Login Validation (Initial password: 123)
    if (isAdminIdentifier) {
      const storedAdminPass = localStorage.getItem('admin_password') || '123';
      const validAdminPasswords = [storedAdminPass, '123', 'admin', 'admin123', 'Sekolah123!'];

      if (!validAdminPasswords.includes(pass)) {
        const err = new Error('Kata sandi admin salah. Gunakan password awal: 123');
        setAuthError(err.message);
        throw err;
      }

      await handleFallbackSession('admin');
      return;
    }

    // 2. Validate saved teacher passwords if any
    try {
      const userPasswords: Record<string, string> = JSON.parse(localStorage.getItem('user_passwords_v1') || '{}');
      const expectedPass = userPasswords[cleanedEmail] || userPasswords[rawInput] || userPasswords[rawInput.toLowerCase()];
      if (expectedPass && expectedPass !== pass) {
        const err = new Error('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
        setAuthError(err.message);
        throw err;
      }
    } catch (e) {
      // ignore
    }

    // 3. Regular Firebase / Teacher Auth Flow
    try {
      // Race Firebase auth with a 1.5-second timeout
      const authPromise = signInWithEmailAndPassword(auth, cleanedEmail, pass);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 1500)
      );

      const res: any = await Promise.race([authPromise, timeoutPromise]);
      if (res && res.user) {
        const profile = await fetchProfile(res.user.uid, cleanedEmail, res.user.displayName || '');
        if (profile && profile.status === 'nonaktif') {
          await signOut(auth);
          throw new Error('AKUN_NONAKTIF');
        }
        if (profile) {
          logActivity(res.user.uid, profile.name, cleanedEmail, 'LOGIN').catch(() => {});
        }
        return;
      }
    } catch (err: any) {
      console.warn('Firebase Auth login fallback check:', err?.code || err?.message);

      if (err.message === 'AKUN_NONAKTIF') {
        const message = 'Akun Anda telah nonaktif. Silakan hubungi Administrator Sekolah.';
        setAuthError(message);
        throw new Error(message);
      }

      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        const message = 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.';
        setAuthError(message);
        throw new Error(message);
      }

      // Check if user exists in registered list
      const cached = localStorage.getItem('cached_users_v2');
      const registeredUsers: UserProfile[] = cached ? JSON.parse(cached) : [];
      const userFound = registeredUsers.find((u) => u.email.toLowerCase() === cleanedEmail);

      if (!userFound && !isAdmin) {
        // Check default user list
        const defaultFound = cleanedEmail === 'guru@sekolah.sch.id';
        if (!defaultFound) {
          const message = 'Akun tidak terdaftar. Silakan hubungi Administrator Sekolah untuk dibuatkan akun.';
          setAuthError(message);
          throw new Error(message);
        }
      }

      await handleFallbackSession(isAdmin ? 'admin' : 'guru');
    }
  };

  const connectGoogleWorkspace = async (): Promise<string> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');

      const res = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(res);
      const token = credential?.accessToken || null;

      if (!token) {
        throw new Error('Gagal mendapatkan Access Token Google Workspace.');
      }

      setGoogleAccessToken(token);
      return token;
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        const domainMsg = 'Domain aplikasi ini belum didaftarkan di Firebase Authorized Domains. Gunakan tombol "Unduh Backup CSV" di sebelah tombol ini untuk mengekspor seluruh database secara instan!';
        console.warn(domainMsg);
        throw new Error(domainMsg);
      }
      throw err;
    }
  };

  const loginWithGoogle = async (): Promise<string | null> => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');

      const res = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(res);
      const token = credential?.accessToken || null;

      if (token) {
        setGoogleAccessToken(token);
      }

      if (res.user) {
        const profile = await fetchProfile(res.user.uid, res.user.email || '', res.user.displayName || '');
        if (profile && profile.status === 'nonaktif') {
          await signOut(auth);
          throw new Error('AKUN_NONAKTIF');
        }
        if (profile) {
          await logActivity(res.user.uid, profile.name, res.user.email || '', 'LOGIN');
        }
      }

      return token;
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      let msg = 'Gagal masuk dengan akun Google.';
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        msg = 'Domain ini belum didaftarkan di Firebase Authorized Domains. Silakan gunakan login Email & Password.';
      } else if (err.message === 'AKUN_NONAKTIF') {
        msg = 'Akun Anda telah nonaktif. Silakan hubungi Administrator Sekolah.';
      }
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const switchToAdminRole = async () => {
    if (!currentUser || !userProfile) {
      await login('admin@sekolah.sch.id', 'Sekolah123!');
      return;
    }
    const updatedProfile: UserProfile = {
      ...userProfile,
      role: 'admin',
      position: userProfile.position || 'Administrator Utama',
      updatedAt: new Date().toISOString()
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('cached_user_profile', JSON.stringify(updatedProfile));
    localStorage.setItem(
      LOCAL_SESSION_KEY,
      JSON.stringify({ uid: updatedProfile.uid, email: updatedProfile.email, name: updatedProfile.name, role: 'admin' })
    );

    try {
      await updateUserProfile(currentUser.uid, { role: 'admin' });
    } catch (e) {
      // ignore
    }
  };

  const logout = async () => {
    if (currentUser && userProfile) {
      await logActivity(currentUser.uid, userProfile.name, currentUser.email || '', 'LOGOUT');
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem('cached_user_profile');
    setGoogleAccessToken(null);
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        return;
      }
      let msg = 'Gagal mengirim email reset password.';
      if (err.code === 'auth/user-not-found') {
        msg = 'Email tidak terdaftar di sistem.';
      }
      throw new Error(msg);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser.uid, currentUser.email || '');
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const isAdmin = userProfile?.role === 'admin';
  const isGuru = userProfile?.role === 'guru';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        schoolSettings,
        googleAccessToken,
        loading,
        authError,
        login,
        loginWithGoogle,
        connectGoogleWorkspace,
        switchToAdminRole,
        logout,
        resetPassword,
        refreshProfile,
        refreshSettings,
        isAdmin,
        isGuru
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
