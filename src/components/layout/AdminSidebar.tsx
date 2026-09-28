import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  X,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getActiveAnnouncements } from '../../services/announcementService';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileDrawer?: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number | string;
}

interface MenuGroup {
  groupTitle: string;
  items: NavItem[];
}

interface TooltipState {
  label: string;
  badge?: number | string;
  top: number;
  left: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  onCloseMobile,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isMobileDrawer = false
}) => {
  const { logout, userProfile, schoolSettings } = useAuth();
  const location = useLocation();

  // Internal collapsed state if not controlled externally
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });

  const isCollapsed = isMobileDrawer ? false : (controlledCollapsed ?? internalCollapsed);

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('admin_sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  // Real announcements count (no dummy numbers)
  const [activeAnnouncementsCount, setActiveAnnouncementsCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    getActiveAnnouncements()
      .then((announcements) => {
        if (isMounted && announcements && announcements.length > 0) {
          setActiveAnnouncementsCount(announcements.length);
        }
      })
      .catch((err) => {
        console.warn('Could not load announcements count for sidebar badge:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Floating tooltip state for collapsed mode
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const showTooltip = (label: string, badge: number | string | undefined, element: HTMLElement) => {
    if (!isCollapsed) return;
    const rect = element.getBoundingClientRect();
    setTooltip({
      label,
      badge,
      top: rect.top + rect.height / 2,
      left: rect.right + 10
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  // Grouped Menu Navigation as requested
  const menuGroups: MenuGroup[] = [
    {
      groupTitle: 'UTAMA',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, end: true }
      ]
    },
    {
      groupTitle: 'DOKUMEN',
      items: [
        { label: 'Semua Dokumen', path: '/admin/documents', icon: FileText, end: true },
        { label: 'Tambah Dokumen', path: '/admin/documents/create', icon: FilePlus },
        { label: 'Kategori Dokumen', path: '/admin/categories', icon: FolderKanban }
      ]
    },
    {
      groupTitle: 'PENGELOLAAN',
      items: [
        { label: 'Kelola Pengguna', path: '/admin/users', icon: Users },
        { label: 'Log Aktivitas', path: '/admin/activity', icon: Activity },
        { label: 'Statistik Download', path: '/admin/downloads', icon: DownloadCloud }
      ]
    },
    {
      groupTitle: 'INFORMASI',
      items: [
        {
          label: 'Pengumuman',
          path: '/admin/announcements',
          icon: Megaphone,
          badge: activeAnnouncementsCount
        }
      ]
    },
    {
      groupTitle: 'SEKOLAH',
      items: [
        { label: 'Pengaturan Sekolah', path: '/admin/settings', icon: School },
        { label: 'Profil Admin', path: '/admin/profile', icon: User }
      ]
    }
  ];

  const handleLinkClick = () => {
    hideTooltip();
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    hideTooltip();
    logout();
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className="w-full bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800/90 select-none relative transition-all duration-300 ease-in-out"
    >
      {/* 1. SIDEBAR HEADER */}
      <div
        className={`border-b border-slate-800 shrink-0 transition-all duration-300 ${
          isCollapsed ? 'p-3 flex flex-col items-center gap-2' : 'p-4 sm:p-4.5 flex items-center justify-between gap-2.5'
        }`}
      >
        {isCollapsed ? (
          // Collapsed Header View (72px)
          <>
            <div
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-600/30 shrink-0 overflow-hidden"
              title={schoolSettings?.name || 'Pusat Administrasi'}
            >
              {schoolSettings?.logo ? (
                <img
                  src={schoolSettings.logo}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                'PAS'
              )}
            </div>

            {/* Desktop Expand Toggle Button */}
            {!isMobileDrawer && (
              <button
                type="button"
                onClick={handleToggle}
                className="w-9 h-9 mt-1 text-slate-400 hover:text-white hover:bg-slate-800/90 rounded-lg transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          // Expanded Header View (260px or Mobile Drawer)
          <>
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-600/30 shrink-0 overflow-hidden">
                {schoolSettings?.logo ? (
                  <img
                    src={schoolSettings.logo}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  'PAS'
                )}
              </div>
              <div className="overflow-hidden min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate leading-tight">
                  {schoolSettings?.name || 'PUSAT ADMINISTRASI'}
                </h1>
                <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase mt-0.5 truncate">
                  ADMINISTRATOR
                </p>
              </div>
            </div>

            {/* Toggle Button or Mobile Close Button */}
            {isMobileDrawer ? (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close navigation"
                title="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggle}
                className="w-9 h-9 text-slate-400 hover:text-white hover:bg-slate-800/90 rounded-xl transition-colors flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* 2. NAVIGATION MENU LINKS */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden ${
          isCollapsed ? 'p-2 space-y-3' : 'p-3 sm:p-3.5 space-y-3'
        }`}
        onScroll={hideTooltip}
      >
        {menuGroups.map((group, groupIdx) => (
          <div key={group.groupTitle} className="space-y-1">
            {/* Group Label or Collapsed Divider */}
            {isCollapsed ? (
              groupIdx > 0 && <div className="border-t border-slate-800/80 my-2 mx-1" />
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pt-1 pb-1">
                {group.groupTitle}
              </p>
            )}

            {/* Items inside group */}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={handleLinkClick}
                  onMouseEnter={(e) => showTooltip(item.label, item.badge, e.currentTarget)}
                  onMouseLeave={hideTooltip}
                  onFocus={(e) => showTooltip(item.label, item.badge, e.currentTarget)}
                  onBlur={hideTooltip}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `group relative flex items-center transition-all duration-200 rounded-xl text-xs font-semibold focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isCollapsed
                        ? 'w-11 h-11 mx-auto justify-center'
                        : 'w-full px-3 py-2.5 min-h-[42px] gap-3 justify-between'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Icon */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        <Icon
                          className={`transition-colors shrink-0 ${
                            isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                          } ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}
                        />

                        {/* Collapsed Badge (Stays neatly anchored to icon inside 72px) */}
                        {isCollapsed && item.badge !== undefined && (
                          <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center bg-blue-500 text-white ring-2 ring-slate-900 shadow-sm pointer-events-none">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Expanded Item Label & Badge */}
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0 overflow-hidden">
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 3. PROFILE & LOGOUT FOOTER (STICKY AT BOTTOM) */}
      <div
        className={`border-t border-slate-800 bg-slate-950/60 shrink-0 transition-all duration-300 ${
          isCollapsed ? 'p-2.5 flex flex-col items-center gap-2.5' : 'p-3.5 sm:p-4 space-y-3'
        }`}
      >
        {isCollapsed ? (
          // Collapsed Footer View
          <>
            <div
              className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/30 cursor-default"
              onMouseEnter={(e) =>
                showTooltip(userProfile?.name || 'Administrator Sekolah', undefined, e.currentTarget)
              }
              onMouseLeave={hideTooltip}
              onFocus={(e) =>
                showTooltip(userProfile?.name || 'Administrator Sekolah', undefined, e.currentTarget)
              }
              onBlur={hideTooltip}
              tabIndex={0}
              aria-label={`Administrator: ${userProfile?.name || 'Admin Sekolah'}`}
            >
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt="Admin"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                userProfile?.name?.charAt(0) || 'A'
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              onMouseEnter={(e) => showTooltip('Keluar (Logout)', undefined, e.currentTarget)}
              onMouseLeave={hideTooltip}
              onFocus={(e) => showTooltip('Keluar (Logout)', undefined, e.currentTarget)}
              onBlur={hideTooltip}
              className="w-10 h-10 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
              aria-label="Keluar (Logout)"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </>
        ) : (
          // Expanded Footer View
          <>
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/30 overflow-hidden">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Admin"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  userProfile?.name?.charAt(0) || 'A'
                )}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {userProfile?.name || 'Administrator Sekolah'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {userProfile?.email || 'admin@sekolah.sch.id'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-colors min-h-[42px] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
              aria-label="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Keluar (Logout)</span>
            </button>
          </>
        )}
      </div>

      {/* 4. FLOATING TOOLTIP FOR COLLAPSED MODE (Fixed, Non-Clipping) */}
      {isCollapsed && tooltip && (
        <div
          style={{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }}
          className="fixed z-[100] -translate-y-1/2 flex items-center gap-2 bg-slate-900 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700/90 shadow-xl shadow-black/50 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          {/* Arrow pointing to icon */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700/90 rotate-45" />
          <span>{tooltip.label}</span>
          {tooltip.badge !== undefined && (
            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/30 text-blue-300 text-[10px] font-bold">
              {tooltip.badge}
            </span>
          )}
        </div>
      )}
    </aside>
  );
};
