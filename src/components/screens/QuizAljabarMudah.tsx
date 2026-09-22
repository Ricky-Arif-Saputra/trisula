import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarMudah: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);

  const questionData = {
    context: "Sebuah perusahaan distribusi barang memiliki dua fungsi dalam proses pengiriman produk. Fungsi pertama f(x) = 2x + 3 menyatakan jumlah barang setelah melalui proses pengemasan dari gudang, dengan x adalah jumlah barang awal. Fungsi kedua g(x) = x - 5 menyatakan jumlah barang yang tersisa setelah proses penyortiran.",
    question: "Jika seluruh proses dilakukan secara berurutan mulai dari pengemasan kemudian penyortiran, maka hasil komposisi fungsinya adalah ...",
    options: [
      "A. 2x - 2",
      "B. 2x + 8",
      "C. 2x - 8",
      "D. x - 2",
      "E. 2x + 3"
    ],
    correctOptionIdx: 0, // A
  };

  const isCorrect = selectedOption === questionData.correctOptionIdx;
  const isMisconceptionC = selectedOption === 2; // Selected C (2x - 8)

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setHasSubmitted(true);
      // Sequence the conveyor animation
      setTimeout(() => setAnimationStep(1), 500); // Box enters f(x)
      setTimeout(() => setAnimationStep(2), 2000); // Box exits f(x), enters g(x)
      setTimeout(() => setAnimationStep(3), 3500); // Box exits g(x)
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-blue-400">factory</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Aljabar - Fungsi
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Komposisi Fungsi (Mudah)
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
            Soal 1 / 1
          </span>
        </div>

        <div className="p-6">
          <div className="callout-example mb-6">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
              {questionData.context}
            </p>
            <div className="flex flex-col gap-2 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="material-symbols-outlined text-indigo-500">inventory_2</span>
                Pengemasan: <InlineMath math="f(x) = 2x + 3" />
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-purple-700 dark:text-purple-300">
                <span className="material-symbols-outlined text-purple-500">filter_alt</span>
                Penyortiran: <InlineMath math="g(x) = x - 5" />
              </div>
            </div>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 leading-relaxed">
            {questionData.question}
          </h3>

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

          {/* RME FEEDBACK SECTION */}
          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
              
              {!isCorrect && isMisconceptionC && (
                <div className="p-4 rounded-xl mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">warning</span>
                  <div>
                    <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm mb-1">Awas Kesalahan Tanda Hitung!</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-300">
                      Anda mungkin mengurangkan 3 dengan 5 dan menganggapnya -8. Ingat bahwa <InlineMath math="+3 - 5 = -2" />, bukan <InlineMath math="-8" />.
                    </p>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isCorrect ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isCorrect ? 'bg-[#10B981]' : 'bg-slate-500'}`}>
                  <span className="material-symbols-outlined">{isCorrect ? 'celebration' : 'precision_manufacturing'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-[#10B981]' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isCorrect ? 'Jawaban Benar! Mesin bekerja sempurna.' : 'Mari kita lihat bagaimana mesin pabrik ini bekerja!'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Komposisi fungsi berarti keluaran (output) dari mesin pertama menjadi masukan (input) untuk mesin kedua secara berurutan.
                  </p>
                </div>
              </div>

              {/* RME Factory Conveyor Belt Simulation */}
              <div className="mb-6 p-6 bg-slate-800 dark:bg-[#0F172A] rounded-xl border border-slate-700 shadow-inner overflow-hidden relative">
                <h4 className="font-bold text-white text-sm mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">conveyor_belt</span>
                  Visualisasi Ban Berjalan (Mesin Komposisi)
                </h4>
                
                {/* Conveyor Background Line */}
                <div className="absolute top-[60%] left-0 right-0 h-2 bg-slate-600 rounded-full z-0 mx-8"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  {/* Start Point */}
                  <div className="flex flex-col items-center gap-2 w-20">
                    <div className={`text-xs font-mono font-bold px-2 py-1 bg-white text-slate-800 rounded transition-opacity duration-300 ${animationStep >= 0 ? 'opacity-100' : 'opacity-0'}`}>
                      Input: x
                    </div>
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  </div>

                  {/* Machine 1 */}
                  <div className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors duration-500 bg-slate-700 ${animationStep === 1 ? 'border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]' : 'border-slate-500'}`}>
                    <span className="text-xs text-indigo-300 font-bold mb-1 uppercase">Mesin 1 (Pengemasan)</span>
                    <span className="font-mono text-white bg-indigo-900/50 px-3 py-1 rounded">f(x) = 2x + 3</span>
                  </div>

                  {/* Intermediary Point */}
                  <div className="flex flex-col items-center gap-2 w-24">
                    <div className={`text-xs font-mono font-bold px-2 py-1 bg-indigo-100 text-indigo-800 rounded transition-opacity duration-300 ${animationStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                      2x + 3
                    </div>
                  </div>

                  {/* Machine 2 */}
                  <div className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors duration-500 bg-slate-700 ${animationStep === 2 ? 'border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.5)]' : 'border-slate-500'}`}>
                    <span className="text-xs text-purple-300 font-bold mb-1 uppercase">Mesin 2 (Penyortiran)</span>
                    <span className="font-mono text-white bg-purple-900/50 px-3 py-1 rounded">g(x) = ... - 5</span>
                  </div>

                  {/* End Point */}
                  <div className="flex flex-col items-center gap-2 w-24">
                    <div className={`text-xs font-mono font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded transition-opacity duration-300 ${animationStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                      2x - 2
                    </div>
                    <div className={`w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-opacity duration-300 ${animationStep >= 3 ? 'opacity-100' : 'opacity-0'}`}></div>
                  </div>
                </div>
              </div>

              {/* Guided Scaffolding */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in slide-in-from-top-2 fade-in" style={{ animationDelay: '3.5s', animationFillMode: 'both' }}>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3">Langkah Penyelesaian Matematis</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
                  <p>
                    Proses berurutan dari pengemasan <InlineMath math="f(x)" /> kemudian penyortiran <InlineMath math="g(x)" /> dituliskan sebagai komposisi <InlineMath math="(g \circ f)(x)" /> atau <InlineMath math="g(f(x))" />.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-center flex flex-col gap-2 overflow-x-auto">
                    <div><InlineMath math="(g \circ f)(x) = g(f(x))" /></div>
                    <div><InlineMath math="g(f(x)) = g(\textcolor{#4f46e5}{2x + 3})" /></div>
                    <div><InlineMath math="= (\textcolor{#4f46e5}{2x + 3}) - 5" /></div>
                    <div><InlineMath math="= 2x + 3 - 5" /></div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-base mt-2"><InlineMath math="= 2x - 2" /></div>
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
