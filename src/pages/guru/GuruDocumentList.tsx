import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, FileText } from 'lucide-react';
import { getPublishedDocuments, recordDocumentDownload } from '../../services/documentService';
import { getCategories } from '../../services/categoryService';
import { SchoolDocument, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SearchBar } from '../../components/common/SearchBar';
import { DocumentFilter, FilterOptions } from '../../components/common/DocumentFilter';
import { DocumentCard } from '../../components/common/DocumentCard';
import { DocumentTable } from '../../components/common/DocumentTable';
import { DocumentPreview } from '../../components/common/DocumentPreview';
import { EmptyState } from '../../components/common/EmptyState';
import { Toast, ToastType } from '../../components/common/Toast';

import { INITIAL_DOCUMENTS, INITIAL_CATEGORIES } from '../../services/defaultData';

export const GuruDocumentList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCatId = searchParams.get('category') || '';

  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<SchoolDocument[]>(INITIAL_DOCUMENTS.filter((d) => d.status === 'Published'));
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<FilterOptions>({
    categoryId: initialCatId,
    year: '',
    semester: '',
    fileType: ''
  });

  const [selectedDocForPreview, setSelectedDocForPreview] = useState<SchoolDocument | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { currentUser, userProfile } = useAuth();

  const loadData = async () => {
    try {
      const [docData, catData] = await Promise.all([
        getPublishedDocuments(),
        getCategories()
      ]);
      setDocuments(docData);
      setCategories(catData);
    } catch (err) {
      console.warn('Error loading documents for teacher:', err);
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

    window.open(doc.fileUrl, '_blank');

    setToast({ message: `Mengunduh file: ${doc.title}`, type: 'success' });
    loadData();
  };

  const filteredDocuments = documents.filter((doc) => {
    // Realtime search
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

    // Filter checks
    if (filters.categoryId && doc.categoryId !== filters.categoryId) return false;
    if (filters.year && doc.year !== filters.year) return false;
    if (filters.semester && doc.semester !== filters.semester) return false;
    if (filters.fileType && (doc.fileType || '').toLowerCase() !== filters.fileType.toLowerCase()) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Daftar Dokumen Administrasi Sekolah</h1>
        <p className="text-xs text-slate-500 mt-1">
          Cari, filter, preview, dan unduh berkas administrasi pembelajaran dan kurikulum.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari kata kunci: contoh 'Modul Ajar Matematika', 'Prota', 'KTSP'..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 mr-1">Tampilan:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px] cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-emerald-600 text-white border-emerald-600'
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
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <List className="w-4 h-4" />
            Tabel
          </button>
        </div>
      </div>

      {/* Filter */}
      <DocumentFilter
        categories={categories}
        filters={filters}
        onChange={setFilters}
        showStatusFilter={false}
      />

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Memuat dokumen administrasi..." />
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          title="Tidak Ada Dokumen Ditemukan"
          message={
            searchQuery || filters.categoryId
              ? 'Tidak ada dokumen yang cocok dengan kata pencarian atau filter yang diterapkan.'
              : 'Belum ada dokumen administrasi yang tersedia untuk diunduh.'
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.documentId}
              doc={doc}
              onPreview={(d) => setSelectedDocForPreview(d)}
              onDownload={handleDownload}
              isAdmin={false}
            />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={filteredDocuments}
          onPreview={(d) => setSelectedDocForPreview(d)}
          onDownload={handleDownload}
          isAdmin={false}
        />
      )}

      {/* Preview Modal */}
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
