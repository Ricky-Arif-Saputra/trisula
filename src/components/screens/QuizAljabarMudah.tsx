import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarMudah: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // RME Interactive: Conveyor Simulator
  const [simX, setSimX] = useState<number>(4);
  // RME Interactive: "Coba Sendiri" — user inputs their own f and g
  const [customA, setCustomA] = useState<number>(2);
  const [customB, setCustomB] = useState<number>(3);
  const [customC, setCustomC] = useState<number>(5);
  // RME Interactive: Step verification — user tries to compute manually
  const [userStep1, setUserStep1] = useState<string>('');
  const [userStep2, setUserStep2] = useState<string>('');
  const [showStepCheck, setShowStepCheck] = useState<boolean>(false);

  const questionData = {
    context: "Sebuah perusahaan distribusi barang memiliki dua fungsi dalam proses pengiriman produk. Fungsi pertama f(x) = 2x + 3 menyatakan jumlah barang setelah melalui proses pengemasan dari gudang, dengan x adalah jumlah barang awal. Fungsi kedua g(x) = x - 5 menyatakan jumlah barang yang tersisa setelah proses penyortiran.",
    question: "Jika seluruh proses dilakukan secara berurutan mulai dari pengemasan kemudian penyortiran, maka hasil komposisi fungsinya adalah ...",
    options: ["A. 2x - 2", "B. 2x + 8", "C. 2x - 8", "D. x - 2", "E. 2x + 3"],
    correctOptionIdx: 0,
  };

  const isCorrect = selectedOption === questionData.correctOptionIdx;
  const isMisconceptionC = selectedOption === 2;

  // Fixed problem computations
  const fOfX = 2 * simX + 3;
  const gOfFX = fOfX - 5;

  // Custom function computations
  const customFOfX = customA * simX + customB;
  const customGOfFX = customFOfX - customC;
  const customCompositionResult = `${customA}x + ${customB - customC}`;

  // Step verification
  const correctStep1 = String(fOfX);
  const correctStep2 = String(gOfFX);
  const step1Correct = userStep1.trim() === correctStep1;
  const step2Correct = userStep2.trim() === correctStep2;

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
                <InlineMath math="f(x) = 2x + 3" />
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                <span className="material-symbols-outlined text-purple-500">filter_alt</span>
                <InlineMath math="g(x) = x - 5" />
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
                btnClass = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30";
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
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">warning</span>
                  <div>
                    <h4 className="font-bold text-amber-700 text-sm mb-1">Awas Kesalahan Tanda!</h4>
                    <p className="text-sm text-amber-700"><InlineMath math="+3 - 5 = -2" />, bukan <InlineMath math="-8" />.</p>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-xl flex items-start gap-4 border ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-300'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                  <span className="material-symbols-outlined">{isCorrect ? 'celebration' : 'precision_manufacturing'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isCorrect ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {isCorrect ? 'Jawaban Benar!' : 'Mari kita jalankan mesin pabrik secara langsung!'}
                  </h3>
                </div>
              </div>

              {/* ======================================== */}
              {/* RME 1: STEP VERIFICATION — COBA HITUNG SENDIRI */}
              {/* ======================================== */}
              <div className="border border-blue-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">edit_note</span>
                    Coba Hitung Sendiri — Apakah kamu bisa menghitung manual?
                  </h4>
                  <p className="text-blue-100 text-xs mt-1">Masukkan x = {simX}, lalu hitung hasil tiap mesin. Ketik jawabanmu di kotak!</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200">
                      <label className="text-xs font-bold text-indigo-600 uppercase mb-2 block">
                        Mesin 1: f({simX}) = 2({simX}) + 3 = ?
                      </label>
                      <input 
                        type="number" 
                        value={userStep1} 
                        onChange={(e) => { setUserStep1(e.target.value); setShowStepCheck(false); }}
                        className="w-full p-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 font-mono text-lg font-bold text-center outline-none bg-white dark:bg-slate-800 dark:text-white"
                        placeholder="?"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200">
                      <label className="text-xs font-bold text-purple-600 uppercase mb-2 block">
                        Mesin 2: g({userStep1 || '?'}) = ({userStep1 || '?'}) - 5 = ?
                      </label>
                      <input 
                        type="number" 
                        value={userStep2} 
                        onChange={(e) => { setUserStep2(e.target.value); setShowStepCheck(false); }}
                        className="w-full p-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 font-mono text-lg font-bold text-center outline-none bg-white dark:bg-slate-800 dark:text-white"
                        placeholder="?"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowStepCheck(true)}
                    disabled={!userStep1 || !userStep2}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${userStep1 && userStep2 ? 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                    Periksa Jawabanku
                  </button>
                  {showStepCheck && (
                    <div className="mt-4 space-y-2 animate-in fade-in">
                      <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${step1Correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        <span className="material-symbols-outlined text-[16px]">{step1Correct ? 'check_circle' : 'cancel'}</span>
                        Mesin 1: f({simX}) = {correctStep1} {step1Correct ? '✓ Benar!' : `(Jawabanmu: ${userStep1})`}
                      </div>
                      <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${step2Correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        <span className="material-symbols-outlined text-[16px]">{step2Correct ? 'check_circle' : 'cancel'}</span>
                        Mesin 2: g(f({simX})) = {correctStep2} {step2Correct ? '✓ Benar!' : `(Jawabanmu: ${userStep2})`}
                      </div>
                      {step1Correct && step2Correct && (
                        <div className="p-3 rounded-lg bg-emerald-500 text-white text-center font-bold text-sm">
                          🎉 Sempurna! Kamu bisa menghitung komposisi fungsi secara manual!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ======================================== */}
              {/* RME 2: CONVEYOR BELT SIMULATOR (SLIDER) */}
              {/* ======================================== */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-inner">
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">tune</span>
                  Simulator Ban Berjalan — Ubah Nilai x
                </h4>
                <p className="text-slate-400 text-xs mb-5">Geser slider untuk mengubah jumlah barang awal dan lihat alur mesin secara real-time.</p>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Barang Awal (x)</label>
                    <span className="text-2xl font-black text-white bg-slate-700 px-3 py-1 rounded-lg">{simX}</span>
                  </div>
                  <input type="range" min="0" max="20" step="1" value={simX}
                    onChange={(e) => { setSimX(Number(e.target.value)); setShowStepCheck(false); setUserStep1(''); setUserStep2(''); }}
                    className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>0</span><span>20</span></div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-500 uppercase">Input</span>
                    <div className="bg-blue-600 text-white rounded-xl px-5 py-3 shadow-lg min-w-[70px]">
                      <div className="text-xs text-blue-200">x</div>
                      <div className="text-2xl font-black">{simX}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 rotate-90 sm:rotate-0 text-xl">arrow_forward</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-indigo-400 uppercase font-bold">Mesin 1</span>
                    <div className="bg-indigo-900 border border-indigo-500 text-white rounded-xl px-4 py-3 shadow-lg min-w-[120px]">
                      <div className="text-[10px] text-indigo-300 font-mono">2({simX}) + 3</div>
                      <div className="text-xl font-black text-indigo-200">= {fOfX}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 rotate-90 sm:rotate-0 text-xl">arrow_forward</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-purple-400 uppercase font-bold">Mesin 2</span>
                    <div className="bg-purple-900 border border-purple-500 text-white rounded-xl px-4 py-3 shadow-lg min-w-[120px]">
                      <div className="text-[10px] text-purple-300 font-mono">{fOfX} - 5</div>
                      <div className="text-xl font-black text-purple-200">= {gOfFX}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 rotate-90 sm:rotate-0 text-xl">arrow_forward</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">Output</span>
                    <div className="bg-emerald-700 text-white rounded-xl px-5 py-3 shadow-lg min-w-[70px] ring-2 ring-emerald-400">
                      <div className="text-xs text-emerald-200">(g∘f)({simX})</div>
                      <div className="text-2xl font-black">{gOfFX}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                  <p className="text-xs text-slate-400 mb-1">Verifikasi: <InlineMath math="2x - 2" /></p>
                  <p className="font-mono text-sm text-emerald-400 font-bold">2({simX}) - 2 = {2 * simX - 2} {2 * simX - 2 === gOfFX ? '✓' : '✗'}</p>
                </div>
              </div>

              {/* ======================================== */}
              {/* RME 3: CUSTOM FUNCTION LAB */}
              {/* ======================================== */}
              <div className="border border-violet-200 dark:border-violet-800 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">science</span>
                    Lab Fungsi Kustom — Buat Fungsimu Sendiri!
                  </h4>
                  <p className="text-violet-100 text-xs mt-1">Ubah koefisien a, b, c untuk membuat f(x) = ax + b dan g(x) = x - c, lalu lihat hasil komposisinya!</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">a (Pengali)</label>
                      <input type="range" min="1" max="5" step="1" value={customA} onChange={(e) => setCustomA(Number(e.target.value))}
                        className="w-full accent-violet-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                      <div className="text-center text-lg font-black text-violet-600 dark:text-violet-400">{customA}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">b (Tambahan f)</label>
                      <input type="range" min="0" max="10" step="1" value={customB} onChange={(e) => setCustomB(Number(e.target.value))}
                        className="w-full accent-violet-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                      <div className="text-center text-lg font-black text-violet-600 dark:text-violet-400">{customB}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">c (Pengurang g)</label>
                      <input type="range" min="1" max="10" step="1" value={customC} onChange={(e) => setCustomC(Number(e.target.value))}
                        className="w-full accent-violet-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                      <div className="text-center text-lg font-black text-violet-600 dark:text-violet-400">{customC}</div>
                    </div>
                  </div>

                  <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded-xl border border-violet-200 dark:border-violet-800 text-sm space-y-2 font-mono">
                    <div className="text-slate-600 dark:text-slate-400">f(x) = {customA}x + {customB}</div>
                    <div className="text-slate-600 dark:text-slate-400">g(x) = x - {customC}</div>
                    <div className="border-t border-violet-200 dark:border-violet-700 pt-2 mt-2">
                      <span className="text-slate-500">g(f(x)) = ({customA}x + {customB}) - {customC} = </span>
                      <span className="text-violet-700 dark:text-violet-400 font-bold text-lg">{customCompositionResult}</span>
                    </div>
                    <div className="text-slate-500">Dengan x = {simX}: g(f({simX})) = {customA}({simX}) + {customB - customC} = {customA * simX + (customB - customC)}</div>
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
