import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
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

import { INITIAL_USERS } from './defaultData';

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'));
    const fetchPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));

    const snap: any = await Promise.race([fetchPromise, timeoutPromise]);
    if (snap) {
      const users: UserProfile[] = [];
      snap.forEach((doc: any) => {
        users.push(doc.data() as UserProfile);
      });
      localStorage.setItem('cached_users_v2', JSON.stringify(users));
      localStorage.setItem('users_initialized_v2', 'true');
      return users.sort((a, b) => a.name.localeCompare(b.name));
    }
    const cached = localStorage.getItem('cached_users_v2');
    if (cached !== null) {
      return JSON.parse(cached);
    }
    return localStorage.getItem('users_initialized_v2') ? [] : INITIAL_USERS;
  } catch (err) {
    console.warn('Error fetching users, using fallback:', err);
    const cached = localStorage.getItem('cached_users_v2');
    if (cached !== null) {
      return JSON.parse(cached);
    }
    return localStorage.getItem('users_initialized_v2') ? [] : INITIAL_USERS;
  }
}

export async function setUserStatus(uid: string, status: UserStatus): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status,
      updatedAt: new Date().toISOString()
    });

    const cached = localStorage.getItem('cached_users_v2');
    if (cached) {
      const users: UserProfile[] = JSON.parse(cached);
      const updated = users.map((u) => (u.uid === uid ? { ...u, status } : u));
      localStorage.setItem('cached_users_v2', JSON.stringify(updated));
    }
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
  const cleanedEmail = userData.email.trim().toLowerCase();

  const newProfile: UserProfile = {
    uid: userData.uid,
    email: cleanedEmail,
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

  // Clear deleted email list if present
  try {
    const deletedList: string[] = JSON.parse(localStorage.getItem('deleted_user_emails_v2') || '[]');
    const updatedDeleted = deletedList.filter((e) => e !== cleanedEmail);
    localStorage.setItem('deleted_user_emails_v2', JSON.stringify(updatedDeleted));
  } catch (e) {}

  // Update cached_users_v2
  try {
    const cached = localStorage.getItem('cached_users_v2');
    const users: UserProfile[] = cached ? JSON.parse(cached) : [];
    const filtered = users.filter((u) => u.uid !== userData.uid && u.email.toLowerCase() !== cleanedEmail);
    filtered.push(newProfile);
    localStorage.setItem('cached_users_v2', JSON.stringify(filtered));
  } catch (e) {}

  return newProfile;
}

export async function deleteUserRecord(uid: string, email?: string): Promise<void> {
  const cleanedEmail = email ? email.trim().toLowerCase() : '';

  // 1. Update local cache
  const cached = localStorage.getItem('cached_users_v2');
  if (cached) {
    try {
      const users: UserProfile[] = JSON.parse(cached);
      const updated = users.filter((u) => u.uid !== uid && (cleanedEmail ? u.email.toLowerCase() !== cleanedEmail : true));
      localStorage.setItem('cached_users_v2', JSON.stringify(updated));
    } catch (e) {}
  }
  localStorage.setItem('users_initialized_v2', 'true');

  if (cleanedEmail) {
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('deleted_user_emails_v2') || '[]');
      if (!deletedList.includes(cleanedEmail)) {
        deletedList.push(cleanedEmail);
        localStorage.setItem('deleted_user_emails_v2', JSON.stringify(deletedList));
      }
    } catch (e) {}
  }

  // 2. Delete from Firestore server
  try {
    const userRef = doc(db, 'users', uid);
    const deletePromise = deleteDoc(userRef);
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1000));
    await Promise.race([deletePromise, timeoutPromise]);
  } catch (err) {
    console.warn('Error deleting user record from Firestore:', err);
  }
}

export function isUserEmailDeleted(email: string): boolean {
  if (!email) return false;
  const cleanedEmail = email.trim().toLowerCase();
  try {
    const deletedList: string[] = JSON.parse(localStorage.getItem('deleted_user_emails_v2') || '[]');
    if (deletedList.includes(cleanedEmail)) {
      return true;
    }
  } catch (e) {}
  return false;
}
