import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';

export const QuizQuestionRMESedang: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  
  // RME Extension Simulator State
  const [simYears, setSimYears] = useState<number>(3);

  const questionData = {
    context: "Bank Swasta ECO menawarkan program tabungan pendidikan untuk pelajar. Budi, seorang siswa SMA, menyisihkan uang sakunya setiap bulan hingga terkumpul Rp1.500.000. Ia menabung uang tersebut pada program bank dengan bunga majemuk 8% per tahun.",
    question: "Model matematika yang tepat untuk menentukan nilai tabungan Budi setelah 3 tahun adalah ....",
    options: [
      "A. S = 1.500.000 × (1,08)³",
      "B. S = 1.500.000 + (1,08)³ × (1.500.000)",
      "C. S = 1.500.000 × (1 + 0,24)",
      "D. S = 1.500.000 × 0,08³",
      "E. S = 1.500.000 + 0,08³"
    ],
    correctOptionIdx: 0, // A
    baseModal: 1500000,
    rate: 0.08
  };

  const isCorrect = selectedOption === questionData.correctOptionIdx;
  const isMisconceptionC = selectedOption === 2; // Option C is Simple Interest

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setHasSubmitted(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  // Timeline data for base 3 years
  const timelineData = [
    { year: 0, val: 1500000, desc: "Modal Awal = 100%" },
    { year: 1, val: 1500000 * 1.08, desc: "Uang bertambah 8% dari modal awal" },
    { year: 2, val: 1500000 * Math.pow(1.08, 2), desc: "Bunga dari tahun ke-1 ikut berbunga" },
    { year: 3, val: 1500000 * Math.pow(1.08, 3), desc: "Bunga dari tahun ke-2 ikut berbunga" }
  ];

  // Simulator calculation
  const simpleInterestFinal = questionData.baseModal * (1 + (questionData.rate * simYears));
  const compoundInterestFinal = questionData.baseModal * Math.pow((1 + questionData.rate), simYears);
  const diffExtra = compoundInterestFinal - simpleInterestFinal;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[#D97706]">timeline</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Bilangan
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Bunga Majemuk (Sedang)
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
            Soal 1 / 1
          </span>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <div className="callout-example mb-6">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {questionData.context}
            </p>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 leading-relaxed">
            {questionData.question}
          </h3>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-[#0F172A] dark:hover:border-slate-500 text-slate-700 dark:text-slate-300";
              
              if (hasSubmitted) {
                const isCorrectOpt = idx === questionData.correctOptionIdx;
                if (isSelected && isCorrectOpt) btnClass = "border-[#059669] bg-[#059669]/10 text-[#059669]";
                else if (isSelected && !isCorrectOpt) btnClass = "border-red-500 bg-red-500/10 text-red-500";
                else if (isCorrectOpt) btnClass = "border-[#059669] bg-[#059669]/10 text-[#059669]";
                else btnClass = "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50";
              } else if (isSelected) {
                btnClass = "border-[#0F172A] dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold ring-2 ring-[#0F172A] dark:ring-white";
              }

              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                >
                  <span className="font-mono text-sm font-semibold">{opt}</span>
                  {hasSubmitted && idx === questionData.correctOptionIdx && <span className="material-symbols-outlined text-[#059669]">check_circle</span>}
                  {hasSubmitted && isSelected && idx !== questionData.correctOptionIdx && <span className="material-symbols-outlined text-red-500">cancel</span>}
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          {!hasSubmitted && (
            <button
              disabled={selectedOption === null}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedOption !== null 
                  ? 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-md cursor-pointer' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              Submit Jawaban
            </button>
          )}

          {/* ========================================================= */}
          {/* RME FEEDBACK SECTION (Tampil setelah Submit) */}
          {/* ========================================================= */}
          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
              
              {/* Misconception Alert if they picked C */}
              {!isCorrect && isMisconceptionC && (
                <div className="p-4 rounded-xl mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                  <div>
                    <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-1">Hati-hati terbalik!</h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Opsi C <InlineMath math="(1 + 0,24)" /> adalah rumus <strong>Bunga Tunggal</strong> (8% × 3 tahun = 24%). Pada <strong>Bunga Majemuk</strong>, bunga periode sebelumnya ikut berbunga kembali, sehingga kita menggunakan perkalian berulang / eksponen <InlineMath math="(1,08)^3" />.
                    </p>
                  </div>
                </div>
              )}

              {/* Guided Scaffolding Header */}
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isCorrect ? 'bg-[#059669]/10 border-[#059669]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isCorrect ? 'bg-[#059669]' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isCorrect ? 'workspace_premium' : 'psychology_alt'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-[#059669]' : 'text-amber-600'}`}>
                    {isCorrect ? 'Luar biasa! Kamu berhasil memahami konsep pertumbuhan eksponensial bunga majemuk! 🎉' : 'Mari kita urai konsep bunga majemuk!'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {!isCorrect && 'Bunga majemuk berarti bunga yang didapat di suatu tahun akan ditambahkan ke modal, dan ikut berbunga di tahun berikutnya. Ini menciptakan efek perkalian yang berulang (eksponensial).'}
                  </p>
                </div>
              </div>

              {/* Visualisasi Model Matematika (Timeline Konstruksi Konsep) */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D97706]">account_tree</span>
                  Interactive Year-by-Year Timeline
                </h4>
                
                <div className="flex flex-col gap-4 relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-300 dark:bg-slate-600 z-0"></div>
                  
                  {timelineData.map((item, idx) => (
                    <div key={idx} className="flex gap-4 relative z-10 items-center">
                      <div className={`w-12 h-12 rounded-full border-4 border-slate-50 dark:border-slate-800 flex items-center justify-center font-bold text-sm flex-shrink-0 ${idx === 0 ? 'bg-slate-200 text-slate-600' : 'bg-[#1E3A5F] text-white shadow-md'}`}>
                        T{item.year}
                      </div>
                      
                      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-white mb-1">
                              {formatCurrency(item.val)}
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.desc}
                            </p>
                          </div>
                          <div className="bg-[#059669]/10 text-[#059669] px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex flex-col items-end">
                            {idx === 0 ? (
                              <span>1.500.000</span>
                            ) : (
                              <span>1.500.000 × (1,08)<sup className="text-[10px]">{idx > 1 ? idx : ''}</sup></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-3 bg-[#D97706]/10 border border-[#D97706]/30 rounded-lg text-xs text-slate-700 dark:text-slate-300 text-center font-bold">
                  Perhatikan faktor pengali (1,08) yang terus berulang sebanyak jumlah tahun. Inilah yang membuat modal awal dikalikan dengan eksponen pangkat waktu.
                </div>
              </div>

              {/* RME Extension (Komparator Interaktif) */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-[#1E293B]">
                <button 
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#059669]/10 text-[#059669] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">swap_calls</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      Komparator: Bunga Majemuk vs Tunggal
                    </span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isAccordionOpen && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      Seberapa besar bedanya jika Budi menabung dengan sistem bunga tunggal dibandingkan bunga majemuk? Geser tahun di bawah ini untuk melihat perbandingan secara real-time!
                    </p>
                    
                    {/* Interactive Slider */}
                    <div className="mb-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi Menabung</span>
                        <span className="text-sm font-bold text-[#D97706]">{simYears} Tahun</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1"
                        value={simYears} 
                        onChange={(e) => setSimYears(Number(e.target.value))}
                        className="w-full accent-[#D97706] h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                        <span>1 Thn</span>
                        <span>10 Thn</span>
                      </div>
                    </div>

                    {/* Compare Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Bunga Tunggal (Opsi C)
                        </span>
                        <div className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                          {formatCurrency(simpleInterestFinal)}
                        </div>
                        <div className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded inline-block mt-1">
                          S = 1.5M × (1 + {0.08 * simYears})
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-[#059669]/30 bg-[#059669]/5">
                        <span className="text-[10px] font-bold text-[#059669] uppercase tracking-widest block mb-1">
                          Bunga Majemuk (Opsi A)
                        </span>
                        <div className="text-lg font-bold text-[#059669] mb-1">
                          {formatCurrency(compoundInterestFinal)}
                        </div>
                        <div className="text-xs text-[#059669]/80 font-mono bg-[#059669]/10 px-2 py-1 rounded inline-block mt-1">
                          S = 1.5M × (1,08)<sup className="text-[10px]">{simYears}</sup>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1E3A5F] text-white p-4 rounded-xl flex items-center justify-between shadow-inner">
                      <div>
                        <div className="text-xs text-slate-300 mb-0.5">Keuntungan Ekstra Budi (Selisih)</div>
                        <div className="text-sm font-bold text-[#fbbf24]">Dalam {simYears} tahun</div>
                      </div>
                      <div className="text-xl font-bold text-[#fbbf24] bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                        +{formatCurrency(diffExtra)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
