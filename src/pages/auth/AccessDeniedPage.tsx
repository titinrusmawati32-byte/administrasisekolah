import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldX, Home, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AccessDeniedPage: React.FC = () => {
  const { userProfile, switchToAdminRole, logout } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleSwitchAdmin = async () => {
    setSwitching(true);
    try {
      await switchToAdminRole();
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldX className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">Akses Ditolak (403)</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Akun Anda terdaftar sebagai <span className="font-bold text-slate-700">Guru</span> ({userProfile?.email || 'guru'}). Halaman Administrator memerlukan hak akses khusus.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={handleSwitchAdmin}
            disabled={switching}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {switching ? 'Mengaktifkan Akses Admin...' : 'Beralih ke Hak Akses Admin Sekolah'}
          </button>

          <Link
            to="/guru/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Ke Dashboard Guru
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-rose-600 py-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar dan Ganti Akun
          </button>
        </div>
      </div>
    </div>
  );
};
