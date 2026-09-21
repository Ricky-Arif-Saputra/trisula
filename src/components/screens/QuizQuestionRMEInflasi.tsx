import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizQuestionRMEInflasi: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  
  // RME Extension Simulator State
  const [simIncome, setSimIncome] = useState<number>(2000000);
  const [simInflationRate, setSimInflationRate] = useState<number>(5);

  const questionData = {
    context: "Badan Pusat Statistik melaporkan bahwa tingkat inflasi tahunan suatu daerah mencapai 5%. Pada awal tahun, harga rata-rata paket kebutuhan sekolah adalah Rp2.000.000. Empat siswa memberikan pendapat berikut:",
    opinions: [
      "Andi: 'Jika inflasi 5%, maka harga paket akan menjadi Rp2.100.000.'",
      "Budi: 'Kenaikan harga sebesar Rp100.000.'",
      "Citra: 'Daya beli masyarakat dapat menurun jika pendapatan tidak naik.'",
      "Dina: 'Inflasi menyebabkan harga paket turun.'"
    ],
    question: "Pilih semua pernyataan yang benar.",
    options: [
      "A. Pendapat Andi benar.",
      "B. Pendapat Budi benar.",
      "C. Pendapat Citra benar.",
      "D. Pendapat Dina benar.",
      "E. Inflasi 5% berarti harga semua barang pasti naik sebesar Rp500.000."
    ],
    correctOptionIdxs: [0, 1, 2], // A, B, C
    basePrice: 2000000,
    inflationRate: 0.05
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

  const isMisconceptionE = selectedOptions.includes(4); // Picked Option E

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      setHasSubmitted(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  // Simulator Data
  const newPrice = questionData.basePrice * (1 + (simInflationRate / 100));
  const deficit = simIncome - newPrice;
  const isDeficit = deficit < 0;

  // Verification Cards Data for Dashboard
  const opinionCards = [
    {
      id: "Andi",
      isTrue: true,
      icon: "person",
      desc: "Harga Awal + (Inflasi × Harga Awal)",
      math: `2.000.000 + (5\\% \\times 2.000.000) = 2.100.000`
    },
    {
      id: "Budi",
      isTrue: true,
      icon: "person_2",
      desc: "Nominal Kenaikan",
      math: `5\\% \\times 2.000.000 = 100.000`
    },
    {
      id: "Citra",
      isTrue: true,
      icon: "person_3",
      desc: "Dengan uang Rp2.000.000, masyarakat tidak lagi bisa membeli paket sekolah yang harganya sudah naik jadi Rp2.100.000 jika gajinya tidak ikut naik. Inilah yang disebut penurunan daya beli.",
      math: null
    },
    {
      id: "Dina",
      isTrue: false,
      icon: "person_4",
      desc: "Inflasi adalah kenaikan harga barang dan jasa secara umum dan terus menerus. Jika harga turun secara umum, dinamakan Deflasi.",
      math: null
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-purple-400">price_change</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Bilangan
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Literasi Finansial & Inflasi (Sulit)
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
            Soal 2 / 2
          </span>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <div className="callout-example mb-6">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
              {questionData.context}
            </p>
            <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-inner">
              {questionData.opinions.map((op, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">chat</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 italic">
                    {op}
                  </p>
                </div>
              ))}
            </div>
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
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
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
                      ? (hasSubmitted ? (isCorrectOpt ? 'bg-[#059669] border-[#059669]' : 'bg-rose-500 border-rose-500') : 'bg-[#0F172A] dark:bg-white border-[#0F172A] dark:border-white text-white dark:text-[#0F172A]') 
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
              
              {/* Misconception Alert if they picked E */}
              {!isAllCorrect && isMisconceptionE && (
                <div className="p-4 rounded-xl mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-start gap-3 shadow-sm">
                  <span className="material-symbols-outlined text-rose-500 mt-0.5">warning</span>
                  <div>
                    <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm mb-2">⚠️ Kenapa Opsi E Salah?</h4>
                    <div className="text-sm text-rose-700 dark:text-rose-300 space-y-2">
                      <p><strong>1) Secara Matematis:</strong> 5% dari Rp2.000.000 adalah Rp100.000, bukan Rp500.000.</p>
                      <p><strong>2) Secara Konsep:</strong> Inflasi persentase bergantung pada harga awal barang. 5% dari buku Rp10.000 adalah Rp500, bukan Rp500.000!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Header */}
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isAllCorrect ? 'bg-[#059669]/10 border-[#059669]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isAllCorrect ? 'bg-[#059669]' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'fact_check'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isAllCorrect ? 'text-[#059669]' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Tepat Sekali! Analisismu sangat kritis! 🎉' : 'Mari kita bedah setiap opini siswa dengan teliti!'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {!isAllCorrect && 'Tingkat inflasi merupakan konsep persentase yang berdampak pada kenaikan harga riil dan penurunan daya beli.'}
                  </p>
                </div>
              </div>

              {/* Dashboard Bedah Opini Siswa */}
              <div className="mb-6">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500">dashboard</span>
                  Dashboard Analisis Opini Siswa
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opinionCards.map((card, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border shadow-sm relative overflow-hidden ${
                      card.isTrue 
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' 
                        : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/50'
                    }`}>
                      <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl-lg text-[10px] font-bold text-white ${card.isTrue ? 'bg-[#059669]' : 'bg-rose-500'}`}>
                        {card.isTrue ? 'BENAR' : 'SALAH'}
                      </div>
                      <div className="flex gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${card.isTrue ? 'bg-[#059669]' : 'bg-rose-500'}`}>
                          <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white mb-0.5">Opini {card.id}</div>
                          {card.math && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{card.desc}</div>
                          )}
                        </div>
                      </div>
                      
                      {card.math ? (
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center mt-2 overflow-x-auto">
                          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                            <InlineMath math={card.math} />
                          </span>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                          {card.desc}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* RME Extension (Simulator Daya Beli) */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-[#1E293B]">
                <button 
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      Simulator Dompet vs Inflasi (Daya Beli)
                    </span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isAccordionOpen && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      Bagaimana dampak inflasi terhadap daya beli orang tuamu? Coba sesuaikan gaji bulanan dan tingkat inflasi di bawah ini untuk melihat apakah gaji tersebut masih mencukupi untuk membeli kebutuhan sekolah yang harganya ikut naik.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
                      {/* Interactive Controls */}
                      <div className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-6">
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">payments</span>
                              Anggaran / Gaji
                            </label>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                              {formatCurrency(simIncome)}
                            </span>
                          </div>
                          <input 
                            type="range" min="1500000" max="3000000" step="50000" value={simIncome} 
                            onChange={(e) => setSimIncome(Number(e.target.value))}
                            className="w-full accent-indigo-500 h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">trending_up</span>
                              Tingkat Inflasi
                            </label>
                            <span className="text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded">
                              {simInflationRate}%
                            </span>
                          </div>
                          <input 
                            type="range" min="0" max="20" step="1" value={simInflationRate} 
                            onChange={(e) => setSimInflationRate(Number(e.target.value))}
                            className="w-full accent-rose-500 h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                      </div>

                      {/* Power Purchasing Display */}
                      <div className="flex flex-col justify-center h-full gap-4">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Harga Paket Setelah Inflasi
                          </div>
                          <div className="text-lg font-black text-rose-500">
                            {formatCurrency(newPrice)}
                          </div>
                        </div>

                        <div className={`p-5 rounded-xl border-2 flex items-center gap-4 transition-colors ${
                          isDeficit 
                            ? 'bg-rose-50 border-rose-300 dark:bg-rose-900/20 dark:border-rose-700' 
                            : 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700'
                        }`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white ${
                            isDeficit ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}>
                            <span className="material-symbols-outlined text-3xl">
                              {isDeficit ? 'money_off' : 'shopping_bag'}
                            </span>
                          </div>
                          <div>
                            <h5 className={`font-black text-base uppercase tracking-wide mb-1 ${
                              isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {isDeficit ? 'Daya Beli Menurun ⚠️' : 'Daya Beli Aman ✅'}
                            </h5>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {isDeficit 
                                ? <>Defisit <span className="text-rose-500 font-bold">{formatCurrency(Math.abs(deficit))}</span>. Uang tidak cukup!</> 
                                : <>Masih sisa <span className="text-emerald-500 font-bold">{formatCurrency(deficit)}</span>. Uang cukup!</>}
                            </p>
                          </div>
                        </div>
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
