import React from 'react';
import { Menu, School, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { userProfile, schoolSettings, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button (Touch friendly min 44px) */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden min-h-[44px] min-w-[44px] -ml-1 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* School Name & Branding Header */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 items-center justify-center font-bold text-xs shrink-0">
            <School className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight truncate max-w-[130px] min-[380px]:max-w-[180px] sm:max-w-xs md:max-w-md">
              {schoolSettings?.name || 'SD Negeri 01 Permata'}
            </h2>
            <p className="text-[10px] font-semibold text-slate-500 truncate">
              NPSN: {schoolSettings?.npsn || '10203040'}
            </p>
          </div>
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role Badge (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold">
          {isAdmin ? (
            <span className="flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Administrator
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Guru / Pendidik
            </span>
          )}
        </div>

        {/* User Avatar & Name */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="relative">
            <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs overflow-hidden">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                userProfile?.name?.charAt(0) || 'U'
              )}
            </div>
            {/* Mobile role indicator dot */}
            <span
              className={`md:hidden absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isAdmin ? 'bg-blue-600' : 'bg-emerald-500'
              }`}
              title={isAdmin ? 'Administrator' : 'Guru'}
            />
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
