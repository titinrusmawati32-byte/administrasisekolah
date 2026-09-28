import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AccessDeniedPage } from './pages/auth/AccessDeniedPage';
import { NotFoundPage } from './pages/auth/NotFoundPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDocumentList } from './pages/admin/AdminDocumentList';
import { AdminDocumentCreate } from './pages/admin/AdminDocumentCreate';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminUserList } from './pages/admin/AdminUserList';
import { AdminActivityLog } from './pages/admin/AdminActivityLog';
import { AdminDownloadStats } from './pages/admin/AdminDownloadStats';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminSchoolSettings } from './pages/admin/AdminSchoolSettings';
import { AdminProfile } from './pages/admin/AdminProfile';

// Guru Pages
import { GuruDashboard } from './pages/guru/GuruDashboard';
import { GuruDocumentList } from './pages/guru/GuruDocumentList';
import { GuruCategories } from './pages/guru/GuruCategories';
import { GuruDownloadHistory } from './pages/guru/GuruDownloadHistory';
import { GuruAnnouncements } from './pages/guru/GuruAnnouncements';
import { GuruProfile } from './pages/guru/GuruProfile';

const RootRedirect: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Memuat aplikasi..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/guru/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/403" element={<AccessDeniedPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/documents" element={<AdminDocumentList />} />
              <Route path="/admin/documents/create" element={<AdminDocumentCreate />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/users" element={<AdminUserList />} />
              <Route path="/admin/activity" element={<AdminActivityLog />} />
              <Route path="/admin/downloads" element={<AdminDownloadStats />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/settings" element={<AdminSchoolSettings />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Route>

          {/* Protected Guru Routes */}
          <Route element={<ProtectedRoute allowedRoles={['guru', 'admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/guru/dashboard" element={<GuruDashboard />} />
              <Route path="/guru/documents" element={<GuruDocumentList />} />
              <Route path="/guru/categories" element={<GuruCategories />} />
              <Route path="/guru/downloads" element={<GuruDownloadHistory />} />
              <Route path="/guru/announcements" element={<GuruAnnouncements />} />
              <Route path="/guru/profile" element={<GuruProfile />} />
            </Route>
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
