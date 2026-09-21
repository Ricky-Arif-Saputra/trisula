import React, { useState, useEffect } from 'react';
import { ScreenType, MathCategory } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BerandaScreen } from './components/screens/BerandaScreen';
import { MateriScreen } from './components/screens/MateriScreen';
import { LatihanScreen } from './components/screens/LatihanScreen';
import { SimulasiScreen } from './components/screens/SimulasiScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { useAuth } from './components/Auth/AuthProvider';
import AuthLayout from './components/Auth/AuthLayout';
import AuthTabs from './components/Auth/AuthTabs';

export default function App() {
  const { user, loading } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('beranda');
  const [materiCategory, setMateriCategory] = useState<MathCategory | null>(null);
  const [latihanCategory, setLatihanCategory] = useState<MathCategory | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [userXp, setUserXp] = useState<number>(4850);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('trisula_theme') === 'dark';
    setIsDark(isDarkStored);
    if (isDarkStored) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('trisula_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('trisula_theme', 'light');
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleClaimXp = (amount: number) => {
    setUserXp((prev) => prev + amount);
    showToast(`Selamat! +${amount} XP berhasil ditambahkan ke profil Anda.`);
  };

  const handleNavigate = (screen: ScreenType, category?: MathCategory | null) => {
    if (category !== undefined) {
      if (screen === 'materi') setMateriCategory(category);
      if (screen === 'latihan') setLatihanCategory(category);
    } else {
      if (screen === 'materi') setMateriCategory(null); // Reset ke 5 Kartu Utama
      if (screen === 'latihan') setLatihanCategory(null); // Reset ke 5 Topik Latihan
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDetailView = (currentScreen === 'materi' && materiCategory !== null) || (currentScreen === 'latihan' && latihanCategory !== null);

  const handleBack = () => {
    if (currentScreen === 'materi') setMateriCategory(null);
    if (currentScreen === 'latihan') setLatihanCategory(null);
  };

  const getHeaderTitle = () => {
    if (currentScreen === 'materi') {
      if (materiCategory === 'bilangan') return 'Detail Materi: Bilangan';
      if (materiCategory === 'aljabar') return 'Detail Materi: Aljabar';
      if (materiCategory === 'geometri') return 'Detail Materi: Geometri';
      if (materiCategory === 'trigonometri') return 'Detail Materi: Trigonometri';
      if (materiCategory === 'peluang') return 'Detail Materi: Data & Peluang';
      return 'Daftar 5 Materi Utama';
    }
    if (currentScreen === 'latihan') {
      if (latihanCategory === 'bilangan') return 'Latihan: Bilangan';
      if (latihanCategory === 'aljabar') return 'Latihan: Aljabar';
      if (latihanCategory === 'geometri') return 'Latihan: Geometri';
      if (latihanCategory === 'trigonometri') return 'Latihan: Trigonometri';
      if (latihanCategory === 'peluang') return 'Latihan: Data & Peluang';
      return 'Daftar Topik Latihan';
    }
    if (currentScreen === 'beranda') return 'TRISULA EduMath';
    if (currentScreen === 'simulasi') return 'Laboratorium Simulasi 3D';
    if (currentScreen === 'dashboard') return 'Dasbor Analyst & Profil';
    return 'TRISULA EduMath';
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8f9fa',
        fontFamily: 'sans-serif',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #006b5c',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: '#006b5c', fontSize: '14px', fontWeight: 600 }}>Memuat TRISULA EduMath...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in — show auth screen
  if (!user) {
    return (
      <AuthLayout>
        <AuthTabs />
      </AuthLayout>
    );
  }

  // Logged in — show main app
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans transition-colors duration-300">
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto flex flex-col min-h-screen bg-surface relative shadow-2xl transition-all duration-300">
        <Header
          currentScreen={currentScreen}
          title={getHeaderTitle()}
          showBack={isDetailView}
          onBack={handleBack}
          isDark={isDark}
          onToggleDark={handleToggleTheme}
        />

        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-primary text-on-primary shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <span className="material-symbols-outlined text-secondary text-[20px]">military_tech</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 flex flex-col pt-16 pb-20 w-full">
          {currentScreen === 'beranda' && (
            <BerandaScreen onNavigate={(screen, cat) => handleNavigate(screen, cat)} />
          )}
          {currentScreen === 'materi' && (
            <MateriScreen
              initialCategory={materiCategory}
              onSelectCategory={(cat) => setMateriCategory(cat)}
              onNavigateToProblem={() => handleNavigate('latihan')}
            />
          )}
          {currentScreen === 'latihan' && (
            <LatihanScreen 
              initialCategory={latihanCategory}
              onSelectCategory={(cat) => setLatihanCategory(cat)}
              onClaimXp={handleClaimXp} 
              onNavigateToSimulasi={() => handleNavigate('simulasi')} 
            />
          )}
          {currentScreen === 'simulasi' && <SimulasiScreen />}
          {currentScreen === 'dashboard' && (
            <DashboardScreen onNavigate={(screen, cat) => handleNavigate(screen, cat)} />
          )}
        </main>

        <BottomNav
          currentScreen={currentScreen}
          onSelectScreen={(screen) => {
            handleNavigate(screen, null); // Always reset category when using BottomNav
          }}
        />
      </div>
    </div>
  );
}
