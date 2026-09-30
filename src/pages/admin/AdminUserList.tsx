import React, { useEffect, useState } from 'react';
import { Users, Shield, GraduationCap, CheckCircle, XCircle, Pencil, Trash2, Search, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { getAllUsers, setUserStatus, updateUserProfile, deleteUserRecord } from '../../services/userService';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/SearchBar';
import { Toast, ToastType } from '../../components/common/Toast';

export const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'semua' | 'guru' | 'admin'>('semua');

  // Edit Teacher Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Delete Teacher Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (err) {
      console.error('Error fetching user list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus: UserStatus = user.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await setUserStatus(user.uid, newStatus);
      setToast({
        message: `Status pengguna ${user.name} diubah menjadi ${newStatus}.`,
        type: 'success'
      });
      await loadUsers();
    } catch (err) {
      setToast({ message: 'Gagal mengubah status pengguna.', type: 'error' });
    }
  };

  const handleEditOpen = (user: UserProfile) => {
    setEditingUser(user);
    setEditPassword('');
    setShowEditPassword(false);
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      await updateUserProfile(editingUser.uid, {
        name: editingUser.name,
        nip: editingUser.nip,
        position: editingUser.position
      });

      if (editPassword.trim()) {
        try {
          const userPasswords: Record<string, string> = JSON.parse(localStorage.getItem('user_passwords_v1') || '{}');
          userPasswords[editingUser.email.toLowerCase()] = editPassword.trim();
          if (editingUser.nip) {
            userPasswords[editingUser.nip.trim()] = editPassword.trim();
          }
          userPasswords[editingUser.name.trim().toLowerCase()] = editPassword.trim();
          localStorage.setItem('user_passwords_v1', JSON.stringify(userPasswords));
        } catch (e) {}
      }

      setToast({ message: 'Data guru berhasil diperbarui.', type: 'success' });
      setEditModalOpen(false);
      await loadUsers();
    } catch (err) {
      setToast({ message: 'Gagal memperbarui pengguna.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOpen = (user: UserProfile) => {
    setDeletingUser(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await deleteUserRecord(deletingUser.uid, deletingUser.email);
      setToast({
        message: `Akun pengguna ${deletingUser.name} (${deletingUser.email}) berhasil dihapus dari server.`,
        type: 'success'
      });
      setDeleteModalOpen(false);
      setDeletingUser(null);
      await loadUsers();
    } catch (err) {
      setToast({ message: 'Gagal menghapus pengguna dari server.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'semua' && u.role !== roleFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchNip = u.nip?.toLowerCase().includes(q);
      const matchPos = u.position?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchNip && !matchPos) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Manajemen Pengguna & Guru</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data guru, administrator, serta status keaktifan akun dalam sistem. Username dan password guru telah diatur di dalam sistem kode.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama, email, NIP, atau jabatan guru..."
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 focus:ring-1 focus:ring-blue-500 min-h-[40px]"
          >
            <option value="semua">Semua Peran</option>
            <option value="guru">Guru / Pendidik</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Display */}
      {loading ? (
        <LoadingSpinner label="Memuat daftar pengguna..." />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Tidak ada pengguna yang cocok dengan kriteria pencarian.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile Card View (< 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.uid}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {user.position || 'Guru Kelas'} {user.nip ? `• NIP: ${user.nip}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3 text-blue-600" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <GraduationCap className="w-3 h-3 text-emerald-600" />
                        Guru
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors cursor-pointer min-h-[32px] ${
                        user.status === 'aktif'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {user.status === 'aktif' ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Nonaktif
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditOpen(user)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-200 transition-colors inline-flex items-center gap-1 min-h-[36px] cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOpen(user)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-200 transition-colors inline-flex items-center gap-1 min-h-[36px] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Table View (>= 768px) */}
          <div className="hidden md:block bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">NIP</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Peran</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.name}</p>
                            <p className="text-[11px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {user.nip || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {user.position || 'Guru Kelas'}
                      </td>

                      <td className="py-3.5 px-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <Shield className="w-3 h-3 text-blue-600" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <GraduationCap className="w-3 h-3 text-emerald-600" />
                            Guru
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            user.status === 'aktif'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {user.status === 'aktif' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Nonaktif
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditOpen(user)}
                            className="px-2.5 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteOpen(user)}
                            className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Data Guru - ${editingUser.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                  className="w-full min-h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Tugas *</label>
                <input
                  type="text"
                  value={editingUser.position || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                  required
                  placeholder="contoh: Guru Kelas 4A"
                  className="w-full min-h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  value={editingUser.nip || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, nip: e.target.value })}
                  placeholder="contoh: 19850123..."
                  className="w-full min-h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reset Password Baru (Opsional)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Kosongkan jika password tidak ingin diubah"
                    className="w-full min-h-[42px] pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showEditPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="min-h-[44px] px-5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center"
              >
                {saving ? 'Memperbarui...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingUser && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Konfirmasi Hapus Akun Pengguna"
        >
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-900">Perhatian: Akun akan Dihapus Permanen</h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun <span className="font-bold underline">{deletingUser.name}</span> ({deletingUser.email}) dari server?
                </p>
                <p className="text-[11px] text-rose-600 italic pt-1">
                  Pengguna tidak akan bisa login lagi ke sistem sampai Admin membuatkan/generate akun baru kembali.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Nama:</span>
                <span className="font-bold text-slate-800">{deletingUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Email Login:</span>
                <span className="font-mono text-slate-800">{deletingUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Peran:</span>
                <span className="capitalize font-semibold text-slate-700">{deletingUser.role}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="min-h-[44px] px-5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="min-h-[44px] px-6 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-200 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};
