import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { ActivityLog } from '../types';

export async function logActivity(
  userId: string,
  userName: string,
  userEmail: string,
  action: ActivityLog['action'],
  documentId?: string,
  documentName?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const activityId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const logData: ActivityLog = {
      activityId,
      userId,
      userName: userName || 'Pengguna',
      userEmail: userEmail || '',
      action,
      documentId: documentId || '',
      documentName: documentName || '',
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    await addDoc(collection(db, 'activityLogs'), logData);
  } catch (err) {
    console.error('Failed to record activity log:', err);
  }
}

export async function getActivityLogs(maxRecords = 200): Promise<ActivityLog[]> {
  try {
    const q = query(
      collection(db, 'activityLogs'),
      orderBy('timestamp', 'desc'),
      limit(maxRecords)
    );
    const fetchPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));

    const snap: any = await Promise.race([fetchPromise, timeoutPromise]);
    if (snap) {
      const logs: ActivityLog[] = [];
      snap.forEach((doc: any) => {
        logs.push(doc.data() as ActivityLog);
      });
      return logs;
    }
    return [];
  } catch (err) {
    console.warn('Error getting activity logs, returning empty fallback:', err);
    return [];
  }
}

export function exportActivityLogsToCSV(logs: ActivityLog[]): void {
  const headers = ['Waktu', 'Pengguna', 'Email', 'Aksi', 'ID Dokumen', 'Nama Dokumen'];
  const rows = logs.map(l => [
    new Date(l.timestamp).toLocaleString('id-ID'),
    `"${l.userName.replace(/"/g, '""')}"`,
    `"${l.userEmail.replace(/"/g, '""')}"`,
    l.action,
    l.documentId || '-',
    `"${(l.documentName || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Aktivitas_Sistem_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
