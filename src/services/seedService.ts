import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { SchoolSettings } from '../types';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Administrasi Sekolah', icon: 'Building2', description: 'Dokumen tata kelola, visi-misi, dan manajemen sekolah', order: 1 },
  { id: 'cat-2', name: 'Administrasi Guru', icon: 'UserCheck', description: 'SK, beban kerja, portofolio, dan administrasi individu guru', order: 2 },
  { id: 'cat-3', name: 'Administrasi Pembelajaran', icon: 'BookOpen', description: 'RRP, Prota, Promes, Silabus, dan Administrasi Pembelajaran', order: 3 },
  { id: 'cat-4', name: 'Kurikulum', icon: 'GraduationCap', description: 'KTSP, KOSP, Capaian Pembelajaran, dan Struktur Kurikulum', order: 4 },
  { id: 'cat-5', name: 'Kesiswaan', icon: 'Users', description: 'Data siswa, ekstrakurikuler, prestasi, dan tata tertib', order: 5 },
  { id: 'cat-6', name: 'Kepegawaian', icon: 'Briefcase', description: 'Arsip kepegawaian, kenaikan pangkat, dan sertifikasi', order: 6 },
  { id: 'cat-7', name: 'Surat Menyurat', icon: 'Mail', description: 'Surat masuk, surat keluar, edaran, dan undangan', order: 7 },
  { id: 'cat-8', name: 'Penilaian', icon: 'ClipboardCheck', description: 'Kisi-kisi, soal, analisis nilai, dan rapor siswa', order: 8 },
  { id: 'cat-9', name: 'Administrasi Kelas', icon: 'FolderKanban', description: 'Jadwal pelajaran, denah kelas, dan daftar piket', order: 9 },
  { id: 'cat-10', name: 'Sarana dan Prasarana', icon: 'Building', description: 'Inventarisasi barang, fasiltas sekolah, dan pemeliharaan', order: 10 },
  { id: 'cat-11', name: 'BOS / Keuangan', icon: 'Wallet', description: 'RKAS, laporan pertanggungjawaban dana BOS & komite', order: 11 },
  { id: 'cat-12', name: 'Formulir', icon: 'FileText', description: 'Formulir pendaftaran, izin, permohonan, dan perizinan', order: 12 },
  { id: 'cat-13', name: 'Perangkat Ajar', icon: 'LayoutList', description: 'Modul ajar, LKPD, bahan ajar, dan media pembelajaran', order: 13 },
  { id: 'cat-14', name: 'Lainnya', icon: 'Folder', description: 'Dokumen umum dan arsip pendukung lainnya', order: 14 }
];

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  name: 'SD Negeri 01 Nusantara',
  npsn: '20101234',
  address: 'Jl. Merdeka No. 45, Kecamatan Sukajadi, Kota Nusantara',
  logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=300&q=80',
  email: 'info@sdn01nusantara.sch.id',
  phone: '(021) 7890-1234',
  website: 'https://sdn01nusantara.sch.id',
  principalName: 'H. Ahmad Supriyadi, S.Pd., M.Pd.',
  updatedAt: new Date().toISOString()
};

export async function initializeSchoolData(): Promise<void> {
  try {
    // 1. Check School Settings
    const schoolDocRef = doc(db, 'settings', 'school');
    const schoolSnap = await getDoc(schoolDocRef);
    if (!schoolSnap.exists()) {
      await setDoc(schoolDocRef, DEFAULT_SCHOOL_SETTINGS);
    }

    // 2. Check Categories
    const catCollection = collection(db, 'categories');
    const catSnap = await getDocs(catCollection);
    if (catSnap.empty) {
      const batch = writeBatch(db);
      for (const cat of DEFAULT_CATEGORIES) {
        const catRef = doc(db, 'categories', cat.id);
        batch.set(catRef, {
          categoryId: cat.id,
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          order: cat.order,
          createdAt: new Date().toISOString()
        });
      }
      await batch.commit();
    }
  } catch (err: any) {
    console.warn('Note: School data seed check handled offline/pending network state:', err?.message || err);
  }
}
