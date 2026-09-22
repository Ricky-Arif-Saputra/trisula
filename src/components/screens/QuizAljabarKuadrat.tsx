import React, { useState } from 'react';

export const QuizAljabarKuadrat: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [hoverPoint, setHoverPoint] = useState<number | null>(null);

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
    correctOptionIdxs: [0, 1, 3], // A, B, D
  };

  const handleToggleOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOptions(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const isAllCorrect = 
    selectedOptions.length === questionData.correctOptionIdxs.length &&
    questionData.correctOptionIdxs.every(idx => selectedOptions.includes(idx));

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      setHasSubmitted(true);
    }
  };

  // SVG Parabola parameters
  // Vertex (40, 800), Roots 0 and 80.
  // Equation: y = a(x - 40)^2 + 800
  // a(40)^2 + 800 = 0 => 1600a = -800 => a = -0.5
  // y = -0.5(x - 40)^2 + 800
  
  // Mapping to SVG space: width 300, height 200
  // X range: -10 to 90 => 100 units
  // Y range: -100 to 900 => 1000 units
  const mapX = (x: number) => ((x + 10) / 100) * 300;
  const mapY = (y: number) => 200 - ((y + 100) / 1000) * 200;

  const generateParabolaPath = () => {
    let d = `M ${mapX(0)} ${mapY(0)}`;
    for (let x = 1; x <= 80; x++) {
      const y = -0.5 * Math.pow(x - 40, 2) + 800;
      d += ` L ${mapX(x)} ${mapY(y)}`;
    }
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
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Topik: Aljabar - Fungsi Kuadrat
              </span>
              <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize font-serif leading-tight">
                Fungsi Kuadrat Multi-Select (Sulit)
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
            Soal 2 / 3
          </span>
        </div>

        <div className="p-6">
          <div className="callout-example mb-6">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
              {questionData.context}
            </p>
            
            {/* Visual Asset: SVG Graph */}
            <div className="w-full flex justify-center mb-4">
              <div className="relative bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-4 shadow-inner"
                   onMouseLeave={() => setHoverPoint(null)}>
                <svg width="300" height="200" viewBox="0 0 300 200" className="overflow-visible">
                  {/* Grid Lines & Labels */}
                  <line x1={mapX(0)} y1={mapY(-100)} x2={mapX(0)} y2={mapY(900)} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />
                  <line x1={mapX(-10)} y1={mapY(0)} x2={mapX(90)} y2={mapY(0)} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />
                  
                  {/* Ticks and Labels */}
                  <text x={mapX(40)} y={mapY(0) + 15} fontSize="10" fill="currentColor" className="text-slate-500 text-center" textAnchor="middle">40</text>
                  <text x={mapX(80)} y={mapY(0) + 15} fontSize="10" fill="currentColor" className="text-slate-500 text-center" textAnchor="middle">80</text>
                  <text x={mapX(0) - 10} y={mapY(800)} fontSize="10" fill="currentColor" className="text-slate-500 text-right" textAnchor="end" dominantBaseline="middle">800</text>
                  
                  {/* Axes labels */}
                  <text x={mapX(90)} y={mapY(0) - 10} fontSize="10" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-bold" textAnchor="end">Unit Terjual (x)</text>
                  <text x={mapX(0) + 10} y={mapY(900) + 10} fontSize="10" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-bold">Keuntungan (y)</text>

                  {/* The Parabola */}
                  <path d={generateParabolaPath()} fill="none" stroke="#10B981" strokeWidth="3" />

                  {/* Interactive Elements (Active only after submit for scaffolding, or always?) */}
                  {/* The prompt implies interactive graph inspector for RME feedback, so we show it after submit or hover during */}
                  {hasSubmitted && (
                    <>
                      {/* Vertex Highlight */}
                      <circle 
                        cx={mapX(40)} cy={mapY(800)} r="6" fill="#F59E0B" 
                        onMouseEnter={() => setHoverPoint(40)}
                        className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                      />
                      
                      {/* 20 and 60 highlight */}
                      <circle 
                        cx={mapX(20)} cy={mapY(600)} r="5" fill="#3B82F6" 
                        onMouseEnter={() => setHoverPoint(20)}
                        className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                      />
                      <circle 
                        cx={mapX(60)} cy={mapY(600)} r="5" fill="#3B82F6" 
                        onMouseEnter={() => setHoverPoint(60)}
                        className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                      />

                      {/* Tooltips and Guidelines based on hover */}
                      {hoverPoint === 40 && (
                        <g className="animate-in fade-in">
                          <line x1={mapX(40)} y1={mapY(0)} x2={mapX(40)} y2={mapY(800)} stroke="#F59E0B" strokeDasharray="4" />
                          <line x1={mapX(0)} y1={mapY(800)} x2={mapX(40)} y2={mapY(800)} stroke="#F59E0B" strokeDasharray="4" />
                          <rect x={mapX(40) - 60} y={mapY(800) - 30} width="120" height="20" fill="#1E293B" rx="4" />
                          <text x={mapX(40)} y={mapY(800) - 16} fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">Puncak: (40, 800)</text>
                        </g>
                      )}

                      {(hoverPoint === 20 || hoverPoint === 60) && (
                        <g className="animate-in fade-in">
                          {/* Horizontal line showing symmetry */}
                          <line x1={mapX(20)} y1={mapY(600)} x2={mapX(60)} y2={mapY(600)} stroke="#3B82F6" strokeDasharray="4" strokeWidth="2" />
                          <line x1={mapX(20)} y1={mapY(0)} x2={mapX(20)} y2={mapY(600)} stroke="#3B82F6" strokeDasharray="4" />
                          <line x1={mapX(60)} y1={mapY(0)} x2={mapX(60)} y2={mapY(600)} stroke="#3B82F6" strokeDasharray="4" />
                          <rect x={mapX(40) - 60} y={mapY(600) - 25} width="120" height="20" fill="#1E293B" rx="4" />
                          <text x={mapX(40)} y={mapY(600) - 11} fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">Simetris: y sama besar</text>
                        </g>
                      )}
                    </>
                  )}
                </svg>
                {hasSubmitted && <div className="absolute top-2 right-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold animate-pulse">Arahkan kursor ke titik grafik!</div>}
              </div>
            </div>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 leading-relaxed">
            {questionData.question}
            <span className="block text-xs font-normal text-slate-500 mt-1 italic">
              *Pilih semua opsi yang bernilai benar (Multi-Select).
            </span>
          </h3>

          <div className="flex flex-col gap-3 mb-6">
            {questionData.options.map((opt, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const isCorrectOpt = questionData.correctOptionIdxs.includes(idx);
              
              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-[#0F172A] dark:hover:border-slate-500 text-slate-700 dark:text-slate-300";
              
              if (hasSubmitted) {
                if (isSelected && isCorrectOpt) btnClass = "border-[#059669] bg-[#059669]/10 text-[#059669]";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-500/10 text-rose-500";
                else if (!isSelected && isCorrectOpt) btnClass = "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-500";
                else btnClass = "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50";
              } else if (isSelected) {
                btnClass = "border-[#0F172A] dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold ring-2 ring-[#0F172A] dark:ring-white";
              }

              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => handleToggleOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${btnClass}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                    isSelected 
                      ? (hasSubmitted ? (isCorrectOpt ? 'bg-[#059669] border-[#059669]' : 'bg-rose-500 border-rose-500') : 'bg-[#0F172A] dark:bg-white border-[#0F172A] dark:border-white text-white dark:text-[#0F172A]') 
                      : 'border-slate-300 dark:border-slate-600 bg-transparent'
                  }`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{opt}</span>
                    {hasSubmitted && !isSelected && isCorrectOpt && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-bold">
                        *Opsi ini seharusnya dipilih karena bernilai benar.
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {!hasSubmitted && (
            <button
              disabled={selectedOptions.length === 0}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedOptions.length > 0 
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
              
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-4 border ${isAllCorrect ? 'bg-[#059669]/10 border-[#059669]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isAllCorrect ? 'bg-[#059669]' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'fact_check'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isAllCorrect ? 'text-[#059669]' : 'text-amber-600'}`}>
                    {isAllCorrect ? 'Luar Biasa! Analisis grafiknya sangat akurat.' : 'Mari kita bedah kurva parabola ini lebih dalam!'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Grafik fungsi kuadrat (parabola) dalam konteks bisnis sering menunjukkan titik optimum (maksimum/minimum) dan sifat simetris. Coba arahkan kursor ke titik-titik pada grafik di atas!
                  </p>
                </div>
              </div>

              {/* Step-by-Step Scaffolding Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Card A & B */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-auto px-2 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs font-bold gap-1">A & B <span className="material-symbols-outlined text-[12px]">check_circle</span></div>
                    <h5 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Titik Puncak (Optimum)</h5>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                    <p>
                      Titik puncak parabola terletak pada koordinat <strong>(40, 800)</strong>. Sumbu-x mewakili jumlah penjualan dan sumbu-y mewakili keuntungan.
                    </p>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-500 bg-white dark:bg-slate-900 p-2 rounded">
                      Maka, Penjualan Optimum = 40 unit, dan Keuntungan Maksimum = Rp800.000.
                    </p>
                  </div>
                </div>

                {/* Card D */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">D</div>
                    <h5 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Sifat Simetris</h5>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                    <p>
                      Parabola memiliki sumbu simetri di <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">x = 40</code>.
                    </p>
                    <p>
                      Penjualan 20 unit dan 60 unit sama-sama berjarak <strong>20 unit</strong> dari sumbu simetri (40 - 20 = 20, dan 40 + 20 = 60). 
                    </p>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-500 bg-white dark:bg-slate-900 p-2 rounded">
                      Karena simetris, nilai keuntungan (y) pada kedua titik tersebut pasti sama besar.
                    </p>
                  </div>
                </div>

                {/* Card C & E (Salah) */}
                <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-xl border border-rose-200 dark:border-rose-800/50 shadow-sm md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-auto px-2 h-6 rounded bg-rose-500 text-white flex items-center justify-center text-xs font-bold gap-1">C & E <span className="material-symbols-outlined text-[12px]">cancel</span></div>
                    <h5 className="font-bold text-rose-800 dark:text-rose-400 text-sm">Miskonsepsi Pernyataan</h5>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3">
                    <p>
                      <strong>Pernyataan C:</strong> Grafik parabola melengkung seperti huruf "n", artinya kurva <strong>terbuka ke bawah</strong>, bukan ke atas. Ini menandakan adanya batas maksimum.
                    </p>
                    <p>
                      <strong>Pernyataan E:</strong> Karena kurva terbuka ke bawah, setelah mencapai titik puncak (40 unit), keuntungan akan <strong>mulai menurun</strong> (bisa karena faktor biaya operasional yang membengkak melebihi kapasitas). Jadi, keuntungan tidak akan naik tanpa batas.
                    </p>
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
