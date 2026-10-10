import React from 'react';
import { ScreenType, MathCategory } from '../../types';

interface BerandaScreenProps {
  onNavigate: (screen: ScreenType, category?: MathCategory) => void;
  onOpenTeacherMode: () => void;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  onNavigate,
  onOpenTeacherMode,
}) => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30 py-16 px-6 lg:px-16 gap-16 font-sans">
      
      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100/60 shadow-sm text-rose-700 font-medium text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          Metodologi Pembelajaran Terkini
        </div>
        
        <h1 className="font-serif text-4xl lg:text-5xl tracking-tight text-rose-950 leading-tight">
          Menghidupkan Matematika dengan <br className="hidden lg:block"/> Pendekatan Realistik (RME)
        </h1>
        
        <p className="text-slate-600 leading-relaxed text-lg max-w-2xl px-4">
          Sebuah ruang elegan di mana abstraksi matematika bertemu dengan realitas. Kami memandu Anda menenun pemahaman konsep melalui situasi dunia nyata, membangun nalar logis tanpa tekanan menghafal.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto px-4">
          <button
            onClick={() => onNavigate('latihan-rme')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-rose-700 text-white font-medium text-sm hover:bg-rose-800 transition-all duration-300 hover:shadow-lg hover:shadow-rose-200 cursor-pointer"
          >
            Mulai Perjalanan RME
          </button>
          <button
            onClick={onOpenTeacherMode}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-rose-800 font-medium text-sm border border-rose-200 hover:bg-rose-50 transition-all duration-300 cursor-pointer"
          >
            Akses Pendidik
          </button>
        </div>
      </section>

      {/* SECTION 1: APA ITU RME */}
      <section className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto w-full pt-8">
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="font-serif text-3xl tracking-tight text-rose-950">Apa itu Realistic Mathematics Education?</h2>
          <div className="w-16 h-1 bg-rose-200 rounded-full"></div>
          <p className="text-slate-600 leading-relaxed text-base">
            Realistic Mathematics Education (RME) adalah pendekatan pedagogis inovatif yang lahir dari keyakinan bahwa matematika adalah aktivitas manusia, bukan sekadar sekumpulan aturan abstrak. 
            Melalui RME, pengalaman sehari-hari Anda—mulai dari arsitektur jembatan hingga ekonomi perbankan—diubah menjadi landasan intuitif untuk memecahkan masalah matematis yang kompleks.
          </p>
          <p className="text-slate-600 leading-relaxed text-base">
            Bersama TRISULA EduMath, Anda tidak lagi dituntut untuk menelan rumus mentah-mentah. Anda akan diajak bereksplorasi, menemukan pola, dan merajut pemahaman Anda sendiri dengan bimbingan yang anggun dan interaktif.
          </p>
        </div>
        <div className="flex-1 w-full bg-white rounded-3xl p-8 border border-rose-100/60 shadow-xl shadow-rose-100/40 relative overflow-hidden flex items-center justify-center min-h-[300px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-50 rounded-tr-full opacity-50"></div>
          <span className="material-symbols-outlined text-[120px] text-rose-200 drop-shadow-md">local_florist</span>
        </div>
      </section>

      {/* SECTION 2: 4 PILAR UTAMA RME */}
      <section className="flex flex-col gap-12 max-w-6xl mx-auto w-full pt-12">
        <div className="text-center flex flex-col items-center gap-4">
          <h2 className="font-serif text-3xl tracking-tight text-rose-950">Empat Pilar Utama RME</h2>
          <div className="w-12 h-1 bg-rose-200 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pilar 1 */}
          <div className="bg-white rounded-3xl p-8 border border-rose-100/60 shadow-xl shadow-rose-100/40 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-2">
              <span className="material-symbols-outlined text-[24px]">public</span>
            </div>
            <h3 className="font-serif text-lg text-rose-900 font-bold">Konteks Dunia Nyata</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Memulai pembelajaran dari masalah dan fenomena yang dapat dibayangkan, memberikan makna langsung pada abstraksi matematika.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white rounded-3xl p-8 border border-rose-100/60 shadow-xl shadow-rose-100/40 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
              <span className="material-symbols-outlined text-[24px]">architecture</span>
            </div>
            <h3 className="font-serif text-lg text-rose-900 font-bold">Matematisasi</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Proses anggun menyaring dunia nyata menjadi model (horizontal) dan mereorganisasinya di dalam sistem matematika (vertikal).
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white rounded-3xl p-8 border border-rose-100/60 shadow-xl shadow-rose-100/40 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-2">
              <span className="material-symbols-outlined text-[24px]">explore</span>
            </div>
            <h3 className="font-serif text-lg text-rose-900 font-bold">Penemuan Terbimbing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Siswa diberi ruang lapang untuk membangun dan menemukan kembali pengetahuan matematis dengan bimbingan yang tepat dan elegan.
            </p>
          </div>

          {/* Pilar 4 */}
          <div className="bg-white rounded-3xl p-8 border border-rose-100/60 shadow-xl shadow-rose-100/40 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
              <span className="material-symbols-outlined text-[24px]">forum</span>
            </div>
            <h3 className="font-serif text-lg text-rose-900 font-bold">Interaktivitas & Refleksi</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pembelajaran adalah proses sosial. Terdapat ruang dialog, refleksi diri, serta umpan balik kecerdasan buatan yang santun.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANFAAT RME */}
      <section className="flex flex-col gap-12 max-w-6xl mx-auto w-full pt-12 pb-16">
        <div className="text-center flex flex-col items-center gap-4">
          <h2 className="font-serif text-3xl tracking-tight text-rose-950">Manfaat RME bagi Pembelajar</h2>
          <div className="w-12 h-1 bg-rose-200 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-white to-rose-50/30 rounded-3xl p-8 border border-rose-100/60 flex items-start gap-4 shadow-sm">
            <span className="material-symbols-outlined text-rose-400 mt-1">favorite</span>
            <div>
              <h4 className="font-serif text-rose-900 font-bold mb-2">Mengurangi Kecemasan</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Menghapus stigma matematika yang menakutkan melalui pendekatan bertahap yang bersahabat dan lekat dengan realita.</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-rose-50/30 rounded-3xl p-8 border border-rose-100/60 flex items-start gap-4 shadow-sm">
            <span className="material-symbols-outlined text-rose-400 mt-1">psychology</span>
            <div>
              <h4 className="font-serif text-rose-900 font-bold mb-2">Nalar & Kritis</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Membentuk kebiasaan berpikir logis dan sistematis, menumbuhkan rasa ingin tahu alih-alih ketergantungan pada rumus.</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-3xl p-8 border border-amber-100/60 flex items-start gap-4 shadow-sm">
            <span className="material-symbols-outlined text-amber-500 mt-1">spa</span>
            <div>
              <h4 className="font-serif text-rose-900 font-bold mb-2">Kemandirian Belajar</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Mendorong sikap proaktif untuk merumuskan masalah dan mencari solusi melalui eksplorasi personal yang mendalam.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
