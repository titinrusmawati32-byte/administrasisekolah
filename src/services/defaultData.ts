import { SchoolDocument, Category, UserProfile, Announcement, DownloadRecord } from '../types';
import { DEFAULT_CATEGORIES } from './seedService';

export const INITIAL_CATEGORIES: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
  categoryId: cat.id,
  name: cat.name,
  icon: cat.icon,
  description: cat.description,
  order: cat.order,
  createdAt: new Date().toISOString()
}));

export const INITIAL_DOCUMENTS: SchoolDocument[] = [
  {
    documentId: 'doc-1',
    title: 'Modul Ajar Matematika Kelas 4 Kurikulum Merdeka Semester 1',
    description: 'Modul ajar lengkap matematika bab pecahan dan pengukuran keliling & luas.',
    categoryId: 'cat-3',
    categoryName: 'Administrasi Pembelajaran',
    fileName: 'Modul_Ajar_Matematika_K4_Sem1.pdf',
    fileType: 'PDF',
    fileSize: 2450000,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    storagePath: '',
    year: '2024/2025',
    semester: 'Ganjil',
    downloadCount: 18,
    status: 'Published',
    accessLevel: 'guru',
    uploadedBy: 'user-admin',
    uploadedByName: 'Administrator Sekolah',
    uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    documentId: 'doc-2',
    title: 'KOSP (Kurikulum Operasional Satuan Pendidikan) 2024/2025',
    description: 'Kurikulum Operasional SD Negeri 01 Nusantara Tahun Ajaran 2024/2025.',
    categoryId: 'cat-4',
    categoryName: 'Kurikulum',
    fileName: 'KOSP_SDN01_Nusantara_2024_2025.pdf',
    fileType: 'PDF',
    fileSize: 5200000,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    storagePath: '',
    year: '2024/2025',
    semester: 'Ganjil',
    downloadCount: 42,
    status: 'Published',
    accessLevel: 'semua',
    uploadedBy: 'user-admin',
    uploadedByName: 'Administrator Sekolah',
    uploadedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    documentId: 'doc-3',
    title: 'Jadwal Pelajaran dan Piket Kelas Semester Ganjil',
    description: 'Jadwal tatap muka pembelajaran dan jadwal piket kebersihan guru piket.',
    categoryId: 'cat-9',
    categoryName: 'Administrasi Kelas',
    fileName: 'Jadwal_Pelajaran_Sem_Ganjil.xlsx',
    fileType: 'XLSX',
    fileSize: 850000,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    storagePath: '',
    year: '2024/2025',
    semester: 'Ganjil',
    downloadCount: 25,
    status: 'Published',
    accessLevel: 'guru',
    uploadedBy: 'user-guru',
    uploadedByName: 'Guru SD',
    uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    documentId: 'doc-4',
    title: 'RKAS dan Laporan Penggunaan Dana BOS Tahap 1',
    description: 'Rencana Kegiatan dan Anggaran Sekolah serta Laporan LPJ BOS Tahap I.',
    categoryId: 'cat-11',
    categoryName: 'BOS / Keuangan',
    fileName: 'RKAS_LPJ_BOS_Tahap_1_2024.pdf',
    fileType: 'PDF',
    fileSize: 3100000,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    storagePath: '',
    year: '2024/2025',
    semester: 'Ganjil',
    downloadCount: 11,
    status: 'Published',
    accessLevel: 'admin',
    uploadedBy: 'user-admin',
    uploadedByName: 'Administrator Sekolah',
    uploadedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user-admin_sekolah_sch_id',
    email: 'admin@sekolah.sch.id',
    name: 'Administrator Sekolah',
    role: 'admin',
    nip: '198503122010011005',
    nuptk: '3456789012345678',
    position: 'Kepala / Admin UT',
    phone: '081234567890',
    photoURL: '',
    status: 'aktif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  },
  {
    uid: 'user-guru_sekolah_sch_id',
    email: 'guru@sekolah.sch.id',
    name: 'Guru SD Negeri 01',
    role: 'guru',
    nip: '199005152015022003',
    nuptk: '8765432109876543',
    position: 'Guru Kelas 4B',
    phone: '085678901234',
    photoURL: '',
    status: 'aktif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    announcementId: 'ann-1',
    title: 'Pengumpulan Perangkat Ajar & Modul Kurikulum Merdeka Semester Ganjil',
    content: 'Diberitahukan kepada seluruh Bapak/Ibu Guru untuk mengunggah perangkat ajar kelas masing-masing paling lambat akhir minggu ini.',
    createdBy: 'user-admin',
    createdByName: 'Administrator Sekolah',
    createdAt: new Date().toISOString(),
    status: 'active'
  }
];

export const INITIAL_DOWNLOADS: DownloadRecord[] = [
  {
    downloadId: 'dl-1',
    documentId: 'doc-1',
    documentTitle: 'Modul Ajar Matematika Kelas 4 Kurikulum Merdeka Semester 1',
    userId: 'user-guru',
    userName: 'Guru SD Negeri 01',
    userEmail: 'guru@sekolah.sch.id',
    downloadedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    fileName: 'Modul_Ajar_Matematika_K4_Sem1.pdf'
  }
];
