export type UserRole = 'admin' | 'guru';

export type UserStatus = 'aktif' | 'nonaktif';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  nip?: string;
  nuptk?: string;
  position?: string;
  phone?: string;
  photoURL?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export type DocumentStatus = 'Published' | 'Draft' | 'Archived';
export type AccessLevel = 'semua' | 'guru' | 'admin';

export interface SchoolDocument {
  documentId: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  fileType: string; // e.g. 'pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'zip'
  fileSize: number; // bytes
  thumbnailUrl?: string;
  year: string;
  semester: string; // e.g., 'Ganjil', 'Genap', '1', '2'
  uploadedBy: string; // user uid
  uploadedByName: string;
  uploadedAt: string;
  updatedAt: string;
  downloadCount: number;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  remarks?: string;
}

export interface Category {
  categoryId: string;
  name: string;
  icon: string; // icon identifier or lucide name
  description: string;
  order: number;
  documentCount?: number;
  createdAt: string;
}

export interface DownloadRecord {
  downloadId: string;
  documentId: string;
  documentTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  downloadedAt: string;
  fileName: string;
}

export interface ActivityLog {
  activityId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'LOGIN' | 'LOGOUT' | 'UPLOAD_DOC' | 'EDIT_DOC' | 'DELETE_DOC' | 'DOWNLOAD_DOC' | 'UPDATE_PROFILE' | 'UPDATE_SETTINGS' | 'CREATE_CATEGORY' | 'CREATE_USER';
  documentId?: string;
  documentName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  status: 'active' | 'archived';
}

export interface SchoolSettings {
  name: string;
  npsn: string;
  address: string;
  logo: string;
  email: string;
  phone: string;
  website: string;
  principalName: string;
  updatedAt: string;
}
