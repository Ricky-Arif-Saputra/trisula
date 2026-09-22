import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarMudah: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // RME Interactive Simulator
  const [simX, setSimX] = useState<number>(4);

  const questionData = {
    context: "Sebuah perusahaan distribusi barang memiliki dua fungsi dalam proses pengiriman produk. Fungsi pertama f(x) = 2x + 3 menyatakan jumlah barang setelah melalui proses pengemasan dari gudang, dengan x adalah jumlah barang awal. Fungsi kedua g(x) = x - 5 menyatakan jumlah barang yang tersisa setelah proses penyortiran.",
    question: "Jika seluruh proses dilakukan secara berurutan mulai dari pengemasan kemudian penyortiran, maka hasil komposisi fungsinya adalah ...",
    options: ["A. 2x - 2", "B. 2x + 8", "C. 2x - 8", "D. x - 2", "E. 2x + 3"],
    correctOptionIdx: 0,
  };

  const isCorrect = selectedOption === questionData.correctOptionIdx;
  const isMisconceptionC = selectedOption === 2;

  // Live simulator computations
  const fOfX = 2 * simX + 3;        // After Mesin 1 (Packaging)
  const gOfFX = fOfX - 5;           // After Mesin 2 (Sorting) = 2x - 2

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-blue-400">factory</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Topik: Aljabar - Fungsi</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-serif leading-tight">Komposisi Fungsi (Mudah)</h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">Soal 1</span>
        </div>

        <div className="p-6">
          <div className="callout-example mb-6">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">{questionData.context}</p>
            <div className="flex flex-wrap gap-3 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="material-symbols-outlined text-indigo-500">inventory_2</span>
                Pengemasan: <InlineMath math="f(x) = 2x + 3" />
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                <span className="material-symbols-outlined text-purple-500">filter_alt</span>
                Penyortiran: <InlineMath math="g(x) = x - 5" />
              </div>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">{questionData.question}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300";
              if (hasSubmitted) {
                const isCorrectOpt = idx === questionData.correctOptionIdx;
                if (isSelected && isCorrectOpt) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
                else if (isCorrectOpt) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600";
                else btnClass = "border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
              } else if (isSelected) {
                btnClass = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 font-bold ring-2 ring-indigo-500/30";
              }
              return (
                <button key={idx} disabled={hasSubmitted} onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${btnClass}`}>
                  <span className="font-mono text-sm font-semibold">{opt}</span>
                  {hasSubmitted && idx === questionData.correctOptionIdx && <span className="material-symbols-outlined text-emerald-500">check_circle</span>}
                  {hasSubmitted && isSelected && idx !== questionData.correctOptionIdx && <span className="material-symbols-outlined text-rose-500">cancel</span>}
                </button>
              );
            })}
          </div>

          {!hasSubmitted && (
            <button disabled={selectedOption === null} onClick={() => setHasSubmitted(true)}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedOption !== null ? 'bg-[#0F172A] text-white hover:bg-indigo-700 shadow-md cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
              Submit Jawaban
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 space-y-6 animate-in fade-in slide-in-from-bottom-4">

              {!isCorrect && isMisconceptionC && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">warning</span>
                  <div>
                    <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm mb-1">Awas Kesalahan Tanda!</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300"><InlineMath math="+3 - 5 = -2" />, bukan <InlineMath math="-8" />. Jangan terbawa ikut mengurangkan koefisiennya!</p>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-xl flex items-start gap-4 border ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                  <span className="material-symbols-outlined">{isCorrect ? 'celebration' : 'precision_manufacturing'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isCorrect ? 'Jawaban Benar! Mesin pabrik bekerja sempurna.' : 'Mari kita jalankan mesin pabrik secara langsung!'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Output Mesin 1 langsung menjadi input Mesin 2 secara berurutan.</p>
                </div>
              </div>

              {/* === RME: Interactive Conveyor Belt Simulator === */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-inner">
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">tune</span>
                  Simulator Ban Berjalan Interaktif
                </h4>
                <p className="text-slate-400 text-xs mb-5">Ubah jumlah barang awal (x) dan lihat bagaimana angkanya berubah di setiap mesin secara real-time.</p>

                {/* Slider */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Barang Awal (x)</label>
                    <span className="text-2xl font-black text-white bg-slate-700 px-3 py-1 rounded-lg">{simX}</span>
                  </div>
                  <input type="range" min="0" max="20" step="1" value={simX}
                    onChange={(e) => setSimX(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>0</span><span>20</span></div>
                </div>

                {/* Live Conveyor Visualization */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                  {/* Input */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Input</span>
                    <div className="bg-blue-600 text-white rounded-xl px-5 py-3 shadow-lg shadow-blue-900/50 min-w-[80px]">
                      <div className="text-xs text-blue-200 mb-0.5">x =</div>
                      <div className="text-2xl font-black">{simX}</div>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-slate-500 rotate-90 sm:rotate-0 text-2xl">arrow_forward</span>

                  {/* Mesin 1 */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold">Mesin 1 (Pengemasan)</span>
                    <div className="bg-indigo-900 border border-indigo-500 text-white rounded-xl px-4 py-3 shadow-lg shadow-indigo-900/50 min-w-[130px]">
                      <div className="text-[10px] text-indigo-300 mb-1 font-mono">f(x) = 2x + 3</div>
                      <div className="text-[10px] text-indigo-400 font-mono">= 2({simX}) + 3</div>
                      <div className="text-xl font-black text-indigo-200 mt-1">= {fOfX}</div>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-slate-500 rotate-90 sm:rotate-0 text-2xl">arrow_forward</span>

                  {/* Mesin 2 */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Mesin 2 (Penyortiran)</span>
                    <div className="bg-purple-900 border border-purple-500 text-white rounded-xl px-4 py-3 shadow-lg shadow-purple-900/50 min-w-[130px]">
                      <div className="text-[10px] text-purple-300 mb-1 font-mono">g(f(x)) = f(x) - 5</div>
                      <div className="text-[10px] text-purple-400 font-mono">= {fOfX} - 5</div>
                      <div className="text-xl font-black text-purple-200 mt-1">= {gOfFX}</div>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-slate-500 rotate-90 sm:rotate-0 text-2xl">arrow_forward</span>

                  {/* Output */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Output Akhir</span>
                    <div className="bg-emerald-700 text-white rounded-xl px-5 py-3 shadow-lg shadow-emerald-900/50 min-w-[80px] ring-2 ring-emerald-400">
                      <div className="text-xs text-emerald-200 mb-0.5">(g∘f)(x) =</div>
                      <div className="text-2xl font-black">{gOfFX}</div>
                    </div>
                  </div>
                </div>

                {/* Formula Verification */}
                <div className="mt-5 p-4 bg-slate-800 rounded-xl border border-slate-700 text-center">
                  <p className="text-xs text-slate-400 mb-2">Verifikasi Rumus: <InlineMath math="(g \circ f)(x) = 2x - 2" /></p>
                  <p className="font-mono text-sm text-emerald-400 font-bold">
                    2({simX}) - 2 = {2 * simX - 2} ✓ (Cocok dengan output mesin: {gOfFX})
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
