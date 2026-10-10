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
  X,
  XCircle,
  Lightbulb,
  Zap,
  Target
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
  const [selectedPillarIndex, setSelectedPillarIndex] = useState<number | null>(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' as const } },
  };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

  const pillars = [
    { 
      icon: <Globe size={32} />, 
      title: 'Konteks Dunia Nyata', 
      desc: 'Berangkat dari masalah autentik (kesehatan, arsitektur, dll) agar siswa memahami esensi matematika.', 
      color: 'blue',
      fullContent: 'Pendekatan ini berfokus pada penggunaan masalah dari dunia nyata sebagai titik tolak belajar matematika. Dengan mengaitkan materi pada kehidupan sehari-hari, siswa tidak lagi menganggap matematika sebagai ilmu abstrak, melainkan sesuatu yang sangat berguna.' 
    },
    { 
      icon: <Sigma size={32} />, 
      title: 'Pembentukan Model', 
      desc: 'Transisi mandiri dari realitas ke simbol matematis untuk membangun intuisi tanpa paksaan hafalan.', 
      color: 'violet',
      fullContent: 'Siswa didorong untuk secara mandiri memodelkan permasalahan nyata ke dalam bentuk matematika (matematisasi horizontal), kemudian menyederhanakannya menjadi rumus atau algoritma formal (matematisasi vertikal). Hal ini memicu kebebasan berkreasi dan intuisi alami.'
    },
    { 
      icon: <BrainCircuit size={32} />, 
      title: 'Umpan Balik AI', 
      desc: 'Kecerdasan Buatan membimbing logika siswa lapis demi lapis, bertindak selayaknya tutor privat.', 
      color: 'cyan',
      fullContent: 'Mengadopsi pendekatan modern, sistem tidak hanya menilai hasil akhir. Melalui bantuan AI, siswa menerima umpan balik relevan di setiap tahapan. AI bertindak seperti tutor privat yang mengidentifikasi letak kesalahan logika dan memberikan panduan perbaikan.'
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-slate-50 font-sans antialiased overflow-x-hidden">

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/[0.08] blur-[120px]" />
        <div className="absolute top-1/4 right-[-200px] w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
      </div>

      <div className="relative z-10 text-white">

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-12 flex flex-col lg:flex-row items-center gap-12">
          <motion.div className="flex-1 flex flex-col items-start gap-6" variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wide">
              <Sparkles size={13} />{userName ? `Selamat kembali, ${userName}` : 'Platform Asesmen RME Berbasis AI'}
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl lg:text-6xl font-extrabold text-white leading-[1.12] tracking-tight">
              Belajar Matematika{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">Nyata &amp; Relevan</span>
              <br />Bersama TRISULA EDUMATH
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Platform pembelajaran matematika kontekstual yang mengintegrasikan <em className="text-slate-200 not-italic">Realistic Mathematics Education</em> (RME) dengan <em className="text-slate-200 not-italic">AI Scoring Engine</em>—memandu siswa menuju penguasaan matematis mendalam.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center gap-4 pt-1">
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

          <motion.div className="flex-1 w-full max-w-lg relative h-[360px] rounded-3xl overflow-hidden" initial={{ opacity:0,x:40 }} animate={{ opacity:1,x:0,transition:{duration:0.8,ease:'easeOut' as const,delay:0.2} }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop" 
              alt="Students learning math" 
              className="w-full h-full object-cover object-center opacity-80"
            />
          </motion.div>
        </section>
        
        {/* PILLARS */}
        <section id="metode-rme" className="scroll-mt-24 border-y border-white/[0.05] bg-black/10">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div className="text-center mb-10" initial="hidden" whileInView="show" viewport={{once:true,amount:0.3}} variants={stagger}>
              <motion.p variants={fadeUp} className="text-blue-400 text-xs font-bold uppercase tracking-[0.25em] mb-3">Pendekatan RME</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Tiga Pilar Utama <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Metode TRISULA</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-3 text-slate-400 w-full whitespace-normal md:whitespace-nowrap mx-auto text-base leading-relaxed">
                Dikembangkan dari teori RME Hans Freudenthal, diakselerasi dengan kecerdasan buatan.
              </motion.p>
            </motion.div>
            
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{once:true,amount:0.2}} variants={stagger}>
              {pillars.map((p,i)=>(
                <motion.div 
                  key={i} 
                  variants={fadeUp} 
                  onClick={() => setSelectedPillarIndex(i)}
                  className="group relative rounded-3xl bg-gradient-to-b from-[#1E293B]/80 to-[#0F172A] border border-white/[0.08] p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                >
                  <div className={`absolute top-0 w-full h-24 opacity-20 blur-2xl rounded-full pointer-events-none transition-all duration-500 ${p.color==='blue'?'bg-blue-500':p.color==='violet'?'bg-violet-500':'bg-cyan-500'}`} />
                  
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 border-2 transition-all duration-300 shadow-lg relative z-10 ${p.color==='blue'?'bg-blue-900/50 border-blue-500 text-blue-400 group-hover:scale-110':p.color==='violet'?'bg-violet-900/50 border-violet-500 text-violet-400 group-hover:scale-110':'bg-cyan-900/50 border-cyan-500 text-cyan-400 group-hover:scale-110'}`}>
                    {p.icon}
                  </div>
                  
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${p.color==='blue'?'text-blue-500':p.color==='violet'?'text-violet-500':'text-cyan-500'}`}>Pilar 0{i+1}</span>
                  <h3 className="text-lg font-bold text-white mb-3 relative z-10">{p.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">{p.desc}</p>
                  
                  <div className="mt-auto flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                    Pelajari <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Transition into light theme */}
        <div className="text-slate-900 mt-10">
          
          {/* BENTO GRID FEATURES (Replaced old features) */}
          <section className="max-w-7xl mx-auto px-6 py-12">
            <motion.div className="text-center mb-10" initial="hidden" whileInView="show" viewport={{once:true,amount:0.3}} variants={stagger}>
              <motion.p variants={fadeUp} className="text-blue-600 text-xs font-bold uppercase tracking-[0.25em] mb-3">Ekosistem Pembelajaran Terpadu</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Teknologi yang Memberdayakan<br/><span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Potensi Logika Siswa</span>
              </motion.h2>
            </motion.div>
            
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{once:true,amount:0.2}} variants={stagger}>
              {/* Feature 1 - Wide Card */}
              <motion.div variants={fadeUp} className="lg:col-span-2 rounded-3xl bg-blue-50 border border-blue-100 p-8 flex flex-col md:flex-row gap-6 items-center shadow-lg shadow-blue-900/5 relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-200/50 rounded-full blur-3xl"></div>
                <div className="flex-1 relative z-10">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-600/30">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Evaluasi Real-Time dengan AI</h3>
                  <p className="text-slate-600 leading-relaxed">Setiap langkah perhitungan dan logika bahasa dianalisis seketika. Siswa tidak perlu menunggu guru untuk mengetahui letak kesalahan atau memvalidasi strategi mereka.</p>
                </div>
                <div className="flex-1 w-full relative z-10 bg-white rounded-2xl p-5 border border-slate-200 shadow-xl">
                   <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-xs font-semibold text-slate-500">AI Feedback Engine</span>
                   </div>
                   <p className="text-sm text-slate-700 italic border-l-4 border-blue-500 pl-3">"Strategi substitusimu sudah tepat! Namun, perhatikan kembali saat mengalikan tanda negatif di baris kedua. Coba perbaiki lalu kirim ulang."</p>
                </div>
              </motion.div>

              {/* Feature 2 - Tall Card */}
              <motion.div variants={fadeUp} className="rounded-3xl bg-white border border-slate-200 p-8 shadow-lg shadow-slate-200/50 flex flex-col">
                <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-5">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Kasus Multi-Tahap</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">Mengurangi tebakan ganda. Soal dipecah menjadi: Identifikasi, Matematisasi, Solusi, dan Refleksi—dinilai secara parsial.</p>
                <div className="mt-auto space-y-2">
                  {['Identifikasi (20%)','Matematisasi (30%)','Solusi (40%)'].map((l,i) => (
                    <div key={i} className="w-full bg-slate-50 rounded-lg p-2.5 flex items-center gap-2 border border-slate-100">
                      <CheckCircle2 size={14} className="text-emerald-500"/>
                      <span className="text-xs font-semibold text-slate-600">{l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div variants={fadeUp} className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-5 border border-indigo-500/30">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Analitik Kompetensi</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Dashboard menyajikan pemetaan kelemahan spesifik per sub-topik sehingga evaluasi lebih tajam.</p>
                </div>
              </motion.div>

              {/* Feature 4 - Wide Card */}
              <motion.div variants={fadeUp} className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 p-8 shadow-lg flex flex-col justify-center items-center text-center">
                <Lightbulb size={32} className="text-amber-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Berhenti Menghafal, Mulai Bernalar</h3>
                <p className="text-slate-600 max-w-lg">Kurikulum TRISULA didesain agar siswa tidak dijejali rumus usang, melainkan dibiasakan merumuskan pola dari fenomena dunia nyata yang terstruktur.</p>
              </motion.div>
            </motion.div>
          </section>

          {/* SIDE-BY-SIDE COMPARISON (Replaced old tabs) */}
          <section className="bg-slate-100 border-y border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-16">
              <motion.div className="text-center mb-12" initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
                <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-extrabold text-slate-900">
                  Mengapa Pendekatan Kami Berbeda?
                </motion.h2>
              </motion.div>

              <div className="relative flex flex-col lg:flex-row gap-6 items-stretch">
                {/* VS Badge */}
                <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border border-slate-200 shadow-xl items-center justify-center z-20 font-black text-slate-400">
                  VS
                </div>

                {/* Konvensional */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                  className="flex-1 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm opacity-80"
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><XCircle size={20} /></div>
                    <h3 className="text-xl font-bold text-slate-600">Pendidikan Konvensional</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      'Fokus utama pada menghafal rumus',
                      'Konteks abstrak, terlepas dari dunia nyata',
                      'Jawaban akhir adalah segalanya (Skor 0/100)',
                      'Hanya tahu SALAH tanpa tahu MENGAPA',
                      'Siswa pasif menerima informasi'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-500">
                        <div className="mt-1 shrink-0"><X size={14} className="text-red-400" /></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* TRISULA */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-1 bg-blue-600 rounded-3xl border border-blue-500 p-8 shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-500/50">
                      <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-md"><Triangle size={20} fill="currentColor" /></div>
                      <h3 className="text-xl font-bold text-white">Metode RME TRISULA</h3>
                    </div>
                    <ul className="space-y-4">
                      {[
                        'Fokus pada konstruksi dan penemuan konsep',
                        'Skenario nyata yang otentik dan relevan',
                        'Penilaian berlapis pada setiap tahap berpikir',
                        'Umpan balik AI yang kualitatif dan formatif',
                        'Siswa aktif bernalar tingkat tinggi (HOTS)'
                      ].map((item, i) => (
                         <li key={i} className="flex items-start gap-3 text-sm text-blue-50">
                          <div className="mt-1 shrink-0"><CheckCircle2 size={16} className="text-emerald-400" /></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="max-w-7xl mx-auto px-6 py-12">
            <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{once:true,amount:0.3}} variants={stagger}>
              {[{icon:<Users size={24}/>,target:1240,suffix:'+',label:'Siswa Aktif',sub:'dari 18 sekolah mitra'},{icon:<Award size={24}/>,target:8500,suffix:'+',label:'Studi Kasus Selesai',sub:'dengan penilaian AI'},{icon:<Building2 size={24}/>,target:18,suffix:'',label:'Sekolah Mitra',sub:'se-Sulawesi dan Nusa Tenggara'}].map((s,i)=>(
                <motion.div key={i} variants={fadeUp} className="group rounded-3xl border border-slate-200 bg-white p-6 text-center hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">{s.icon}</div>
                  <div className="text-3xl font-black text-slate-900 mb-1"><AnimatedCounter target={s.target} suffix={s.suffix}/></div>
                  <p className="text-sm font-bold text-slate-700 mb-1">{s.label}</p>
                  <p className="text-xs text-slate-500">{s.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* FINAL CTA */}
          <section className="max-w-7xl mx-auto px-6 pb-20">
            <motion.div className="relative rounded-[2rem] overflow-hidden bg-blue-900 p-10 lg:p-16 text-center shadow-2xl shadow-blue-900/20 text-white" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0,transition:{duration:0.7}}} viewport={{once:true}}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"/>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl"/>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-5">
                <p className="text-blue-300 text-xs font-bold uppercase tracking-[0.25em]">Mulai Hari Ini</p>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Siap Menguasai Matematika<br/><span className="text-blue-200">dengan Cara yang Benar?</span>
                </h2>
                <p className="text-blue-100 max-w-xl text-base leading-relaxed">Bergabung bersama ribuan siswa yang telah membuktikan bahwa matematika bukan tentang menghafal—tapi tentang memahami dan berpikir.</p>
                <button onClick={()=>onNavigate('materi')} className="group mt-3 inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-bold text-base transition-all duration-300 shadow-xl hover:scale-[1.04] active:scale-95 cursor-pointer">
                  Eksplorasi Modul Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                </button>
              </div>
            </motion.div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white text-slate-900">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center"><Triangle size={14} className="text-white" fill="white"/></div>
                  <span className="text-sm font-extrabold text-slate-900">TRISULA <span className="font-light text-blue-600">EDUMATH</span></span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-sm">Platform asesmen matematika berbasis RME dan AI Generatif untuk siswa Kelas XII, mendorong penalaran logis yang bermakna.</p>
                <div className="flex gap-3 mt-1">
                  {[<Twitter size={15}/>,<Instagram size={15}/>,<Github size={15}/>,<Mail size={15}/>].map((Icon,i)=>(
                    <a key={i} href="#" className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">{Icon}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">Platform</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {['Beranda','Metode RME','Modul Interaktif','Keunggulan','Kontak'].map(link=>(
                    <li key={link}><a href="#" className="hover:text-blue-600 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">Sumber</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {['Tentang RME','Panduan Guru','Blog Edukasi','Kebijakan Privasi','Syarat Ketentuan'].map(link=>(
                    <li key={link}><a href="#" className="hover:text-blue-600 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <p>2026 TRISULA EDUMATH. Seluruh hak cipta dilindungi.</p>
              <p>Dibuat untuk pendidikan matematika yang bermakna di Indonesia.</p>
            </div>
          </div>
        </footer>

      </div>

      {/* PILLAR MODAL OVERLAY */}
      <AnimatePresence>
        {selectedPillarIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedPillarIndex(null)}
              className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className={`h-24 w-full flex items-center justify-center ${pillars[selectedPillarIndex].color === 'blue' ? 'bg-blue-600' : pillars[selectedPillarIndex].color === 'violet' ? 'bg-violet-600' : 'bg-cyan-600'}`}>
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-inner">
                  {pillars[selectedPillarIndex].icon}
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedPillarIndex(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              
              <div className="p-8">
                <span className={`text-xs font-black uppercase tracking-widest block mb-2 ${pillars[selectedPillarIndex].color === 'blue' ? 'text-blue-600' : pillars[selectedPillarIndex].color === 'violet' ? 'text-violet-600' : 'text-cyan-600'}`}>
                  Pilar 0{selectedPillarIndex + 1}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4">{pillars[selectedPillarIndex].title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {pillars[selectedPillarIndex].fullContent}
                </p>
                <button 
                  onClick={() => setSelectedPillarIndex(null)}
                  className="mt-8 w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
                >
                  Tutup Informasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
