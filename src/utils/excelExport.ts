/**
 * Client-side CSV/Excel Data Exporter Fallback
 */

import { SchoolDocument, Category, UserProfile, DownloadRecord, ActivityLog } from '../types';

function convertToCSV(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((field) => {
          const str = String(field ?? '');
          // Escape quotes and enclose in quotes if contains comma or quote
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');
}

function triggerDownloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFullDatabaseCSV(data: {
  documents: SchoolDocument[];
  categories: Category[];
  users: UserProfile[];
  downloads: DownloadRecord[];
  logs: ActivityLog[];
}) {
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. Dokumen
  const docRows = [
    ['ID Dokumen', 'Judul Dokumen', 'Kategori', 'Tahun', 'Semester', 'Format', 'Ukuran (Bytes)', 'Jumlah Download', 'Status', 'Hak Akses', 'Diupload Oleh', 'Waktu Upload', 'URL File'],
    ...data.documents.map((d) => [
      d.documentId,
      d.title,
      d.categoryName || '',
      d.year,
      d.semester,
      d.fileType,
      d.fileSize,
      d.downloadCount || 0,
      d.status,
      d.accessLevel,
      d.uploadedByName,
      d.uploadedAt,
      d.fileUrl
    ])
  ];
  triggerDownloadCSV(`Backup_Dokumen_Sekolah_${dateStr}.csv`, convertToCSV(docRows));

  // 2. Daftar Pengguna
  const userRows = [
    ['UID', 'Nama Lengkap', 'Email', 'NIP', 'NUPTK', 'Jabatan', 'Peran', 'Status'],
    ...data.users.map((u) => [
      u.uid,
      u.name,
      u.email,
      u.nip || '',
      u.nuptk || '',
      u.position || '',
      u.role,
      u.status
    ])
  ];
  triggerDownloadCSV(`Backup_Pengguna_Sekolah_${dateStr}.csv`, convertToCSV(userRows));
}
