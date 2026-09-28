import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SchoolSettings } from '../types';
import { DEFAULT_SCHOOL_SETTINGS } from './seedService';

export async function getSchoolSettings(): Promise<SchoolSettings> {
  try {
    const schoolRef = doc(db, 'settings', 'school');
    const snap = await getDoc(schoolRef);
    if (snap.exists()) {
      return snap.data() as SchoolSettings;
    } else {
      try {
        await setDoc(schoolRef, DEFAULT_SCHOOL_SETTINGS);
      } catch (e) {
        // ignore offline write error
      }
      return DEFAULT_SCHOOL_SETTINGS;
    }
  } catch (err: any) {
    console.warn('Using default school settings due to network/offline state:', err?.message || err);
    return DEFAULT_SCHOOL_SETTINGS;
  }
}

export async function updateSchoolSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
  const schoolRef = doc(db, 'settings', 'school');
  const current = await getSchoolSettings();
  const updated: SchoolSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(schoolRef, updated, { merge: true });
  } catch (e) {
    console.warn('Offline update saved locally:', e);
  }
  return updated;
}
