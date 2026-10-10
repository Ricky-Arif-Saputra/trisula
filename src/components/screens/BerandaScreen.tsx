import React from 'react';
import { motion } from 'framer-motion';
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
  Scale,
  Map
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

  const floatingVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden relative selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Ambient Gradients & Blurs */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-950 pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-20 bg-rose-500 pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-20 bg-indigo-500 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-10 bg-purple-600 pointer-events-none z-0"></div>

      <motion.div 
        className="max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col gap-32 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* 1. HERO SECTION */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
          {/* Kolom Kiri */}
          <motion.div variants={itemVariants} className="flex-1 flex flex-col items-start gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-semibold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.15)]">
              <Sparkles size={16} className="text-rose-400" />
              <span>Platform Asesmen RME Berbasis AI Generatif</span>
            </div>
            
            <div className="flex flex-col gap-4 w-full">
              <h1 className="font-extrabold text-5xl lg:text-7xl tracking-tight leading-[1.1]">
                {userName ? <span className="block text-3xl lg:text-4xl text-slate-300 mb-2 font-medium">Halo, {userName}</span> : null}
                <span className="bg-gradient-to-r from-rose-200 via-pink-300 to-indigo-200 bg-clip-text text-transparent">
                  Merajut Nalar, <br className="hidden lg:block"/>Bukan Menghafal.
                </span>
              </h1>
            </div>
            
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              Selamat datang di era baru pendidikan matematika. TRISULA menghadirkan pendekatan Realistic Mathematics Education (RME) yang didukung oleh <i>Strict Scoring Engine</i> AI untuk memandu penalaran logis Anda dari konteks dunia nyata hingga kesimpulan matematis.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 mt-4 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('latihan-rme')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/30 flex items-center justify-center gap-3 cursor-pointer border border-white/10"
              >
                Mulai Ujian RME
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>

          {/* Kolom Kanan (Visual Mockup) */}
          <motion.div variants={itemVariants} className="flex-1 w-full relative h-[450px] lg:h-[550px] flex items-center justify-center">
            <motion.div 
              variants={pulseVariants} 
              animate="animate"
              className="absolute w-64 h-64 bg-rose-500/20 rounded-full blur-[80px]"
            ></motion.div>
            
            <motion.div 
              variants={floatingVariants}
              animate="animate"
              className="relative w-full max-w-[420px] bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] shadow-2xl shadow-rose-950/40 p-7 flex flex-col gap-6 z-10 hover:border-rose-500/40 transition-colors duration-500"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-rose-500/20 flex items-center justify-center shadow-inner">
                    <Bot className="text-rose-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">AI Scoring Engine</h3>
                    <p className="text-xs text-slate-400">Analisis Multidimensi Aktif</p>
                  </div>
                </div>
                {/* Pulsing dot AI */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-extrabold uppercase tracking-widest shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  Standby
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium text-slate-400">Skor Evaluasi Real-time</span>
                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-indigo-200">85<span className="text-lg text-slate-500">/100</span></span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {[
                    { title: 'Konteks', val: '100%', color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
                    { title: 'Matematisasi', val: '80%', color: 'bg-indigo-500', glow: 'shadow-indigo-500/50' },
                    { title: 'Penyelesaian', val: '90%', color: 'bg-rose-500', glow: 'shadow-rose-500/50' },
                    { title: 'Refleksi', val: '70%', color: 'bg-amber-500', glow: 'shadow-amber-500/50' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-400 w-24">{item.title}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full ${item.glow} shadow-[0_0_8px]`} style={{ width: item.val }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-2 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-rose-900/20 border border-indigo-500/20 text-xs text-slate-300 font-medium leading-relaxed backdrop-blur-md">
                <Sparkles size={14} className="inline mr-2 text-indigo-400 mb-0.5" />
                "Penalaran logis pada matematisasi sangat kuat. Saran: perjelas unit metrik pada kesimpulan akhir."
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. KEY METRICS & IMPACT (4 Cards) */}
        <motion.section variants={itemVariants} className="w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: <Map size={20} />, title: "4 Tahap RME", desc: "Konteks s/d Refleksi" },
              { icon: <Target size={20} />, title: "100% Akurasi", desc: "Strict AI Scoring" },
              { icon: <Zap size={20} />, title: "Real-Time", desc: "Feedback Instan" },
              { icon: <BarChart3 size={20} />, title: "Analisis HOTS", desc: "Evaluasi Nalar" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4 hover:border-rose-500/30 hover:bg-slate-800/60 transition-all duration-300 group shadow-lg shadow-black/20">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform duration-300 group-hover:bg-rose-900/30 group-hover:border-rose-500/30">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm lg:text-base font-bold text-slate-200 mb-1">{item.title}</h4>
                  <p className="text-xs lg:text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 3. ALUR 4 TAHAP RME (Interactive Visual Stepper) */}
        <motion.section variants={itemVariants} className="w-full flex flex-col gap-16 py-10">
          <div className="text-center flex flex-col items-center gap-4">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight">Arsitektur Kognitif RME</h2>
            <p className="text-slate-400 max-w-2xl text-lg">Alur terstruktur yang merombak cara pandang terhadap resolusi masalah.</p>
          </div>

          <div className="relative max-w-4xl mx-auto w-full">
            {/* Glowing Connector Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-rose-500 via-indigo-500 to-purple-500 opacity-30"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
              {[
                { 
                  num: "01", 
                  title: "Memahami Konteks", 
                  icon: <Globe size={28} />, 
                  desc: "Mengekstraksi informasi vital dari fenomena nyata.",
                  color: "rose"
                },
                { 
                  num: "02", 
                  title: "Matematisasi", 
                  icon: <Sigma size={28} />, 
                  desc: "Menerjemahkan realitas ke model matematis (Horizontal & Vertikal).",
                  color: "indigo"
                },
                { 
                  num: "03", 
                  title: "Penyelesaian", 
                  icon: <Binary size={28} />, 
                  desc: "Menjalankan algoritma dan strategi nalar sistematis.",
                  color: "purple"
                },
                { 
                  num: "04", 
                  title: "Refleksi", 
                  icon: <MessageSquareShare size={28} />, 
                  desc: "Validasi AI dan rekontekstualisasi hasil ke masalah awal.",
                  color: "emerald"
                }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-5 group relative">
                  {/* Mobile Connector */}
                  {idx !== 3 && <div className="lg:hidden w-1 h-12 bg-gradient-to-b from-rose-500/30 to-transparent absolute -bottom-14 left-1/2 -translate-x-1/2"></div>}
                  
                  <div className={`w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 shadow-xl group-hover:border-${step.color}-500/50 group-hover:text-${step.color}-300 group-hover:shadow-[0_0_30px_rgba(var(--color-${step.color}-500),0.2)] transition-all duration-500 group-hover:-translate-y-2 relative`}>
                    {/* Inner Glow */}
                    <div className={`absolute inset-0 rounded-3xl bg-${step.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <span className="relative z-10">{step.icon}</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${step.color}-400/80`}>Tahap {step.num}</span>
                    <h4 className="text-lg font-bold text-slate-200 leading-tight">{step.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. SHOWCASE CONTOH SOAL (Demonstration Card) */}
        <motion.section variants={itemVariants} className="w-full py-10">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl flex flex-col lg:flex-row gap-12 items-center overflow-hidden relative">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex-1 flex flex-col gap-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 w-fit">
                <Scale size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Paradigma Baru</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-extrabold text-white leading-[1.2]">Tradisional vs Realistik</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Soal tradisional bertanya: <i>"Berapa volume balok 5x4x3?"</i><br/><br/>
                Soal RME mengeksplorasi: <i>"Seorang arsitek merancang tangki air untuk desa kekeringan. Dengan material beton 50m², buatlah model dimensi tangki yang memaksimalkan volume air, serta jelaskan asumsi keselamatan strukturnya."</i>
              </p>
            </div>
            
            <div className="flex-1 w-full relative z-10">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">JAWABAN SISWA (RME)</span>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-mono leading-relaxed">
                  1. Diketahui: L_permukaan = 50m²<br/>
                  2. Ditanya: Model dimensi Max(V)<br/>
                  3. Matematisasi: V = p.l.t; 2(pl+pt+lt) = 50<br/>
                  4. Strategi: ...
                </div>
                <div className="flex items-start gap-3 mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Bot size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    <strong>AI Engine:</strong> Pemodelan luas permukaan akurat. Siswa berhasil menghubungkan constraint material fisik dengan optimasi fungsi kubik secara rasional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 5. FINAL CTA CARD */}
        <motion.section variants={itemVariants} className="w-full pb-10">
          <div className="rounded-[3rem] bg-gradient-to-br from-purple-900/60 to-rose-900/40 border border-rose-500/30 p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-rose-900/20 group">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight">Siap Membuktikan Nalar?</h2>
              <p className="text-xl text-rose-200/80 max-w-2xl font-light">
                Masuk ke ruang asesmen dan rasakan pengalaman dinilai secara komprehensif oleh kecerdasan buatan.
              </p>
              <button
                onClick={() => onNavigate('latihan-rme')}
                className="mt-4 px-10 py-5 rounded-2xl bg-white text-rose-900 font-bold text-lg hover:bg-rose-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] cursor-pointer"
              >
                Mulai Ujian Sekarang
              </button>
            </div>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
};
