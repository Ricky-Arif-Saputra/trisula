import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarProgramLinear: React.FC = () => {
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null, null, null]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // RME: Interactive Production Planner
  const [simKaos, setSimKaos] = useState<number>(60);
  const [simJaket, setSimJaket] = useState<number>(30);

  const questionData = {
    context: "Sebuah usaha konveksi memproduksi dua jenis pakaian, yaitu kaos (x) dan jaket (y). Untuk membuat satu kaos diperlukan 2 jam kerja dan 1 meter kain, sedangkan untuk membuat satu jaket diperlukan 4 jam kerja dan 3 meter kain. Dalam satu bulan tersedia paling banyak 240 jam kerja dan 180 meter kain. Setiap kaos memberikan keuntungan Rp25.000 dan setiap jaket Rp60.000.",
    statements: [
      { text: "1. Kendala jam kerja adalah 2x + 4y ≤ 240.", correct: true },
      { text: "2. Fungsi keuntungan: Z = 25.000x + 60.000y.", correct: true },
      { text: "3. Titik (120, 0) memenuhi semua kendala (merupakan alternatif produksi).", correct: true },
      { text: "4. Keuntungan maksimum adalah 120 kaos dan 0 jaket.", correct: false },
      { text: "5. Keuntungan maksimum diperoleh dengan 60 jaket dan 0 kaos (titik (0,60)).", correct: true },
    ],
  };

  const handleAnswer = (idx: number, val: boolean) => {
    if (hasSubmitted) return;
    const next = [...answers];
    next[idx] = val;
    setAnswers(next);
  };

  const isAllAnswered = answers.every(a => a !== null);
  let score = 0;
  if (hasSubmitted) score = answers.reduce((acc, a, i) => acc + (a === questionData.statements[i].correct ? 1 : 0), 0);
  const isAllCorrect = score === 5;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  // Constraint checks for simulator
  const simJam = 2 * simKaos + 4 * simJaket;
  const simKain = 1 * simKaos + 3 * simJaket;
  const simProfit = 25000 * simKaos + 60000 * simJaket;
  const jamOK = simJam <= 240;
  const kainOK = simKain <= 180;
  const feasible = jamOK && kainOK;

  // SVG Feasible Region
  // Constraint 1: 2x + 4y ≤ 240 → x + 2y ≤ 120 → (120,0), (0,60)
  // Constraint 2: x + 3y ≤ 180 → (180,0), (0,60)
  // Intersection of C1 and C2: x + 2y = 120, x + 3y = 180 → y = 60, x = 0
  // Vertices: (0,0), (120,0), (0,60)
  const scale = 1.5; // 1 unit = 1.5 px, max x=120, max y=80 → 180×120 viewBox
  const vX = (x: number) => 20 + x * scale;
  const vY = (y: number) => 140 - y * scale;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-yellow-400">format_list_numbered</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Topik: Aljabar - Program Linear</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white font-serif leading-tight">Tabel Benar-Salah (Sulit)</h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">Soal 3/3</span>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-6">{questionData.context}</p>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Tentukan Benar atau Salah setiap pernyataan berikut.</h3>

          {/* Statement Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 shadow-sm">
            <div className="hidden md:grid grid-cols-12 p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-8">Pernyataan</div>
              <div className="col-span-2 text-center">Benar</div>
              <div className="col-span-2 text-center">Salah</div>
            </div>
            {questionData.statements.map((stmt, idx) => {
              const ans = answers[idx];
              const isCorrectAns = ans === stmt.correct;
              return (
                <div key={idx} className={`border-b border-slate-100 dark:border-slate-800/50 p-4 transition-colors ${hasSubmitted ? (isCorrectAns ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : 'bg-rose-50/30 dark:bg-rose-900/5') : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center">
                    <div className="col-span-8 text-sm text-slate-700 dark:text-slate-300 font-medium">{stmt.text}</div>
                    <div className="col-span-4 flex gap-2 w-full md:w-auto justify-start">
                      {[{ val: true, label: 'BENAR', color: 'emerald' }, { val: false, label: 'SALAH', color: 'rose' }].map(({ val, label, color }) => (
                        <button key={label} disabled={hasSubmitted} onClick={() => handleAnswer(idx, val)}
                          className={`flex-1 md:flex-none md:w-20 py-2 rounded-lg font-bold text-xs border-2 transition-all ${ans === val ? `bg-${color}-500 border-${color}-500 text-white shadow-md` : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-${color}-400 hover:text-${color}-500`} ${hasSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hasSubmitted && (
                    <div className={`mt-2 p-2 rounded text-xs font-bold flex items-center gap-1.5 ${isCorrectAns ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                      <span className="material-symbols-outlined text-[14px]">{isCorrectAns ? 'check_circle' : 'cancel'}</span>
                      {isCorrectAns ? 'Tepat!' : `Jawaban seharusnya: ${stmt.correct ? 'BENAR' : 'SALAH'}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!hasSubmitted && (
            <button disabled={!isAllAnswered} onClick={() => setHasSubmitted(true)}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isAllAnswered ? 'bg-[#0F172A] text-white hover:bg-yellow-600 shadow-md cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
              Submit Analisis
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 space-y-6 animate-in fade-in slide-in-from-bottom-4">

              <div className={`p-4 rounded-xl flex items-start gap-4 border ${isAllCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isAllCorrect ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'analytics'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isAllCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Semua pernyataan dianalisis dengan sempurna!' : `${score}/5 pernyataan benar — Coba simulasi berikut!`}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Titik (0,60) memberikan profit Rp3.600.000, lebih tinggi dari (120,0) = Rp3.000.000.</p>
                </div>
              </div>

              {/* Feasible Region SVG */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col items-center">
                  <h4 className="font-bold text-white text-sm mb-4 self-start flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">area_chart</span>
                    Daerah Penyelesaian (Feasible Region)
                  </h4>
                  <svg viewBox="0 0 200 160" className="w-full max-w-[280px]">
                    {/* Axes */}
                    <line x1="20" y1="10" x2="20" y2="145" stroke="#475569" strokeWidth="1.5" />
                    <line x1="15" y1="140" x2="195" y2="140" stroke="#475569" strokeWidth="1.5" />

                    {/* Feasible Region Polygon: (0,0)→(120,0)→(0,60) */}
                    <polygon points={`${vX(0)},${vY(0)} ${vX(120)},${vY(0)} ${vX(0)},${vY(60)}`} fill="rgba(16,185,129,0.25)" stroke="#10B981" strokeWidth="2" />

                    {/* Constraint lines dashed */}
                    <line x1={vX(0)} y1={vY(60)} x2={vX(120)} y2={vY(0)} stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4" />

                    {/* Axis labels */}
                    <text x="175" y="152" fontSize="9" fill="#94A3B8">x (Kaos)</text>
                    <text x="22" y="14" fontSize="9" fill="#94A3B8">y (Jaket)</text>
                    <text x={vX(120)+3} y={vY(0)+4} fontSize="9" fill="#94A3B8">(120,0)</text>
                    <text x={vX(0)+3} y={vY(60)-3} fontSize="9" fill="#94A3B8">(0,60)</text>
                    <text x={vX(0)+3} y={vY(0)-3} fontSize="9" fill="#94A3B8">(0,0)</text>

                    {/* Vertex Circles */}
                    <circle cx={vX(0)} cy={vY(0)} r="4" fill="#64748B" />
                    <circle cx={vX(120)} cy={vY(0)} r="6" fill="#F59E0B" stroke="white" strokeWidth="2" />
                    <circle cx={vX(0)} cy={vY(60)} r="6" fill="#3B82F6" stroke="white" strokeWidth="2" />

                    {/* Profit labels */}
                    <text x={vX(120)+3} y={vY(0)+14} fontSize="8" fill="#F59E0B" fontWeight="bold">Rp3jt</text>
                    <text x={vX(0)+3} y={vY(60)-12} fontSize="8" fill="#3B82F6" fontWeight="bold">Rp3,6jt ★</text>
                  </svg>
                </div>

                {/* Profit Comparison */}
                <div className="flex flex-col justify-center gap-4">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Perbandingan Keuntungan di Titik Uji:</h4>
                  {[
                    { label: "Titik (120, 0)", kaos: 120, jaket: 0, color: "amber" },
                    { label: "Titik (0, 60) ★", kaos: 0, jaket: 60, color: "blue" },
                  ].map((t) => {
                    const profit = 25000 * t.kaos + 60000 * t.jaket;
                    return (
                      <div key={t.label} className={`p-4 rounded-xl border bg-${t.color}-50 dark:bg-${t.color}-900/10 border-${t.color}-200 dark:border-${t.color}-800/50`}>
                        <div className={`font-bold text-${t.color}-700 dark:text-${t.color}-400 text-sm mb-1`}>{t.label}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mb-2">
                          {t.kaos} kaos × Rp25.000 + {t.jaket} jaket × Rp60.000
                        </div>
                        <div className={`font-black text-lg text-${t.color}-600 dark:text-${t.color}-400`}>{formatCurrency(profit)}</div>
                        {profit === 3600000 && <div className="text-xs text-emerald-600 font-bold mt-1">🏆 KEUNTUNGAN MAKSIMUM!</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* === RME: Interactive Production Planner === */}
              <div className="border border-yellow-200 dark:border-yellow-800/50 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">factory</span>
                    Perencana Produksi Konveksi — Coba Sendiri!
                  </h4>
                  <p className="text-yellow-100 text-xs mt-1">Atur jumlah produksi Kaos dan Jaket. Sistem akan mengecek apakah kendala terpenuhi dan menghitung keuntunganmu secara real-time.</p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    {[
                      { label: "👕 Kaos (x)", value: simKaos, setter: setSimKaos, max: 120, jam: 2, kain: 1, color: "sky" },
                      { label: "🧥 Jaket (y)", value: simJaket, setter: setSimJaket, max: 60, jam: 4, kain: 3, color: "purple" },
                    ].map((item) => (
                      <div key={item.label} className={`bg-${item.color}-50 dark:bg-${item.color}-900/10 p-4 rounded-xl border border-${item.color}-200 dark:border-${item.color}-800/50`}>
                        <div className={`flex items-center justify-between mb-2 text-${item.color}-700 dark:text-${item.color}-400`}>
                          <span className="font-bold text-sm">{item.label}</span>
                          <span className="text-2xl font-black">{item.value}</span>
                        </div>
                        <input type="range" min="0" max={item.max} step="5" value={item.value}
                          onChange={(e) => item.setter(Number(e.target.value))}
                          className={`w-full accent-yellow-500 h-2 bg-${item.color}-200 dark:bg-${item.color}-800 rounded-lg appearance-none cursor-pointer mb-2`} />
                        <div className={`text-[10px] text-${item.color}-600 dark:text-${item.color}-500 font-mono`}>
                          Butuh: {item.value * item.jam} jam & {item.value * item.kain}m kain
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Constraint Gauges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Jam Kerja", used: simJam, max: 240, ok: jamOK },
                      { label: "Kain", used: simKain, max: 180, ok: kainOK, unit: "m" },
                    ].map((c) => (
                      <div key={c.label} className={`p-3 rounded-xl border ${c.ok ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200'}`}>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className={c.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                            {c.label} {c.ok ? '✓' : '✗ MELEBIHI!'}
                          </span>
                          <span className="text-slate-500">{c.used}/{c.max} {c.unit || 'jam'}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${c.ok ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, (c.used / c.max) * 100)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Result */}
                  <div className={`p-4 rounded-xl font-mono flex items-center justify-between ${feasible ? 'bg-slate-900' : 'bg-rose-900/20 border border-rose-700'}`}>
                    <div>
                      <div className={`text-xs mb-1 ${feasible ? 'text-slate-400' : 'text-rose-400'}`}>
                        {feasible ? 'Z = 25.000×' + simKaos + ' + 60.000×' + simJaket + ' =' : '⚠️ Kendala dilanggar! Kurangi produksi.'}
                      </div>
                      {feasible && <div className="text-emerald-400 font-black text-xl">{formatCurrency(simProfit)}</div>}
                    </div>
                    {feasible && (
                      <div className="text-right">
                        <div className="text-slate-400 text-[10px] mb-1">vs Maksimum</div>
                        <div className="text-blue-400 font-bold">Rp3.600.000</div>
                        <div className={`text-[10px] font-bold ${simProfit === 3600000 ? 'text-yellow-400' : 'text-slate-500'}`}>
                          {simProfit === 3600000 ? '🏆 MAKS!' : `Selisih ${formatCurrency(3600000 - simProfit)}`}
                        </div>
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
