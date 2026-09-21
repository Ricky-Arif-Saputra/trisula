import React, { useState, useEffect } from 'react';
import { MathCategory } from '../../types';
import { BlockMath, InlineMath } from 'react-katex';

interface MateriScreenProps {
  initialCategory?: MathCategory | null;
  onSelectCategory?: (category: MathCategory | null) => void;
  onNavigateToProblem?: () => void;
}

export const MateriScreen: React.FC<MateriScreenProps> = ({
  initialCategory = null,
  onSelectCategory,
  onNavigateToProblem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MathCategory | null>(initialCategory);
  const [activeSubtopic, setActiveSubtopic] = useState<string>('intro');

  // Sync internal state if prop changes from parent
  useEffect(() => {
    setSelectedCategory(initialCategory);
    setActiveSubtopic('intro'); // Reset subtopic when category changes
  }, [initialCategory]);

  const handleSelectCat = (cat: MathCategory | null) => {
    setSelectedCategory(cat);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  // Syllabus Data Structure
  const syllabus = {
    bilangan: [
      { id: 'intro', title: 'Pengantar Teori Bilangan' },
      { id: 'operasi', title: 'Sifat Operasi Hitung' },
      { id: 'fpbkpk', title: 'FPB & KPK' },
      { id: 'rasio', title: 'Rasio & Skala' },
    ],
    aljabar: [
      { id: 'intro', title: 'Konsep Dasar Aljabar' },
      { id: 'linear', title: 'Persamaan Linear' },
      { id: 'pertidaksamaan', title: 'Pertidaksamaan Linear' },
      { id: 'fungsi', title: 'Sistem Fungsi' },
    ],
    geometri: [
      { id: 'intro', title: 'Elemen Geometri Dasar' },
      { id: 'objek', title: 'Objek & Bangun 2D/3D' },
      { id: 'transformasi', title: 'Transformasi Geometri' },
      { id: 'pengukuran', title: 'Sistem Pengukuran' },
    ],
    trigonometri: [
      { id: 'intro', title: 'Sudut & Lingkaran Satuan' },
      { id: 'rasio', title: 'Rasio Trigonometri' },
      { id: 'identitas', title: 'Identitas Trigonometri' },
      { id: 'grafik', title: 'Grafik Gelombang' },
    ],
    peluang: [
      { id: 'intro', title: 'Konsep Dasar Statistika' },
      { id: 'data', title: 'Analisis Data' },
      { id: 'kombinatorika', title: 'Kombinatorika' },
      { id: 'peluang', title: 'Teori Peluang' },
    ],
  };

  const renderContent = () => {
    if (selectedCategory === 'aljabar' && activeSubtopic === 'linear') {
      return (
        <div className="space-y-6 animate-in fade-in">
          <div className="callout-definition shadow-sm">
            <h4 className="font-bold text-[#1E3A5F] dark:text-[#60a5fa] mb-2 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              Definisi Kunci: Persamaan Linear
            </h4>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Persamaan linear adalah suatu persamaan aljabar yang tiap sukunya mengandung konstanta, 
              atau perkalian konstanta dengan variabel tunggal berderajat pertama. Bentuk umumnya dinyatakan sebagai:
            </p>
            <div className="mt-3">
              <BlockMath math="ax + b = 0" />
            </div>
            <p className="text-sm leading-relaxed text-on-surface-variant mt-2">
              di mana <InlineMath math="a \neq 0" />.
            </p>
          </div>

          <div className="callout-theorem shadow-sm">
            <h4 className="font-bold text-[#059669] dark:text-[#34d399] mb-2 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              Teorema Kesetaraan
            </h4>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Jika kedua ruas suatu persamaan ditambah, dikurang, dikali, atau dibagi dengan bilangan riil 
              yang sama (bukan nol untuk pembagian), maka nilai kebenaran persamaan tersebut tidak berubah.
            </p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-on-surface mb-3 text-sm">Contoh Soal</h4>
            <p className="text-sm text-on-surface-variant mb-2">
              Tentukan nilai <InlineMath math="x" /> dari persamaan:
            </p>
            <BlockMath math="2x + 5 = 13" />
            
            <div className="mt-4 callout-solution">
              <h5 className="font-bold text-[#16a34a] dark:text-[#4ade80] text-xs mb-2 uppercase tracking-wide">Penyelesaian:</h5>
              <div className="text-sm text-on-surface-variant space-y-2">
                <p>Kurangi kedua ruas dengan 5:</p>
                <BlockMath math="2x = 13 - 5 \implies 2x = 8" />
                <p>Bagi kedua ruas dengan 2:</p>
                <BlockMath math="x = \frac{8}{2} \implies x = 4" />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Default dummy content for other topics to showcase the style
    return (
      <div className="space-y-6 animate-in fade-in">
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white capitalize">
          {syllabus[selectedCategory as keyof typeof syllabus]?.find(s => s.id === activeSubtopic)?.title || 'Pengantar'}
        </h2>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Pilih sub-topik spesifik di menu silabus (sebelah kiri) untuk mulai membaca materi. Materi yang 
          disediakan disusun dengan standar akademis dan dilengkapi dengan notasi matematis presisi tinggi (LaTeX).
        </p>
        <div className="callout-example shadow-sm">
          <h4 className="font-bold text-[#D97706] dark:text-[#fbbf24] mb-2 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
            Contoh Notasi Presisi (Euler's Identity)
          </h4>
          <BlockMath math="e^{i\pi} + 1 = 0" />
        </div>
      </div>
    );
  };

  // ==============================================================
  // VIEW 1: DAFTAR 5 MATERI UTAMA (When selectedCategory === null)
  // ==============================================================
  if (selectedCategory === null) {
    return (
      <div className="flex flex-col w-full pb-16 font-sans">
        {/* HEADER HERO ACADEMIC */}
        <section className="px-margin-mobile pt-space-sm pb-space-md flex flex-col gap-space-sm">
          <div className="p-space-lg rounded-2xl bg-[#0F172A] text-white shadow-xl relative overflow-hidden border border-[#1E293B]">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#059669]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#1E293B] border border-[#334155] text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="material-symbols-outlined text-[32px] text-[#059669]">account_balance</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#D97706] uppercase tracking-widest font-bold">
                      Academic LMS Program
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white leading-tight font-serif tracking-wide">
                    Modul Kurikulum Utama
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Pilih disiplin ilmu untuk mulai belajar</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GRID 5 MATERI UTAMA CARDS */}
        <section className="px-margin-mobile flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {(['bilangan', 'aljabar', 'geometri', 'trigonometri', 'peluang'] as const).map((cat) => {
              const icons = { bilangan: 'tag', aljabar: 'functions', geometri: 'category', trigonometri: 'change_history', peluang: 'bar_chart' };
              const titles = { bilangan: 'Teori Bilangan', aljabar: 'Aljabar Modern', geometri: 'Geometri & Pengukuran', trigonometri: 'Trigonometri', peluang: 'Data & Probabilitas' };
              const desc = { 
                bilangan: 'Operasi Hitung, FPB/KPK, Rasio & Sifat Bilangan.', 
                aljabar: 'Persamaan Linear, Pertidaksamaan & Sistem Fungsi.', 
                geometri: 'Objek 2D/3D, Transformasi Geometri, Luas/Volume.', 
                trigonometri: 'Rasio & Identitas Trigonometri, Grafik Gelombang.', 
                peluang: 'Analisis Data, Statistik, Peluang & Kombinatorika.' 
              };

              return (
                <div
                  key={cat}
                  onClick={() => handleSelectCat(cat)}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-[#059669]/50 transition-all cursor-pointer flex flex-col gap-4 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-[#059669]/10 group-hover:text-[#059669] transition-colors">
                      <span className="material-symbols-outlined text-[20px]">{icons[cat]}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded uppercase tracking-wider">
                      Modul Aktif
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-serif mb-1 group-hover:text-[#059669] transition-colors">
                      {titles[cat]}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {desc[cat]}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        </section>
      </div>
    );
  }

  // ==============================================================
  // VIEW 2: DETAIL MATERI DENGAN SYLLABUS SIDEBAR
  // ==============================================================
  const currentSyllabus = syllabus[selectedCategory as keyof typeof syllabus] || [];

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] pb-16 font-sans bg-slate-50 dark:bg-[#0F172A]">
      
      {/* ACADEMIC HEADER FOR DETAIL VIEW */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-700 px-margin-mobile py-4 sticky top-16 z-20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#D97706]">
              <span className="material-symbols-outlined text-[18px]">local_library</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Materi Pembelajaran
              </span>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                {selectedCategory}
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
             <button
              onClick={() => onNavigateToProblem && onNavigateToProblem()}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              Latihan Topik Ini
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full">
        {/* SIDEBAR SYLLABUS */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-[#1E293B] md:border-r border-slate-200 dark:border-slate-700 md:min-h-full">
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
              Struktur Silabus
            </h3>
            <nav className="flex flex-col gap-1">
              {currentSyllabus.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSubtopic(item.id)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 cursor-pointer ${
                    activeSubtopic === item.id
                      ? 'bg-[#059669]/10 text-[#059669] font-bold border-l-4 border-[#059669]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeSubtopic === item.id ? 'bg-[#059669] text-white' : 'bg-slate-200 dark:bg-slate-700'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </nav>
            
            {/* Progress Indicator */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-500">Progres Modul</span>
                <span className="font-bold text-[#059669]">25%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#059669] h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 bg-white dark:bg-transparent">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-6">
             <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full badge-in-progress flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Sedang Dipelajari
             </span>
          </div>

          <article className="max-w-3xl">
            {renderContent()}
          </article>
        </main>
      </div>

    </div>
  );
};
