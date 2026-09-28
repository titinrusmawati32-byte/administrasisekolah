import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { SchoolDocument, DownloadRecord, DocumentStatus, AccessLevel } from '../types';
import { logActivity } from './activityService';

import { uploadFileToGoogleDrive, deleteFileFromGoogleDrive } from './googleDriveService';

export interface CreateDocumentInput {
  title: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  file?: File | null;
  fileUrlFallback?: string;
  googleAccessToken?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  year: string;
  semester: string;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  remarks?: string;
  uploadedBy: string;
  uploadedByName: string;
}

export async function uploadDocument(
  input: CreateDocumentInput,
  onProgress?: (progress: number) => void
): Promise<SchoolDocument> {
  const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  let finalFileUrl = input.fileUrlFallback || '';
  let storagePath = '';

  if (input.file) {
    // 1. Try Google Drive API Upload first if Access Token is provided
    if (input.googleAccessToken) {
      try {
        const driveResult = await uploadFileToGoogleDrive(
          input.file,
          input.googleAccessToken,
          input.categoryName || 'Administrasi',
          onProgress
        );
        finalFileUrl = driveResult.webContentLink || driveResult.webViewLink;
        storagePath = `drive:${driveResult.fileId}`;
      } catch (driveErr) {
        console.warn('Google Drive upload fallback to local/storage:', driveErr);
      }
    }

    // 2. Fallback to Firebase Storage / Local URL if finalFileUrl is still empty
    if (!finalFileUrl) {
      const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      storagePath = `documents/${input.categoryId}/${documentId}/${safeName}`;
      const storageRef = ref(storage, storagePath);

      try {
        const uploadTask = uploadBytesResumable(storageRef, input.file);

        // Max 3.5-second wait for Firebase Storage upload
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            if (input.file && !finalFileUrl) {
              finalFileUrl = URL.createObjectURL(input.file);
            }
            resolve();
          }, 3500);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (onProgress) onProgress(pct);
            },
            (error) => {
              clearTimeout(timeout);
              if (input.file) {
                finalFileUrl = URL.createObjectURL(input.file);
              }
              resolve();
            },
            async () => {
              clearTimeout(timeout);
              try {
                finalFileUrl = await getDownloadURL(uploadTask.snapshot.ref);
              } catch (e) {
                if (input.file) finalFileUrl = URL.createObjectURL(input.file);
              }
              resolve();
            }
          );
        });
      } catch (err) {
        if (input.file && !finalFileUrl) {
          finalFileUrl = URL.createObjectURL(input.file);
        }
      }
    }
  }

  if (!finalFileUrl && input.file) {
    finalFileUrl = URL.createObjectURL(input.file);
  }

  const now = new Date().toISOString();

  const newDoc: SchoolDocument = {
    documentId,
    title: input.title,
    description: input.description || '',
    categoryId: input.categoryId,
    categoryName: input.categoryName || '',
    subcategoryId: input.subcategoryId || '',
    fileName: input.fileName || (input.file ? input.file.name : 'Dokumen.pdf'),
    fileUrl: finalFileUrl,
    storagePath,
    fileType: input.fileType || 'pdf',
    fileSize: input.fileSize || (input.file ? input.file.size : 1024),
    year: input.year || new Date().getFullYear().toString(),
    semester: input.semester || '1',
    uploadedBy: input.uploadedBy,
    uploadedByName: input.uploadedByName,
    uploadedAt: now,
    updatedAt: now,
    downloadCount: 0,
    status: input.status || 'Published',
    accessLevel: input.accessLevel || 'semua',
    remarks: input.remarks || ''
  };

  // 1. Immediately insert into local cache for instant UI availability
  try {
    const cached = localStorage.getItem('cached_documents_v2');
    const docs: SchoolDocument[] = cached ? JSON.parse(cached) : [];
    const updated = [newDoc, ...docs.filter((d) => d.documentId !== documentId)];
    localStorage.setItem('cached_documents_v2', JSON.stringify(updated));
  } catch (e) {}
  localStorage.setItem('app_initialized_v2', 'true');

  if (onProgress) onProgress(100);

  // 2. Race Firestore persistence with 1200ms timeout
  try {
    const savePromise = setDoc(doc(db, 'documents', documentId), newDoc);
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1200));
    await Promise.race([savePromise, timeoutPromise]);
  } catch (e) {
    console.warn('Note: Document saved to local cache:', e);
  }

  // Background activity logging
  logActivity(
    input.uploadedBy,
    input.uploadedByName,
    '',
    'UPLOAD_DOC',
    documentId,
    input.title
  ).catch(() => {});

  return newDoc;
}

import { INITIAL_DOCUMENTS, INITIAL_DOWNLOADS } from './defaultData';

export async function getAllDocuments(): Promise<SchoolDocument[]> {
  try {
    const q = query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'));
    const fetchPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));

    const snap: any = await Promise.race([fetchPromise, timeoutPromise]);
    if (!snap) {
      const cached = localStorage.getItem('cached_documents_v2');
      if (cached !== null) {
        return JSON.parse(cached);
      }
      return localStorage.getItem('app_initialized_v2') ? [] : INITIAL_DOCUMENTS;
    }
    const docs: SchoolDocument[] = [];
    snap.forEach((d: any) => {
      docs.push(d.data() as SchoolDocument);
    });
    
    localStorage.setItem('cached_documents_v2', JSON.stringify(docs));
    localStorage.setItem('app_initialized_v2', 'true');
    return docs;
  } catch (err) {
    console.warn('Note: getAllDocuments fallback used:', err);
    const cached = localStorage.getItem('cached_documents_v2');
    if (cached !== null) {
      return JSON.parse(cached);
    }
    return localStorage.getItem('app_initialized_v2') ? [] : INITIAL_DOCUMENTS;
  }
}

