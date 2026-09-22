import React, { useState } from 'react';

export const QuizAljabarKuadrat: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [hoverPoint, setHoverPoint] = useState<number | null>(null);
  
  // RME: Interactive slider to explore the parabola
  const [simX, setSimX] = useState<number>(40);

  const questionData = {
    context: "Seorang pelaku UMKM mengamati hubungan antara jumlah produk yang terjual dengan keuntungan harian. Hubungan tersebut digambarkan dalam sebuah grafik fungsi kuadrat di bawah ini.",
    question: "Berdasarkan informasi grafik tersebut, manakah pernyataan berikut yang benar?",
    options: [
      "A. Keuntungan maksimum UMKM terjadi saat penjualan 40 unit produk.",
      "B. Keuntungan maksimum UMKM adalah Rp800.000.",
      "C. Grafik menunjukkan fungsi kuadrat terbuka ke atas.",
      "D. Pada penjualan 20 unit dan 60 unit, keuntungan yang diperoleh sama besar.",
      "E. Keuntungan akan terus meningkat jika jumlah penjualan terus bertambah tanpa batas."
    ],
    correctOptionIdxs: [0, 1, 3],
  };

  const handleToggle = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOptions(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const isAllCorrect =
    selectedOptions.length === questionData.correctOptionIdxs.length &&
    questionData.correctOptionIdxs.every(idx => selectedOptions.includes(idx));

  // Parabola: y = -0.5(x - 40)^2 + 800
  const calcY = (x: number) => Math.max(0, -0.5 * Math.pow(x - 40, 2) + 800);
  const simY = calcY(simX);
  const formatCurrency = (n: number) => `Rp${Math.round(n).toLocaleString('id-ID')}`;

  // SVG mapping
  const W = 300, H = 200;
  const mapX = (x: number) => ((x + 5) / 90) * W;
  const mapY = (y: number) => H - ((y + 50) / 950) * H;

  const generatePath = () => {
    let d = `M ${mapX(0)} ${mapY(calcY(0))}`;
    for (let x = 1; x <= 80; x++) d += ` L ${mapX(x)} ${mapY(calcY(x))}`;
    return d;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-green-400">stacked_line_chart</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Topik: Aljabar - Fungsi Kuadrat</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-serif leading-tight">Fungsi Kuadrat Multi-Select (Sulit)</h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">Soal 2/3</span>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">{questionData.context}</p>

          {/* Parabola SVG */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-3 w-full max-w-sm shadow-inner relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" onMouseLeave={() => setHoverPoint(null)}>
                {/* Axes */}
                <line x1={mapX(0)} y1={mapY(-50)} x2={mapX(0)} y2={mapY(900)} stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth="1.5" />
                <line x1={mapX(-5)} y1={mapY(0)} x2={mapX(85)} y2={mapY(0)} stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth="1.5" />
                
                {/* Labels */}
                <text x={mapX(40)} y={mapY(0)+14} fontSize="9" fill="currentColor" className="text-slate-500" textAnchor="middle">40</text>
                <text x={mapX(80)} y={mapY(0)+14} fontSize="9" fill="currentColor" className="text-slate-500" textAnchor="middle">80</text>
                <text x={mapX(20)} y={mapY(0)+14} fontSize="9" fill="currentColor" className="text-slate-500" textAnchor="middle">20</text>
                <text x={mapX(60)} y={mapY(0)+14} fontSize="9" fill="currentColor" className="text-slate-500" textAnchor="middle">60</text>
                <text x={mapX(0)-5} y={mapY(800)+3} fontSize="9" fill="currentColor" className="text-slate-500" textAnchor="end">800</text>

                {/* Parabola */}
                <path d={generatePath()} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />

                {/* Interactive hover points */}
                <circle cx={mapX(40)} cy={mapY(800)} r="7" fill="#F59E0B" stroke="white" strokeWidth="2"
                  onMouseEnter={() => setHoverPoint(40)} className="cursor-pointer transition-all hover:r-[10px]" />
                <circle cx={mapX(20)} cy={mapY(calcY(20))} r="6" fill="#3B82F6" stroke="white" strokeWidth="2"
                  onMouseEnter={() => setHoverPoint(20)} className="cursor-pointer" />
                <circle cx={mapX(60)} cy={mapY(calcY(60))} r="6" fill="#3B82F6" stroke="white" strokeWidth="2"
                  onMouseEnter={() => setHoverPoint(60)} className="cursor-pointer" />

                {/* Tooltips */}
                {hoverPoint === 40 && (
                  <g>
                    <line x1={mapX(40)} y1={mapY(0)} x2={mapX(40)} y2={mapY(800)} stroke="#F59E0B" strokeDasharray="4" strokeOpacity="0.7" />
                    <line x1={mapX(0)} y1={mapY(800)} x2={mapX(40)} y2={mapY(800)} stroke="#F59E0B" strokeDasharray="4" strokeOpacity="0.7" />
                    <rect x={mapX(40)-50} y={mapY(800)-28} width="100" height="22" rx="5" fill="#1E293B" />
                    <text x={mapX(40)} y={mapY(800)-13} fontSize="9" fill="#FCD34D" textAnchor="middle" fontWeight="bold">Puncak: (40, 800) 🏆</text>
                  </g>
                )}
                {(hoverPoint === 20 || hoverPoint === 60) && (
                  <g>
                    <line x1={mapX(20)} y1={mapY(calcY(20))} x2={mapX(60)} y2={mapY(calcY(60))} stroke="#3B82F6" strokeDasharray="5" strokeWidth="2" />
                    <line x1={mapX(20)} y1={mapY(0)} x2={mapX(20)} y2={mapY(calcY(20))} stroke="#3B82F6" strokeDasharray="4" />
                    <line x1={mapX(60)} y1={mapY(0)} x2={mapX(60)} y2={mapY(calcY(60))} stroke="#3B82F6" strokeDasharray="4" />
                    <rect x={mapX(40)-65} y={mapY(calcY(20))-26} width="130" height="20" rx="5" fill="#1E293B" />
                    <text x={mapX(40)} y={mapY(calcY(20))-12} fontSize="9" fill="#93C5FD" textAnchor="middle" fontWeight="bold">Simetris: y sama = {formatCurrency(calcY(20))}</text>
                  </g>
                )}
                
                {/* sim cursor */}
                {hasSubmitted && (
                  <g>
                    <line x1={mapX(simX)} y1={mapY(0)} x2={mapX(simX)} y2={mapY(simY)} stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="3" />
                    <circle cx={mapX(simX)} cy={mapY(simY)} r="5" fill="#F43F5E" stroke="white" strokeWidth="2" />
                  </g>
                )}

                {/* Axis arrows */}
                <text x={mapX(83)} y={mapY(0)+3} fontSize="9" fill="currentColor" className="text-slate-500">x</text>
                <text x={mapX(0)+3} y={mapY(870)} fontSize="9" fill="currentColor" className="text-slate-500">y</text>
              </svg>
              {!hasSubmitted && <div className="text-[10px] text-slate-400 text-center mt-1">Arahkan kursor ke titik berwarna!</div>}
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{questionData.question}</h3>
          <p className="text-xs text-slate-500 italic mb-4">*Pilih semua opsi yang bernilai benar (Multi-Select).</p>

          <div className="flex flex-col gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const isCorrectOpt = questionData.correctOptionIdxs.includes(idx);
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-green-400 text-slate-700 dark:text-slate-300";
              if (hasSubmitted) {
                if (isSelected && isCorrectOpt) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
                else if (!isSelected && isCorrectOpt) btnClass = "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400";
                else btnClass = "border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
              } else if (isSelected) {
                btnClass = "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 font-bold ring-2 ring-green-500/30";
              }
              return (
                <button key={idx} disabled={hasSubmitted} onClick={() => handleToggle(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${btnClass}`}>
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${isSelected ? (hasSubmitted ? (isCorrectOpt ? 'bg-emerald-500 border-emerald-500' : 'bg-rose-500 border-rose-500') : 'bg-green-500 border-green-500') : 'border-slate-300 dark:border-slate-600'}`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                  </div>
                  <span className="text-sm font-semibold flex-1">{opt}</span>
                  {hasSubmitted && !isSelected && isCorrectOpt && <span className="text-[10px] text-amber-600 font-bold ml-2 shrink-0">*Terlewat</span>}
                </button>
              );
            })}
          </div>

          {!hasSubmitted && (
            <button disabled={selectedOptions.length === 0} onClick={() => setHasSubmitted(true)}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedOptions.length > 0 ? 'bg-[#0F172A] text-white hover:bg-green-700 shadow-md cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
              Submit Jawaban
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 space-y-6 animate-in fade-in slide-in-from-bottom-4">

              <div className={`p-4 rounded-xl flex items-start gap-4 border ${isAllCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isAllCorrect ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'query_stats'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isAllCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Analisis Grafik Sempurna!' : 'Coba geser slider di bawah untuk menjelajahi grafik!'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Arahkan kursor ke titik-titik berwarna pada grafik di atas untuk melihat informasi interaktif!</p>
                </div>
              </div>

              {/* === RME: Interactive Parabola Explorer === */}
              <div className="border border-green-200 dark:border-green-800/50 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">explore</span>
                    Penjelajah Parabola Interaktif — Geser untuk Menjelajahi!
                  </h4>
                  <p className="text-green-100 text-xs mt-1">Ubah jumlah penjualan dengan slider dan lihat estimasi keuntungan harian secara langsung.</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Terjual (x)</label>
                      <span className="text-xl font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">{simX} unit</span>
                    </div>
                    <input type="range" min="0" max="80" step="2" value={simX}
                      onChange={(e) => setSimX(Number(e.target.value))}
                      className="w-full accent-green-500 h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>0 unit</span><span>80 unit</span></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Fungsi</div>
                      <div className="text-xs font-mono text-slate-700 dark:text-slate-300">y = -0,5(x-40)² + 800</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">= -0,5({simX}-40)² + 800</div>
                    </div>
                    <div className={`p-4 rounded-xl text-center border-2 ${simY === 800 ? 'bg-amber-50 border-amber-400' : simY > 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-300'}`}>
                      <div className="text-[10px] font-bold uppercase mb-1 text-slate-500">Keuntungan</div>
                      <div className={`text-xl font-black ${simY === 800 ? 'text-amber-600' : simY > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {simY > 0 ? `${formatCurrency(simY * 1000)}` : 'Rp0 (Impas)'}
                      </div>
                      {simY === 800 && <div className="text-[10px] text-amber-600 font-bold mt-1">🏆 KEUNTUNGAN MAKSIMUM!</div>}
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Posisi vs Puncak</div>
                      <div className={`text-sm font-bold ${simX < 40 ? 'text-blue-600' : simX === 40 ? 'text-amber-600' : 'text-purple-600'}`}>
                        {simX < 40 ? `⬆ Menuju Puncak (${40 - simX} unit lagi)` : simX === 40 ? '🎯 Di Titik Puncak!' : `⬇ Menurun (${simX - 40} unit setelah puncak)`}
                      </div>
                      {simX === 80 - simX || (simX <= 80 && simX !== 40) ? (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Pasangan simetris: x = {80 - simX} unit → {formatCurrency(calcY(80 - simX) * 1000)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scaffolding Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">A & B ✓</div>
                    <h5 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Titik Puncak = Optimum</h5>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Koordinat (40, 800): penjualan 40 unit = keuntungan <strong>Rp800.000</strong> (maksimum).</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">D ✓</div>
                    <h5 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Simetri x = 40</h5>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">x=20 dan x=60 sama-sama berjarak 20 dari sumbu simetri → y sama = <strong>{formatCurrency(calcY(20) * 1000)}</strong>.</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-xl border border-rose-200 dark:border-rose-800/50 md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 h-6 rounded bg-rose-500 text-white flex items-center justify-center text-xs font-bold">C & E ✗</div>
                    <h5 className="font-bold text-rose-800 dark:text-rose-400 text-sm">Miskonsepsi</h5>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong>C:</strong> Kurva melengkung ke bawah (terbuka ke bawah), bukan ke atas. | <strong>E:</strong> Setelah 40 unit, keuntungan justru menurun karena kurva menurun. Coba geser slider ke lebih dari 40 unit!</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
