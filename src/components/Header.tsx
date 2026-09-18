import React, { useState } from 'react';
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
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen: _currentScreen,
  title,
  isDark,
  onToggleDark,
  onBack,
  showBack = false,
  onOpenProfile,
}) => {
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-none dark:border-b dark:border-outline-variant/30">
      <div className="max-w-2xl mx-auto h-16 px-margin-mobile flex items-center justify-between gap-space-sm">
        {/* Left: Logo and title / Back button */}
        <div className="flex items-center gap-space-xs min-w-0 flex-1">
          {showBack && (
            <button
              aria-label="Kembali"
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex-shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          )}

          <img
            alt="TRISULA EduMath Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src={ASSETS.logo}
          />

          <div className="flex flex-col min-w-0 ml-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[11px] text-primary-container dark:text-primary-fixed truncate">
                TRISULA
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px] uppercase flex-shrink-0">
                Kelas XII SMA
              </span>
            </div>
            <h1 className="text-sm font-bold text-on-surface truncate leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 relative">
          <button
            aria-label="Beralih Mode Gelap"
            onClick={onToggleDark}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <div className="relative">
            <button
              aria-label="Notifikasi"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadCount(0);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container relative transition-colors cursor-pointer"
              title="Notifikasi"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 p-space-sm z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <span className="font-bold text-xs text-on-surface">Pemberitahuan</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-on-surface-variant hover:text-on-surface"
                  >
                    Tutup
                  </button>
                </div>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="p-2 rounded-lg bg-secondary-container/20 flex gap-2 items-start">
                    <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0">
                      local_fire_department
                    </span>
                    <div>
                      <p className="font-bold text-on-surface">Tantangan Mingguan Berakhir!</p>
                      <p className="text-on-surface-variant text-[11px]">
                        2 hari tersisa untuk menyelesaikan pemodelan Jembatan Rangka Baja (+250 XP).
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container flex gap-2 items-start">
                    <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">
                      military_tech
                    </span>
                    <div>
                      <p className="font-bold text-on-surface">Pencapaian Baru</p>
                      <p className="text-on-surface-variant text-[11px]">
                        Selamat! Anda meraih streak belajar konsisten 14 hari.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-secondary transition-all overflow-hidden ml-1"
              title="Profil Pengguna"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          )}
          {/* Logout button (Tombol Keluar) */}
          <button
            onClick={() => signOut()}
            className="w-8 h-8 rounded-full bg-error/15 text-error hover:bg-error hover:text-white flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-error/50 transition-all overflow-hidden ml-1"
            title="Keluar / Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