export async function getPublishedDocuments(): Promise<SchoolDocument[]> {
  try {
    const all = await getAllDocuments();
    return all.filter((d) => d.status === 'Published');
  } catch (err) {
    return [];
  }
}

export async function getDocumentById(documentId: string): Promise<SchoolDocument | null> {
  try {
    const dRef = doc(db, 'documents', documentId);
    const snap = await getDoc(dRef);
    if (snap.exists()) {
      return snap.data() as SchoolDocument;
    }
    return null;
  } catch (err) {
    console.error('Error getting document details:', err);
    return null;
  }
}

export async function updateDocumentDetails(
  documentId: string,
  updates: Partial<SchoolDocument>,
  updatedByUserId: string,
  updatedByUserName: string
): Promise<void> {
  const dRef = doc(db, 'documents', documentId);
  await updateDoc(dRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });

  await logActivity(
    updatedByUserId,
    updatedByUserName,
    '',
    'EDIT_DOC',
    documentId,
    updates.title || 'Dokumen'
  );
}

export async function deleteDocumentRecord(
  documentId: string,
  deletedByUserId: string,
  deletedByUserName: string
): Promise<void> {
  // 1. Immediately update local storage cache so refresh/offline reflects deletion
  const cached = localStorage.getItem('cached_documents_v2');
  if (cached) {
    try {
      const docs: SchoolDocument[] = JSON.parse(cached);
      const updated = docs.filter((d) => d.documentId !== documentId);
      localStorage.setItem('cached_documents_v2', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
  localStorage.setItem('app_initialized_v2', 'true');

  // 2. Fire-and-forget storage cleanup and activity logging in background
  getDocumentById(documentId).then((docData) => {
    if (docData && docData.storagePath) {
      try {
        const storageRef = ref(storage, docData.storagePath);
        deleteObject(storageRef).catch(() => {});
      } catch (e) {
        // ignore
      }
    }
    logActivity(
      deletedByUserId,
      deletedByUserName,
      '',
      'DELETE_DOC',
      documentId,
      docData?.title || 'Dokumen'
    ).catch(() => {});
  }).catch(() => {});

  // 3. Race Firestore deletion with 1200ms timeout
  try {
    const deletePromise = deleteDoc(doc(db, 'documents', documentId));
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1200));
    await Promise.race([deletePromise, timeoutPromise]);
  } catch (err) {
    console.warn('Note: Document deleted locally:', err);
  }
}

export async function recordDocumentDownload(
  docItem: SchoolDocument,
  userId: string,
  userName: string,
  userEmail: string
): Promise<void> {
  try {
    // 1. Increment download count in Firestore
    const dRef = doc(db, 'documents', docItem.documentId);
    await updateDoc(dRef, {
      downloadCount: increment(1)
    });

    // 2. Add entry to downloads collection
    const downloadId = `dl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: DownloadRecord = {
      downloadId,
      documentId: docItem.documentId,
      documentTitle: docItem.title,
      userId,
      userName,
      userEmail,
      downloadedAt: new Date().toISOString(),
      fileName: docItem.fileName
    };
    await setDoc(doc(db, 'downloads', downloadId), record);

    // 3. Log activity
    await logActivity(
      userId,
      userName,
      userEmail,
      'DOWNLOAD_DOC',
      docItem.documentId,
      docItem.title
    );
  } catch (err) {
    console.error('Error recording download:', err);
  }
}

export async function getUserDownloadHistory(userId: string): Promise<DownloadRecord[]> {
  try {
    const q = query(
      collection(db, 'downloads'),
      where('userId', '==', userId)
    );
    const fetchPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));

    const snap: any = await Promise.race([fetchPromise, timeoutPromise]);
    if (!snap) {
      return INITIAL_DOWNLOADS;
    }
    const records: DownloadRecord[] = [];
    snap.forEach((d: any) => {
      records.push(d.data() as DownloadRecord);
    });
    return records.length > 0
      ? records.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())
      : INITIAL_DOWNLOADS;
  } catch (err) {
    console.warn('Error getting download history, using fallback:', err);
    return INITIAL_DOWNLOADS;
  }
}

export async function getAllDownloadRecords(): Promise<DownloadRecord[]> {
  try {
    const q = query(collection(db, 'downloads'));
    const fetchPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));

    const snap: any = await Promise.race([fetchPromise, timeoutPromise]);
    if (!snap) {
      return INITIAL_DOWNLOADS;
    }
    const records: DownloadRecord[] = [];
    snap.forEach((d: any) => {
      records.push(d.data() as DownloadRecord);
    });
    return records.length > 0
      ? records.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())
      : INITIAL_DOWNLOADS;
  } catch (err) {
    console.warn('Note: getAllDownloadRecords fallback used:', err);
    return INITIAL_DOWNLOADS;
  }
}
