import React, { useState } from 'react';
import { InlineMath } from 'react-katex';

export const QuizAljabarProgramLinear: React.FC = () => {
  // Store true/false for each of the 5 statements
  // true = 'Benar', false = 'Salah', null = unanswered
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null, null, null]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const questionData = {
    context: "Sebuah usaha konveksi memproduksi dua jenis pakaian, yaitu kaos (x) dan jaket (y). Untuk membuat satu kaos diperlukan 2 jam kerja dan 1 meter kain, sedangkan untuk membuat satu jaket diperlukan 4 jam kerja dan 3 meter kain. Dalam satu bulan tersedia paling banyak 240 jam kerja dan 180 meter kain. Setiap kaos yang terjual memberikan keuntungan sebesar Rp25.000,00, sedangkan setiap jaket memberikan keuntungan sebesar Rp60.000,00. Seorang siswa diminta menganalisis permasalahan tersebut.",
    statements: [
      "1. Jika x menyatakan kaos dan y jaket, kendala jam kerja adalah 2x + 4y ≤ 240.",
      "2. Fungsi keuntungan yang dimaksimalkan: Z = 25.000x + 60.000y.",
      "3. Titik (120, 0) memenuhi semua kendala sehingga merupakan salah satu alternatif produksi.",
      "4. Produksi yang menghasilkan keuntungan maksimum adalah 120 kaos dan 0 jaket.",
      "5. Keuntungan maksimum diperoleh dengan memproduksi 60 jaket dan tidak memproduksi kaos (0, 60)."
    ],
    // Correct answers: B, B, B, S, B
    correctAnswers: [true, true, true, false, true]
  };

  const handleAnswerChange = (idx: number, val: boolean) => {
    if (hasSubmitted) return;
    const newAnswers = [...answers];
    newAnswers[idx] = val;
    setAnswers(newAnswers);
  };

  const isAllAnswered = answers.every(a => a !== null);
  
  let score = 0;
  if (hasSubmitted) {
    score = answers.reduce((acc, curr, idx) => acc + (curr === questionData.correctAnswers[idx] ? 1 : 0), 0);
  }

  const isAllCorrect = score === 5;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-yellow-400">format_list_numbered</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Aljabar - Program Linear
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Tabel Benar-Salah (Sulit)
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
            Soal 3 / 3
          </span>
        </div>

        <div className="p-6">
          <div className="callout-example mb-6">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
              {questionData.context}
            </p>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 leading-relaxed">
            Pilih "Benar" atau "Salah" untuk setiap pernyataan di bawah ini berdasarkan analisis matematika.
          </h3>

          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6 shadow-sm">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
              <div className="col-span-8">Pernyataan</div>
              <div className="col-span-2 text-center">Benar</div>
              <div className="col-span-2 text-center">Salah</div>
            </div>

            <div className="flex flex-col">
              {questionData.statements.map((stmt, idx) => {
                const ans = answers[idx];
                const isCorrect = ans === questionData.correctAnswers[idx];

                return (
                  <div key={idx} className="border-b border-slate-100 dark:border-slate-800/50 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative">
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center">
                      <div className="col-span-8 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {stmt}
                      </div>
                      <div className="col-span-4 flex w-full md:w-auto gap-2 justify-between md:justify-around self-end">
                        <button
                          onClick={() => handleAnswerChange(idx, true)}
                          disabled={hasSubmitted}
                          className={`flex-1 md:w-16 py-2 rounded-lg font-bold text-xs transition-all border-2 ${
                            ans === true 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-500'
                          } ${hasSubmitted ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          BENAR
                        </button>
                        <button
                          onClick={() => handleAnswerChange(idx, false)}
                          disabled={hasSubmitted}
                          className={`flex-1 md:w-16 py-2 rounded-lg font-bold text-xs transition-all border-2 ${
                            ans === false 
                              ? 'bg-rose-500 border-rose-500 text-white shadow-md' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-rose-500 hover:text-rose-500'
                          } ${hasSubmitted ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          SALAH
                        </button>
                      </div>
                    </div>
                    {/* Inline feedback after submit */}
                    {hasSubmitted && (
                      <div className={`mt-3 p-2 rounded text-xs font-bold flex items-center gap-2 ${isCorrect ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                        <span className="material-symbols-outlined text-[14px]">{isCorrect ? 'check_circle' : 'cancel'}</span>
                        {isCorrect ? 'Jawaban Anda Tepat!' : `Jawaban Seharusnya: ${questionData.correctAnswers[idx] ? 'BENAR' : 'SALAH'}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!hasSubmitted && (
            <button
              disabled={!isAllAnswered}
              onClick={() => setHasSubmitted(true)}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isAllAnswered 
                  ? 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-md cursor-pointer' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              Submit Analisis
            </button>
          )}

          {/* RME FEEDBACK SECTION */}
          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
              
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isAllCorrect ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isAllCorrect ? 'bg-[#10B981]' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'analytics'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isAllCorrect ? 'text-[#10B981]' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Luar Biasa! Semua pernyataan dianalisis dengan sempurna.' : `Kamu berhasil menjawab benar ${score} dari 5 pernyataan.`}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Mari kita bedah Daerah Penyelesaian (Feasible Region) untuk membuktikan pernyataan 4 dan 5 terkait nilai keuntungan.
                  </p>
                </div>
              </div>

              {/* RME: Resource Feasibility Gauge & SVG Graph */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* SVG Graph */}
                <div className="bg-slate-800 dark:bg-slate-900 rounded-xl p-5 border border-slate-700 shadow-inner flex flex-col items-center">
                  <h4 className="font-bold text-white text-sm mb-4">Grafik Daerah Penyelesaian</h4>
                  <div className="relative w-full max-w-[300px] aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-slate-300 dark:border-slate-600 overflow-hidden">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Axes */}
                      <line x1="20" y1="180" x2="20" y2="20" stroke="#475569" strokeWidth="2" />
                      <line x1="20" y1="180" x2="180" y2="180" stroke="#475569" strokeWidth="2" />
                      
                      {/* Line 1: 2x + 4y = 240 => (120,0) to (0,60) */}
                      {/* Map (120,0) to SVG (180, 180) -- Wait, let's say max X is 200, mapped to 180 */}
                      {/* Let's scale: 1 unit = 1 pixel. max x=150, max y=150 */}
                      {/* x: 0->20, 120->140. y: 0->180, 60->120 */}
                      {/* Poly: (0,60)=>(20,120), (120,0)=>(140,180), (180,0)=>(200,180) => (0,0)=>(20,180) */}
                      
                      {/* Actual polygon for feasible region */}
                      <polygon points="20,180 20,120 140,180" fill="rgba(16, 185, 129, 0.3)" stroke="#10B981" strokeWidth="2" />
                      
                      {/* Line 2 (Kain): x + 3y <= 180 (Not explicitly used in the vertex analysis for brevity but it's part of the constraints) */}
                      
                      <circle cx="20" cy="120" r="4" fill="#3B82F6" />
                      <text x="25" y="115" fontSize="8" fill="#3B82F6" fontWeight="bold">(0, 60)</text>

                      <circle cx="140" cy="180" r="4" fill="#F59E0B" />
                      <text x="135" y="175" fontSize="8" fill="#F59E0B" fontWeight="bold">(120, 0)</text>

                      <circle cx="20" cy="180" r="4" fill="#94A3B8" />
                      
                      <text x="160" y="195" fontSize="8" fill="#475569">x (Kaos)</text>
                      <text x="5" y="30" fontSize="8" fill="#475569" transform="rotate(-90, 5, 30)">y (Jaket)</text>
                    </svg>
                  </div>
                </div>

                {/* Profit Analysis */}
                <div className="flex flex-col justify-center gap-4">
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-bl-lg">UJI TITIK A</div>
                    <h5 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-2">Produksi (120, 0)</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">120 Kaos & 0 Jaket</p>
                    <div className="font-mono text-sm bg-white dark:bg-slate-900 p-2 rounded text-slate-700 dark:text-slate-300">
                      <InlineMath math="Z = 25.000(120) + 60.000(0)" /><br/>
                      <span className="font-bold">Z = Rp3.000.000</span>
                    </div>
                  </div>

                  <div className="bg-sky-50 dark:bg-sky-900/10 p-4 rounded-xl border border-sky-200 dark:border-sky-800/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-sky-500 text-white text-[10px] font-bold rounded-bl-lg">UJI TITIK B</div>
                    <h5 className="font-bold text-sky-800 dark:text-sky-400 text-sm mb-2">Produksi (0, 60)</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">0 Kaos & 60 Jaket</p>
                    <div className="font-mono text-sm bg-white dark:bg-slate-900 p-2 rounded text-slate-700 dark:text-slate-300">
                      <InlineMath math="Z = 25.000(0) + 60.000(60)" /><br/>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Z = Rp3.600.000 (MAKSIMUM!)</span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-700 dark:text-slate-300 p-2 border-l-4 border-emerald-500 bg-slate-50 dark:bg-slate-800 rounded-r">
                    <strong>Kesimpulan:</strong> Pernyataan 4 <strong>SALAH</strong> karena Rp3.000.000 bukanlah nilai tertinggi. Sebaliknya, pernyataan 5 <strong>BENAR</strong> karena (0,60) memberikan profit tertinggi.
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
