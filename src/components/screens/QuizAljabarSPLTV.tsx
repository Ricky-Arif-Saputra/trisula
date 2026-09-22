import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarSPLTV: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [stepVisualizer, setStepVisualizer] = useState<number>(0);

  const questionData = {
    context: "Seorang pengrajin menjual tiga jenis produk, yaitu tas, dompet, dan tempat pensil dengan harga satuan yang tetap. Pada suatu transaksi, seorang pembeli membeli 1 tas, 2 dompet, dan 1 tempat pensil dengan total harga Rp150.000. Pada transaksi lain, pembeli berbeda membeli 2 tas, 1 dompet, dan 3 tempat pensil dengan total harga Rp230.000. Kemudian transaksi ketiga menunjukkan bahwa 1 tas, 1 dompet, dan 2 tempat pensil dijual dengan total harga Rp170.000.",
    question: "Berdasarkan informasi tersebut, maka harga 5 tas adalah ...",
    options: [
      "A. Rp175.000",
      "B. Rp200.000",
      "C. Rp225.000",
      "D. Rp250.000",
      "E. Rp275.000"
    ],
    correctOptionIdx: 1, // B
  };

  const isCorrect = selectedOption === questionData.correctOptionIdx;

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setHasSubmitted(true);
      setTimeout(() => setStepVisualizer(1), 800);
      setTimeout(() => setStepVisualizer(2), 2000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">

        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-orange-400">functions</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Aljabar - SPLTV
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                SPLTV Aritmetika (Sedang)
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
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedOption !== null
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

              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isCorrect ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isCorrect ? 'bg-[#10B981]' : 'bg-slate-500'}`}>
                  <span className="material-symbols-outlined">{isCorrect ? 'celebration' : 'receipt_long'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isCorrect ? 'text-[#10B981]' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isCorrect ? 'Tepat Sekali! Analisis SPLTV kamu berhasil.' : 'Mari kita susun struk belanja ini menjadi persamaan matematika!'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Setiap transaksi belanja dapat dimodelkan menjadi sebuah persamaan linear dengan memisalkan tas <InlineMath math="(x)" />, dompet <InlineMath math="(y)" />, dan tempat pensil <InlineMath math="(z)" />.
                  </p>
                </div>
              </div>

              {/* RME: 3 Digital Receipts */}
              <div className="mb-8">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">point_of_sale</span>
                  Visualisasi Model Matematika (Struk Digital)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Receipt 1 */}
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50 shadow-sm font-mono text-sm">
                    <div className="text-center font-bold text-amber-700 dark:text-amber-500 border-b border-dashed border-amber-300 dark:border-amber-700 pb-2 mb-3">
                      STRUK #001
                    </div>
                    <div className="space-y-2 text-slate-700 dark:text-slate-300 mb-4">
                      <div className="flex justify-between"><span>1x Tas (x)</span><span>-</span></div>
                      <div className="flex justify-between"><span>2x Dompet (y)</span><span>-</span></div>
                      <div className="flex justify-between"><span>1x Pensil (z)</span><span>-</span></div>
                    </div>
                    <div className="border-t-2 border-amber-800 dark:border-amber-600 pt-2 flex justify-between font-bold text-amber-900 dark:text-amber-400">
                      <span>TOTAL</span>
                      <span>150.000</span>
                    </div>
                    <div className="mt-4 p-2 bg-white dark:bg-slate-900 rounded text-center border border-amber-200 dark:border-amber-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <InlineMath math="x + 2y + z = 150.000" />
                    </div>
                  </div>

                  {/* Receipt 2 */}
                  <div className="bg-sky-50 dark:bg-sky-900/10 rounded-xl p-4 border border-sky-200 dark:border-sky-800/50 shadow-sm font-mono text-sm">
                    <div className="text-center font-bold text-sky-700 dark:text-sky-500 border-b border-dashed border-sky-300 dark:border-sky-700 pb-2 mb-3">
                      STRUK #002
                    </div>
                    <div className="space-y-2 text-slate-700 dark:text-slate-300 mb-4">
                      <div className="flex justify-between"><span>2x Tas (x)</span><span>-</span></div>
                      <div className="flex justify-between"><span>1x Dompet (y)</span><span>-</span></div>
                      <div className="flex justify-between"><span>3x Pensil (z)</span><span>-</span></div>
                    </div>
                    <div className="border-t-2 border-sky-800 dark:border-sky-600 pt-2 flex justify-between font-bold text-sky-900 dark:text-sky-400">
                      <span>TOTAL</span>
                      <span>230.000</span>
                    </div>
                    <div className="mt-4 p-2 bg-white dark:bg-slate-900 rounded text-center border border-sky-200 dark:border-sky-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <InlineMath math="2x + y + 3z = 230.000" />
                    </div>
                  </div>

                  {/* Receipt 3 */}
                  <div className="bg-rose-50 dark:bg-rose-900/10 rounded-xl p-4 border border-rose-200 dark:border-rose-800/50 shadow-sm font-mono text-sm">
                    <div className="text-center font-bold text-rose-700 dark:text-rose-500 border-b border-dashed border-rose-300 dark:border-rose-700 pb-2 mb-3">
                      STRUK #003
                    </div>
                    <div className="space-y-2 text-slate-700 dark:text-slate-300 mb-4">
                      <div className="flex justify-between"><span>1x Tas (x)</span><span>-</span></div>
                      <div className="flex justify-between"><span>1x Dompet (y)</span><span>-</span></div>
                      <div className="flex justify-between"><span>2x Pensil (z)</span><span>-</span></div>
                    </div>
                    <div className="border-t-2 border-rose-800 dark:border-rose-600 pt-2 flex justify-between font-bold text-rose-900 dark:text-rose-400">
                      <span>TOTAL</span>
                      <span>170.000</span>
                    </div>
                    <div className="mt-4 p-2 bg-white dark:bg-slate-900 rounded text-center border border-rose-200 dark:border-rose-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <InlineMath math="x + y + 2z = 170.000" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Guided Scaffolding */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Guided Eliminasi Step-by-Step</h4>

                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border transition-all duration-500 ${stepVisualizer >= 1 ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 opacity-50 bg-slate-50'}`}>
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">Langkah 1: Selesaikan Sistem Persamaan</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Dengan menggunakan metode eliminasi/substitusi pada ketiga persamaan tersebut, kita dapat menemukan harga satuan setiap barang. Yang kita butuhkan adalah variabel <InlineMath math="x" /> (Tas).</p>
                    {stepVisualizer >= 1 && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-center font-bold text-emerald-700 dark:text-emerald-400 text-sm animate-in zoom-in-95">
                        Harga 1 Tas (x) = Rp40.000
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg border transition-all duration-500 ${stepVisualizer >= 2 ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 opacity-50 bg-slate-50'}`}>
                    <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">Langkah 2: Hitung Target Pertanyaan</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Soal menanyakan harga 5 buah tas.</p>
                    {stepVisualizer >= 2 && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-center font-bold text-emerald-700 dark:text-emerald-400 text-sm animate-in zoom-in-95">
                        <InlineMath math="5x = 5 \times 40.000 = 200.000" />
                      </div>
                    )}
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
