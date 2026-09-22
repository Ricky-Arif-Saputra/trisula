import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarInvers: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // RME 1: Interactive Inverse Calculator
  const [simFinalPrice, setSimFinalPrice] = useState<number>(90);

  // RME 2: "Bangun Invers Sendiri" — user manually reverses each step
  const [userInvStep1, setUserInvStep1] = useState<string>(''); // After subtracting 10
  const [userInvStep2, setUserInvStep2] = useState<string>(''); // After dividing 2
  const [showInvCheck, setShowInvCheck] = useState<boolean>(false);

  // RME 3: "Verifikasi Silang" — user picks a price, system goes forward AND backward
  const [verifyX, setVerifyX] = useState<number>(25);

  const questionData = {
    context: "Sebuah toko menerapkan sistem penetapan harga: harga awal x (dalam ribuan rupiah). Setelah pajak dan biaya layanan, harga jual akhir: f(x) = 2x + 10. Seorang pelanggan ingin mengetahui harga awal jika harga setelah pajak Rp90.000,00.",
    question: "Manakah pernyataan yang benar terkait fungsi invers untuk menghitung harga awal serta nominal harga sebelum pajak?",
    options: [
      "A. f⁻¹(x) = (x - 10) / 2",
      "B. f⁻¹(x) = (x + 10) / 2",
      "C. Harga awal = Rp40.000",
      "D. Harga awal = Rp50.000",
      "E. Harga awal = Rp45.000"
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

  // Computations
  const simOriginal = (simFinalPrice - 10) / 2;
  const formatK = (n: number) => `Rp${n.toLocaleString('id-ID')}.000`;

  // Step verification
  const correctInvStep1 = String(simFinalPrice - 10);
  const correctInvStep2 = String((simFinalPrice - 10) / 2);
  const invStep1OK = userInvStep1.trim() === correctInvStep1;
  const invStep2OK = userInvStep2.trim() === correctInvStep2;

  // Verify cross-check
  const verifyForward = 2 * verifyX + 10; // f(x)
  const verifyBackward = (verifyForward - 10) / 2; // f⁻¹(f(x)) should = x

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
          <p className="text-xs text-slate-500 italic mb-4">*Pilih semua opsi yang benar (Multi-Select).</p>

          <div className="flex flex-col gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const isCorrectOpt = questionData.correctOptionIdxs.includes(idx);
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-rose-400 text-slate-700 dark:text-slate-300";
              if (hasSubmitted) {
                if (isSelected && isCorrectOpt) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
                else if (!isSelected && isCorrectOpt) btnClass = "border-amber-500 bg-amber-500/10 text-amber-700";
                else btnClass = "border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
              } else if (isSelected) {
                btnClass = "border-rose-400 bg-rose-50 dark:bg-rose-900/10 text-rose-700 ring-2 ring-rose-400/30";
              }
              return (
                <button key={idx} disabled={hasSubmitted} onClick={() => handleToggle(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${btnClass}`}>
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${isSelected ? (hasSubmitted ? (isCorrectOpt ? 'bg-emerald-500 border-emerald-500' : 'bg-rose-500 border-rose-500') : 'bg-rose-500 border-rose-500') : 'border-slate-300 dark:border-slate-600'}`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                  </div>
                  <span className="text-sm font-semibold flex-1">{opt}</span>
                  {hasSubmitted && !isSelected && isCorrectOpt && <span className="text-[10px] text-amber-600 font-bold shrink-0">*Terlewat</span>}
                </button>
              );
            })}
          </div>

          {!hasSubmitted && (
            <button disabled={selectedOptions.length === 0} onClick={() => setHasSubmitted(true)}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedOptions.length > 0 ? 'bg-[#0F172A] text-white hover:bg-rose-700 shadow-md cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
              Submit Jawaban
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 space-y-6 animate-in fade-in slide-in-from-bottom-4">

              <div className={`p-4 rounded-xl flex items-start gap-4 border ${isAllCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isAllCorrect ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'fact_check'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isAllCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Tepat! Kamu menguasai fungsi invers.' : 'Coba balikkan operasinya secara manual!'}
                  </h3>
                </div>
              </div>

              {/* ======================================== */}
              {/* RME 1: BANGUN INVERS SENDIRI — Manual Step */}
              {/* ======================================== */}
              <div className="border border-rose-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">edit_note</span>
                    Balikkan Operasi Sendiri — Hitung Manual!
                  </h4>
                  <p className="text-rose-100 text-xs mt-1">
                    Diketahui harga akhir = {simFinalPrice} (ribuan). Proses maju: ×2 lalu +10. Balikkan langkah-langkahnya!
                  </p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  {/* Alur Maju Visual */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">➡ Alur Maju</p>
                    <div className="flex items-center justify-center gap-2 text-xs font-bold flex-wrap">
                      <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg">x</div>
                      <span className="text-slate-400">×2</span>
                      <div className="bg-slate-600 text-white px-3 py-2 rounded-lg">2x</div>
                      <span className="text-slate-400">+10</span>
                      <div className="bg-purple-600 text-white px-3 py-2 rounded-lg">2x+10 = y</div>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">⬅ Balikkan! Mulai dari y = {simFinalPrice}:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200">
                      <label className="text-xs font-bold text-rose-600 block mb-2">
                        Langkah 1: {simFinalPrice} - 10 = ?
                      </label>
                      <input type="number" value={userInvStep1}
                        onChange={(e) => { setUserInvStep1(e.target.value); setShowInvCheck(false); }}
                        className="w-full p-3 rounded-lg border-2 border-rose-200 focus:border-rose-500 font-mono text-lg font-bold text-center outline-none bg-white dark:bg-slate-800 dark:text-white"
                        placeholder="?" />
                    </div>
                    <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-900/10 border border-pink-200">
                      <label className="text-xs font-bold text-pink-600 block mb-2">
                        Langkah 2: ({userInvStep1 || '?'}) ÷ 2 = ?
                      </label>
                      <input type="number" value={userInvStep2}
                        onChange={(e) => { setUserInvStep2(e.target.value); setShowInvCheck(false); }}
                        className="w-full p-3 rounded-lg border-2 border-pink-200 focus:border-pink-500 font-mono text-lg font-bold text-center outline-none bg-white dark:bg-slate-800 dark:text-white"
                        placeholder="?" />
                    </div>
                  </div>
                  <button onClick={() => setShowInvCheck(true)}
                    disabled={!userInvStep1 || !userInvStep2}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${userInvStep1 && userInvStep2 ? 'bg-rose-600 text-white cursor-pointer hover:bg-rose-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                    Periksa Jawabanku
                  </button>

                  {showInvCheck && (
                    <div className="mt-4 space-y-2 animate-in fade-in">
                      <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${invStep1OK ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        <span className="material-symbols-outlined text-[16px]">{invStep1OK ? 'check_circle' : 'cancel'}</span>
                        {simFinalPrice} - 10 = {correctInvStep1} {invStep1OK ? '✓' : `(Jawabanmu: ${userInvStep1})`}
                      </div>
                      <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${invStep2OK ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        <span className="material-symbols-outlined text-[16px]">{invStep2OK ? 'check_circle' : 'cancel'}</span>
                        {correctInvStep1} ÷ 2 = {correctInvStep2} {invStep2OK ? '✓' : `(Jawabanmu: ${userInvStep2})`}
                      </div>
                      {invStep1OK && invStep2OK && (
                        <div className="p-3 rounded-lg bg-emerald-500 text-white text-center font-bold text-sm">
                          🎉 Harga awal = {formatK(Number(correctInvStep2))}. Kamu berhasil membalikkan fungsinya!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ======================================== */}
              {/* RME 2: SLIDER PRICE FINDER */}
              {/* ======================================== */}
              <div className="border border-purple-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">price_check</span>
                    Mesin Pencari Harga Awal — Geser Harga Akhir!
                  </h4>
                  <p className="text-purple-100 text-xs mt-1">Ubah harga akhir dan lihat mesin menghitung harga awal secara otomatis.</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Harga Akhir (y)</label>
                      <span className="text-lg font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">{formatK(simFinalPrice)}</span>
                    </div>
                    <input type="range" min="12" max="120" step="2" value={simFinalPrice}
                      onChange={(e) => { setSimFinalPrice(Number(e.target.value)); setUserInvStep1(''); setUserInvStep2(''); setShowInvCheck(false); }}
                      className="w-full accent-purple-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>Rp12.000</span><span>Rp120.000</span></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <div className="text-[10px] text-purple-500 font-bold uppercase mb-1">Harga Akhir</div>
                      <div className="text-xl font-black text-purple-700">{formatK(simFinalPrice)}</div>
                    </div>
                    <div className="flex items-center justify-center flex-col">
                      <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-center">
                        <InlineMath math={`\\frac{${simFinalPrice} - 10}{2}`} />
                      </div>
                      <span className="text-2xl mt-1">⬇</span>
                    </div>
                    <div className={`p-4 rounded-xl border ${simOriginal > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Harga Awal</div>
                      <div className={`text-xl font-black ${simOriginal > 0 ? 'text-emerald-700' : 'text-rose-500'}`}>
                        {simOriginal > 0 ? formatK(simOriginal) : 'Tidak Valid'}
                      </div>
                    </div>
                  </div>

                  {simFinalPrice === 90 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-700 text-center">
                      ✨ Ini nilai soal asli! f⁻¹(90) = (90-10)/2 = 40 → Harga Awal = Rp40.000
                    </div>
                  )}
                </div>
              </div>

              {/* ======================================== */}
              {/* RME 3: VERIFIKASI SILANG */}
              {/* ======================================== */}
              <div className="border border-cyan-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">swap_vert</span>
                    Verifikasi Silang — Buktikan f⁻¹(f(x)) = x!
                  </h4>
                  <p className="text-cyan-100 text-xs mt-1">Pilih harga awal apapun. Sistem akan maju (f) lalu mundur (f⁻¹), dan hasilnya harus sama dengan harga awal!</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Harga Awal (x)</label>
                      <span className="text-lg font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg">{formatK(verifyX)}</span>
                    </div>
                    <input type="range" min="5" max="60" step="1" value={verifyX}
                      onChange={(e) => setVerifyX(Number(e.target.value))}
                      className="w-full accent-cyan-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs font-bold">
                    <div className="bg-cyan-600 text-white px-4 py-3 rounded-lg min-w-[80px]">
                      <div className="text-cyan-200 text-[10px]">Awal</div>
                      <div className="text-lg">{verifyX}</div>
                    </div>
                    <div className="flex flex-col items-center text-slate-400">
                      <span className="text-[10px]">f(x)=2x+10</span>
                      <span className="material-symbols-outlined rotate-90 sm:rotate-0">arrow_forward</span>
                    </div>
                    <div className="bg-purple-600 text-white px-4 py-3 rounded-lg min-w-[80px]">
                      <div className="text-purple-200 text-[10px]">f({verifyX})</div>
                      <div className="text-lg">{verifyForward}</div>
                    </div>
                    <div className="flex flex-col items-center text-slate-400">
                      <span className="text-[10px]">f⁻¹(y)=(y-10)/2</span>
                      <span className="material-symbols-outlined rotate-90 sm:rotate-0">arrow_forward</span>
                    </div>
                    <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg min-w-[80px] ring-2 ring-emerald-400">
                      <div className="text-emerald-200 text-[10px]">f⁻¹(f({verifyX}))</div>
                      <div className="text-lg">{verifyBackward}</div>
                    </div>
                  </div>
                  <div className={`mt-4 p-3 rounded-lg text-center text-sm font-bold ${verifyBackward === verifyX ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {verifyBackward === verifyX ? `✅ f⁻¹(f(${verifyX})) = ${verifyBackward} = ${verifyX}. Terbukti kembali ke harga awal!` : 'Terjadi kesalahan perhitungan.'}
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
