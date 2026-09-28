import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Announcement } from '../types';

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const announcements: Announcement[] = [];
    snap.forEach((d) => {
      announcements.push(d.data() as Announcement);
    });
    return announcements;
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return [];
  }
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const all = await getAnnouncements();
  return all.filter((a) => a.status === 'active');
}

export async function createAnnouncement(
  title: string,
  content: string,
  userId: string,
  userName: string
): Promise<Announcement> {
  const announcementId = `ann-${Date.now()}`;
  const newAnn: Announcement = {
    announcementId,
    title,
    content,
    createdBy: userId,
    createdByName: userName,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  await setDoc(doc(db, 'announcements', announcementId), newAnn);
  return newAnn;
}

export async function updateAnnouncementStatus(announcementId: string, status: 'active' | 'archived'): Promise<void> {
  await updateDoc(doc(db, 'announcements', announcementId), { status });
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await deleteDoc(doc(db, 'announcements', announcementId));
}
