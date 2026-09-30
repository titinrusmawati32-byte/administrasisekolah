import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List, FileText } from 'lucide-react';
import { getAllDocuments, deleteDocumentRecord, recordDocumentDownload, getAllDownloadRecords } from '../../services/documentService';
import { getCategories } from '../../services/categoryService';
import { getAllUsers } from '../../services/userService';
import { getActivityLogs } from '../../services/activityService';
import { syncAllDataToGoogleSheets } from '../../services/googleSheetsService';
import { SchoolDocument, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SearchBar } from '../../components/common/SearchBar';
import { DocumentFilter, FilterOptions } from '../../components/common/DocumentFilter';
import { DocumentCard } from '../../components/common/DocumentCard';
import { DocumentTable } from '../../components/common/DocumentTable';
import { DocumentPreview } from '../../components/common/DocumentPreview';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Toast, ToastType } from '../../components/common/Toast';

export const AdminDocumentList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<FilterOptions>({
    categoryId: '',
    year: '',
    semester: '',
    fileType: '',
    status: ''
  });

  const [selectedDocForPreview, setSelectedDocForPreview] = useState<SchoolDocument | null>(null);
  const [selectedDocForDelete, setSelectedDocForDelete] = useState<SchoolDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { currentUser, userProfile, googleAccessToken } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [docData, catData] = await Promise.all([
        getAllDocuments(),
        getCategories()
      ]);
      setDocuments(docData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching admin document list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    a.download = doc.fileName || doc.title || 'dokumen';
    if (!doc.fileUrl.startsWith('data:')) {
      a.target = '_blank';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setToast({ message: `Mengunduh file: ${doc.title}`, type: 'success' });
    loadData(); // refresh download counts
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocForDelete || !currentUser || !userProfile) return;
    const docToDelete = selectedDocForDelete;
    
    // Optimistic UI update: close modal and remove from list instantly!
    setDocuments((prev) => prev.filter((d) => d.documentId !== docToDelete.documentId));
    setSelectedDocForDelete(null);
    setToast({ message: 'Dokumen berhasil dihapus.', type: 'success' });

    try {
      await deleteDocumentRecord(
        docToDelete.documentId,
        currentUser.uid,
        userProfile.name
      );

      // Auto-sync to Google Sheets in background if spreadsheet was previously initialized
      const spreadsheetId = localStorage.getItem('pas_school_spreadsheet_id');
      if (spreadsheetId && googleAccessToken) {
        const [remainingDocs, catData, users, downloads, logs] = await Promise.all([
          getAllDocuments(),
          getCategories(),
          getAllUsers(),
          getAllDownloadRecords(),
          getActivityLogs(300)
        ]);
        await syncAllDataToGoogleSheets(googleAccessToken, {
          documents: remainingDocs,
          categories: catData,
          users,
          downloads,
          logs
        });
      }
    } catch (err) {
      console.warn('Background document delete / sync:', err);
    }
  };

  // Filter & Search Logic
  const filteredDocuments = documents.filter((doc) => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchDesc = doc.description?.toLowerCase().includes(q);
      const matchCat = doc.categoryName?.toLowerCase().includes(q);
      const matchFileName = doc.fileName?.toLowerCase().includes(q);
      const matchYear = doc.year?.includes(q);
      if (!matchTitle && !matchDesc && !matchCat && !matchFileName && !matchYear) {
        return false;
      }
    }

    // Filters
    if (filters.categoryId && doc.categoryId !== filters.categoryId) return false;
    if (filters.year && doc.year !== filters.year) return false;
    if (filters.semester && doc.semester !== filters.semester) return false;
    if (filters.fileType && (doc.fileType || '').toLowerCase() !== filters.fileType.toLowerCase()) return false;
    if (filters.status && doc.status !== filters.status) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Semua Dokumen Administrasi</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola, perbarui, dan distribusikan dokumen sekolah untuk para guru.
          </p>
        </div>

        <Link
          to="/admin/documents/create"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-[1.02] shrink-0 min-h-[44px] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumen Baru
        </Link>
      </div>

      {/* Controls Bar: Search & Toggle View */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari berdasarkan nama dokumen, kategori, deskripsi, atau tahun..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 mr-1">Tampilan:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px] cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px] cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <List className="w-4 h-4" />
            Tabel
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <DocumentFilter
        categories={categories}
        filters={filters}
        onChange={setFilters}
        showStatusFilter={true}
      />

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner label="Memuat seluruh dokumen..." />
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          title="Tidak ada dokumen ditemukan"
          message={
            searchQuery || filters.categoryId || filters.status
              ? 'Tidak ada dokumen yang cocok dengan kata kunci atau filter yang Anda pilih.'
              : 'Belum ada dokumen yang tersimpan dalam sistem administrasi.'
          }
          actionText="Unggah Dokumen Sekarang"
          onAction={() => navigate('/admin/documents/create')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.documentId}
              doc={doc}
              onPreview={(d) => setSelectedDocForPreview(d)}
              onDownload={(d) => handleDownload(d)}
              onDelete={(d) => setSelectedDocForDelete(d)}
              isAdmin={true}
            />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={filteredDocuments}
          onPreview={(d) => setSelectedDocForPreview(d)}
          onDownload={(d) => handleDownload(d)}
          onDelete={(d) => setSelectedDocForDelete(d)}
          isAdmin={true}
        />
      )}

      {/* Preview Modal */}
      <DocumentPreview
        doc={selectedDocForPreview}
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        onDownload={handleDownload}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedDocForDelete)}
        onClose={() => setSelectedDocForDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Dokumen Administrasi"
        message={`Apakah Anda yakin ingin menghapus dokumen "${selectedDocForDelete?.title}"? Dokumen ini tidak akan tersedia lagi bagi para guru.`}
        confirmText="Hapus Dokumen"
        isDangerous={true}
        loading={deleting}
      />

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
