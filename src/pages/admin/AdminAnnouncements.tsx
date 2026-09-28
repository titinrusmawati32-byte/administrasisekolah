import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, CheckCircle2, Archive } from 'lucide-react';
import { getAnnouncements, createAnnouncement, updateAnnouncementStatus, deleteAnnouncement } from '../../services/announcementService';
import { Announcement } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast, ToastType } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [deletingAnn, setDeletingAnn] = useState<Announcement | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { currentUser, userProfile } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !currentUser || !userProfile) return;

    try {
      await createAnnouncement(title.trim(), content.trim(), currentUser.uid, userProfile.name);
      setToast({ message: 'Pengumuman baru berhasil dipublikasikan.', type: 'success' });
      setTitle('');
      setContent('');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setToast({ message: 'Gagal membuat pengumuman.', type: 'error' });
    }
  };

  const handleToggleStatus = async (ann: Announcement) => {
    const nextStatus = ann.status === 'active' ? 'archived' : 'active';
    try {
      await updateAnnouncementStatus(ann.announcementId, nextStatus);
      setToast({ message: `Status pengumuman diubah ke ${nextStatus}.`, type: 'success' });
      await loadData();
    } catch (err) {
      setToast({ message: 'Gagal mengubah status pengumuman.', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingAnn) return;
    const annToDelete = deletingAnn;

    // Optimistic UI update: close modal and remove from state instantly
    setAnnouncements((prev) => prev.filter((a) => a.announcementId !== annToDelete.announcementId));
    setDeletingAnn(null);
    setToast({ message: 'Pengumuman berhasil dihapus.', type: 'success' });

    try {
      await deleteAnnouncement(annToDelete.announcementId);
    } catch (err) {
      console.warn('Background announcement delete:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pengumuman Sekolah</h1>
          <p className="text-xs text-slate-500 mt-1">
            Buat pesan penting yang langsung muncul di dashboard guru.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Pengumuman Baru
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Memuat pengumuman..." />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.announcementId}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{ann.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      Oleh {ann.createdByName} • {formatDate(ann.createdAt)}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    ann.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {ann.status === 'active' ? 'Aktif' : 'Diarsipkan'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {ann.content}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleToggleStatus(ann)}
                  className="px-3 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <Archive className="w-3.5 h-3.5" />
                  {ann.status === 'active' ? 'Arsipkan' : 'Aktifkan'}
                </button>
                <button
                  onClick={() => setDeletingAnn(ann)}
                  className="px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Buat Pengumuman Baru"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Pembaruan Perangkat Ajar Semester 1"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Isi Pengumuman *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan pengumuman penting untuk seluruh guru di sekolah..."
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Publikasikan
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingAnn)}
        onClose={() => setDeletingAnn(null)}
        onConfirm={handleDelete}
        title="Hapus Pengumuman"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${deletingAnn?.title}"?`}
        confirmText="Hapus"
        isDangerous={true}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};
