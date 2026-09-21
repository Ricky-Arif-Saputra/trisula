import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizQuestionRMESulit: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  
  // RME Extension Simulator State
  const [simYears, setSimYears] = useState<number>(4);

  const questionData = {
    context: "Seorang siswa berprestasi di SMA Suka Maju memperoleh dana beasiswa dari Pemerintah sebesar Rp4.000.000 yang ditujukan untuk biaya pendidikan dan riset proyek sekolahnya. Ia mempertimbangkan dua pilihan investasi untuk menyimpan dana tersebut selama masa belajarnya.",
    programs: [
      "Program A: Bunga majemuk 6% per tahun.",
      "Program B: Bonus tetap Rp250.000 setiap tahun."
    ],
    question: "Apabila dana disimpan selama 4 tahun. Pilih semua pernyataan yang benar.",
    options: [
      "A. Setelah 4 tahun saldo Program B menjadi Rp5.000.000.",
      "B. Saldo Program A lebih besar daripada Program B.",
      "C. Selisih kedua program kurang dari Rp100.000.",
      "D. Program B memberikan hasil terbesar.",
      "E. Karena Program A menggunakan bunga majemuk, maka hasil akhirnya pasti dua kali lebih besar daripada modal awal."
    ],
    correctOptionIdxs: [0, 1, 2], // A, B, C
    baseModal: 4000000,
    rateA: 0.06,
    bonusB: 250000
  };

  const handleToggleOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOptions(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const isAllCorrect = 
    selectedOptions.length === questionData.correctOptionIdxs.length &&
    questionData.correctOptionIdxs.every(idx => selectedOptions.includes(idx));

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      setHasSubmitted(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  // Helper for generating progress data up to year 4
  const generateProgressData = (maxYears: number) => {
    const data = [];
    for (let i = 0; i <= maxYears; i++) {
      data.push({
        year: i,
        progA: questionData.baseModal * Math.pow((1 + questionData.rateA), i),
        progB: questionData.baseModal + (questionData.bonusB * i)
      });
    }
    return data;
  };

  const progressData4Y = generateProgressData(4);
  const progA4Y = progressData4Y[4].progA;
  const progB4Y = progressData4Y[4].progB;

  // Simulator Data
  const simProgA = questionData.baseModal * Math.pow((1 + questionData.rateA), simYears);
  const simProgB = questionData.baseModal + (questionData.bonusB * simYears);

  // Verification Cards Data
  const verificationCards = [
    {
      id: "A",
      isTrue: true,
      desc: `Rp4.000.000 + 4(Rp250.000) = Rp5.000.000.`
    },
    {
      id: "B",
      isTrue: true,
      desc: `Program A (${formatCurrency(progA4Y)}) > Program B (${formatCurrency(progB4Y)}).`
    },
    {
      id: "C",
      isTrue: true,
      desc: `Selisih = ${formatCurrency(progA4Y)} - ${formatCurrency(progB4Y)} = ${formatCurrency(progA4Y - progB4Y)} (kurang dari Rp100.000).`
    },
    {
      id: "D",
      isTrue: false,
      desc: `Program A yang memberikan hasil terbesar, bukan Program B.`
    },
    {
      id: "E",
      isTrue: false,
      desc: `Dua kali modal awal adalah Rp8.000.000. Hasil Program A baru mencapainya di tahun ke-12, bukan tahun ke-4.`
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-rose-500">hotel_class</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Bilangan
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Pilihan Ganda Kompleks (Sulit)
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
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
              {questionData.context}
            </p>
            <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 font-semibold ml-2 space-y-1">
              {questionData.programs.map((prog, i) => (
                <li key={i}>{prog}</li>
              ))}
            </ul>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 leading-relaxed">
            {questionData.question}
            <span className="block text-xs font-normal text-slate-500 mt-1 italic">
              *Pilih semua opsi yang bernilai benar (Multi-Select).
            </span>
          </h3>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const isCorrectOpt = questionData.correctOptionIdxs.includes(idx);
              
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-[#0F172A] dark:hover:border-slate-500 text-slate-700 dark:text-slate-300";
              
              if (hasSubmitted) {
                if (isSelected && isCorrectOpt) btnClass = "border-[#059669] bg-[#059669]/10 text-[#059669]";
                else if (isSelected && !isCorrectOpt) btnClass = "border-red-500 bg-red-500/10 text-red-500";
                else if (!isSelected && isCorrectOpt) btnClass = "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-500"; // Missed correct option
                else btnClass = "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50";
              } else if (isSelected) {
                btnClass = "border-[#0F172A] dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold ring-2 ring-[#0F172A] dark:ring-white";
              }

              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => handleToggleOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${btnClass}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                    isSelected 
                      ? (hasSubmitted ? (isCorrectOpt ? 'bg-[#059669] border-[#059669]' : 'bg-red-500 border-red-500') : 'bg-[#0F172A] dark:bg-white border-[#0F172A] dark:border-white text-white dark:text-[#0F172A]') 
                      : 'border-slate-300 dark:border-slate-600 bg-transparent'
                  }`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{opt}</span>
                    {hasSubmitted && !isSelected && isCorrectOpt && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-bold">
                        *Opsi ini seharusnya dipilih karena bernilai benar.
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          {!hasSubmitted && (
            <button
              disabled={selectedOptions.length === 0}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedOptions.length > 0 
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
              
              {/* Feedback Header */}
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isAllCorrect ? 'bg-[#059669]/10 border-[#059669]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isAllCorrect ? 'bg-[#059669]' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'plumbing'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isAllCorrect ? 'text-[#059669]' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Sempurna! Analisis investasimu sangat tajam! 🎉' : 'Mari kita bedah setiap pernyataan dengan teliti!'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {!isAllCorrect && 'Soal pilihan ganda kompleks membutuhkan verifikasi mendetail untuk tiap opsi. Perhatikan perbandingan nilai dari tahun ke tahun berikut ini.'}
                  </p>
                </div>
              </div>

              {/* Visualisasi Model Matematika (Dual Line / Progress Visualizer) */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1E3A5F] dark:text-[#60a5fa]">monitoring</span>
                  Perbandingan Pertumbuhan Saldo (Tahun 0 - 4)
                </h4>
                
                <div className="overflow-x-auto pb-4">
                  <div className="min-w-[600px]">
                    <div className="grid grid-cols-6 gap-2 text-center text-xs font-bold text-slate-500 mb-2">
                      <div>Tahun</div>
                      <div>Tahun 0</div>
                      <div>Tahun 1</div>
                      <div>Tahun 2</div>
                      <div>Tahun 3</div>
                      <div>Tahun 4</div>
                    </div>
                    
                    {/* Program A Row */}
                    <div className="grid grid-cols-6 gap-2 items-center mb-4">
                      <div className="text-xs font-bold text-[#059669] flex flex-col">
                        <span>Prog A</span>
                        <span className="text-[9px] text-slate-400">Majemuk 6%</span>
                      </div>
                      {progressData4Y.map((data, i) => (
                        <div key={`A-${i}`} className="bg-[#059669]/10 border border-[#059669]/30 p-2 rounded-lg text-center shadow-sm">
                          <div className="text-[11px] font-mono font-bold text-[#059669]">{formatCurrency(data.progA)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Program B Row */}
                    <div className="grid grid-cols-6 gap-2 items-center">
                      <div className="text-xs font-bold text-[#1E3A5F] dark:text-[#60a5fa] flex flex-col">
                        <span>Prog B</span>
                        <span className="text-[9px] text-slate-400">Bonus Rp250k</span>
                      </div>
                      {progressData4Y.map((data, i) => (
                        <div key={`B-${i}`} className="bg-[#1E3A5F]/10 border border-[#1E3A5F]/30 p-2 rounded-lg text-center shadow-sm">
                          <div className="text-[11px] font-mono font-bold text-[#1E3A5F] dark:text-[#60a5fa]">{formatCurrency(data.progB)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guided Scaffolding - Bedah Pernyataan */}
              <div className="mb-6">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D97706]">fact_check</span>
                  Bedah Status Pernyataan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {verificationCards.map((card, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex gap-3 items-start ${
                      card.isTrue 
                        ? 'bg-[#059669]/5 border-[#059669]/20' 
                        : 'bg-red-500/5 border-red-500/20'
                    }`}>
                      <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                        card.isTrue ? 'bg-[#059669] text-white' : 'bg-red-500 text-white'
                      }`}>
                        <span className="material-symbols-outlined text-[16px] font-bold">
                          {card.isTrue ? 'check' : 'close'}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                          <span className={card.isTrue ? 'text-[#059669]' : 'text-red-500'}>
                            Pernyataan {card.id} [{card.isTrue ? 'BENAR' : 'SALAH'}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RME Extension (Simulator Rentang Tahun) */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-[#1E293B]">
                <button 
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#D97706]/10 text-[#D97706] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">explore</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      Simulator Jangka Panjang (Efek Eksponensial)
                    </span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isAccordionOpen && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      Perhatikan bahwa di awal-awal, bonus tetap (Prog B) terasa lebih besar dari persentase (Prog A). Coba geser durasi hingga 10 tahun untuk melihat kapan grafik mulai bersilangan!
                    </p>
                    
                    {/* Interactive Slider */}
                    <div className="mb-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi Simpanan</span>
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
                      <div className={`p-4 rounded-xl border ${simProgA > simProgB ? 'border-[#059669]/50 bg-[#059669]/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest block ${simProgA > simProgB ? 'text-[#059669]' : 'text-slate-400'}`}>
                            Program A (Majemuk 6%)
                          </span>
                          {simProgA > simProgB && <span className="text-[9px] bg-[#059669] text-white px-2 py-0.5 rounded-full font-bold">MENANG</span>}
                        </div>
                        <div className={`text-lg font-bold mb-1 ${simProgA > simProgB ? 'text-[#059669]' : 'text-slate-800 dark:text-white'}`}>
                          {formatCurrency(simProgA)}
                        </div>
                        <div className="text-xs text-slate-500 font-mono inline-block mt-1">
                          <InlineMath math={`4.000.000 \\times (1,06)^{${simYears}}`} />
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${simProgB > simProgA ? 'border-[#1E3A5F]/50 bg-[#1E3A5F]/10 dark:border-[#60a5fa]/50 dark:bg-[#60a5fa]/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest block ${simProgB > simProgA ? 'text-[#1E3A5F] dark:text-[#60a5fa]' : 'text-slate-400'}`}>
                            Program B (Bonus 250k)
                          </span>
                          {simProgB > simProgA && <span className="text-[9px] bg-[#1E3A5F] dark:bg-[#60a5fa] text-white px-2 py-0.5 rounded-full font-bold">MENANG</span>}
                        </div>
                        <div className={`text-lg font-bold mb-1 ${simProgB > simProgA ? 'text-[#1E3A5F] dark:text-[#60a5fa]' : 'text-slate-800 dark:text-white'}`}>
                          {formatCurrency(simProgB)}
                        </div>
                        <div className="text-xs text-slate-500 font-mono inline-block mt-1">
                          <InlineMath math={`4.000.000 + (${simYears} \\times 250.000)`} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-xs text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      Selisih Nilai Investasi: <span className="text-rose-500">{formatCurrency(Math.abs(simProgA - simProgB))}</span>
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
