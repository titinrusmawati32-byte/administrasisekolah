import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserRole, UserStatus } from '../types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err: any) {
    console.warn('Note getting user profile in offline mode:', err?.message || err);
    return null;
  }
}

export async function createOrUpdateUserDoc(
  uid: string,
  email: string,
  name: string,
  role: UserRole = 'guru'
): Promise<UserProfile> {
  const isAdminEmail = email.toLowerCase().includes('admin') || email.toLowerCase().includes('frezafa20@gmail.com');
  const finalRole: UserRole = isAdminEmail ? 'admin' : role;
  const now = new Date().toISOString();

  const fallbackProfile: UserProfile = {
    uid,
    email,
    name: name || (finalRole === 'admin' ? 'Administrator Sekolah' : 'Guru SD'),
    role: finalRole,
    nip: '',
    nuptk: '',
    position: finalRole === 'admin' ? 'Kepala / Admin UT' : 'Guru Kelas',
    phone: '',
    photoURL: '',
    status: 'aktif',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now
  };

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      try {
        await setDoc(userRef, fallbackProfile);
      } catch (wErr) {
        console.warn('Set user profile offline warning:', wErr);
      }
      return fallbackProfile;
    } else {
      try {
        await updateDoc(userRef, {
          lastLoginAt: now,
          updatedAt: now
        });
      } catch (uErr) {
        console.warn('Update user profile offline warning:', uErr);
      }
      return snap.data() as UserProfile;
    }
  } catch (err: any) {
    console.warn('Using fallback user profile during offline/pending network connection:', err?.message || err);
    return fallbackProfile;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not update profile online, saved locally:', err);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'));
    const snap = await getDocs(q);
    const users: UserProfile[] = [];
    snap.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    return users.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.warn('Error fetching users:', err);
    return [];
  }
}

export async function setUserStatus(uid: string, status: UserStatus): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error updating user status:', err);
  }
}

export async function createTeacherUser(userData: {
  uid: string;
  name: string;
  email: string;
  nip?: string;
  nuptk?: string;
  position?: string;
  phone?: string;
  role?: UserRole;
}): Promise<UserProfile> {
  const userRef = doc(db, 'users', userData.uid);
  const now = new Date().toISOString();

  const newProfile: UserProfile = {
    uid: userData.uid,
    email: userData.email,
    name: userData.name,
    role: userData.role || 'guru',
    nip: userData.nip || '',
    nuptk: userData.nuptk || '',
    position: userData.position || 'Guru Kelas',
    phone: userData.phone || '',
    photoURL: '',
    status: 'aktif',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now
  };

  try {
    await setDoc(userRef, newProfile);
  } catch (err) {
    console.warn('Offline create teacher user saved locally:', err);
  }
  return newProfile;
}
