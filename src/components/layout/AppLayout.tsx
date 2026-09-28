import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AdminSidebar } from './AdminSidebar';
import { TeacherSidebar } from './TeacherSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { loading, isAdmin } = useAuth();

  // Collapsible sidebar state with localStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return false;
  });

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Memuat sistem administrasi sekolah..." />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800 font-sans">
      {/* Desktop Sidebar (Permanent >= 1024px) */}
      <div
        className={`hidden lg:block h-full shrink-0 transition-[width] duration-300 ease-in-out ${
          isAdmin
            ? sidebarCollapsed
              ? 'w-[72px]'
              : 'w-[260px]'
            : 'w-[260px]'
        }`}
      >
        {isAdmin ? (
          <AdminSidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapsed}
          />
        ) : (
          <TeacherSidebar />
        )}
      </div>

      {/* Mobile Drawer Overlay (< 1024px) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[270px] max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-250">
            {isAdmin ? (
              <AdminSidebar
                onCloseMobile={() => setMobileMenuOpen(false)}
                isMobileDrawer={true}
              />
            ) : (
              <TeacherSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            )}
          </div>
        </div>
      )}

      {/* Main Content Area (Naturally expands/shrinks as sidebar collapses/expands) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Navbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onToggleDesktopCollapse={toggleSidebarCollapsed}
          isDesktopCollapsed={sidebarCollapsed}
        />

        {/* Scrollable Container with Mobile-First padding & bottom-bar clearance */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 pb-24 lg:pb-8 bg-slate-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (< 1024px) */}
        <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      </div>
    </div>
  );
};
