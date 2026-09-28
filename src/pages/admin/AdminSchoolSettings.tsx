import React, { useEffect, useState } from 'react';
import { School, Save, Building, Mail, Phone, Globe, UserCheck, Database, FileSpreadsheet, HardDrive, CheckCircle2, ExternalLink, RefreshCw, Download } from 'lucide-react';
import { getSchoolSettings, updateSchoolSettings } from '../../services/settingsService';
import { getAllDocuments } from '../../services/documentService';
import { getCategories } from '../../services/categoryService';
import { getAllUsers } from '../../services/userService';
import { getAllDownloadRecords } from '../../services/documentService';
import { getActivityLogs } from '../../services/activityService';
import { syncAllDataToGoogleSheets } from '../../services/googleSheetsService';
import { exportFullDatabaseCSV } from '../../utils/excelExport';
import { SchoolSettings } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Toast, ToastType } from '../../components/common/Toast';

export const AdminSchoolSettings: React.FC = () => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { refreshSettings, googleAccessToken, connectGoogleWorkspace } = useAuth();

  useEffect(() => {
    getSchoolSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await updateSchoolSettings(settings);
      await refreshSettings();
      setToast({ message: 'Pengaturan identitas sekolah berhasil diperbarui.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Gagal memperbarui profil sekolah.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToGoogleSheets = async () => {
    setSyncingSheets(true);
    try {
      let token = googleAccessToken;
      if (!token) {
        token = await connectGoogleWorkspace();
      }

      if (!token) {
        setToast({ message: 'Izin token Google Workspace diperlukan.', type: 'error' });
        return;
      }

      // Fetch all collections
      const [documents, categories, users, downloads, logs] = await Promise.all([
        getAllDocuments(),
        getCategories(),
        getAllUsers(),
        getAllDownloadRecords(),
        getActivityLogs(300)
      ]);

      const result = await syncAllDataToGoogleSheets(token, {
        documents,
        categories,
        users,
        downloads,
        logs
      });

      setSheetUrl(result.spreadsheetUrl);
      setToast({ message: 'Seluruh database berhasil disinkronkan ke Google Sheets!', type: 'success' });
    } catch (err: any) {
      console.warn('Google Sheets sync result:', err);
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.message?.includes('popup-closed-by-user') ||
        err.code === 'auth/popup-blocked'
      ) {
        setToast({
          message: 'Sinkronisasi dibatalkan karena jendela login Google ditutup. Silakan klik tombol lagi dan selesaikan login Google.',
          type: 'info'
        });
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setToast({
          message: 'Domain ini belum diizinkan oleh Firebase OAuth. Silakan gunakan tombol "Unduh Backup CSV" untuk mengunduh seluruh data database Excel/CSV secara instan.',
          type: 'error'
        });
      } else {
        setToast({
          message: err.message || 'Gagal mensinkronkan data ke Google Sheets.',
          type: 'error'
        });
      }
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleExportCSVFallback = async () => {
    try {
      const [documents, categories, users, downloads, logs] = await Promise.all([
        getAllDocuments(),
        getCategories(),
        getAllUsers(),
        getAllDownloadRecords(),
        getActivityLogs(300)
      ]);

      exportFullDatabaseCSV({
        documents,
        categories,
        users,
        downloads,
        logs
      });

      setToast({ message: 'Backup berkas CSV berhasil diunduh ke perangkat Anda!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Gagal mengunduh backup CSV.', type: 'error' });
    }
  };

  if (loading || !settings) {
    return <LoadingSpinner label="Memuat pengaturan profil sekolah..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Pengaturan Identitas & Integrasi Google Workspace</h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola informasi sekolah dan integrasi Google Drive serta Google Sheets untuk penyimpanan database.
        </p>
      </div>

      {/* Google Workspace Integration Box */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white border border-blue-800 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-blue-300">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Google Drive & Google Sheets Integration
                {googleAccessToken && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Terhubung
                  </span>
                )}
              </h3>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Simpan file dokumen di Google Drive dan sinkronkan seluruh database ke Google Sheets.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSyncToGoogleSheets}
            disabled={syncingSheets}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {syncingSheets ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Mengunggah & Mensinkronkan Ke Google Sheets...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                Sinkronkan Seluruh Data ke Google Sheets
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCSVFallback}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Backup CSV</span>
          </button>

          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors"
            >
              <span>Buka Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* School Information Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
          <School className="w-4 h-4 text-blue-600" />
          Profil Resmi Sekolah
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Sekolah *
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              NPSN (Nomor Pokok Sekolah Nasional) *
            </label>
            <input
              type="text"
              value={settings.npsn}
              onChange={(e) => setSettings({ ...settings, npsn: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Kepala Sekolah *
            </label>
            <input
              type="text"
              value={settings.principalName}
              onChange={(e) => setSettings({ ...settings, principalName: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Resmi Sekolah
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor Telepon
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Website Resmi
            </label>
            <input
              type="text"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL Logo Sekolah
            </label>
            <input
              type="text"
              value={settings.logo}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Lengkap Sekolah
            </label>
            <textarea
              rows={3}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};
