import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Menu,
  FolderKanban,
  DownloadCloud
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

interface NavTabItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { isAdmin } = useAuth();

  const adminTabs: NavTabItem[] = [
    { label: 'Beranda', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Dokumen', path: '/admin/documents', icon: FileText },
    { label: 'Tambah', path: '/admin/documents/create', icon: PlusCircle, isPrimary: true },
    { label: 'Guru', path: '/admin/users', icon: Users },
  ];

  const teacherTabs: NavTabItem[] = [
    { label: 'Beranda', path: '/guru/dashboard', icon: LayoutDashboard },
    { label: 'Dokumen', path: '/guru/documents', icon: FileText },
    { label: 'Kategori', path: '/guru/categories', icon: FolderKanban },
    { label: 'Riwayat', path: '/guru/downloads', icon: DownloadCloud },
  ];

  const tabs = isAdmin ? adminTabs : teacherTabs;

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-2 py-1 safe-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          if (tab.isPrimary) {
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center -mt-4 group focus:outline-none`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95 ${
                        isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-blue-500/30'
                          : 'bg-blue-600 text-white shadow-blue-500/20'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 mt-1">
                      {tab.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] tracking-tight mt-0.5 leading-tight">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* More / Menu Drawer Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
          aria-label="Buka Menu Lainnya"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 leading-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
