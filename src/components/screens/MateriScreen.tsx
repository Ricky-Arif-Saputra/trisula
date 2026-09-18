import React, { useState } from 'react';
import { ASSETS } from '../../data';
import { MathCategory } from '../../types';

interface MateriScreenProps {
  initialCategory?: MathCategory;
  onNavigateToProblem?: () => void;
}

export const MateriScreen: React.FC<MateriScreenProps> = ({
  initialCategory = 'bilangan',
  onNavigateToProblem: _onNavigateToProblem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MathCategory>(initialCategory);

  // ==========================================
  // 1. BILANGAN STATE
  // ==========================================
  const [decInput, setDecInput] = useState<number>(42);
  const [selectedFormula, setSelectedFormula] = useState<'exponential' | 'linear'>('exponential');
  const [nInput, setNInput] = useState<string>('7');
  const [bilanganFeedback, setBilanganFeedback] = useState<{
    text: string;
    type: 'idle' | 'success' | 'warning' | 'error';
  }>({
    text: 'Model Eksponensial Bunga Majemuk: Saldo akhir M_n = M_0 (1 + i)^n.',
    type: 'success',
  });

  // ==========================================
  // 2. ALJABAR STATE
  // ==========================================
  const [aljabarSubTab, setAljabarSubTab] = useState<'linear' | 'fungsi'>('linear');
  // Balance scale (2x + 4 = 12 -> x = 4)
  const [xValScale, setXValScale] = useState<number>(4);
  // Function machine f(x) = 2x + 5
  const [funcXInput, setFuncXInput] = useState<number>(3);

  // ==========================================
  // 3. GEOMETRI & PENGUKURAN STATE
  // ==========================================
  const [geometriSubTab, setGeometriSubTab] = useState<'objek' | 'transformasi' | 'pengukuran'>('objek');
  const [selectedShape, setSelectedShape] = useState<'cube' | 'prism' | 'sphere'>('cube');
  const [wireframeMode, setWireframeMode] = useState<boolean>(true);
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

  // Helper calculation functions for Trigonometri
  const getTrigValues = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const tan = Math.abs(cos) < 0.0001 ? Infinity : Math.tan(rad);

    // Standard right triangle sides (hypotenuse = 1)
    const miring = 1.0;
    const depan = Math.abs(sin);
    const samping = Math.abs(cos);

    return {
      sin: sin.toFixed(3),
      cos: cos.toFixed(3),
      tan: isFinite(tan) ? tan.toFixed(3) : 'Tak Hingga',
      depan: depan.toFixed(3),
      samping: samping.toFixed(3),
      miring: miring.toFixed(1),
    };
  };

  const trigVals = getTrigValues(trigAngle);

  // Roll Dice Simulation
  const handleRollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const randDice = Math.floor(Math.random() * 6) + 1;
      const randCoin = Math.random() > 0.5 ? 'GARUDA' : 'ANGKA';
      setDiceVal(randDice);
      setCoinVal(randCoin);
      setIsRolling(false);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full pb-16 font-sans">
      {/* HEADER BANNER */}
      <section className="px-margin-mobile pt-space-sm pb-space-md flex flex-col gap-space-sm">
        <div className="p-space-lg rounded-2xl bg-gradient-to-br from-[#0a2540] via-[#004d40] to-[#006b5c] text-white shadow-xl relative overflow-hidden border border-white/10 backdrop-blur-xl">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#00E676]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00E676] to-[#00B0FF] text-black flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-xl">
                📐
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#00E676] uppercase tracking-wider font-extrabold">
                    Neo-Clean Glassmorphism 3D
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B0FF] animate-pulse"></span>
                  <span className="text-[11px] text-white/70">Fase F+ (Kelas XII)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  Modul Interaktif 5 Domain Matematika
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[#00E676] text-xs font-bold border border-[#00E676]/30">
                ⚡ 100% Interaktif
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 CATEGORY TABS (NEON GLOW NAVIGATOR) */}
      <section className="sticky top-16 z-30 bg-surface/90 dark:bg-surface-container-lowest/90 backdrop-blur-xl py-3 px-margin-mobile border-b border-outline-variant/20 shadow-sm">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {/* BILANGAN */}
          <button
            onClick={() => setSelectedCategory('bilangan')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'bilangan'
                ? 'bg-gradient-to-r from-[#00E676] to-[#00B0FF] text-black shadow-[0_4px_16px_rgba(0,230,118,0.4)] scale-105'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-base">🔢</span>
            <span>BILANGAN</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs font-bold">85%</span>
          </button>

          {/* ALJABAR */}
          <button
            onClick={() => setSelectedCategory('aljabar')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'aljabar'
                ? 'bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] text-white shadow-[0_4px_16px_rgba(124,77,255,0.4)] scale-105'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-base">➗</span>
            <span>ALJABAR</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">70%</span>
          </button>

          {/* GEOMETRI */}
          <button
            onClick={() => setSelectedCategory('geometri')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'geometri'
                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] text-black shadow-[0_4px_16px_rgba(255,109,0,0.4)] scale-105'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-base">📐</span>
            <span>GEOMETRI & PENGUKURAN</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs font-bold">60%</span>
          </button>

          {/* TRIGONOMETRI */}
          <button
            onClick={() => setSelectedCategory('trigonometri')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'trigonometri'
                ? 'bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-black shadow-[0_4px_16px_rgba(0,229,255,0.4)] scale-105'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-base">📐</span>
            <span>TRIGONOMETRI</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs font-bold">45%</span>
          </button>

          {/* DATA & PELUANG */}
          <button
            onClick={() => setSelectedCategory('peluang')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'peluang'
                ? 'bg-gradient-to-r from-[#FF4081] to-[#FFEA00] text-black shadow-[0_4px_16px_rgba(255,64,129,0.4)] scale-105'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-base">📊</span>
            <span>DATA & PELUANG</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs font-bold">90%</span>
          </button>
        </div>
      </section>

      {/* DYNAMIC CONTENT PER CATEGORY */}
      <div className="px-margin-mobile flex flex-col gap-space-lg mt-space-md">

        {/* ============================================================== */}
        {/* 1. KATEGORI BILANGAN (Emerald Green & Electric Cyan) */}
        {/* ============================================================== */}
        {selectedCategory === 'bilangan' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            {/* Header Status Card */}
            <div className="p- space-md p-5 rounded-2xl bg-gradient-to-br from-[#004d40]/80 via-[#006b5c]/60 to-[#0a2540]/80 border border-[#00E676]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-extrabold border border-[#00E676]/40">
                  🟢 Level: Sedang
                </span>
                <span className="text-xs text-[#00B0FF] font-bold">Progress: 85% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                🔢 Grid Numerik & Konverter Basis Bilangan Digital
              </h3>
              <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-[#00E676] to-[#00B0FF] h-full rounded-full w-[85%] transition-all duration-500"></div>
              </div>
            </div>

            {/* Interactive Base Converter Widget */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-[#00E676] tracking-wider">
                  ⚡ Simulator Basis Bilangan (Base Converter 3D)
                </span>
                <span className="text-[11px] text-on-surface-variant">Real-Time Input</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface">Uji Angka Desimal (Base 10):</label>
                <input
                  type="number"
                  value={decInput}
                  onChange={(e) => setDecInput(parseInt(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-surface-container text-on-surface font-mono font-bold text-lg border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#00E676]"
                />
              </div>

              {/* Dynamic Base Displays */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* BINARY */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00E676]/10 to-transparent border border-[#00E676]/30 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-[#00E676] uppercase">Biner (Base 2):</span>
                  <span className="font-mono text-base font-extrabold text-on-surface break-all">
                    {decInput.toString(2)}₂
                  </span>
                </div>
                {/* HEXADECIMAL */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#00B0FF]/10 to-transparent border border-[#00B0FF]/30 flex flex-col gap-1">
                  <span className="text-[11px] font-extrabold text-[#00B0FF] uppercase">Heksadesimal (Base 16):</span>
                  <span className="font-mono text-base font-extrabold text-on-surface break-all">
                    0x{decInput.toString(16).toUpperCase()}₁₆
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Exponential Bunga Majemuk Calculator */}
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
        {/* 2. KATEGORI ALJABAR (Deep Violet & Electric Purple) */}
        {/* ============================================================== */}
        {selectedCategory === 'aljabar' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            {/* Header Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2a0845]/90 via-[#6441a5]/70 to-[#7C4DFF]/50 border border-[#D500F9]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#D500F9]/20 text-[#D500F9] text-xs font-extrabold border border-[#D500F9]/40">
                  🔴 Level: HOTS / Sedang
                </span>
                <span className="text-xs text-[#7C4DFF] font-bold">Progress: 70% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                ➗ Timbangan Digital Linear & Mesin Input-Output Fungsi
              </h3>
              <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] h-full rounded-full w-[70%] transition-all duration-500"></div>
              </div>
            </div>

            {/* Sub-Tab Selector Aljabar */}
            <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
              <button
                onClick={() => setAljabarSubTab('linear')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  aljabarSubTab === 'linear'
                    ? 'bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] text-white shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                a. Timbangan Linear (2x + 4 = 12)
              </button>
              <button
                onClick={() => setAljabarSubTab('fungsi')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  aljabarSubTab === 'fungsi'
                    ? 'bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] text-white shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                b. Mesin Fungsi f(x) = 2x + 5
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

                {/* Balance Scale Visual Widget */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#7C4DFF]/15 to-transparent border border-[#7C4DFF]/30 flex flex-col items-center gap-4">
                  <div className="flex items-center justify-between w-full max-w-md">
                    {/* Left Pan */}
                    <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-surface-container border border-[#7C4DFF]/40 shadow-inner">
                      <span className="text-xs font-bold text-on-surface">Sisi Kiri</span>
                      <span className="font-mono text-lg font-extrabold text-[#D500F9]">
                        2({xValScale}) + 4 = {2 * xValScale + 4}
                      </span>
                    </div>

                    {/* Scale Pivot Icon */}
                    <div className={`text-3xl transition-transform duration-300 ${xValScale === 4 ? 'rotate-0' : xValScale < 4 ? '-rotate-12' : 'rotate-12'}`}>
                      ⚖️
                    </div>

                    {/* Right Pan */}
                    <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-surface-container border border-[#7C4DFF]/40 shadow-inner">
                      <span className="text-xs font-bold text-on-surface">Sisi Kanan</span>
                      <span className="font-mono text-lg font-extrabold text-[#7C4DFF]">
                        12
                      </span>
                    </div>
                  </div>

                  {/* Slider Control */}
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

                  {/* Status Indicator */}
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

            {/* SUB-MATERIAL B: MESIN FUNGSI INPUT-OUTPUT */}
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
                    {/* INPUT DOMAIN */}
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

                    {/* MACHINE PROCESS */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7C4DFF] to-[#D500F9] text-white font-mono font-extrabold text-sm text-center shadow-lg">
                      f(x) = 2({funcXInput}) + 5
                    </div>

                    <span className="text-2xl text-[#D500F9]">➔</span>

                    {/* OUTPUT KODOMAIN */}
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
        {/* 3. KATEGORI GEOMETRI DAN PENGUKURAN (Sunset Orange & Warm Amber) */}
        {/* ============================================================== */}
        {selectedCategory === 'geometri' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            {/* Header Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#4a1c00]/90 via-[#8a3300]/70 to-[#FF6D00]/50 border border-[#FFAB00]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#FFAB00]/20 text-[#FFAB00] text-xs font-extrabold border border-[#FFAB00]/40">
                  🟢 Level: Sedang
                </span>
                <span className="text-xs text-[#FF6D00] font-bold">Progress: 60% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                📐 Viewer Objek 3D 360°, Vektor Transformasi, & Meteran Cairan
              </h3>
              <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] h-full rounded-full w-[60%] transition-all duration-500"></div>
              </div>
            </div>

            {/* Sub-Tab Selector Geometri */}
            <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
              <button
                onClick={() => setGeometriSubTab('objek')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  geometriSubTab === 'objek'
                    ? 'bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                a. Objek 3D 360°
              </button>
              <button
                onClick={() => setGeometriSubTab('transformasi')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  geometriSubTab === 'transformasi'
                    ? 'bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                b. Transformasi Vektor
              </button>
              <button
                onClick={() => setGeometriSubTab('pengukuran')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  geometriSubTab === 'pengukuran'
                    ? 'bg-gradient-to-r from-[#FF6D00] to-[#FFAB00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                c. Gauge Pengukuran
              </button>
            </div>

            {/* SUB-MATERIAL A: OBJEK GEOMETRI 3D 360 */}
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

                {/* 3D Visual Box Simulation */}
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

            {/* SUB-MATERIAL C: GAUGE PENGUKURAN */}
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
        {/* 4. KATEGORI TRIGONOMETRI (Glowing Cyan & Wave Blue) */}
        {/* ============================================================== */}
        {selectedCategory === 'trigonometri' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            {/* Header Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#002b4d]/90 via-[#005288]/70 to-[#00E5FF]/40 border border-[#00E5FF]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-extrabold border border-[#00E5FF]/40">
                  🔴 Level: Sedang / HOTS
                </span>
                <span className="text-xs text-[#2979FF] font-bold">Progress: 45% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                📐 Lingkaran Satuan (Unit Circle 3D) & Gelombang Sinus
              </h3>
              <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-[#00E5FF] to-[#2979FF] h-full rounded-full w-[45%] transition-all duration-500"></div>
              </div>
            </div>

            {/* Interactive Unit Circle & Trigonometric Ratios */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
              <span className="text-xs font-extrabold uppercase text-[#00E5FF] tracking-wider">
                ⭕ Unit Circle & Rasio Sudut Istimewa (θ)
              </span>

              {/* Quick Angle Selector Buttons */}
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

              {/* Trigonometric Values Display Table */}
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

              {/* Side Ratios Display */}
              <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between font-mono text-xs text-on-surface">
                <span>Sisi Depan = <strong>{trigVals.depan}</strong></span>
                <span>Samping = <strong>{trigVals.samping}</strong></span>
                <span>Miring = <strong>{trigVals.miring}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. KATEGORI DATA DAN PELUANG (Coral Pink & Neon Yellow) */}
        {/* ============================================================== */}
        {selectedCategory === 'peluang' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            {/* Header Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#4a0027]/90 via-[#8a0045]/70 to-[#FF4081]/40 border border-[#FFEA00]/30 backdrop-blur-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#FFEA00]/20 text-[#FFEA00] text-xs font-extrabold border border-[#FFEA00]/40">
                  🟢 Level: Mudah
                </span>
                <span className="text-xs text-[#FF4081] font-bold">Progress: 90% Selesai</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                📊 Dashboard Statistik 3D & Simulator Peluang (Dice/Coin Flip)
              </h3>
              <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-[#FF4081] to-[#FFEA00] h-full rounded-full w-[90%] transition-all duration-500"></div>
              </div>
            </div>

            {/* Sub-Tab Selector Data & Peluang */}
            <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
              <button
                onClick={() => setDataSubTab('data')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  dataSubTab === 'data'
                    ? 'bg-gradient-to-r from-[#FF4081] to-[#FFEA00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                a. Data & Grafik 3D
              </button>
              <button
                onClick={() => setDataSubTab('peluang')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  dataSubTab === 'peluang'
                    ? 'bg-gradient-to-r from-[#FF4081] to-[#FFEA00] text-black shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                b. Simulator Peluang Dadu/Koin
              </button>
            </div>

            {/* SUB-MATERIAL A: DATA & STATISTIK */}
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

                {/* 3D Bar Chart Visual Mockup */}
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

            {/* SUB-MATERIAL B: SIMULATOR PELUANG */}
            {dataSubTab === 'peluang' && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase text-[#FFEA00] tracking-wider">
                  🎲 Simulator Peluang 3D Melayang & Flip Koin
                </span>

                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#FF4081]/20 to-transparent border border-[#FF4081]/30 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-6">
                    {/* Dadu */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4081] to-[#FFEA00] text-black font-extrabold text-3xl flex items-center justify-center shadow-xl ${isRolling ? 'animate-spin' : ''}`}>
                      {diceVal}
                    </div>

                    {/* Koin */}
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
