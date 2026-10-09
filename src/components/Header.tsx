import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth/AuthProvider';
import { ASSETS } from '../data';
import { ScreenType } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  title: string;
  isDark: boolean;
  onToggleDark: () => void;
  onBack?: () => void;
  showBack?: boolean;
  onOpenProfile?: () => void;
  /** 0–100, shown as progress bar on exam screens */
  progress?: number;
  /** Timer string e.g. "45:00" shown on exam screens */
  timer?: string;
  /** Student name shown on exam screens */
  studentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen: _currentScreen,
  title,
  isDark,
  onToggleDark,
  onBack,
  showBack = false,
  onOpenProfile,
  progress,
  timer,
  studentName,
}) => {
  const { signOut, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayEmail = user?.email ?? '';
  const displayInitial = displayEmail.charAt(0).toUpperCase() || 'U';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm shadow-slate-200/50'
          : 'backdrop-blur-sm bg-white/70 border-b border-slate-200/40'
      }`}
    >
      {/* Main header row */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-4">

        {/* Left: Logo & title / back */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack && (
            <button
              aria-label="Kembali"
              onClick={onBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 flex-shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}

          <img
            alt="TRISULA Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src={ASSETS.logo}
          />

          <div className="flex flex-col min-w-0 ml-0.5">
            <span className="font-black text-lg text-indigo-700 tracking-wide leading-none">TRISULA</span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase leading-none mt-0.5 hidden sm:block">
              EduMath
            </span>
          </div>

          {/* Page title pill — visible on medium+ screens */}
          {title && title !== 'TRISULA EduMath' && (
            <div className="hidden md:flex items-center gap-1.5 ml-2 px-3 py-1 bg-slate-100 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px] lg:max-w-xs">{title}</span>
            </div>
          )}
        </div>

        {/* Center: student name + timer on exam screens */}
        {(studentName || timer) && (
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {studentName && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200/60 rounded-xl">
                <span className="material-symbols-outlined text-indigo-500 text-[14px]">person</span>
                <span className="text-xs font-bold text-indigo-700 max-w-[120px] truncate">{studentName}</span>
              </div>
            )}
            {timer && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/60 rounded-xl">
                <span className="material-symbols-outlined text-amber-500 text-[14px]">timer</span>
                <span className="text-xs font-black text-amber-700 tabular-nums">{timer}</span>
              </div>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 relative">

          {/* Dark mode toggle */}
          <button
            aria-label="Beralih Mode Gelap"
            onClick={onToggleDark}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              aria-label="Notifikasi"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadCount(0);
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 relative transition-all duration-200 cursor-pointer"
              title="Notifikasi"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/60 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-700 uppercase tracking-widest">Pemberitahuan</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
                <div className="space-y-2 pt-3">
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-[14px]">local_fire_department</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Tantangan Mingguan Berakhir!</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                        2 hari tersisa untuk menyelesaikan pemodelan Jembatan Rangka Baja (+250 XP).
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-[14px]">military_tech</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Pencapaian Baru!</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                        Selamat! Anda meraih streak belajar konsisten 14 hari.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile button */}
          {onOpenProfile ? (
            <button
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-all duration-200 overflow-hidden ml-1 shadow-md shadow-indigo-500/20"
              title="Profil Pengguna"
            >
              <span className="font-black text-sm">{displayInitial}</span>
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center overflow-hidden ml-1 shadow-md shadow-indigo-500/20 flex-shrink-0">
              <span className="font-black text-sm">{displayInitial}</span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={() => signOut()}
            className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden ml-1"
            title="Keluar / Logout"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </div>
      </div>

      {/* Progress bar — shown when progress prop is provided (e.g. during exam) */}
      {progress !== undefined && (
        <div className="w-full h-1 bg-slate-200/70">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out rounded-r-full"
            style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </header>
  );
};
