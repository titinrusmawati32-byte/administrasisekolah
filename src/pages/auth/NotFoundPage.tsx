import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const NotFoundPage: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 text-center space-y-5 shadow-xl">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Halaman Tidak Ditemukan (404)</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to={isAdmin ? '/admin/dashboard' : '/guru/dashboard'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
