import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Triangle,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  BrainCircuit,
  Users,
  Award,
  Building2,
  ChevronRight,
  Play,
  Star,
  Layers,
  TrendingUp,
  Sigma,
  Twitter,
  Instagram,
  Github,
  Mail,
} from 'lucide-react';
import { ScreenType, MathCategory } from '../../types';
import { useAuth } from '../Auth/AuthProvider';

interface BerandaScreenProps {
  onNavigate: (screen: ScreenType, category?: MathCategory) => void;
  onOpenTeacherMode: () => void;
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);
  return <span ref={ref}>{count.toLocaleString('id-ID')}{suffix}</span>;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({ onNavigate }) => {
  const { userName } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeProblem, setActiveProblem] = useState<'rme' | 'traditional'>('rme');

  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' as const } },
  };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

  const features = [
    {
      icon: <Globe size={20} />,
      title: 'Simulasi Kontekstual',
      desc: 'Setiap soal dikemas dalam skenario kehidupan nyata—dari pasar, arsitektur, hingga kesehatan. Konteks autentik membuat siswa memahami MENGAPA matematika penting.',
      preview: (
        <div className="bg-[#0F172A] rounded-xl border border-blue-900/50 p-5 space-y-3">
          <div className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-4">Konteks Dunia Nyata</div>
          <div className="bg-blue-950/60 rounded-lg p-3 text-slate-300 text-xs leading-relaxed border border-blue-800/30">
            Seorang arsitek merancang jembatan gantung sepanjang 120 m. Kabel utama membentuk parabola dengan tinggi 15 m di titik tengah. Tentukan persamaan parabola dan panjang kabel vertikal pada jarak 40 m dari pusat.
          </div>
          <div className="flex gap-2 flex-wrap">
            {['Geometri', 'Kelas XII', 'Studi Kasus'].map(t => (
              <span key={t} className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-600/20 text-blue-300 border border-blue-600/30">{t}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: <Layers size={20} />,
      title: 'Soal Studi Kasus',
      desc: 'Soal multi-tahap yang menguji seluruh alur berpikir RME: Identifikasi konteks, Matematisasi, Penyelesaian, Refleksi. Setiap tahap dinilai secara independen oleh AI.',
      preview: (
        <div className="bg-[#0F172A] rounded-xl border border-blue-900/50 p-5 space-y-3">
          <div className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-4">Alur 4 Tahap RME</div>
          {[
            { step: '01', label: 'Identifikasi Konteks', done: true, active: false },
            { step: '02', label: 'Matematisasi', done: true, active: false },
            { step: '03', label: 'Penyelesaian Sistematis', done: false, active: true },
            { step: '04', label: 'Refleksi & Kesimpulan', done: false, active: false },
          ].map(s => (
            <div key={s.step} className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${s.active ? 'bg-blue-600/15 border border-blue-500/30 text-blue-200' : s.done ? 'text-emerald-400' : 'text-slate-600'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${s.active ? 'bg-blue-600 border-blue-400 text-white' : s.done ? 'bg-emerald-900/40 border-emerald-600 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-600'}`}>
                {s.done && !s.active ? <CheckCircle2 size={12} /> : s.step}
              </span>
              {s.label}
              {s.active && <span className="ml-auto text-[10px] text-blue-400 animate-pulse">● Aktif</span>}
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <TrendingUp size={20} />,
      title: 'Analisis Kemajuan',
      desc: 'Dashboard analitik personal yang melacak penguasaan per topik, tren skor, dan kelemahan spesifik. Data berbasis AI untuk panduan belajar yang presisi.',
      preview: (
        <div className="bg-[#0F172A] rounded-xl border border-blue-900/50 p-5 space-y-4">
          <div className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Kemajuan Belajar</div>
          {[{ label: 'Geometri Analitik', pct: 88 }, { label: 'Trigonometri Terapan', pct: 74 }, { label: 'Statistika Kontekstual', pct: 61 }, { label: 'Kalkulus Terapan', pct: 45 }].map(b => (
            <div key={b.label} className="space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-slate-400">{b.label}</span><span className="text-blue-300 font-bold">{b.pct}%</span></div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: `${b.pct}%` }} /></div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const pillars = [
    { icon: <Globe size={28} />, title: 'Konteks Dunia Nyata', desc: 'Setiap konsep diawali dari situasi autentik—pasar, arsitektur, kesehatan—sehingga siswa merasakan relevansi matematika.', color: 'blue' },
    { icon: <Sigma size={28} />, title: 'Pembentukan Model', desc: 'Menjembatani realitas ke bahasa matematis melalui matematisasi horizontal & vertikal, membangun intuisi yang kokoh.', color: 'violet' },
    { icon: <BrainCircuit size={28} />, title: 'Pembelajaran Interaktif', desc: 'Umpan balik AI generatif per tahap mendorong meta-kognisi sehingga siswa memahami mengapa strategi mereka benar atau perlu diperbaiki.', color: 'cyan' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0F172A] text-slate-100 font-sans antialiased overflow-x-hidden">

      {/* Ambient blurs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/[0.08] blur-[120px]" />
        <div className="absolute top-1/2 right-[-200px] w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-blue-500/[0.05] blur-[80px]" />
      </div>

      <div className="relative z-10">

        {/* NAV */}
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0F172A]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Triangle size={18} className="text-white" fill="white" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">TRISULA <span className="font-light text-blue-400">EDUMATH</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              {['Beranda', 'Metode RME', 'Modul Interaktif', 'Keunggulan', 'Kontak'].map(link => (
                <a key={link} href="#" className="hover:text-white transition-colors duration-200">{link}</a>
              ))}
            </div>
            <button onClick={() => onNavigate('latihan-rme')} className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 cursor-pointer">
              Mulai Belajar <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col lg:flex-row items-center gap-16">
          <motion.div className="flex-1 flex flex-col items-start gap-8" variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wide">
              <Sparkles size={13} />{userName ? `Selamat kembali, ${userName}` : 'Platform Asesmen RME Berbasis AI'}
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl lg:text-6xl font-extrabold text-white leading-[1.12] tracking-tight">
              Belajar Matematika{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">Nyata &amp; Relevan</span>
              <br />Bersama TRISULA EDUMATH
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Platform pembelajaran matematika kontekstual yang mengintegrasikan <em className="text-slate-200 not-italic">Realistic Mathematics Education</em> (RME) dengan <em className="text-slate-200 not-italic">AI Scoring Engine</em>—memandu siswa dari masalah dunia nyata menuju penguasaan matematis mendalam.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => onNavigate('latihan-rme')} className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-blue-600/30 hover:scale-[1.03] active:scale-95 cursor-pointer">
                Eksplorasi Modul <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => document.getElementById('metode-rme')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-700 hover:border-blue-500/50 text-slate-300 hover:text-white font-semibold text-base transition-all duration-300 cursor-pointer">
                <Play size={16} className="text-blue-400" /> Pelajari Metode RME
              </button>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {['#3B82F6','#8B5CF6','#06B6D4','#10B981'].map((c,i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0F172A] flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: c }}>
                    {['A','R','S','D'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-400">
                <span className="text-white font-semibold">4.9</span> rating dari <span className="text-white font-semibold">1.200+</span> siswa
                <div className="flex gap-0.5 mt-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={10} fill="#FBBF24" className="text-amber-400"/>)}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Dashboard preview card */}
          <motion.div className="flex-1 w-full max-w-lg relative" initial={{ opacity:0,x:40 }} animate={{ opacity:1,x:0,transition:{duration:0.8,ease:'easeOut' as const,delay:0.2} }}>
            <div className="relative rounded-3xl border border-white/[0.08] bg-[#1E293B]/80 backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
                    <Triangle size={14} className="text-blue-400" fill="currentColor" />
                  </div>
                  <div><p className="text-xs font-bold text-white">TRISULA AI Engine</p><p className="text-[10px] text-slate-500">Real-time Evaluation</p></div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Live
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[{label:'Skor Total',val:'87',unit:'/100'},{label:'Tahap Selesai',val:'3',unit:'/4'},{label:'Waktu Tersisa',val:'14',unit:' mnt'},{label:'Akurasi',val:'91',unit:'%'}].map(m=>(
                  <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                    <p className="text-[10px] text-slate-500 mb-1">{m.label}</p>
                    <p className="text-xl font-black text-white">{m.val}<span className="text-xs font-normal text-slate-500">{m.unit}</span></p>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Evaluasi Per Tahap</p>
                {[{label:'Konteks',pct:100,color:'#10B981'},{label:'Matematisasi',pct:85,color:'#3B82F6'},{label:'Penyelesaian',pct:78,color:'#8B5CF6'},{label:'Refleksi',pct:65,color:'#F59E0B'}].map(b=>(
                  <div key={b.label} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-slate-400 shrink-0">{b.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${b.pct}%`,backgroundColor:b.color}}/></div>
                    <span className="text-white font-bold w-8 text-right">{b.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-800/30 text-xs text-blue-200/80 leading-relaxed">
                <span className="font-bold text-blue-300">AI Feedback: </span>"Strategi matematisasi sangat kuat. Perkuat justifikasi unit pada kesimpulan akhir."
              </div>
            </div>
            <motion.div animate={{y:[0,-8,0]}} transition={{duration:4,repeat:Infinity,ease:'easeInOut' as const}} className="absolute -top-5 -right-5 bg-[#1E293B] border border-white/[0.08] rounded-2xl px-4 py-3 shadow-xl text-xs font-semibold text-white flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400"/>Soal divalidasi AI
            </motion.div>
            <motion.div animate={{y:[0,8,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut' as const,delay:1}} className="absolute -bottom-5 -left-5 bg-[#1E293B] border border-white/[0.08] rounded-2xl px-4 py-3 shadow-xl text-xs font-semibold text-white flex items-center gap-2">
              <BarChart3 size={14} className="text-blue-400"/>+12% minggu ini
            </motion.div>
          </motion.div>
        </section>

        {/* PILLARS */}
        <section id="metode-rme" className="scroll-mt-24 bg-[#111827] border-y border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-6 py-28">
            <motion.div className="text-center mb-16" initial="hidden" whileInView="show" viewport={{once:true,amount:0.3}} variants={stagger}>
              <motion.p variants={fadeUp} className="text-blue-400 text-xs font-bold uppercase tracking-[0.25em] mb-4">Pendekatan RME</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Tiga Pilar Utama<br/><span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Metode TRISULA</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">Dikembangkan dari teori RME Hans Freudenthal, diakselerasi dengan kecerdasan buatan.</motion.p>
            </motion.div>
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{once:true,amount:0.2}} variants={stagger}>
              {pillars.map((p,i)=>(
                <motion.div key={i} variants={fadeUp} className="group relative rounded-3xl border border-white/[0.07] bg-[#1E293B]/50 p-8 hover:border-blue-500/40 hover:bg-[#1E293B] hover:-translate-y-1.5 transition-all duration-300 cursor-default">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${p.color==='blue'?'bg-blue-600/15 border-blue-600/30 text-blue-400':p.color==='violet'?'bg-violet-600/15 border-violet-600/30 text-violet-400':'bg-cyan-600/15 border-cyan-600/30 text-cyan-400'}`}>{p.icon}</div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${p.color==='blue'?'text-blue-500':p.color==='violet'?'text-violet-500':'text-cyan-500'}`}>Pilar 0{i+1}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FEATURE SHOWCASE */}
        <section className="max-w-7xl mx-auto px-6 py-28">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="show" viewport={{once:true,amount:0.3}} variants={stagger}>
            <motion.p variants={fadeUp} className="text-blue-400 text-xs font-bold uppercase tracking-[0.25em] mb-4">Fitur Platform</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
              Semua yang Kamu Butuhkan,<br/><span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">dalam Satu Platform</span>
            </motion.h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 lg:grid-cols-[1fr,1.4fr] gap-6 items-start" initial="hidden" whileInView="show" viewport={{once:true,amount:0.2}} variants={stagger}>
            <motion.div variants={fadeUp} className="flex flex-col gap-3">
              {features.map((f,i)=>(
                <button key={i} onClick={()=>setActiveFeature(i)} className={`group text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${activeFeature===i?'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-900/20':'bg-[#1E293B]/40 border-white/[0.06] hover:border-slate-700 hover:bg-[#1E293B]/60'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeFeature===i?'bg-blue-600 text-white':'bg-slate-800 text-slate-400'}`}>{f.icon}</div>
                    <h4 className={`font-bold text-sm ${activeFeature===i?'text-white':'text-slate-300'}`}>{f.title}</h4>
                    <ChevronRight size={14} className={`ml-auto ${activeFeature===i?'text-blue-400 translate-x-0.5':'text-slate-600'}`}/>
                  </div>
                  {activeFeature===i&&<p className="text-slate-400 text-sm leading-relaxed pl-11">{f.desc}</p>}
                </button>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.07] bg-[#1E293B]/60 p-6 backdrop-blur-sm shadow-2xl shadow-black/30">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
                <div className="flex gap-1.5">{['#EF4444','#F59E0B','#10B981'].map(c=><div key={c} className="w-3 h-3 rounded-full" style={{backgroundColor:c}}/>)}</div>
                <span className="ml-2 text-[11px] text-slate-500 font-mono">trisula.preview — {features[activeFeature].title}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeFeature} initial={{opacity:0,y:10}} animate={{opacity:1,y:0,transition:{duration:0.35}}} exit={{opacity:0,y:-10,transition:{duration:0.2}}}>
                  {features[activeFeature].preview}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </section>

        {/* COMPARISON */}
        <section className="bg-[#111827] border-y border-white/[0.05]">
          <div className="max-w-5xl mx-auto px-6 py-28">
            <motion.div className="text-center mb-14" initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-extrabold text-white">
                Konvensional vs <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Metode RME TRISULA</span>
              </motion.h2>
            </motion.div>
            <div className="flex gap-3 justify-center mb-8">
              {(['rme','traditional'] as const).map(v=>(
                <button key={v} onClick={()=>setActiveProblem(v)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeProblem===v?'bg-blue-600 text-white shadow-lg shadow-blue-600/30':'bg-[#1E293B] text-slate-400 border border-white/[0.06] hover:border-slate-600'}`}>
                  {v==='rme'?'Metode RME TRISULA':'Konvensional'}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={activeProblem} initial={{opacity:0,y:16}} animate={{opacity:1,y:0,transition:{duration:0.4}}} exit={{opacity:0,y:-16}} className={`rounded-3xl border p-8 lg:p-10 ${activeProblem==='rme'?'bg-blue-950/30 border-blue-500/30 shadow-xl shadow-blue-900/20':'bg-[#1E293B]/40 border-white/[0.07] opacity-80'}`}>
                {activeProblem==='rme'?(
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Metode RME TRISULA</p>
                      <ul className="space-y-3">
                        {['Dimulai dari skenario dunia nyata yang autentik','Siswa membangun sendiri model matematis (discovery)','Penilaian per tahap: konteks, matematisasi, penyelesaian, refleksi','Feedback AI yang menjelaskan MENGAPA salah','Mengasah HOTS: analisis, evaluasi, kreasi'].map(item=>(
                          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300"><CheckCircle2 size={15} className="text-blue-400 mt-0.5 shrink-0"/>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#0F172A] rounded-2xl border border-blue-900/40 p-5 text-xs font-mono text-slate-300 leading-relaxed">
                      <p className="text-blue-400 font-bold mb-3">Konteks Arsitektur:</p>
                      <p className="mb-3">"Atap kubah stadion berbentuk parabola dengan diameter 80m dan tinggi 20m..."</p>
                      <div className="pt-3 border-t border-slate-800">
                        <p className="text-emerald-400 font-bold">Matematisasi: y = -(x^2/80) + 20</p>
                        <p className="text-blue-300">Panjang kabel ~94.3 m</p>
                      </div>
                    </div>
                  </div>
                ):(
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Metode Konvensional</p>
                      <ul className="space-y-3">
                        {['Dimulai langsung dari definisi dan rumus abstrak','Siswa menghafal rumus tanpa memahami konteks','Penilaian hanya berdasarkan jawaban akhir','Tidak ada umpan balik kualitatif','Fokus pada prosedur mekanis, bukan penalaran'].map(item=>(
                          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-500"><div className="w-4 h-4 rounded-full border border-slate-700 mt-0.5 shrink-0 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"/></div>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#0F172A]/60 rounded-2xl border border-slate-800 p-5 text-xs font-mono text-slate-500 leading-relaxed">
                      <p className="text-slate-600 font-bold mb-3">Soal Standar:</p>
                      <p className="mb-3">"Diketahui parabola y = ax^2 + bx + c. Jika titik puncaknya (2, 5)..."</p>
                      <div className="pt-3 border-t border-slate-800/60">
                        <p className="text-slate-600">Jawaban: a = -2, b = 8, c = -3</p>
                        <p className="text-slate-700">Status: Salah (skor 0)</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* STATS */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{once:true,amount:0.3}} variants={stagger}>
            {[{icon:<Users size={24}/>,target:1240,suffix:'+',label:'Siswa Aktif',sub:'dari 18 sekolah mitra'},{icon:<Award size={24}/>,target:8500,suffix:'+',label:'Studi Kasus Selesai',sub:'dengan penilaian AI'},{icon:<Building2 size={24}/>,target:18,suffix:'',label:'Sekolah Mitra',sub:'se-Sulawesi dan Nusa Tenggara'}].map((s,i)=>(
              <motion.div key={i} variants={fadeUp} className="group rounded-3xl border border-white/[0.07] bg-[#1E293B]/40 p-8 text-center hover:border-blue-500/30 hover:bg-[#1E293B] transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-600/25 text-blue-400 flex items-center justify-center mx-auto mb-4">{s.icon}</div>
                <div className="text-4xl font-black text-white mb-1"><AnimatedCounter target={s.target} suffix={s.suffix}/></div>
                <p className="text-base font-bold text-slate-300 mb-1">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-28">
          <motion.div className="relative rounded-[2rem] overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-950/60 via-[#1E293B] to-violet-950/40 p-12 lg:p-20 text-center shadow-2xl shadow-blue-900/20" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0,transition:{duration:0.7}}} viewport={{once:true}}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"/>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl"/>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-6">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.25em]">Mulai Hari Ini</p>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                Siap Menguasai Matematika<br/><span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">dengan Cara yang Benar?</span>
              </h2>
              <p className="text-slate-400 max-w-xl text-lg leading-relaxed">Bergabung bersama ribuan siswa yang telah membuktikan bahwa matematika bukan tentang menghafal—tapi tentang memahami dan berpikir.</p>
              <button onClick={()=>onNavigate('latihan-rme')} className="group mt-4 inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all duration-300 shadow-2xl shadow-blue-600/40 hover:scale-[1.04] active:scale-95 cursor-pointer">
                Eksplorasi Modul Sekarang <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/[0.06] bg-[#0F172A]">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center"><Triangle size={16} className="text-white" fill="white"/></div>
                  <span className="text-base font-extrabold text-white">TRISULA <span className="font-light text-blue-400">EDUMATH</span></span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm">Platform asesmen matematika berbasis RME dan AI Generatif untuk siswa Kelas XII, mendorong penalaran logis yang bermakna.</p>
                <div className="flex gap-3 mt-2">
                  {[<Twitter size={15}/>,<Instagram size={15}/>,<Github size={15}/>,<Mail size={15}/>].map((Icon,i)=>(
                    <a key={i} href="#" className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-600/10 transition-all">{Icon}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Platform</p>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  {['Beranda','Metode RME','Modul Interaktif','Keunggulan','Kontak'].map(link=>(
                    <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sumber</p>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  {['Tentang RME','Panduan Guru','Blog Edukasi','Kebijakan Privasi','Syarat Ketentuan'].map(link=>(
                    <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <p>2026 TRISULA EDUMATH. Seluruh hak cipta dilindungi.</p>
              <p>Dibuat untuk pendidikan matematika yang bermakna di Indonesia.</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};
