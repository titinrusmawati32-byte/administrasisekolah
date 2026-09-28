/**
 * Google Sheets API v4 Service for syncing database records to Google Sheets
 */

import { SchoolDocument, Category, DownloadRecord, UserProfile, ActivityLog } from '../types';

export interface SpreadsheetSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  syncedSheets: string[];
}

const SPREADSHEET_TITLE = 'Database Administrasi Sekolah SD (Pusat Dokumen)';
const SPREADSHEET_ID_STORAGE_KEY = 'pas_school_spreadsheet_id';

/**
 * Get or Create the Google Spreadsheet for School Data
 */
export async function getOrCreateSchoolSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  // Check localStorage first
  const existingId = localStorage.getItem(SPREADSHEET_ID_STORAGE_KEY);
  if (existingId) {
    try {
      const checkRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (checkRes.ok) {
        return {
          id: existingId,
          url: `https://docs.google.com/spreadsheets/d/${existingId}/edit`
        };
      }
    } catch (e) {
      // Ignore and create new
    }
  }

  // Create new Spreadsheet
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: SPREADSHEET_TITLE
    },
    sheets: [
      { properties: { title: 'Dokumen Administrasi' } },
      { properties: { title: 'Kategori Dokumen' } },
      { properties: { title: 'Daftar Pengguna' } },
      { properties: { title: 'Riwayat Unduhan' } },
      { properties: { title: 'Log Aktivitas' } }
    ]
  };

  const res = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google Spreadsheet (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  localStorage.setItem(SPREADSHEET_ID_STORAGE_KEY, spreadsheetId);

  return { id: spreadsheetId, url: spreadsheetUrl };
}

/**
 * Update a specific range/sheet in Google Sheets
 */
async function updateSheetRange(
  spreadsheetId: string,
  sheetTitle: string,
  values: (string | number)[][],
  accessToken: string
) {
  const range = `${sheetTitle}!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: `${sheetTitle}!A1`,
      majorDimension: 'ROWS',
      values
    })
  });

  if (!res.ok) {
    console.warn(`Failed to update sheet ${sheetTitle}:`, await res.text());
  }
}

/**
 * Sync all school data (Documents, Categories, Users, Downloads, Logs) to Google Sheets
 */
export async function syncAllDataToGoogleSheets(
  accessToken: string,
  data: {
    documents: SchoolDocument[];
    categories: Category[];
    users: UserProfile[];
    downloads: DownloadRecord[];
    logs: ActivityLog[];
  }
): Promise<SpreadsheetSyncResult> {
  const { id: spreadsheetId, url: spreadsheetUrl } = await getOrCreateSchoolSpreadsheet(accessToken);

  // 1. Dokumen Sheet
  const docHeaders = [
    'ID Dokumen',
    'Judul Dokumen',
    'Kategori',
    'Tahun',
    'Semester',
    'Format',
    'Ukuran (Bytes)',
    'Jumlah Download',
    'Status',
    'Hak Akses',
    'Diupload Oleh',
    'Waktu Upload',
    'URL File (Drive)'
  ];
  const docRows = data.documents.map((d) => [
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
  ]);
  await updateSheetRange(spreadsheetId, 'Dokumen Administrasi', [docHeaders, ...docRows], accessToken);

  // 2. Kategori Sheet
  const catHeaders = ['ID Kategori', 'Nama Kategori', 'Deskripsi', 'Ikon'];
  const catRows = data.categories.map((c) => [c.categoryId, c.name, c.description || '', c.icon || 'Folder']);
  await updateSheetRange(spreadsheetId, 'Kategori Dokumen', [catHeaders, ...catRows], accessToken);

  // 3. Pengguna Sheet
  const userHeaders = ['UID', 'Nama Lengkap', 'Email', 'NIP', 'NUPTK', 'Jabatan', 'Peran', 'Status'];
  const userRows = data.users.map((u) => [
    u.uid,
    u.name,
    u.email,
    u.nip || '',
    u.nuptk || '',
    u.position || '',
    u.role,
    u.status
  ]);
  await updateSheetRange(spreadsheetId, 'Daftar Pengguna', [userHeaders, ...userRows], accessToken);

  // 4. Riwayat Unduhan Sheet
  const dlHeaders = ['ID Unduhan', 'ID Dokumen', 'Judul Dokumen', 'Nama Guru', 'Email Guru', 'Waktu Download'];
  const dlRows = data.downloads.map((dl) => [
    dl.downloadId,
    dl.documentId,
    dl.documentTitle,
    dl.userName,
    dl.userEmail,
    dl.downloadedAt
  ]);
  await updateSheetRange(spreadsheetId, 'Riwayat Unduhan', [dlHeaders, ...dlRows], accessToken);

  // 5. Log Aktivitas Sheet
  const logHeaders = ['ID Log', 'Waktu', 'Pengguna', 'Email', 'Aksi', 'ID Dokumen', 'Nama Dokumen'];
  const logRows = data.logs.map((l) => [
    l.activityId,
    l.timestamp,
    l.userName,
    l.userEmail,
    l.action,
    l.documentId || '',
    l.documentName || ''
  ]);
  await updateSheetRange(spreadsheetId, 'Log Aktivitas', [logHeaders, ...logRows], accessToken);

  return {
    spreadsheetId,
    spreadsheetUrl,
    syncedSheets: ['Dokumen Administrasi', 'Kategori Dokumen', 'Daftar Pengguna', 'Riwayat Unduhan', 'Log Aktivitas']
  };
}
