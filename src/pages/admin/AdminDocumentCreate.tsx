import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, X, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCategories } from '../../services/categoryService';
import { uploadDocument } from '../../services/documentService';
import { Category, DocumentStatus, AccessLevel } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FileIcon } from '../../components/common/FileIcon';
import { formatBytes } from '../../utils/formatters';
import { Toast, ToastType } from '../../components/common/Toast';

export const AdminDocumentCreate: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState('1');
  const [status, setStatus] = useState<DocumentStatus>('Published');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('semua');
  const [remarks, setRemarks] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { currentUser, userProfile, googleAccessToken, connectGoogleWorkspace } = useAuth();
  const navigate = useNavigate();

  const handleConnectGoogle = async () => {
    try {
      await connectGoogleWorkspace();
      setToast({ message: 'Terhubung dengan Google Drive!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Gagal menghubungkan Google Drive.', type: 'error' });
    }
  };

  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) {
        setCategoryId(cats[0].categoryId);
      }
      setLoadingCats(false);
    });
  }, []);

  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'zip', 'rar'];
  const maxFileSizeBytes = 50 * 1024 * 1024; // 50MB

  const handleFileChange = (selectedFile: File | null) => {
    setFileError(null);
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      setFileError(`Format file .${ext.toUpperCase()} tidak diperbolehkan. Format yang diizinkan: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, ZIP.`);
      setFile(null);
      return;
    }

    if (selectedFile.size > maxFileSizeBytes) {
      setFileError(`Ukuran file terlalu besar (${formatBytes(selectedFile.size)}). Maksimal ukuran file adalah 50 MB.`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    if (!title) {
      // Auto-populate title from filename without extension
      const rawName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setTitle(rawName.replace(/_/g, ' ').replace(/-/g, ' '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setToast({ message: 'Judul dokumen wajib diisi.', type: 'error' });
      return;
    }
    if (!categoryId) {
      setToast({ message: 'Kategori dokumen wajib dipilih.', type: 'error' });
      return;
    }
    if (!file) {
      setToast({ message: 'Silakan pilih atau unggah file dokumen.', type: 'error' });
      return;
    }

    if (!currentUser || !userProfile) return;

    setUploading(true);
    setUploadProgress(10);

    try {
      const selectedCategory = categories.find((c) => c.categoryId === categoryId);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';

      await uploadDocument(
        {
          title: title.trim(),
          description: description.trim(),
          categoryId,
          categoryName: selectedCategory?.name || 'Administrasi',
          subcategoryId,
          file,
          googleAccessToken,
          fileName: file.name,
          fileType: ext,
          fileSize: file.size,
          year,
          semester,
          status,
          accessLevel,
          remarks,
          uploadedBy: currentUser.uid,
          uploadedByName: userProfile.name
        },
        (progress) => setUploadProgress(progress)
      );

      setToast({ message: 'Dokumen berhasil diunggah!', type: 'success' });
      setTimeout(() => {
        navigate('/admin/documents');
      }, 1000);
    } catch (err) {
      console.error('Error uploading document:', err);
      setToast({ message: 'Gagal mengunggah dokumen. Silakan coba lagi.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/documents')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Unggah Dokumen Administrasi</h1>
          <p className="text-xs text-slate-500">
            Isi informasi dokumen dan sertakan file yang akan dipublikasikan untuk guru.
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Upload File Box */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            File Dokumen *
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              file
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30'
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-white border border-emerald-200 rounded-2xl shadow-xs">
                  <FileIcon fileType={file.name.split('.').pop() || ''} className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Ganti File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Tarik file ke sini atau{' '}
                    <label className="text-blue-600 hover:underline cursor-pointer">
                      pilih file
                      <input
                        type="file"
                        onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format diperbolehkan: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, ZIP (Maks. 50MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {fileError && (
            <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}
        </div>

        {/* Progress bar if uploading */}
        {uploading && (
          <div className="space-y-1.5 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex justify-between text-xs font-bold text-blue-800">
              <span>Mengunggah dokumen ke Firebase...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="bg-blue-600 h-full transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Judul Dokumen */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Dokumen *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Modul Ajar Matematika Kelas 4 Semester 1"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Dokumen *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subkategori / Topik */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subkategori / Topik (Opsional)
            </label>
            <input
              type="text"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              placeholder="contoh: Kurikulum Merdeka / Bab 1"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Dokumen</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Semester */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Publikasi</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DocumentStatus)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Published">Published (Dapat diunduh guru)</option>
              <option value="Draft">Draft (Hanya dapat dilihat admin)</option>
              <option value="Archived">Archived (Arsip lama)</option>
            </select>
          </div>

          {/* Access Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hak Akses</label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="semua">Semua Pengguna (Guru & Admin)</option>
              <option value="guru">Khusus Guru</option>
              <option value="admin">Khusus Internal Admin</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi & Catatan Penggunaan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Berikan ringkasan atau petunjuk pengisian modul/dokumen ini untuk para guru..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/admin/documents')}
            disabled={uploading}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {uploading ? 'Mengunggah Dokumen...' : 'Simpan & Publikasikan'}
          </button>
        </div>
      </form>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
