import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'guru')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Memeriksa otentikasi..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile && userProfile.status === 'nonaktif') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Akun Nonaktif</h3>
          <p className="text-sm text-slate-600">
            Akun Anda telah dinonaktifkan oleh Administrator Sekolah. Silakan hubungi admin sekolah untuk mengaktifkan kembali.
          </p>
          <a
            href="/login"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            Kembali ke Login
          </a>
        </div>
      </div>
    );
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
