import React from 'react';
import { Menu, Bell, User, School, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { userProfile, schoolSettings, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* School Name & Branding Header */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 items-center justify-center font-bold text-xs">
            <School className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
              {schoolSettings?.name || 'SD Negeri 01 Permata'}
            </h2>
            <p className="text-[10px] font-semibold text-slate-500">
              NPSN: {schoolSettings?.npsn || '10203040'}
            </p>
          </div>
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border">
          {isAdmin ? (
            <span className="flex items-center gap-1 text-blue-700 bg-blue-50 border-blue-200 px-2.5 py-0.5 rounded-full border">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Administrator
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border-emerald-200 px-2.5 py-0.5 rounded-full border">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Guru / Tenaga Pendidik
            </span>
          )}
        </div>

        {/* User Avatar & Name */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs overflow-hidden">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              userProfile?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
              {userProfile?.name || 'Pengguna'}
            </p>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {userProfile?.position || userProfile?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
