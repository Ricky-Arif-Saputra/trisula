import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Globe, 
  Sigma, 
  Binary, 
  MessageSquareShare, 
  ArrowRight,
  Bot,
  BarChart3,
  CheckCircle2,
  Zap,
  Target,
  XCircle,
  Play,
  Map as MapIcon
} from 'lucide-react';
import { ScreenType, MathCategory } from '../../types';
import { useAuth } from '../Auth/AuthProvider';

interface BerandaScreenProps {
  onNavigate: (screen: ScreenType, category?: MathCategory) => void;
  onOpenTeacherMode: () => void;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  onNavigate,
}) => {
  const { userName } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  const tabs = [
    {
      title: "1. Konteks Realistis",
      content: "Sebuah toko elektronik memberikan diskon bertingkat '50% + 20%' untuk televisi seharga Rp5.000.000. Budi mengira ia mendapat diskon 70% dan hanya perlu membayar Rp1.500.000. Apakah perhitungan Budi benar? Berapa pajak PPN 11% yang harus ditambahkan setelah diskon?",
      icon: <Globe size={18} />
    },
    {
      title: "2. Matematisasi",
      content: "Harga Awal (H) = Rp5.000.000\nDiskon 1 (D1) = 50%\nDiskon 2 (D2) = 20%\nPPN = 11%\n\nModel: \nH_setelah_D1 = H - (H * D1)\nH_akhir = H_setelah_D1 - (H_setelah_D1 * D2)\nTotal = H_akhir + (H_akhir * PPN)",
      icon: <Sigma size={18} />
    },
    {
      title: "3. Penyelesaian",
      content: "H_setelah_D1 = 5.000.000 - (5.000.000 * 0.5) = 2.500.000\nH_akhir = 2.500.000 - (2.500.000 * 0.2) = 2.000.000\nTotal Bayar = 2.000.000 + (2.000.000 * 0.11)\nTotal Bayar = 2.000.000 + 220.000 = Rp2.220.000",
      icon: <Binary size={18} />
    },
    {
      title: "4. Refleksi",
      content: "Perhitungan Budi salah. Diskon '50% + 20%' bukan berarti 70% dari harga awal, melainkan diskon berurutan. Harga akhir televisi setelah diskon adalah Rp2.000.000 (bukan Rp1.500.000), dan Budi harus menyiapkan Rp2.220.000 karena ada tambahan PPN 11%.",
      icon: <MessageSquareShare size={18} />
    }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden relative selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Ambient Gradients & Blurs */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-10 bg-rose-500 pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-10 bg-indigo-500 pointer-events-none z-0"></div>

      <motion.div 
        className="max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col gap-32 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* 1. HERO SECTION (Split Layout Lapang) */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
          {/* Kolom Kiri */}
          <motion.div variants={itemVariants} className="flex-1 flex flex-col items-start gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium tracking-wide">
              <Sparkles size={14} className="text-rose-400" />
              <span>Platform Asesmen Matematika Realistik (RME) Berbasis AI</span>
            </div>
            
            <div className="flex flex-col gap-4 w-full">
              {userName && <span className="text-2xl text-slate-400 font-medium mb-[-10px]">Halo, {userName}</span>}
              <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight text-white leading-tight">
                Matematika <br />
                <span className="bg-gradient-to-r from-rose-200 via-pink-300 to-indigo-200 bg-clip-text text-transparent">
                  Penuh Makna.
                </span>
              </h1>
            </div>
            
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              Mengubah soal matematika kaku menjadi pemecahan masalah dunia nyata melalui 4 tahap RME yang terstruktur dan dinilai secara otomatis oleh <i>Generative AI</i>.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('latihan-rme')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-rose-500/25 text-white font-semibold flex items-center justify-center gap-3 cursor-pointer"
              >
                Mulai Ujian RME
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => document.getElementById('simulasi-rme')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-300 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={18} className="text-rose-400" />
                Simulasi Soal RME
              </button>
            </div>
          </motion.div>

          {/* Kolom Kanan (Hero Image & Glassmorphism Overlay) */}
          <motion.div variants={itemVariants} className="flex-1 w-full relative max-w-lg mx-auto">
            {/* Image Container */}
            <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative aspect-[4/5] lg:aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop" 
                alt="Modern Learning" 
                className="w-full h-full object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent"></div>
            </div>
            
            {/* Floating Glass Card */}
            <div className="absolute -bottom-6 -left-6 lg:-left-12 bg-slate-900/90 backdrop-blur-xl border border-rose-500/30 p-5 rounded-2xl shadow-2xl max-w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-rose-300">
                  <Bot size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Standby</span>
                </div>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                <strong className="text-white">Live Eval:</strong> "Strategi optimasi fungsi objektif tepat. Matematisasi mendapat +25 Poin."
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-rose-500 to-indigo-500 h-1.5 rounded-full w-[85%] shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. SIMULASI APLIKATIF (Interactive Demo Playground) */}
        <motion.section id="simulasi-rme" variants={itemVariants} className="w-full flex flex-col gap-10 scroll-mt-24 pt-10">
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Simulasi 4 Tahap RME</h2>
            <p className="text-slate-400 max-w-2xl text-lg">Studi Kasus: Perhitungan Diskon Bertingkat & Pajak Belanja</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            {/* Tabs Sidebar */}
            <div className="w-full lg:w-1/3 bg-slate-950/50 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar">
              {tabs.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal ${
                    activeTab === idx 
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 shadow-[inset_4px_0_0_0_rgba(244,63,94,1)]' 
                      : 'text-slate-400 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className={`${activeTab === idx ? 'text-rose-400' : 'text-slate-500'}`}>{tab.icon}</span>
                  <span className="font-semibold text-sm">{tab.title}</span>
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 p-8 lg:p-12 relative min-h-[300px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-rose-400">
                      {tabs[activeTab].icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{tabs[activeTab].title}</h3>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                    <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {tabs[activeTab].content}
                    </pre>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* 3. MATRIKS PERBANDINGAN */}
        <motion.section variants={itemVariants} className="w-full flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Matematika Konvensional vs Metode RME TRISULA</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Konvensional */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 lg:p-10 flex flex-col gap-6 opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 text-slate-400">
                <XCircle size={24} />
                <h3 className="text-xl font-bold">Konvensional</h3>
              </div>
              <ul className="flex flex-col gap-4 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0"></div>
                  <p>Menghafal rumus kaku (cth: langsung memasukkan angka ke rumus luas).</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0"></div>
                  <p>Berfokus murni pada jawaban/hasil akhir kuantitatif.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0"></div>
                  <p>Umpan balik hanya berupa "Benar" atau "Salah".</p>
                </li>
              </ul>
            </div>
            
            {/* RME TRISULA */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 lg:p-10 flex flex-col gap-6 shadow-[0_0_30px_rgba(244,63,94,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>
              <div className="flex items-center gap-3 text-rose-400 relative z-10">
                <CheckCircle2 size={24} />
                <h3 className="text-xl font-bold text-white">RME + AI TRISULA</h3>
              </div>
              <ul className="flex flex-col gap-4 text-slate-300 text-sm relative z-10">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0 shadow-[0_0_5px_rgba(244,63,94,1)]"></div>
                  <p>Mengasah penalaran <strong>HOTS</strong> dari konteks masalah autentik sehari-hari.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0 shadow-[0_0_5px_rgba(244,63,94,1)]"></div>
                  <p>Fokus pada <strong>alur pikir sistematis</strong> dalam 4 tahapan terpisah.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0 shadow-[0_0_5px_rgba(244,63,94,1)]"></div>
                  <p>Dinilai ketat oleh <strong>AI Generatif</strong> dengan <em>feedback</em> analitis per tahap.</p>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 4. PILAR RME & FITUR UTAMA (4 Grid) */}
        <motion.section variants={itemVariants} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MapIcon size={24} />, title: "Problem Autentik", desc: "Berangkat dari fenomena nyata untuk menjembatani nalar abstrak." },
              { icon: <Target size={24} />, title: "Skoring Presisi", desc: "Mesin AI mengerti struktur algoritma jawaban Anda, bukan sekadar kata kunci." },
              { icon: <Zap size={24} />, title: "Feedback Instan", desc: "Tutor AI privat yang memperbaiki kekeliruan logika Anda seketika." },
              { icon: <BarChart3 size={24} />, title: "Evaluasi HOTS", desc: "Melatih kemampuan evaluasi sintesis tingkat tinggi secara terukur." }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 hover:border-rose-500/50 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-300">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. FINAL CTA CARD */}
        <motion.section variants={itemVariants} className="w-full pb-10">
          <div className="rounded-3xl bg-gradient-to-r from-rose-900/40 via-purple-900/40 to-indigo-900/40 border border-rose-500/30 p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-rose-900/10">
            <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-white/5 rotate-12 blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">Siap Menguji Nalar Logis Anda?</h2>
              <p className="text-lg text-rose-200/80 max-w-xl font-light">
                Tinggalkan batasan soal usang. Rasakan pengalaman asesmen cerdas yang menantang sekaligus memandu jalan pikir Anda secara riil.
              </p>
              <button
                onClick={() => onNavigate('latihan-rme')}
                className="mt-6 px-10 py-4 rounded-2xl bg-white text-rose-900 font-bold text-lg hover:bg-rose-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer flex items-center gap-2"
              >
                Mulai Ujian RME
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
};
