import React, { useState } from 'react';

export const QuizQuestionRME: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  
  // RME Extension Simulator State
  const [simModal, setSimModal] = useState<number>(2000000);

  const questionData = {
    context: "Berdasarkan laporan Otoritas Jasa Keuangan (OJK), literasi keuangan masyarakat Indonesia terus meningkat. Salah satu bentuk pengelolaan keuangan yang banyak dilakukan oleh siswa adalah menabung untuk kebutuhan pendidikan. Seorang siswa kelas XII memiliki uang kas sebesar Rp1.200.000 dan mempertimbangkan tiga pilihan investasi berikut:",
    table: [
      { name: "Deposito A", value: 1272000, rate: 6, profit: 72000 },
      { name: "Deposito B", value: 1260000, rate: 5, profit: 60000 },
      { name: "Deposito C", value: 1284000, rate: 7, profit: 84000 },
    ],
    question: "Siswa tersebut ingin memilih produk yang memberikan keuntungan terbesar dalam satu tahun. Berdasarkan informasi pada tabel, produk yang memberikan keuntungan terbesar adalah ....",
    options: [
      "A. Deposito A",
      "B. Deposito B",
      "C. Deposito C",
      "D. Semua deposito memberikan keuntungan yang sama",
      "E. Tidak dapat ditentukan karena tidak diketahui persentase bunga"
    ],
    correctOptionIdx: 2, // C
    baseModal: 1200000
  };

  const isCorrect = selectedOption === questionData.correctOptionIdx;

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setHasSubmitted(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[#059669]">account_balance</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Bilangan
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Literasi Keuangan (Mudah)
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
            <div className="mt-4 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3">Nilai Setelah 1 Tahun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                  {questionData.table.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold">{item.name}</td>
                      <td className="px-4 py-3 font-mono">{formatCurrency(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <span>{opt}</span>
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
              
              {/* Guided Scaffolding Header */}
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isCorrect ? 'bg-[#059669]/10 border-[#059669]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isCorrect ? 'bg-[#059669]' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isCorrect ? 'workspace_premium' : 'psychology_alt'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-[#059669]' : 'text-amber-600'}`}>
                    {isCorrect ? 'Keren! Keputusan Finansialmu Tepat! 🎉' : 'Yuk, kita amati kembali uang tabunganmu!'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {!isCorrect && 'Keuntungan didapatkan dari selisih antara Uang Akhir yang diterima dengan Modal Uang Kas awal yang disetorkan. Mari kita urai nilainya!'}
                    {isCorrect && 'Kamu berhasil mengidentifikasi bahwa keuntungan adalah selisih antara nilai akhir dan modal awal. Tabungan C memang memberikan imbal hasil tertinggi.'}
                  </p>
                </div>
              </div>

              {/* Visualisasi Model Matematika (Bar Chart SVG) */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D97706]">bar_chart</span>
                  Perbandingan Komponen Uang (Modal + Keuntungan)
                </h4>
                
                <div className="flex flex-col gap-6">
                  {questionData.table.map((item, idx) => {
                    const isMax = item.profit === 84000;
                    const maxTotal = 1284000;
                    const modalPct = (questionData.baseModal / maxTotal) * 100;
                    const profitPct = (item.profit / maxTotal) * 100;

                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                          <span className={isMax ? 'text-[#059669]' : 'text-slate-500'}>
                            Keuntungan: {formatCurrency(item.profit)}
                          </span>
                        </div>
                        
                        {/* Stacked Bar */}
                        <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex relative group cursor-crosshair shadow-inner">
                          {/* Modal Base (Slate Blue) */}
                          <div 
                            className="h-full bg-[#1E3A5F] flex items-center justify-center text-[10px] text-white/80 font-mono"
                            style={{ width: `${modalPct}%` }}
                          >
                            Modal
                          </div>
                          {/* Profit (Emerald Green) */}
                          <div 
                            className={`h-full flex items-center px-2 text-[10px] text-white font-mono font-bold transition-all duration-700 ${isMax ? 'bg-[#059669]' : 'bg-[#10b981]/60'}`}
                            style={{ width: `${profitPct}%` }}
                          >
                            +{formatCurrency(item.profit)}
                          </div>
                          
                          {/* Tooltip on Hover */}
                          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs p-2 rounded -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-10 shadow-xl">
                            {formatCurrency(item.value)} - {formatCurrency(questionData.baseModal)} = {formatCurrency(item.profit)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex items-center gap-4 justify-center text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#1E3A5F]"></span> Modal Awal (Rp1.200.000)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#059669]"></span> Keuntungan Riil
                  </div>
                </div>
              </div>

              {/* RME Extension (Eksplorasi Lanjutan) */}
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
                      Tahukah Kamu? (Eksplorasi Persentase Bunga)
                    </span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isAccordionOpen && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      Keuntungan yang didapat sebenarnya berasal dari suku bunga deposito tahunan. Berdasarkan rasio keuntungan terhadap modal awal, kita bisa mengetahui bunganya:
                    </p>
                    
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {questionData.table.map((item, idx) => (
                        <div key={idx} className={`p-3 text-center rounded-xl border ${item.rate === 7 ? 'bg-[#059669]/10 border-[#059669]/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                          <div className={`text-xl font-bold mt-1 ${item.rate === 7 ? 'text-[#059669]' : 'text-slate-800 dark:text-white'}`}>
                            {item.rate}%
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Mini Simulator */}
                    <div className="bg-[#0F172A] p-5 rounded-xl text-white shadow-inner">
                      <h5 className="font-bold text-sm text-[#059669] mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">calculate</span>
                        Simulator Aritmetika Sosial
                      </h5>
                      <p className="text-xs text-slate-400 mb-3">
                        Bagaimana jika uang kas yang disetorkan lebih besar? Coba geser modal awal di bawah ini:
                      </p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300">Modal Awal Simulasi:</span>
                        <span className="text-sm font-bold text-[#fbbf24]">{formatCurrency(simModal)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="500000" 
                        max="10000000" 
                        step="500000"
                        value={simModal} 
                        onChange={(e) => setSimModal(Number(e.target.value))}
                        className="w-full accent-[#059669] h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mb-5"
                      />

                      <div className="grid grid-cols-3 gap-2">
                         {questionData.table.map((item, idx) => {
                           const newProfit = simModal * (item.rate / 100);
                           return (
                             <div key={idx} className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                               <div className="text-[9px] text-slate-400 uppercase tracking-wider">{item.name} ({item.rate}%)</div>
                               <div className="text-xs font-bold text-white mt-1">
                                 +{formatCurrency(newProfit)}
                               </div>
                             </div>
                           );
                         })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
};
