import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizQuestionRMEDiskon: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  
  // RME Extension Simulator State
  const [simDiscount1, setSimDiscount1] = useState<number>(20);
  const [simDiscount2, setSimDiscount2] = useState<number>(10);

  const questionData = {
    context: "Sebuah marketplace memberikan promo bertingkat untuk menyambut tahun ajaran baru. Terdapat promo laptop pelajar dengan Harga Awal Rp8.000.000 dan promo Diskon Ganda 20% + 10%.",
    question: "Jika Ahmad ingin membeli laptop tersebut, maka harga yang harus dibayarkannya setelah kedua diskon diterapkan adalah ....",
    options: [
      "A. Rp5.600.000",
      "B. Rp5.760.000",
      "C. Rp6.000.000",
      "D. Rp6.400.000",
      "E. Rp5.400.000"
    ],
    correctOptionIdx: 1, // B
    basePrice: 8000000,
    disc1: 0.20,
    disc2: 0.10
  };

  const isCorrect = selectedOption === questionData.correctOptionIdx;
  const isMisconceptionA = selectedOption === 0; // Thinks 20+10 = 30%
  const isMisconceptionD = selectedOption === 3; // Forgot 2nd discount

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setHasSubmitted(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  // Receipt calculations (fixed)
  const d1Amount = questionData.basePrice * questionData.disc1;
  const subtotal = questionData.basePrice - d1Amount;
  const d2Amount = subtotal * questionData.disc2;
  const finalTotal = subtotal - d2Amount;

  // Simulator calculations
  const simD1Amount = questionData.basePrice * (simDiscount1 / 100);
  const simSubtotal = questionData.basePrice - simD1Amount;
  const simD2Amount = simSubtotal * (simDiscount2 / 100);
  const simFinalTotal = simSubtotal - simD2Amount;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[#10B981]">receipt_long</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Bilangan
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Diskon Bertingkat (Sedang)
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
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
              {questionData.context}
            </p>
            {/* Visual Asset Banner Placeholder */}
            <div className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-md flex items-center justify-between relative overflow-hidden mb-2">
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-yellow-400 transform skew-x-12 translate-x-8 opacity-90"></div>
              <div className="relative z-10">
                <div className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">PROMO BACK TO SCHOOL</div>
                <div className="font-black text-xl mb-1">Laptop Pelajar</div>
                <div className="text-sm line-through text-blue-200">Rp8.000.000</div>
              </div>
              <div className="relative z-10 text-right text-yellow-900 pr-2">
                <div className="text-[10px] font-bold uppercase mb-0.5">Diskon Ganda</div>
                <div className="font-black text-2xl leading-none">20%<span className="text-sm">+10%</span></div>
              </div>
            </div>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 leading-relaxed">
            {questionData.question}
          </h3>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-[#0F172A] dark:hover:border-slate-500 text-slate-700 dark:text-slate-300";
              
              if (hasSubmitted) {
                const isCorrectOpt = idx === questionData.correctOptionIdx;
                if (isSelected && isCorrectOpt) btnClass = "border-[#10B981] bg-[#10B981]/10 text-[#10B981]";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
                else if (isCorrectOpt) btnClass = "border-[#10B981] bg-[#10B981]/10 text-[#10B981]";
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
                  {hasSubmitted && idx === questionData.correctOptionIdx && <span className="material-symbols-outlined text-[#10B981]">check_circle</span>}
                  {hasSubmitted && isSelected && idx !== questionData.correctOptionIdx && <span className="material-symbols-outlined text-rose-500">cancel</span>}
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
              
              {/* Misconception Alerts */}
              {!isCorrect && isMisconceptionA && (
                <div className="p-4 rounded-xl mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                  <span className="material-symbols-outlined text-rose-500 mt-0.5">warning</span>
                  <div>
                    <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm mb-1">⚠️ Miskonsepsi Diskon Ganda!</h4>
                    <p className="text-sm text-rose-600 dark:text-rose-300">
                      Diskon 20% + 10% <strong>TIDAK SAMA</strong> dengan Diskon 30%. Diskon 10% kedua dihitung dari subtotal Rp6.400.000, bukan dari harga awal Rp8.000.000.
                    </p>
                  </div>
                </div>
              )}

              {!isCorrect && isMisconceptionD && (
                <div className="p-4 rounded-xl mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">lightbulb</span>
                  <div>
                    <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm mb-1">Hampir benar!</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-300">
                      Rp6.400.000 baru hasil potongan diskon pertama (20%). Jangan lupa masih ada tambahan diskon 10% dari harga tersebut!
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback Header (Correct / General Correction) */}
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isCorrect ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isCorrect ? 'bg-[#10B981]' : 'bg-slate-500'}`}>
                  <span className="material-symbols-outlined">{isCorrect ? 'celebration' : 'calculate'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-[#10B981]' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isCorrect ? 'Sempurna! Kamu memahami alur kalkulasi promo marketplace dengan sangat teliti! 🎉' : 'Mari kita lihat bagaimana mesin kasir menghitungnya!'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {!isCorrect && 'Diskon ganda artinya kita memotong harga secara berurutan. Potongan kedua selalu dihitung dari harga setelah potongan pertama.'}
                  </p>
                </div>
              </div>

              {/* Visualisasi Model Matematika (Struk Kasir Digital) */}
              <div className="flex flex-col lg:flex-row gap-6 mb-6">
                
                {/* E-Receipt Visualizer */}
                <div className="flex-1 bg-white dark:bg-[#0F172A] rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  
                  <div className="flex items-center gap-2 mb-6 border-b border-dashed border-slate-300 dark:border-slate-600 pb-4">
                    <span className="material-symbols-outlined text-slate-400">storefront</span>
                    <h4 className="font-bold text-slate-600 dark:text-slate-300 text-sm tracking-widest uppercase">E-Receipt Promo</h4>
                  </div>
                  
                  <div className="space-y-4 font-mono text-sm">
                    {/* Harga Awal */}
                    <div className="flex justify-between items-end text-slate-600 dark:text-slate-400">
                      <div>
                        <div>1x Laptop Pelajar</div>
                        <div className="text-[10px] text-slate-400">Harga Awal</div>
                      </div>
                      <div>{formatCurrency(questionData.basePrice)}</div>
                    </div>
                    
                    {/* Diskon 1 */}
                    <div className="flex justify-between items-end text-rose-500">
                      <div>
                        <div>Diskon I (20%)</div>
                        <div className="text-[10px] opacity-70">-20% × {formatCurrency(questionData.basePrice)}</div>
                      </div>
                      <div>-{formatCurrency(d1Amount)}</div>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="flex justify-between items-end border-t border-dashed border-slate-300 dark:border-slate-600 pt-2 text-slate-800 dark:text-white font-bold">
                      <div>Subtotal</div>
                      <div>{formatCurrency(subtotal)}</div>
                    </div>

                    {/* Diskon 2 */}
                    <div className="flex justify-between items-end text-rose-500">
                      <div>
                        <div>Diskon II (10%)</div>
                        <div className="text-[10px] opacity-70">-10% × {formatCurrency(subtotal)}</div>
                      </div>
                      <div>-{formatCurrency(d2Amount)}</div>
                    </div>
                    
                    {/* Total Akhir */}
                    <div className="flex justify-between items-end border-t-2 border-slate-800 dark:border-white pt-3 text-xl font-bold text-[#10B981]">
                      <div>TOTAL BAYAR</div>
                      <div>{formatCurrency(finalTotal)}</div>
                    </div>
                  </div>
                </div>

                {/* Shortcut Card */}
                <div className="flex-1">
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-5 shadow-sm h-full flex flex-col justify-center">
                    <h4 className="font-bold text-amber-700 dark:text-amber-500 text-sm mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">bolt</span>
                      Cara Cepat Kasir Digital (Faktor Pengali)
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                      Daripada menghitung potongan satu per satu, kasir menggunakan <strong>sisa persentase (Faktor Pengali)</strong>:
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 mb-4 font-medium">
                      <li>• Jika diskon 20%, maka kita membayar <strong>80% (0,8)</strong>.</li>
                      <li>• Jika diskon 10%, maka kita membayar <strong>90% (0,9)</strong>.</li>
                    </ul>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200 dark:border-amber-700 font-mono text-sm text-center font-bold text-slate-800 dark:text-white">
                      8.000.000 × 0,8 × 0,9 = <span className="text-[#10B981]">5.760.000</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RME Extension (Simulator Diskon) */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-[#1E293B]">
                <button 
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">tune</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      Interactive Discount Simulator
                    </span>
                  </div>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isAccordionOpen && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      Coba ubah persentase Diskon 1 dan Diskon 2 di bawah ini untuk melihat bagaimana harga akhir dan struktur struk berubah secara real-time!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Interactive Sliders */}
                      <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diskon 1</span>
                            <span className="text-sm font-bold text-rose-500">{simDiscount1}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="50" step="5" value={simDiscount1} 
                            onChange={(e) => setSimDiscount1(Number(e.target.value))}
                            className="w-full accent-rose-500 h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diskon 2</span>
                            <span className="text-sm font-bold text-rose-500">{simDiscount2}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="30" step="5" value={simDiscount2} 
                            onChange={(e) => setSimDiscount2(Number(e.target.value))}
                            className="w-full accent-rose-500 h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                      </div>

                      {/* Mini Live Receipt */}
                      <div className="border border-slate-300 dark:border-slate-600 rounded-xl p-4 bg-white dark:bg-[#0F172A] font-mono text-[11px] shadow-sm flex flex-col justify-center space-y-2">
                        <div className="flex justify-between text-slate-500">
                          <span>Harga Awal</span>
                          <span>{formatCurrency(questionData.basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-rose-500">
                          <span>Diskon {simDiscount1}%</span>
                          <span>-{formatCurrency(simD1Amount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-300 border-t border-dashed border-slate-300 dark:border-slate-600 pt-1">
                          <span>Subtotal</span>
                          <span>{formatCurrency(simSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-rose-500">
                          <span>Diskon {simDiscount2}%</span>
                          <span>-{formatCurrency(simD2Amount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-[#10B981] border-t-2 border-slate-300 dark:border-slate-600 pt-2 mt-1">
                          <span>TOTAL BAYAR</span>
                          <span>{formatCurrency(simFinalTotal)}</span>
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
