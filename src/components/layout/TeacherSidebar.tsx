import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  DownloadCloud,
  Megaphone,
  User,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface TeacherSidebarProps {
  onCloseMobile?: () => void;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ onCloseMobile }) => {
  const { logout, userProfile, schoolSettings } = useAuth();

  const navItems = [
    { label: 'Dashboard Guru', path: '/guru/dashboard', icon: LayoutDashboard },
    { label: 'Cari Dokumen', path: '/guru/documents', icon: FileText },
    { label: 'Kategori Dokumen', path: '/guru/categories', icon: FolderKanban },
    { label: 'Riwayat Download', path: '/guru/downloads', icon: DownloadCloud },
    { label: 'Pengumuman Sekolah', path: '/guru/announcements', icon: Megaphone },
    { label: 'Profil Saya', path: '/guru/profile', icon: User }
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-72 sm:w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0 select-none">
      {/* Header Branding */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20 shrink-0">
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
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              PORTAL GURU
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
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
                `flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
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
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 border border-emerald-500/30">
            {userProfile?.name?.charAt(0) || 'G'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{userProfile?.name || 'Guru'}</p>
            <p className="text-[10px] text-slate-400 truncate">{userProfile?.position || 'Guru SD'}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-colors min-h-[44px] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
};
