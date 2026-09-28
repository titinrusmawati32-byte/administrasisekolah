import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  FolderKanban,
  DownloadCloud,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  FilePlus,
  UserPlus,
  Megaphone
} from 'lucide-react';
import { getAllDocuments } from '../../services/documentService';
import { getAllUsers } from '../../services/userService';
import { getCategories } from '../../services/categoryService';
import { getAllDownloadRecords } from '../../services/documentService';
import { SchoolDocument, UserProfile, Category, DownloadRecord } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FileIcon } from '../../components/common/FileIcon';
import { formatBytes, formatDate } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docData, userData, catData, dlData] = await Promise.all([
        getAllDocuments(),
        getAllUsers(),
        getCategories(),
        getAllDownloadRecords()
      ]);
      setDocuments(docData);
      setUsers(userData);
      setCategories(catData);
      setDownloads(dlData);
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Memuat ringkasan statistik sekolah..." />;
  }

  const totalDocs = documents.length;
  const teachersCount = users.filter((u) => u.role === 'guru').length;
  const categoriesCount = categories.length;
  const totalDownloads = downloads.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const docsThisMonth = documents.filter((d) => {
    const dt = new Date(d.uploadedAt);
    return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
  }).length;

  const downloadsThisMonth = downloads.filter((d) => {
    const dt = new Date(d.downloadedAt);
    return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
  }).length;

  // Monthly stats chart data for last 6 months
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const chartMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      monthIdx: d.getMonth(),
      year: d.getFullYear(),
      label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`
    };
  });

  const uploadMonthlyCounts = chartMonths.map((m) => {
    return documents.filter((doc) => {
      const dt = new Date(doc.uploadedAt);
      return dt.getMonth() === m.monthIdx && dt.getFullYear() === m.year;
    }).length;
  });

  const downloadMonthlyCounts = chartMonths.map((m) => {
    return downloads.filter((dl) => {
      const dt = new Date(dl.downloadedAt);
      return dt.getMonth() === m.monthIdx && dt.getFullYear() === m.year;
    }).length;
  });

  const maxUpload = Math.max(...uploadMonthlyCounts, 5);
  const maxDownload = Math.max(...downloadMonthlyCounts, 5);

  const recentDocs = documents.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/15 text-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/20">
              PANEL DASHBOARD ADMINISTRATOR
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Pusat Administrasi Dokumen Sekolah
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              Ringkasan data, statistik pengunggahan, dan aktivitas unduhan dokumen administrasi sekolah secara real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
            <Link
              to="/admin/documents/create"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] min-h-[44px]"
            >
              <FilePlus className="w-4 h-4" />
              Tambah Dokumen
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl border border-blue-400/30 transition-all min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              Kelola Guru
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards (1-2 cols mobile, 3 cols tablet, 6 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block truncate">Total Dokumen</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{totalDocs}</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block truncate">Total Guru</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{teachersCount}</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3">
            <FolderKanban className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block truncate">Total Kategori</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{categoriesCount}</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block truncate">Total Unduhan</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{totalDownloads}</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="w-9 h-9 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3">
            <FilePlus className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block truncate">Upload Bulan Ini</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{docsThisMonth}</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block truncate">Unduh Bulan Ini</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{downloadsThisMonth}</span>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Jumlah Upload Dokumen (6 Bulan Terakhir)</h3>
              <p className="text-xs text-slate-400">Statistik dokumen baru yang ditambahkan ke sistem</p>
            </div>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {chartMonths.map((m, idx) => {
              const val = uploadMonthlyCounts[idx];
              const heightPct = Math.round((val / maxUpload) * 100);
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-blue-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                    className="w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-700 transition-all"
                  />
                  <span className="text-[10px] font-semibold text-slate-500 mt-2 truncate max-w-full">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Jumlah Download Guru (6 Bulan Terakhir)</h3>
              <p className="text-xs text-slate-400">Aktivitas guru mengunduh dokumen administrasi</p>
            </div>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DownloadCloud className="w-4 h-4" />
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {chartMonths.map((m, idx) => {
              const val = downloadMonthlyCounts[idx];
              const heightPct = Math.round((val / maxDownload) * 100);
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-emerald-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                    className="w-full bg-emerald-500 rounded-t-lg group-hover:bg-emerald-600 transition-all"
                  />
                  <span className="text-[10px] font-semibold text-slate-500 mt-2 truncate max-w-full">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Dokumen Terbaru Diunggah</h3>
            <p className="text-xs text-slate-400">Dokumen yang baru saja ditambahkan oleh admin</p>
          </div>
          <Link
            to="/admin/documents"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 self-start sm:self-auto py-1"
          >
            Lihat Semua ({totalDocs})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Belum ada dokumen yang diunggah.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentDocs.map((doc) => (
              <div key={doc.documentId} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
                    <FileIcon fileType={doc.fileType} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{doc.title}</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                      {doc.categoryName || 'Administrasi'} • Tahun {doc.year} • {formatBytes(doc.fileSize)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {doc.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(doc.uploadedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
