import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  DownloadCloud,
  FolderKanban,
  Megaphone,
  Search,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Mail,
  Briefcase,
  ClipboardCheck,
  Users,
  Building,
  Folder,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import { getPublishedDocuments, getUserDownloadHistory, recordDocumentDownload } from '../../services/documentService';
import { getCategories } from '../../services/categoryService';
import { getActiveAnnouncements } from '../../services/announcementService';
import { SchoolDocument, Category, Announcement, DownloadRecord } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DocumentCard } from '../../components/common/DocumentCard';
import { DocumentPreview } from '../../components/common/DocumentPreview';
import { Toast, ToastType } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';

import { INITIAL_DOCUMENTS, INITIAL_CATEGORIES, INITIAL_ANNOUNCEMENTS, INITIAL_DOWNLOADS } from '../../services/defaultData';

export const GuruDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<SchoolDocument[]>(INITIAL_DOCUMENTS.filter((d) => d.status === 'Published'));
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [myDownloads, setMyDownloads] = useState<DownloadRecord[]>(INITIAL_DOWNLOADS);

  const [selectedDocForPreview, setSelectedDocForPreview] = useState<SchoolDocument | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [docData, catData, annData] = await Promise.all([
        getPublishedDocuments(),
        getCategories(),
        getActiveAnnouncements()
      ]);
      setDocuments(docData);
      setCategories(catData);
      setAnnouncements(annData);

      if (currentUser) {
        const dlHistory = await getUserDownloadHistory(currentUser.uid);
        setMyDownloads(dlHistory);
      }
    } catch (err) {
      console.warn('Error loading teacher dashboard (using initial data):', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleDownload = async (doc: SchoolDocument) => {
    if (!doc.fileUrl) {
      setToast({ message: 'URL file tidak ditemukan.', type: 'error' });
      return;
    }

    if (currentUser && userProfile) {
      await recordDocumentDownload(
        doc,
        currentUser.uid,
        userProfile.name,
        currentUser.email || ''
      );
    }

    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.target = '_blank';
    a.download = doc.fileName || doc.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setToast({ message: `Mengunduh file: ${doc.title}`, type: 'success' });
    loadData();
  };

  if (loading) {
    return <LoadingSpinner label="Memuat dashboard guru..." />;
  }

  const recentDocs = documents.slice(0, 6);

  // Map category icons
  const categoryIconMap: Record<string, React.ReactNode> = {
    'cat-1': <Building className="w-6 h-6 text-blue-600" />,
    'cat-2': <UserCheckIcon className="w-6 h-6 text-emerald-600" />,
    'cat-3': <BookOpen className="w-6 h-6 text-indigo-600" />,
    'cat-4': <GraduationCap className="w-6 h-6 text-purple-600" />,
    'cat-5': <Users className="w-6 h-6 text-amber-600" />,
    'cat-6': <Briefcase className="w-6 h-6 text-teal-600" />,
    'cat-7': <Mail className="w-6 h-6 text-rose-600" />,
    'cat-8': <ClipboardCheck className="w-6 h-6 text-sky-600" />,
    'cat-9': <FolderKanban className="w-6 h-6 text-cyan-600" />,
    'cat-10': <Building className="w-6 h-6 text-stone-600" />,
    'cat-11': <FileSpreadsheet className="w-6 h-6 text-emerald-700" />,
    'cat-12': <FileCheck className="w-6 h-6 text-violet-600" />
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/15 text-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/20">
              PORTAL UTAMA GURU & TENAGA PENDIDIK
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Selamat datang, {userProfile?.name || 'Bapak/Ibu Guru'}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Akses cepat modul ajar, RPP, kurikulum, surat resmi, dan formulir administrasi sekolah.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => navigate('/guru/documents')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              Cari & Unduh Dokumen
            </button>
          </div>
        </div>
      </div>

      {/* Announcements Alert if any */}
      {announcements.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Megaphone className="w-4 h-4 text-amber-600 shrink-0" />
            Pengumuman Sekolah Terbaru ({announcements.length})
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 2).map((ann) => (
              <div key={ann.announcementId} className="bg-white p-3 rounded-xl border border-amber-200/60 text-xs">
                <h4 className="font-bold text-slate-800">{ann.title}</h4>
                <p className="text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{ann.content}</p>
                <p className="text-[10px] text-slate-400 mt-1">{formatDate(ann.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Dokumen Tersedia</span>
            <span className="text-2xl font-black text-slate-800">{documents.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Kategori Administrasi</span>
            <span className="text-2xl font-black text-slate-800">{categories.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <DownloadCloud className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Unduhan Saya</span>
            <span className="text-2xl font-black text-slate-800">{myDownloads.length}</span>
          </div>
        </div>
      </div>

      {/* Category Shortcuts Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Kategori Dokumen Administrasi</h3>
            <p className="text-xs text-slate-400">Pilih kategori untuk melihat seluruh berkas pendukung</p>
          </div>
          <Link
            to="/guru/categories"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Lihat Semua Kategori
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.slice(0, 14).map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => navigate(`/guru/documents?category=${cat.categoryId}`)}
              className="p-3 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 rounded-2xl flex flex-col items-center text-center space-y-2 group transition-all"
            >
              <div className="p-2.5 bg-white rounded-xl shadow-2xs border border-slate-100 group-hover:scale-105 transition-transform">
                {categoryIconMap[cat.categoryId] || <Folder className="w-6 h-6 text-emerald-600" />}
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700 line-clamp-2 leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Documents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Dokumen Administrasi Terbaru</h3>
            <p className="text-xs text-slate-500">Dokumen yang baru diunggah oleh admin sekolah</p>
          </div>
          <Link
            to="/guru/documents"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Lihat Semua Dokumen ({documents.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentDocs.map((doc) => (
            <DocumentCard
              key={doc.documentId}
              doc={doc}
              onPreview={(d) => setSelectedDocForPreview(d)}
              onDownload={(d) => handleDownload(d)}
              isAdmin={false}
            />
          ))}
        </div>
      </div>

      <DocumentPreview
        doc={selectedDocForPreview}
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        onDownload={handleDownload}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

function UserCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 11l2 2 4-4" />
    </svg>
  );
}
