import React from 'react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onSelectScreen }) => {
  const navItems: { id: ScreenType; label: string; icon: string }[] = [
    { id: 'beranda', label: 'Beranda', icon: 'home' },
    { id: 'materi', label: 'Materi', icon: 'menu_book' },
    { id: 'latihan-rme', label: 'Latihan', icon: 'ads_click' },
    { id: 'simulasi', label: 'Simulasi', icon: 'science' },
    { id: 'dashboard', label: 'Dashboard', icon: 'leaderboard' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface/90 dark:bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-outline-variant/20">
      <div className="max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto flex justify-around items-center h-16 px-4 sm:px-6">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-12 transition-all cursor-pointer ${
                isActive
                  ? 'text-primary-container dark:text-secondary-fixed font-bold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform ${
                  isActive ? 'fill-1 font-bold' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
