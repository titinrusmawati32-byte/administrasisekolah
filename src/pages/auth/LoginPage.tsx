import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School, Lock, User, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, schoolSettings } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Username/Email dan Password wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await login(identifier, password);
      const clean = identifier.trim().toLowerCase();
      if (clean === 'admin' || clean.includes('admin') || clean.includes('frezafa20@gmail.com')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/guru/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa kembali username/email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-12 my-4 sm:my-8">
        {/* Left Side: Branding Banner */}
        <div className="md:col-span-5 bg-gradient-to-tr from-blue-700 to-indigo-800 p-5 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-white/20 shadow-inner">
              <School className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-blue-400/30">
              SISTEM DOKUMEN SEKOLAH
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 leading-tight">
              {schoolSettings?.name || 'PUSAT ADMINISTRASI SEKOLAH'}
            </h1>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Kelola dan akses dokumen administrasi sekolah, perangkat ajar, kurikulum, serta arsip resmi dengan aman dan efisien.
            </p>
          </div>

          <div className="relative z-10 pt-6 sm:pt-8 border-t border-white/15 space-y-2 text-xs text-blue-100 mt-6 sm:mt-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sistem Terenkripsi & Akses Berbasis Peran</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Portal Guru dan Administrator Sekolah</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Masuk ke Sistem</h2>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan username/email dan kata sandi Anda untuk mengakses portal sekolah
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 sm:mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username atau Alamat Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin atau email@sekolah.sch.id"
                  required
                  autoComplete="username"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi (Password)
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                'Memproses Login...'
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
