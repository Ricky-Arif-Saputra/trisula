import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Map, 
  BrainCircuit, 
  Lightbulb, 
  MessageSquareShare, 
  ArrowRight,
  Bot
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
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-white to-rose-50/30 text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <motion.div 
        className="max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col gap-32"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* 1. HERO SECTION (2 Columns) */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
          {/* Kolom Kiri */}
          <motion.div variants={itemVariants} className="flex-1 flex flex-col items-start gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-semibold tracking-wide shadow-xs">
              <Sparkles size={16} className="text-indigo-500" />
              <span>Platform Edukasi Matematika Realistik (RME)</span>
            </div>
            
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                {userName ? `Halo ${userName},` : 'Transformasi'} <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-rose-500">
                  Nalar Matematika
                </span>
                <br /> Kelas Dunia.
              </h1>
            </div>
            
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Tinggalkan hafalan rumus yang membosankan. TRISULA mengintegrasikan kecerdasan buatan dengan metodologi Realistic Mathematics Education, mengubah studi kasus dunia nyata menjadi pemahaman konsep yang mendalam.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('latihan-rme')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                Mulai Latihan RME
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => document.getElementById('alur-rme')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Pelajari Alur RME
              </button>
            </div>
          </motion.div>

          {/* Kolom Kanan (Visual Mockup) */}
          <motion.div variants={itemVariants} className="flex-1 w-full relative h-[400px] lg:h-[500px] flex items-center justify-center">
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <motion.div 
              variants={floatingVariants}
              animate="animate"
              className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] shadow-2xl shadow-indigo-900/5 p-6 flex flex-col gap-4 z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Bot className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Scoring Engine</h3>
                    <p className="text-xs text-slate-500">Evaluasi Real-time</p>
                  </div>
                </div>
                {/* Pulsing dot AI */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Aktif
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {[
                  { title: 'Tahap 1: Diketahui', status: 'bg-emerald-500', w: 'w-full' },
                  { title: 'Tahap 2: Ditanya', status: 'bg-emerald-500', w: 'w-full' },
                  { title: 'Tahap 3: Pengerjaan', status: 'bg-indigo-500', w: 'w-3/4', pulse: true },
                  { title: 'Tahap 4: Kesimpulan', status: 'bg-slate-200', w: 'w-1/4' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">{item.title}</span>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.status} ${item.w} rounded-full ${item.pulse ? 'animate-pulse' : ''}`}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50 text-xs text-indigo-800 font-medium">
                "Analisis matriks siswa sangat baik. Melanjutkan ke evaluasi kesimpulan akhir..."
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. BENTO GRID: 4 PILAR RME */}
        <motion.section id="alur-rme" variants={itemVariants} className="w-full flex flex-col gap-10 scroll-mt-24">
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Arsitektur Pembelajaran</h2>
            <p className="text-slate-600 max-w-2xl text-lg">Empat fase esensial RME yang memandu siswa dari kebingungan empiris menuju kejernihan matematis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
            {/* Card 1 (Span 2) */}
            <div className="md:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Map size={28} />
              </div>
              <div>
                <span className="text-sm font-bold text-indigo-600 tracking-wider mb-2 block">01</span>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Memahami Konteks Realistis</h3>
                <p className="text-slate-600 leading-relaxed">
                  Semuanya bermula dari fenomena dunia nyata yang valid. Mengurai masalah autentik menjadi variabel yang dapat dikuantifikasi, memastikan matematika memiliki makna.
                </p>
              </div>
            </div>

            {/* Card 2 (Span 1) */}
            <div className="md:col-span-1 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col justify-between gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BrainCircuit size={28} />
              </div>
              <div>
                <span className="text-sm font-bold text-purple-600 tracking-wider mb-2 block">02</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Matematisasi</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Menyaring kerumitan realitas ke dalam bahasa simbolik dan model matematis yang presisi.
                </p>
              </div>
            </div>

            {/* Card 3 (Span 1) */}
            <div className="md:col-span-1 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col justify-between gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Lightbulb size={28} />
              </div>
              <div>
                <span className="text-sm font-bold text-rose-600 tracking-wider mb-2 block">03</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Penemuan Terbimbing</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Membangun alur logika dan strategi pemecahan masalah secara mandiri dan organik.
                </p>
              </div>
            </div>

            {/* Card 4 (Span 2) */}
            <div className="md:col-span-2 bg-linear-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-2xl hover:shadow-indigo-900/30 transition-all duration-300 flex flex-col justify-between gap-6 group border border-indigo-800/50">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-md">
                <MessageSquareShare size={28} />
              </div>
              <div>
                <span className="text-sm font-bold text-indigo-300 tracking-wider mb-2 block">04</span>
                <h3 className="text-2xl font-bold text-white mb-2">Re-kontekstualisasi & Refleksi</h3>
                <p className="text-slate-300 leading-relaxed">
                  Mengembalikan hasil numerik ke dalam konteks awal untuk membuktikan validitasnya, didukung oleh mesin inferensi AI TRISULA yang memberikan umpan balik korektif instan.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. KEUNGGULAN (3 Grid) */}
        <motion.section variants={itemVariants} className="w-full pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <BrainCircuit size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Penalar Logis</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Membentuk pola pikir yang terstruktur dan analitis, menghilangkan kebutuhan untuk menghafal rumus buta.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Bot size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Integrasi AI Ketat</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Setiap tahap dianalisis secara semantik oleh mesin LLM untuk memberikan panduan yang setara dengan tutor privat.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Map size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Berbasis Masalah</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Eksplorasi dari arsitektur jembatan hingga kurva epidemiologi, menjadikan matematika 100% relevan.
              </p>
            </div>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
};
