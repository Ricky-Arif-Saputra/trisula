import React, { useState, useEffect } from 'react';
import { ASSETS } from '../../data';
import { MathCategory } from '../../types';

interface MateriScreenProps {
  initialCategory?: MathCategory | null;
  onSelectCategory?: (category: MathCategory | null) => void;
  onNavigateToProblem?: () => void;
}

export const MateriScreen: React.FC<MateriScreenProps> = ({
  initialCategory = null,
  onSelectCategory,
  onNavigateToProblem: _onNavigateToProblem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MathCategory | null>(initialCategory);

  // Sync internal state if prop changes from parent
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const handleSelectCat = (cat: MathCategory | null) => {
    setSelectedCategory(cat);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  // ==========================================
  // 1. BILANGAN STATE
  // ==========================================
  const [decInput, setDecInput] = useState<number>(42);
  const [nInput, setNInput] = useState<string>('7');

  // ==========================================
  // 2. ALJABAR STATE
  // ==========================================
  const [aljabarSubTab, setAljabarSubTab] = useState<'linear' | 'fungsi'>('linear');
  const [xValScale, setXValScale] = useState<number>(4);
  const [funcXInput, setFuncXInput] = useState<number>(3);

  // ==========================================
  // 3. GEOMETRI & PENGUKURAN STATE
  // ==========================================
  const [geometriSubTab, setGeometriSubTab] = useState<'objek' | 'transformasi' | 'pengukuran'>('objek');
  const [selectedShape, setSelectedShape] = useState<'cube' | 'prism' | 'sphere'>('cube');
  const [transformMode, setTransformMode] = useState<'translasi' | 'refleksi' | 'rotasi' | 'dilatasi'>('translasi');
  const [transformVal, setTransformVal] = useState<number>(3);
  const [gaugeLiquid, setGaugeLiquid] = useState<number>(75);

  // ==========================================
  // 4. TRIGONOMETRI STATE
  // ==========================================
  const [trigAngle, setTrigAngle] = useState<number>(45);

  // ==========================================
  // 5. DATA & PELUANG STATE
  // ==========================================
  const [dataSubTab, setDataSubTab] = useState<'data' | 'peluang'>('data');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [diceVal, setDiceVal] = useState<number | null>(6);
  const [coinVal, setCoinVal] = useState<'ANGKA' | 'GARUDA' | null>('GARUDA');
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Trig calculation helper
  const getTrigValues = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const tan = Math.abs(cos) < 0.0001 ? Infinity : Math.tan(rad);

    return {
      sin: sin.toFixed(3),
      cos: cos.toFixed(3),
      tan: isFinite(tan) ? tan.toFixed(3) : 'Tak Hingga',
      depan: Math.abs(sin).toFixed(3),
      samping: Math.abs(cos).toFixed(3),
      miring: '1.0',
    };
  };

  const trigVals = getTrigValues(trigAngle);

  // Roll Dice Simulation
  const handleRollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      setDiceVal(Math.floor(Math.random() * 6) + 1);
      setCoinVal(Math.random() > 0.5 ? 'GARUDA' : 'ANGKA');
      setIsRolling(false);
    }, 600);
  };

  // ==============================================================
  // VIEW 1: DAFTAR 5 MATERI UTAMA (When selectedCategory === null)
  // ==============================================================
  if (selectedCategory === null) {
    return (
      <div className="flex flex-col w-full pb-16 font-sans">
        {/* HEADER HERO */}
        <section className="px-margin-mobile pt-space-sm pb-space-md flex flex-col gap-space-sm">
          <div className="p-space-lg rounded-2xl bg-gradient-to-br from-[#0a2540] via-[#004d40] to-[#006b5c] text-white shadow-xl relative overflow-hidden border border-white/10 backdrop-blur-xl">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#00E676]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00E676] to-[#00B0FF] text-black flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-2xl">
                  📚
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#00E676] uppercase tracking-wider font-extrabold">
                      Kurikulum Merdeka 2024
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B0FF] animate-pulse"></span>
                    <span className="text-[11px] text-white/70">Modul RME Kelas XII</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                    Daftar 5 Materi Utama Matematika
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GRID 5 MATERI UTAMA CARDS */}
        <section className="px-margin-mobile flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-secondary tracking-wider">
              Pilih Materi Pembelajaran
            </span>
            <span className="text-xs text-on-surface-variant">5 Domain Tersedia</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* CARD 1: BILANGAN */}
            <div
              onClick={() => handleSelectCat('bilangan')}
              className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-[#00E676]/30 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] text-[11px] font-extrabold border border-[#00E676]/30">
                    🟢 Level: Mudah
                  </span>
                  <span className="text-xs font-extrabold text-[#00B0FF]">85% Selesai</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔢</span>
                  <div>
                    <h3 className="text-base font-extrabold text-on-surface group-hover:text-[#00E676] transition-colors">
                      1. Bilangan
                    </h3>
                    <p className="text-xs text-on-surface-variant">Numbers & Arithmetic</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                  Sub-materi: Grid Numerik Digital, Abakus 3D, & Model Eksponensial Bunga Majemuk Perbankan.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#00E676] to-[#00B0FF] h-full rounded-full w-[85%]"></div>
                </div>
                <span className="text-xs font-bold text-[#00E676] flex items-center gap-1">
                  Pelajari <span className="text-sm">➔</span>
                </span>
              </div>
            </div>

            {/* CARD 2: ALJABAR */}
            <div
              onClick={() => handleSelectCat('aljabar')}
              className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-[#D500F9]/30 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D500F9]/20 text-[#D500F9] text-[11px] font-extrabold border border-[#D500F9]/30">
                    🔴 Level: HOTS
                  </span>
                  <span className="text-xs font-extrabold text-[#7C4DFF]">70% Selesai</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">➗</span>
                  <div>
                    <h3 className="text-base font-extrabold text-on-surface group-hover:text-[#D500F9] transition-colors">
                      2. Aljabar
                    </h3>
                    <p className="text-xs text-on-surface-variant">Algebra & Functions</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                  Sub-materi: <strong>a. Persamaan & Pertidaksamaan Linear (Balance Scale)</strong>, serta <strong>b. Materi Fungsi (Input-Output Machine)</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] h-full rounded-full w-[70%]"></div>
                </div>
                <span className="text-xs font-bold text-[#D500F9] flex items-center gap-1">
                  Pelajari <span className="text-sm">➔</span>
                </span>
              </div>
            </div>

            {/* CARD 3: GEOMETRI DAN PENGUKURAN */}
            <div
              onClick={() => handleSelectCat('geometri')}
              className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-[#FF6D00]/30 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFAB00]/20 text-[#FFAB00] text-[11px] font-extrabold border border-[#FFAB00]/30">
                    🟡 Level: Sedang
                  </span>
                  <span className="text-xs font-extrabold text-[#FF6D00]">60% Selesai</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📐</span>
                  <div>
                    <h3 className="text-base font-extrabold text-on-surface group-hover:text-[#FF6D00] transition-colors">
                      3. Geometri & Pengukuran
                    </h3>
                    <p className="text-xs text-on-surface-variant">Geometry & Measurement</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                  Sub-materi: <strong>a. Objek 3D 360°</strong>, <strong>b. Transformasi Vektor (Translasi, Refleksi, Rotasi, Dilatasi)</strong>, dan <strong>c. Pengukuran (Gauge Meter)</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] h-full rounded-full w-[60%]"></div>
                </div>
                <span className="text-xs font-bold text-[#FF6D00] flex items-center gap-1">
                  Pelajari <span className="text-sm">➔</span>
                </span>
              </div>
            </div>

            {/* CARD 4: TRIGONOMETRI */}
            <div
              onClick={() => handleSelectCat('trigonometri')}
              className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-[#00E5FF]/30 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-extrabold border border-[#00E5FF]/30">
                    🔴 Level: HOTS
                  </span>
                  <span className="text-xs font-extrabold text-[#2979FF]">45% Selesai</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📐</span>
                  <div>
                    <h3 className="text-base font-extrabold text-on-surface group-hover:text-[#00E5FF] transition-colors">
                      4. Trigonometri
                    </h3>
                    <p className="text-xs text-on-surface-variant">Trigonometry & Waves</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                  Sub-materi: Lingkaran Satuan (Unit Circle 3D), Sudut Istimewa (θ), & Rasio Trigonometri (Sin, Cos, Tan).
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#00E5FF] to-[#2979FF] h-full rounded-full w-[45%]"></div>
                </div>
                <span className="text-xs font-bold text-[#00E5FF] flex items-center gap-1">
                  Pelajari <span className="text-sm">➔</span>
                </span>
              </div>
            </div>

            {/* CARD 5: DATA DAN PELUANG */}
            <div
              onClick={() => handleSelectCat('peluang')}
              className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-[#FF4081]/30 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFEA00]/20 text-[#FFEA00] text-[11px] font-extrabold border border-[#FFEA00]/30">
                    🟢 Level: Mudah
                  </span>
                  <span className="text-xs font-extrabold text-[#FF4081]">90% Selesai</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  <div>
                    <h3 className="text-base font-extrabold text-on-surface group-hover:text-[#FF4081] transition-colors">
                      5. Data & Peluang
                    </h3>
                    <p className="text-xs text-on-surface-variant">Data & Probability</p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                  Sub-materi: <strong>a. Data & Statistik (3D Charts)</strong>, serta <strong>b. Simulator Peluang (Dadu 3D & Flip Koin)</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FF4081] to-[#FFEA00] h-full rounded-full w-[90%]"></div>
                </div>
                <span className="text-xs font-bold text-[#FF4081] flex items-center gap-1">
                  Pelajari <span className="text-sm">➔</span>
                </span>
              </div>
            </div>

          </div>
        </section>
      </div>
    );
  }

  // ==============================================================
  // VIEW 2: DETAIL MATERI (When selectedCategory !== null)
  // ==============================================================
  return (
    <div className="flex flex-col w-full pb-16 font-sans">
      {/* BACK BUTTON TO 5 MAIN CARDS LIST */}
      <section className="px-margin-mobile pt-space-sm pb-1 flex items-center justify-between">
        <button
          onClick={() => handleSelectCat(null)}
          className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer border border-outline-variant/30"
        >
          <span className="text-base">←</span>
          <span>Kembali ke Daftar 5 Materi Utama</span>
        </button>

        {/* Quick Switch category selector */}
        <div className="flex items-center gap-1">
          {(['bilangan', 'aljabar', 'geometri', 'trigonometri', 'peluang'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCat(cat)}
              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                selectedCategory === cat ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface-variant'
              }`}
              title={`Pindah ke ${cat}`}
            >
              {cat === 'bilangan' ? '1' : cat === 'aljabar' ? '2' : cat === 'geometri' ? '3' : cat === 'trigonometri' ? '4' : '5'}
            </button>
          ))}
        </div>
      </section>

      {/* DYNAMIC SUB-MATERIAL CONTENT */}
      <div className="px-margin-mobile flex flex-col gap-space-lg mt-2">

        {/* ============================================================== */}
        {/* DETAIL: BILANGAN */}
        {/* ============================================================== */}
        {selectedCategory === 'bilangan' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#004d40]/80 via-[#006b5c]/60 to-[#0a2540]/80 border border-[#00E676]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-extrabold border border-[#00E676]/40">
                  🟢 Level: Mudah
                </span>
                <span className="text-xs text-[#00B0FF] font-bold">Progress: 85% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                🔢 Grid Numerik & Konverter Basis Bilangan Digital
              </h3>
            </div>

            {/* Interactive Base Converter Widget */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
              <span className="text-xs font-extrabold uppercase text-[#00E676] tracking-wider">
                ⚡ Simulator Basis Bilangan (Base Converter 3D)
              </span>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface">Uji Angka Desimal (Base 10):</label>
                <input
                  type="number"
                  value={decInput}
                  onChange={(e) => setDecInput(parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-surface-container text-on-surface font-mono font-bold text-lg border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#00E676]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00E676]/10 to-transparent border border-[#00E676]/30 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-[#00E676] uppercase">Biner (Base 2):</span>
                  <span className="font-mono text-base font-extrabold text-on-surface break-all">
                    {decInput.toString(2)}₂
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00B0FF]/10 to-transparent border border-[#00B0FF]/30 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-[#00B0FF] uppercase">Heksadesimal (Base 16):</span>
                  <span className="font-mono text-base font-extrabold text-on-surface break-all">
                    0x{decInput.toString(16).toUpperCase()}₁₆
                  </span>
                </div>
              </div>
            </div>

            {/* Bunga Majemuk Calculator */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
              <span className="text-xs font-extrabold uppercase text-[#00B0FF] tracking-wider">
                📈 Model Pertumbuhan Eksponensial (Bunga Majemuk)
              </span>
              <div className="p-4 rounded-xl bg-surface-container text-xs leading-relaxed space-y-2">
                <p className="font-bold text-on-surface">Kalkulasi Tahun (n) untuk Saldo Rp10.000.000 pada Bunga 6%:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={nInput}
                    onChange={(e) => setNInput(e.target.value)}
                    className="w-24 p-2 rounded-lg bg-surface-container-highest font-mono font-bold text-center border border-outline-variant/40"
                  />
                  <span className="font-bold text-on-surface">Tahun</span>
                </div>
                <div className="p-3 rounded-lg bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] font-mono font-bold text-sm">
                  Nilai Akhir M_{nInput} = Rp{Math.round(10000000 * Math.pow(1.06, parseFloat(nInput) || 0)).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* DETAIL: ALJABAR */}
        {/* ============================================================== */}
        {selectedCategory === 'aljabar' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2a0845]/90 via-[#6441a5]/70 to-[#7C4DFF]/50 border border-[#D500F9]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#D500F9]/20 text-[#D500F9] text-xs font-extrabold border border-[#D500F9]/40">
                  🔴 Level: HOTS
                </span>
                <span className="text-xs text-[#7C4DFF] font-bold">Progress: 70% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                ➗ Timbangan Digital Linear & Mesin Input-Output Fungsi
              </h3>
            </div>

            {/* Sub-Tab Selector Aljabar */}
            <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
              <button
                onClick={() => setAljabarSubTab('linear')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  aljabarSubTab === 'linear'
                    ? 'bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] text-white shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                a. Persamaan & Pertidaksamaan Linear (Balance Scale)
              </button>
              <button
                onClick={() => setAljabarSubTab('fungsi')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  aljabarSubTab === 'fungsi'
                    ? 'bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] text-white shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                b. Materi Fungsi (Input-Output Machine)
              </button>
            </div>

            {/* SUB-MATERIAL A: TIMBANGAN DIGITAL LINEAR */}
            {aljabarSubTab === 'linear' && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase text-[#D500F9] tracking-wider">
                  ⚖️ Timbangan Digital Interaktif (Balance Scale 3D)
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Geser nilai variabel <strong>x</strong> untuk menyeimbangkan timbangan aljabar: <code>2x + 4 = 12</code>
                </p>

                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#7C4DFF]/15 to-transparent border border-[#7C4DFF]/30 flex flex-col items-center gap-4">
                  <div className="flex items-center justify-between w-full max-w-md">
                    <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-surface-container border border-[#7C4DFF]/40 shadow-inner">
                      <span className="text-xs font-bold text-on-surface">Sisi Kiri</span>
                      <span className="font-mono text-lg font-extrabold text-[#D500F9]">
                        2({xValScale}) + 4 = {2 * xValScale + 4}
                      </span>
                    </div>

                    <div className={`text-3xl transition-transform duration-300 ${xValScale === 4 ? 'rotate-0' : xValScale < 4 ? '-rotate-12' : 'rotate-12'}`}>
                      ⚖️
                    </div>

                    <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-surface-container border border-[#7C4DFF]/40 shadow-inner">
                      <span className="text-xs font-bold text-on-surface">Sisi Kanan</span>
                      <span className="font-mono text-lg font-extrabold text-[#7C4DFF]">
                        12
                      </span>
                    </div>
                  </div>

                  <div className="w-full max-w-md flex flex-col gap-2 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Ubah Nilai x:</span>
                      <span className="text-[#D500F9]">x = {xValScale}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={xValScale}
                      onChange={(e) => setXValScale(parseInt(e.target.value))}
                      className="w-full accent-[#D500F9] cursor-pointer"
                    />
                  </div>

                  <div className={`w-full p-3 rounded-xl font-bold text-xs text-center border ${
                    xValScale === 4
                      ? 'bg-[#00E676]/20 border-[#00E676]/50 text-[#00E676]'
                      : 'bg-[#D500F9]/20 border-[#D500F9]/50 text-[#D500F9]'
                  }`}>
                    {xValScale === 4
                      ? '✅ SEIMBANG (EQUILIBRIUM): Nilai x = 4 adalah solusi tepat!'
                      : `⚠️ TIDAK SEIMBANG: Sisi kiri bernilai ${2 * xValScale + 4}, belum sama dengan 12.`}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-MATERIAL B: MESIN FUNGSI */}
            {aljabarSubTab === 'fungsi' && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase text-[#7C4DFF] tracking-wider">
                  ⚙️ Mesin Pemetaan Fungsi (Input-Output Machine)
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Masukkan nilai domain <strong>x</strong> ke dalam mesin fungsi <code>f(x) = 2x + 5</code>:
                </p>

                <div className="p-5 rounded-2xl bg-surface-container border border-[#7C4DFF]/30 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 w-full justify-center">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#7C4DFF]/20 border border-[#7C4DFF]/50 text-center">
                      <span className="text-[11px] font-bold text-[#7C4DFF]">Input (Domain x)</span>
                      <input
                        type="number"
                        value={funcXInput}
                        onChange={(e) => setFuncXInput(parseInt(e.target.value) || 0)}
                        className="w-16 p-1.5 rounded-lg bg-surface-container-highest font-mono font-extrabold text-center text-on-surface text-base"
                      />
                    </div>

                    <span className="text-2xl text-[#D500F9]">➔</span>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] text-white font-mono font-extrabold text-sm text-center shadow-lg">
                      f(x) = 2({funcXInput}) + 5
                    </div>

                    <span className="text-2xl text-[#D500F9]">➔</span>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#D500F9]/20 border border-[#D500F9]/50 text-center">
                      <span className="text-[11px] font-bold text-[#D500F9]">Output (Kodomain)</span>
                      <span className="font-mono text-xl font-extrabold text-on-surface">
                        {2 * funcXInput + 5}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* DETAIL: GEOMETRI DAN PENGUKURAN */}
        {/* ============================================================== */}
        {selectedCategory === 'geometri' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#4a1c00]/90 via-[#8a3300]/70 to-[#FF6D00]/50 border border-[#FFAB00]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#FFAB00]/20 text-[#FFAB00] text-xs font-extrabold border border-[#FFAB00]/40">
                  🟡 Level: Sedang
                </span>
                <span className="text-xs text-[#FF6D00] font-bold">Progress: 60% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                📐 Objek 3D 360°, Transformasi Geometri, & Pengukuran
              </h3>
            </div>

            {/* Sub-Tab Selector Geometri */}
            <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
              <button
                onClick={() => setGeometriSubTab('objek')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  geometriSubTab === 'objek'
                    ? 'bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                a. Objek Geometri 3D 360°
              </button>
              <button
                onClick={() => setGeometriSubTab('transformasi')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  geometriSubTab === 'transformasi'
                    ? 'bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                b. Transformasi Geometri
              </button>
              <button
                onClick={() => setGeometriSubTab('pengukuran')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  geometriSubTab === 'pengukuran'
                    ? 'bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                c. Pengukuran (Gauge)
              </button>
            </div>

            {/* SUB-MATERIAL A: OBJEK 3D */}
            {geometriSubTab === 'objek' && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase text-[#FF6D00] tracking-wider">
                  📦 Interactive 3D Wireframe Viewer
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedShape('cube')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${selectedShape === 'cube' ? 'bg-[#FF6D00] text-white' : 'bg-surface-container text-on-surface'}`}
                  >
                    Kubus (s=6cm)
                  </button>
                  <button
                    onClick={() => setSelectedShape('prism')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${selectedShape === 'prism' ? 'bg-[#FF6D00] text-white' : 'bg-surface-container text-on-surface'}`}
                  >
                    Prisma Segitiga
                  </button>
                  <button
                    onClick={() => setSelectedShape('sphere')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${selectedShape === 'sphere' ? 'bg-[#FF6D00] text-white' : 'bg-surface-container text-on-surface'}`}
                  >
                    Bola (r=7cm)
                  </button>
                </div>

                <div className="h-48 rounded-2xl bg-gradient-to-b from-[#FF6D00]/20 to-transparent border border-[#FF6D00]/30 flex items-center justify-center relative overflow-hidden">
                  <div className="text-6xl animate-bounce">
                    {selectedShape === 'cube' ? '🧊' : selectedShape === 'prism' ? '📐' : '🔮'}
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] text-[#FFAB00] font-mono font-bold">
                    Rotasi 360° Wireframe Neon
                  </div>
                </div>
              </div>
            )}

            {/* SUB-MATERIAL B: TRANSFORMASI GEOMETRI */}
            {geometriSubTab === 'transformasi' && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase text-[#FFAB00] tracking-wider">
                  🔄 Simulator Vektor Gerak Transformasi
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['translasi', 'refleksi', 'rotasi', 'dilatasi'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setTransformMode(m)}
                      className={`p-2 rounded-xl text-xs font-bold capitalize cursor-pointer ${transformMode === m ? 'bg-[#FF6D00] text-white' : 'bg-surface-container text-on-surface'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-surface-container font-mono text-xs text-on-surface space-y-1">
                  <div>Titik Awal P(2, 3) ➔ Mode: <strong>{transformMode.toUpperCase()}</strong> ({transformVal})</div>
                  <div className="text-[#FF6D00] font-bold text-sm">
                    {transformMode === 'translasi' && `Hasil P'(2+${transformVal}, 3+${transformVal}) = P'(${2 + transformVal}, ${3 + transformVal})`}
                    {transformMode === 'refleksi' && `Hasil P'(-2, 3) [Cerminan Sumbu Y]`}
                    {transformMode === 'rotasi' && `Hasil Rotasi 90°: P'(-3, 2)`}
                    {transformMode === 'dilatasi' && `Hasil Skala k=${transformVal}: P'(${2 * transformVal}, ${3 * transformVal})`}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-MATERIAL C: PENGUKURAN */}
            {geometriSubTab === 'pengukuran' && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase text-[#FF6D00] tracking-wider">
                  🧪 Meteran Liquid Gauge Volume Interaktif
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Kapasitas Cairan:</span>
                    <span className="text-[#FF6D00]">{gaugeLiquid}% (Volume 750 mL)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={gaugeLiquid}
                    onChange={(e) => setGaugeLiquid(parseInt(e.target.value))}
                    className="w-full accent-[#FF6D00] cursor-pointer"
                  />
                </div>
                <div className="h-16 w-full rounded-xl bg-surface-container border border-[#FF6D00]/30 overflow-hidden relative p-1">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] rounded-lg transition-all duration-300 flex items-center justify-end pr-3 font-mono font-bold text-black text-xs"
                    style={{ width: `${gaugeLiquid}%` }}
                  >
                    {gaugeLiquid}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* DETAIL: TRIGONOMETRI */}
        {/* ============================================================== */}
        {selectedCategory === 'trigonometri' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#002b4d]/90 via-[#005288]/70 to-[#00E5FF]/40 border border-[#00E5FF]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-extrabold border border-[#00E5FF]/40">
                  🔴 Level: HOTS
                </span>
                <span className="text-xs text-[#2979FF] font-bold">Progress: 45% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                📐 Lingkaran Satuan (Unit Circle 3D) & Rasio Trigonometri
              </h3>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
              <span className="text-xs font-extrabold uppercase text-[#00E5FF] tracking-wider">
                ⭕ Unit Circle & Rasio Sudut Istimewa (θ)
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[0, 30, 45, 60, 90, 180, 360].map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setTrigAngle(angle)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold transition-all cursor-pointer ${
                      trigAngle === angle
                        ? 'bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-black shadow-md scale-105'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {angle}°
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex flex-col items-center">
                  <span className="text-[11px] font-extrabold text-[#00E5FF]">sin({trigAngle}°)</span>
                  <span className="font-mono text-base font-extrabold text-on-surface">{trigVals.sin}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#2979FF]/15 border border-[#2979FF]/40 flex flex-col items-center">
                  <span className="text-[11px] font-extrabold text-[#2979FF]">cos({trigAngle}°)</span>
                  <span className="font-mono text-base font-extrabold text-on-surface">{trigVals.cos}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex flex-col items-center">
                  <span className="text-[11px] font-extrabold text-[#00E5FF]">tan({trigAngle}°)</span>
                  <span className="font-mono text-base font-extrabold text-on-surface">{trigVals.tan}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between font-mono text-xs text-on-surface">
                <span>Sisi Depan = <strong>{trigVals.depan}</strong></span>
                <span>Samping = <strong>{trigVals.samping}</strong></span>
                <span>Miring = <strong>{trigVals.miring}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* DETAIL: DATA DAN PELUANG */}
        {/* ============================================================== */}
        {selectedCategory === 'peluang' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#4a0027]/90 via-[#8a0045]/70 to-[#FF4081]/40 border border-[#FFEA00]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#FFEA00]/20 text-[#FFEA00] text-xs font-extrabold border border-[#FFEA00]/40">
                  🟢 Level: Mudah
                </span>
                <span className="text-xs text-[#FF4081] font-bold">Progress: 90% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                📊 Dashboard Statistik 3D & Simulator Peluang
              </h3>
            </div>

            {/* Sub-Tab Selector Data & Peluang */}
            <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
              <button
                onClick={() => setDataSubTab('data')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  dataSubTab === 'data'
                    ? 'bg-gradient-to-r from-[#FF4081] to-[#FFEA00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                a. Data & Statistik (3D Charts)
              </button>
              <button
                onClick={() => setDataSubTab('peluang')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  dataSubTab === 'peluang'
                    ? 'bg-gradient-to-r from-[#FF4081] to-[#FFEA00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                b. Peluang & Probabilitas (Dice/Coin Flip)
              </button>
            </div>

            {/* SUB-MATERIAL A: DATA */}
            {dataSubTab === 'data' && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#FF4081] tracking-wider">
                    📊 Visualisasi Bar & Pie Chart 3D
                  </span>
                  <div className="flex gap-1">
                    {(['bar', 'pie', 'line'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setChartType(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer ${chartType === t ? 'bg-[#FF4081] text-white' : 'bg-surface-container text-on-surface'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-44 rounded-2xl bg-surface-container p-4 flex items-end justify-around border border-[#FF4081]/30">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-on-surface">MIPA 1</span>
                    <div className="w-10 bg-gradient-to-t from-[#FF4081] to-[#FFEA00] rounded-t-lg h-28 shadow-lg"></div>
                    <span className="text-[10px] text-on-surface-variant font-mono">88%</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-on-surface">MIPA 2</span>
                    <div className="w-10 bg-gradient-to-t from-[#FF4081] to-[#FFEA00] rounded-t-lg h-36 shadow-lg"></div>
                    <span className="text-[10px] text-on-surface-variant font-mono">95%</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-on-surface">MIPA 3</span>
                    <div className="w-10 bg-gradient-to-t from-[#FF4081] to-[#FFEA00] rounded-t-lg h-24 shadow-lg"></div>
                    <span className="text-[10px] text-on-surface-variant font-mono">76%</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-MATERIAL B: PELUANG */}
            {dataSubTab === 'peluang' && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase text-[#FFEA00] tracking-wider">
                  🎲 Simulator Peluang 3D Melayang & Flip Koin
                </span>

                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#FF4081]/20 to-transparent border border-[#FF4081]/30 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4081] to-[#FFEA00] text-black font-extrabold text-3xl flex items-center justify-center shadow-xl ${isRolling ? 'animate-spin' : ''}`}>
                      {diceVal}
                    </div>

                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#FFEA00] to-[#FF4081] text-black font-extrabold text-xs flex items-center justify-center shadow-xl border-2 border-white ${isRolling ? 'animate-ping' : ''}`}>
                      {coinVal}
                    </div>
                  </div>

                  <button
                    onClick={handleRollDice}
                    disabled={isRolling}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF4081] to-[#FFEA00] text-black font-extrabold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    {isRolling ? 'Kocok Dadu & Flip Koin...' : '🎲 Lempar Dadu & Koin Sekarang'}
                  </button>

                  <div className="text-xs font-mono text-on-surface-variant">
                    Peluang Angka 6 pada Dadu = 1/6 (16,67%) | Koin = 1/2 (50%)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
