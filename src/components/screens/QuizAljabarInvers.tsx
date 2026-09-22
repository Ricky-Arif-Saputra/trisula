import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarInvers: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // RME Simulator: user enters a final price, system finds original
  const [simFinalPrice, setSimFinalPrice] = useState<number>(90);
  // f(x) = 2x + 10, so f⁻¹(y) = (y - 10) / 2
  const simOriginalPrice = (simFinalPrice - 10) / 2;

  const questionData = {
    context: "Sebuah toko menerapkan sistem penetapan harga dengan aturan berikut: harga awal suatu barang dimodelkan oleh fungsi x (dalam ribuan rupiah). Setelah dikenakan pajak dan biaya layanan, harga jual akhir dinyatakan oleh fungsi f(x) = 2x + 10. Seorang pelanggan ingin mengetahui harga awal barang jika harga setelah pajak yang ia bayar adalah Rp90.000,00.",
    question: "Manakah pernyataan yang benar terkait fungsi invers yang digunakan untuk menghitung harga awal serta nominal harga sebelum pajak?",
    options: [
      "A. Invers fungsi f(x) adalah f⁻¹(x) = (x - 10) / 2",
      "B. Invers fungsi f(x) adalah f⁻¹(x) = (x + 10) / 2",
      "C. Harga awal barang tersebut adalah Rp40.000",
      "D. Harga awal barang tersebut adalah Rp50.000",
      "E. Harga awal barang tersebut adalah Rp45.000"
    ],
    correctOptionIdxs: [0, 2],
  };

  const handleToggle = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOptions(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const isAllCorrect =
    selectedOptions.length === questionData.correctOptionIdxs.length &&
    questionData.correctOptionIdxs.every(idx => selectedOptions.includes(idx));

  const handleSubmit = () => { if (selectedOptions.length > 0) setHasSubmitted(true); };

  const formatK = (n: number) => `Rp${n.toLocaleString('id-ID')}.000`;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-rose-400">autorenew</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Topik: Aljabar - Fungsi Invers</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-serif leading-tight">Fungsi Invers Multi-Select (Sulit)</h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">Soal 1/3</span>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-6">{questionData.context}</p>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{questionData.question}</h3>
          <p className="text-xs text-slate-500 italic mb-4">*Pilih semua opsi yang bernilai benar (Multi-Select).</p>

          <div className="flex flex-col gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const isCorrectOpt = questionData.correctOptionIdxs.includes(idx);
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-rose-400 text-slate-700 dark:text-slate-300";
              if (hasSubmitted) {
                if (isSelected && isCorrectOpt) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
                else if (!isSelected && isCorrectOpt) btnClass = "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400";
                else btnClass = "border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
              } else if (isSelected) {
                btnClass = "border-rose-400 bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-300 font-bold ring-2 ring-rose-400/30";
              }
              return (
                <button key={idx} disabled={hasSubmitted} onClick={() => handleToggle(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${btnClass}`}>
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${
                    isSelected ? (hasSubmitted ? (isCorrectOpt ? 'bg-emerald-500 border-emerald-500' : 'bg-rose-500 border-rose-500') : 'bg-rose-500 border-rose-500 text-white') : 'border-slate-300 dark:border-slate-600'}`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{opt}</span>
                    {hasSubmitted && !isSelected && isCorrectOpt && <p className="text-xs text-amber-600 mt-1 font-bold">*Seharusnya dipilih</p>}
                  </div>
                </button>
              );
            })}
          </div>

          {!hasSubmitted && (
            <button disabled={selectedOptions.length === 0} onClick={handleSubmit}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedOptions.length > 0 ? 'bg-[#0F172A] text-white hover:bg-rose-700 shadow-md cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
              Submit Jawaban
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 space-y-6 animate-in fade-in slide-in-from-bottom-4">

              <div className={`p-4 rounded-xl flex items-start gap-4 border ${isAllCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isAllCorrect ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'fact_check'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isAllCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Tepat! Kamu menguasai fungsi invers.' : 'Mari kita balik alur fungsi secara langsung!'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Fungsi invers = membalikkan setiap operasi dari akhir ke awal.</p>
                </div>
              </div>

              {/* Alur Maju / Mundur Visual */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-400">swap_horiz</span>
                  Visualisasi Alur Fungsi (Maju & Mundur)
                </h4>
                <div className="flex flex-col gap-5">
                  {/* Alur Maju */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">➡ Alur Maju f(x) = 2x + 10</p>
                    <div className="flex items-center justify-between gap-1 text-xs font-bold text-center flex-wrap">
                      <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg">x</div>
                      <span className="text-slate-500">×2</span>
                      <div className="bg-slate-700 text-slate-300 px-3 py-2 rounded-lg">2x</div>
                      <span className="text-slate-500">+10</span>
                      <div className="bg-purple-600 text-white px-3 py-2 rounded-lg">2x+10</div>
                      <span className="text-slate-500">=</span>
                      <div className="bg-rose-600 text-white px-3 py-2 rounded-lg">f(x)</div>
                    </div>
                  </div>
                  {/* Alur Mundur */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">⬅ Alur Mundur f⁻¹(x) = (x-10)/2</p>
                    <div className="flex items-center justify-between gap-1 text-xs font-bold text-center flex-wrap flex-row-reverse">
                      <div className="bg-rose-600 text-white px-3 py-2 rounded-lg">y</div>
                      <span className="text-rose-500">-10</span>
                      <div className="bg-slate-700 text-slate-300 px-3 py-2 rounded-lg">y-10</div>
                      <span className="text-rose-500">÷2</span>
                      <div className="bg-emerald-600 text-white px-3 py-2 rounded-lg">(y-10)/2</div>
                      <span className="text-slate-500">=</span>
                      <div className="bg-emerald-700 text-white px-3 py-2 rounded-lg">x</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* === RME: Interactive Inverse Price Finder === */}
              <div className="border border-rose-200 dark:border-rose-800/50 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">price_check</span>
                    Mesin Pencari Harga Awal — Coba Harga Akhir Berapa Pun!
                  </h4>
                  <p className="text-rose-100 text-xs mt-1">Masukkan harga akhir (setelah pajak) menggunakan slider, dan mesin akan menghitung harga awal menggunakan fungsi invers secara otomatis.</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Akhir Setelah Pajak</label>
                      <span className="text-lg font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-lg">{formatK(simFinalPrice)}</span>
                    </div>
                    <input type="range" min="12" max="120" step="2" value={simFinalPrice}
                      onChange={(e) => setSimFinalPrice(Number(e.target.value))}
                      className="w-full accent-rose-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>Rp12.000</span><span>Rp120.000</span></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-200 dark:border-rose-800/50 text-center">
                      <div className="text-xs text-rose-500 font-bold mb-1 uppercase">Harga Akhir (y)</div>
                      <div className="text-2xl font-black text-rose-700 dark:text-rose-400">{formatK(simFinalPrice)}</div>
                    </div>
                    <div className="flex items-center justify-center text-slate-500 flex-col">
                      <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-center">
                        <InlineMath math={`f^{-1}(y) = \\frac{y - 10}{2}`} />
                      </div>
                      <span className="text-3xl mt-2">⬇</span>
                    </div>
                    <div className={`p-4 rounded-xl border text-center ${simOriginalPrice > 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-300'}`}>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1 uppercase">Harga Awal (x)</div>
                      <div className={`text-2xl font-black ${simOriginalPrice > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {simOriginalPrice > 0 ? formatK(simOriginalPrice) : 'Tidak Valid'}
                      </div>
                      {simOriginalPrice > 0 && <div className="text-[10px] text-slate-500 mt-1 font-mono">({simFinalPrice} - 10) ÷ 2 = {simOriginalPrice}</div>}
                    </div>
                  </div>

                  {simFinalPrice === 90 && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-400 text-center">
                      ✨ Ini adalah nilai soal aslinya! f⁻¹(90) = (90-10)/2 = 40 → Harga Awal = Rp40.000
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
