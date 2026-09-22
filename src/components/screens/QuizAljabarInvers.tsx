import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarInvers: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const questionData = {
    context: "Sebuah toko menerapkan sistem penetapan harga dengan aturan berikut: harga awal suatu barang dimodelkan oleh fungsi x (dalam ribuan rupiah). Setelah dikenakan pajak dan biaya layanan, harga jual akhir dinyatakan oleh fungsi f(x) = 2x + 10 dengan f(x) juga dalam ribuan rupiah. Seorang pelanggan ingin mengetahui harga awal barang jika harga setelah pajak yang ia bayar adalah Rp90.000,00.",
    question: "Berdasarkan situasi tersebut, manakah pernyataan yang benar terkait fungsi invers yang digunakan untuk menghitung harga awal serta nominal harga sebelum pajak?",
    options: [
      "A. Invers fungsi f(x) adalah f⁻¹(x) = (x - 10) / 2",
      "B. Invers fungsi f(x) adalah f⁻¹(x) = (x + 10) / 2",
      "C. Harga awal barang tersebut adalah Rp40.000",
      "D. Harga awal barang tersebut adalah Rp50.000",
      "E. Harga awal barang tersebut adalah Rp45.000"
    ],
    correctOptionIdxs: [0, 2], // A, C
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-rose-400">autorenew</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Aljabar - Fungsi Invers
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Fungsi Invers Multi-Select (Sulit)
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
            Soal 1 / 3
          </span>
        </div>

        <div className="p-6">
          <div className="callout-example mb-6">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
              {questionData.context}
            </p>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 leading-relaxed">
            {questionData.question}
            <span className="block text-xs font-normal text-slate-500 mt-1 italic">
              *Pilih semua opsi yang bernilai benar (Multi-Select).
            </span>
          </h3>

          <div className="flex flex-col gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const isCorrectOpt = questionData.correctOptionIdxs.includes(idx);
              
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-[#0F172A] dark:hover:border-slate-500 text-slate-700 dark:text-slate-300";
              
              if (hasSubmitted) {
                if (isSelected && isCorrectOpt) btnClass = "border-[#059669] bg-[#059669]/10 text-[#059669]";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
                else if (!isSelected && isCorrectOpt) btnClass = "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-500";
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

          {/* RME FEEDBACK SECTION */}
          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
              
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isAllCorrect ? 'bg-[#059669]/10 border-[#059669]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isAllCorrect ? 'bg-[#059669]' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'fact_check'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isAllCorrect ? 'text-[#059669]' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Tepat Sekali! Kamu menguasai konsep fungsi invers.' : 'Mari kita bedah cara kerja fungsi invers.'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Fungsi invers bekerja dengan membalikkan operasi matematika dari akhir kembali ke awal.
                  </p>
                </div>
              </div>

              {/* RME: Simulation Card (Proses Invers Berbalik) */}
              <div className="mb-6 bg-slate-900 rounded-xl border border-slate-700 shadow-inner overflow-hidden p-6 relative">
                <h4 className="font-bold text-white text-sm mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-400">swap_horiz</span>
                  Visualisasi Alur Maju & Mundur (Invers)
                </h4>

                <div className="flex flex-col gap-8">
                  {/* Alur Maju */}
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2 z-0"></div>
                    <div className="flex justify-between items-center relative z-10 text-xs font-bold text-center">
                      <div className="bg-indigo-500 text-white p-3 rounded-lg w-24 border border-indigo-400 shadow-lg">Harga Awal<br/>(x)</div>
                      <div className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-600">Dikali 2</div>
                      <div className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-600">Ditambah 10</div>
                      <div className="bg-purple-500 text-white p-3 rounded-lg w-24 border border-purple-400 shadow-lg">Harga Akhir<br/>(y)</div>
                    </div>
                  </div>

                  {/* Alur Mundur */}
                  <div className="relative mt-4">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2 z-0"></div>
                    <div className="flex justify-between items-center relative z-10 text-xs font-bold text-center flex-row-reverse">
                      <div className="bg-purple-500 text-white p-3 rounded-lg w-24 border border-purple-400 shadow-lg opacity-80">Harga Akhir<br/>(y = 90)</div>
                      <div className="bg-rose-900/50 text-rose-300 px-3 py-1 rounded-full border border-rose-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        Dikurangi 10
                      </div>
                      <div className="bg-rose-900/50 text-rose-300 px-3 py-1 rounded-full border border-rose-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        Dibagi 2
                      </div>
                      <div className="bg-emerald-500 text-white p-3 rounded-lg w-24 border border-emerald-400 shadow-lg">Harga Awal<br/>(x = 40)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Option Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">A</div>
                    <h5 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Pembuktian Persamaan (Benar)</h5>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 font-mono space-y-2 bg-white dark:bg-slate-900 p-3 rounded border border-emerald-100 dark:border-emerald-800/50">
                    <p><InlineMath math="y = 2x + 10" /></p>
                    <p><InlineMath math="2x = y - 10" /></p>
                    <p><InlineMath math="x = \frac{y - 10}{2}" /></p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-2"><InlineMath math="f^{-1}(x) = \frac{x - 10}{2}" /></p>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">C</div>
                    <h5 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Pembuktian Nominal (Benar)</h5>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                    <p>Masukkan <InlineMath math="y = 90" /> (dalam ribuan) ke dalam fungsi invers:</p>
                    <div className="font-mono bg-white dark:bg-slate-900 p-3 rounded border border-emerald-100 dark:border-emerald-800/50 mt-2 space-y-1">
                      <p><InlineMath math="x = \frac{90 - 10}{2}" /></p>
                      <p><InlineMath math="x = \frac{80}{2} = 40" /></p>
                    </div>
                    <p className="font-bold text-emerald-700 dark:text-emerald-500 mt-2">Maka harga awal adalah Rp40.000,00.</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
