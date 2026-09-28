import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  FolderKanban,
  Users,
  Activity,
  DownloadCloud,
  Megaphone,
  School,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { logout, userProfile, schoolSettings } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Semua Dokumen', path: '/admin/documents', icon: FileText },
    { label: 'Tambah Dokumen', path: '/admin/documents/create', icon: FilePlus },
    { label: 'Kategori Dokumen', path: '/admin/categories', icon: FolderKanban },
    { label: 'Kelola Pengguna', path: '/admin/users', icon: Users },
    { label: 'Log Aktivitas', path: '/admin/activity', icon: Activity },
    { label: 'Statistik Download', path: '/admin/downloads', icon: DownloadCloud },
    { label: 'Pengumuman', path: '/admin/announcements', icon: Megaphone },
    { label: 'Pengaturan Sekolah', path: '/admin/settings', icon: School },
    { label: 'Profil Admin', path: '/admin/profile', icon: User }
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0">
      {/* Header Branding */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20 shrink-0">
          {schoolSettings?.logo ? (
            <img src={schoolSettings.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
          ) : (
            'PAS'
          )}
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-white tracking-tight truncate">
            {schoolSettings?.name || 'PUSAT ADMINISTRASI'}
          </h1>
          <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
            ADMINISTRATOR
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/30">
            {userProfile?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{userProfile?.name || 'Admin Sekolah'}</p>
            <p className="text-[10px] text-slate-400 truncate">{userProfile?.email}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
};
