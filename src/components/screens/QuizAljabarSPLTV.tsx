import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarSPLTV: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // RME 1: "Tebak Harga" — user guesses individual prices
  const [guessTas, setGuessTas] = useState<string>('');
  const [guessDompet, setGuessDompet] = useState<string>('');
  const [guessPensil, setGuessPensil] = useState<string>('');
  const [showGuessCheck, setShowGuessCheck] = useState<boolean>(false);

  // RME 2: Kasir Simulator
  const [simTas, setSimTas] = useState<number>(1);
  const [simDompet, setSimDompet] = useState<number>(1);
  const [simPensil, setSimPensil] = useState<number>(1);

  const questionData = {
    context: "Seorang pengrajin menjual tiga jenis produk, yaitu tas, dompet, dan tempat pensil dengan harga satuan yang tetap. Pada suatu transaksi, seorang pembeli membeli 1 tas, 2 dompet, dan 1 tempat pensil dengan total harga Rp150.000. Pada transaksi lain, pembeli berbeda membeli 2 tas, 1 dompet, dan 3 tempat pensil dengan total harga Rp230.000. Kemudian transaksi ketiga menunjukkan bahwa 1 tas, 1 dompet, dan 2 tempat pensil dijual dengan total harga Rp170.000.",
    question: "Berdasarkan informasi tersebut, maka harga 5 tas adalah ...",
    options: ["A. Rp175.000", "B. Rp200.000", "C. Rp225.000", "D. Rp250.000", "E. Rp275.000"],
    correctOptionIdx: 1,
  };

  const isCorrect = selectedOption === questionData.correctOptionIdx;

  const HARGA_TAS = 40000;
  const HARGA_DOMPET = 30000;
  const HARGA_PENSIL = 50000;

  const simTotal = simTas * HARGA_TAS + simDompet * HARGA_DOMPET + simPensil * HARGA_PENSIL;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  // Guess verification
  const guessT = Number(guessTas) || 0;
  const guessD = Number(guessDompet) || 0;
  const guessP = Number(guessPensil) || 0;
  const guessReceipt1 = 1 * guessT + 2 * guessD + 1 * guessP;
  const guessReceipt2 = 2 * guessT + 1 * guessD + 3 * guessP;
  const guessReceipt3 = 1 * guessT + 1 * guessD + 2 * guessP;
  const r1Match = guessReceipt1 === 150000;
  const r2Match = guessReceipt2 === 230000;
  const r3Match = guessReceipt3 === 170000;
  const allMatch = r1Match && r2Match && r3Match;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-orange-400">functions</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Topik: Aljabar - SPLTV</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-serif leading-tight">SPLTV Aritmetika (Sedang)</h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">Soal 1</span>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-6">{questionData.context}</p>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">{questionData.question}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-orange-400 text-slate-700 dark:text-slate-300";
              if (hasSubmitted) {
                const isCorrectOpt = idx === questionData.correctOptionIdx;
                if (isSelected && isCorrectOpt) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
                else if (isCorrectOpt) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600";
                else btnClass = "border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
              } else if (isSelected) {
                btnClass = "border-orange-400 bg-orange-50 dark:bg-orange-900/10 text-orange-700 ring-2 ring-orange-400/30";
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
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedOption !== null ? 'bg-[#0F172A] text-white hover:bg-orange-600 shadow-md cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
              Submit Jawaban
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 space-y-6 animate-in fade-in slide-in-from-bottom-4">

              <div className={`p-4 rounded-xl flex items-start gap-4 border ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-300'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                  <span className="material-symbols-outlined">{isCorrect ? 'celebration' : 'receipt_long'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isCorrect ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {isCorrect ? 'Tepat Sekali!' : 'Coba tebak harga satuan tiap barang!'}
                  </h3>
                </div>
              </div>

              {/* ======================================== */}
              {/* RME 1: TEBAK HARGA — User guesses prices */}
              {/* ======================================== */}
              <div className="border border-orange-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">quiz</span>
                    Tebak Harga — Masukkan Tebakanmu!
                  </h4>
                  <p className="text-orange-100 text-xs mt-1">Tebak harga satuan tiap produk (dalam Rupiah). Sistem akan mengecek apakah tebakanmu cocok dengan semua struk transaksi.</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "🎒 Tas", value: guessTas, setter: setGuessTas, emoji: "🎒" },
                      { label: "👛 Dompet", value: guessDompet, setter: setGuessDompet, emoji: "👛" },
                      { label: "✏️ T. Pensil", value: guessPensil, setter: setGuessPensil, emoji: "✏️" },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="text-2xl mb-1">{item.emoji}</div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{item.label}</label>
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => { item.setter(e.target.value); setShowGuessCheck(false); }}
                          placeholder="Rp?"
                          className="w-full p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 font-mono text-sm font-bold text-center outline-none bg-white dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowGuessCheck(true)}
                    disabled={!guessTas || !guessDompet || !guessPensil}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${guessTas && guessDompet && guessPensil ? 'bg-orange-500 text-white cursor-pointer hover:bg-orange-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    Cocokkan dengan Struk!
                  </button>

                  {showGuessCheck && (
                    <div className="mt-4 space-y-3 animate-in fade-in">
                      {[
                        { label: "Struk #1: 1T + 2D + 1P", result: guessReceipt1, expected: 150000, match: r1Match },
                        { label: "Struk #2: 2T + 1D + 3P", result: guessReceipt2, expected: 230000, match: r2Match },
                        { label: "Struk #3: 1T + 1D + 2P", result: guessReceipt3, expected: 170000, match: r3Match },
                      ].map((r) => (
                        <div key={r.label} className={`p-3 rounded-lg flex items-center justify-between text-sm font-bold ${r.match ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">{r.match ? 'check_circle' : 'cancel'}</span>
                            <span>{r.label}</span>
                          </div>
                          <div className="text-right text-xs">
                            <div>Tebakanmu: {formatCurrency(r.result)}</div>
                            <div>Seharusnya: {formatCurrency(r.expected)}</div>
                          </div>
                        </div>
                      ))}
                      {allMatch ? (
                        <div className="p-4 rounded-lg bg-emerald-500 text-white text-center font-bold">
                          🎉 Sempurna! Tebakanmu cocok dengan semua struk! Harga 5 Tas = {formatCurrency(5 * guessT)}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-amber-100 text-amber-800 text-center text-xs font-bold">
                          💡 Coba sesuaikan harga tebakanmu sehingga ketiga struk cocok semua.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ======================================== */}
              {/* RME 2: KASIR SIMULATOR */}
              {/* ======================================== */}
              <div className="border border-sky-200 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">shopping_cart</span>
                    Kalkulator Kasir — Buat Belanjaan Sendiri!
                  </h4>
                  <p className="text-sky-100 text-xs mt-1">Geser slider untuk mengubah jumlah setiap item. Total dihitung otomatis menggunakan harga yang ditemukan dari SPLTV.</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="p-3 mb-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 rounded-lg text-sm text-emerald-700 dark:text-emerald-400 font-bold text-center">
                    Harga Satuan: Tas = {formatCurrency(HARGA_TAS)} | Dompet = {formatCurrency(HARGA_DOMPET)} | Pensil = {formatCurrency(HARGA_PENSIL)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {[
                      { label: "🎒 Tas", value: simTas, setter: setSimTas, price: HARGA_TAS },
                      { label: "👛 Dompet", value: simDompet, setter: setSimDompet, price: HARGA_DOMPET },
                      { label: "✏️ Pensil", value: simPensil, setter: setSimPensil, price: HARGA_PENSIL },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                          <span className="text-lg font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded">×{item.value}</span>
                        </div>
                        <input type="range" min="0" max="10" step="1" value={item.value}
                          onChange={(e) => item.setter(Number(e.target.value))}
                          className="w-full accent-sky-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        <div className="text-right text-sm font-bold text-slate-600 dark:text-slate-400 mt-2 font-mono">
                          = {formatCurrency(item.value * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 rounded-xl p-4 font-mono flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-xs">{simTas}T + {simDompet}D + {simPensil}P</div>
                      <div className="text-emerald-400 font-bold text-xl">{formatCurrency(simTotal)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">Jawaban: 5 Tas =</div>
                      <div className="text-amber-400 font-bold text-lg">{formatCurrency(5 * HARGA_TAS)}</div>
                    </div>
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
