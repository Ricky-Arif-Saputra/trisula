import React, { useState } from 'react';

interface LatihanScreenProps {
  onClaimXp?: (amount: number) => void;
  onNavigateToSimulasi?: () => void;
}

export const LatihanScreen: React.FC<LatihanScreenProps> = ({
  onClaimXp,
  onNavigateToSimulasi,
}) => {
  const [activeTab, setActiveTab] = useState<'latihan' | 'virtualLab'>('latihan');

  // Simulation Sliders State
  const [distD, setDistD] = useState<number>(40);
  const [angleAlpha, setAngleAlpha] = useState<number>(35);
  const [angleBeta, setAngleBeta] = useState<number>(50);

  // Model Selection
  const [selectedModelOption, setSelectedModelOption] = useState<number>(1);
  const [showModelFeedback, setShowModelFeedback] = useState<boolean>(false);

  // Reflection Selection
  const [selectedReflection, setSelectedReflection] = useState<'A' | 'B' | null>(null);

  // Tutor AI Message
  const [aiMessage, setAiMessage] = useState<string>(
    'Perhatikan bahwa dasar menara tidak dapat kamu ukur secara manual karena lereng jurang. Kunci RME: Buatlah persamaan tinggi menara (h) dari dua sudut pandang berbeda, lalu eliminasikan variabel jarak tersembunyi (x)!'
  );
  const [isClaimed, setIsClaimed] = useState<boolean>(false);

  // Calculate live geometry
  const radA = (angleAlpha * Math.PI) / 180;
  const radB = (angleBeta * Math.PI) / 180;
  const tanA = Math.tan(radA);
  const tanB = Math.tan(radB);

  let rawX = (distD * tanA) / (tanB - tanA);
  if (rawX <= 0 || !isFinite(rawX)) rawX = 52.36;
  const rawH = rawX * tanB;
  const calculatedH = isFinite(rawH) ? rawH : 62.4;
  const totalH = calculatedH + 1.6;

  // Visual SVG coordinates mapping
  // Base line at y = 130 (eye level), ground at y = 149
  // Tower located at x = 300
  // Position of A & B mapped visually based on sliders:
  const posA = Math.max(30, Math.min(100, 300 - (rawX + distD) * 1.8));
  const posB = Math.max(120, Math.min(230, 300 - rawX * 1.8));
  // Tower top mapped visually:
  const towerTopY = Math.max(15, Math.min(80, 130 - calculatedH * 1.6));

  const handleValidateModel = () => {
    setShowModelFeedback(true);
  };

  const handleAskAIHint = () => {
    setAiMessage(
      "💡 Tips Pemodelan: Nyatakan 'x' dalam fungsi 'h': dari Titik B didapat x = h / tan(50°). Substitusikan ini ke persamaan pertama tan(35°) = h / (h/tan(50°) + 40)!"
    );
  };

  const handleSimulateAngles = () => {
    setDistD(50);
    setAngleAlpha(30);
    setAngleBeta(60);
    setAiMessage(
      '⚡ Simulasi Sudut Khusus Diaktifkan! Sudut 30° dan 60° memudahkan kita melihat rasio segitiga istimewa tanpa kalkulator rumit.'
    );
  };

  const handleSubmitAnswer = () => {
    if (isClaimed) return;
    setIsClaimed(true);
    setAiMessage(
      '🎉 Luar biasa! Refleksi realistik Anda tepat: Ketinggian 64 meter sangat masuk akal untuk menara seluler 16 lantai. +120 XP telah ditambahkan ke profil Anda!'
    );
    if (onClaimXp) {
      onClaimXp(120);
    }
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-space-2xl space-y-space-md">
      {/* Segmented Control Bar */}
      <div className="w-full bg-surface-container-high p-space-xs rounded-xl flex items-center shadow-sm">
        <button
          className={`flex-1 py-space-sm px-space-md rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-space-xs cursor-pointer ${
            activeTab === 'latihan'
              ? 'bg-surface-container-lowest text-primary dark:text-primary-fixed shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('latihan')}
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <span>Latihan RME</span>
        </button>
        <button
          className={`flex-1 py-space-sm px-space-md rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-space-xs cursor-pointer ${
            activeTab === 'virtualLab'
              ? 'bg-surface-container-lowest text-primary dark:text-primary-fixed shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => {
            if (onNavigateToSimulasi) {
              onNavigateToSimulasi();
            } else {
              setActiveTab('virtualLab');
              handleSimulateAngles();
            }
          }}
        >
          <span className="material-symbols-outlined text-[18px]">science</span>
          <span>Virtual Lab</span>
        </button>
      </div>

      {/* Real-World Case Context Card */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <div className="flex items-center justify-between gap-space-sm flex-wrap">
          <div className="flex items-center gap-space-xs bg-secondary-container text-on-secondary-container px-space-sm py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px]">school</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Trigonometri Kelas XII
            </span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container text-on-surface-variant px-space-sm py-1 rounded-full">
            <span className="material-symbols-outlined text-on-tertiary-container text-[15px] fill-1">
              bolt
            </span>
            <span className="text-xs font-bold text-on-surface">+120 XP</span>
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg text-on-surface font-bold leading-tight">
            Menghitung Tinggi Menara Pemancar dengan Klinometer Dua Titik Pengamatan
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Studi lapangan pemancar telekomunikasi 5G di area perbukitan tanpa akses langsung ke
            dasar pondasi.
          </p>
        </div>

        {/* RME 3-Step Flow Stepper */}
        <div className="pt-space-xs">
          <div className="grid grid-cols-3 gap-space-xs">
            {/* Step 1 Done */}
            <div className="bg-surface-container-high rounded-lg p-space-xs flex flex-col items-center text-center">
              <div className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[13px]">done</span>
              </div>
              <span className="text-[10px] text-on-surface-variant line-clamp-1 font-bold">
                1. Konteks Real
              </span>
              <span className="text-[9px] text-secondary font-bold">Selesai</span>
            </div>

            {/* Step 2 Active */}
            <div className="bg-primary-container text-on-primary rounded-lg p-space-xs flex flex-col items-center text-center shadow-md">
              <div className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-1 font-bold text-[11px]">
                2
              </div>
              <span className="text-[10px] text-on-primary line-clamp-1 font-bold">
                2. Pemodelan
              </span>
              <span className="text-[9px] text-secondary-fixed-dim font-bold">Sedang Aktif</span>
            </div>

            {/* Step 3 Pending */}
            <div className="bg-surface-container rounded-lg p-space-xs flex flex-col items-center text-center opacity-85">
              <div className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center mb-1 font-bold text-[11px]">
                3
              </div>
              <span className="text-[10px] text-on-surface-variant line-clamp-1 font-bold">
                3. Refleksi
              </span>
              <span className="text-[9px] text-outline font-bold">Menunggu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Graphic / Virtual Simulation Block */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              architecture
            </span>
            <h3 className="text-sm font-bold text-on-surface">Diagram Elevasi Klinometer</h3>
          </div>
          <span className="text-[11px] bg-surface-container px-space-xs py-0.5 rounded text-on-surface-variant font-mono">
            Live RME Engine
          </span>
        </div>

        {/* Live SVG Visualizer */}
        <div className="w-full bg-surface-container rounded-lg p-space-sm relative overflow-hidden flex flex-col items-center justify-center">
          <svg className="w-full h-44 text-on-surface overflow-visible" viewBox="0 0 360 170">
            {/* Ground grid lines */}
            <line
              x1="20"
              y1="145"
              x2="340"
              y2="145"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity="0.25"
            />
            <line
              x1="20"
              y1="149"
              x2="340"
              y2="149"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.5"
            />

            {/* Observer Eye Level line (1.6m) */}
            <line
              x1="30"
              y1="130"
              x2="300"
              y2="130"
              stroke="#006b5c"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.4"
            />

            {/* Tower Structure */}
            <rect
              x="296"
              y={towerTopY}
              width="8"
              height={149 - towerTopY}
              rx="2"
              fill="#000f22"
              opacity="0.85"
            />
            <polygon
              points={`296,${towerTopY} 300,${towerTopY - 15} 304,${towerTopY}`}
              fill="#c87900"
            />
            <circle cx="300" cy={towerTopY - 15} r="3.5" fill="#ba1a1a" />

            {/* Observation Line Point A (alpha) */}
            <line
              x1={posA}
              y1="130"
              x2="300"
              y2={towerTopY}
              stroke="#768dad"
              strokeWidth="2"
            />

            {/* Observation Line Point B (beta) */}
            <line
              x1={posB}
              y1="130"
              x2="300"
              y2={towerTopY}
              stroke="#006b5c"
              strokeWidth="2.5"
            />

            {/* Observers Markers */}
            <circle cx={posA} cy="130" r="4.5" fill="#000f22" />
            <text x={posA - 4} y="122" fontSize="9" fontWeight="700" fill="#000f22">
              A
            </text>
            <text x={posA + 10} y="123" fontSize="8.5" fontWeight="700" fill="#314865">
              α={angleAlpha}°
            </text>

            <circle cx={posB} cy="130" r="4.5" fill="#006b5c" />
            <text x={posB - 4} y="122" fontSize="9" fontWeight="700" fill="#006b5c">
              B
            </text>
            <text x={posB + 8} y="118" fontSize="8.5" fontWeight="700" fill="#006b5c">
              β={angleBeta}°
            </text>

            {/* Baseline Indicators */}
            <line x1={posA} y1="158" x2={posB} y2="158" stroke="#314865" strokeWidth="1.5" />
            <text
              x={(posA + posB) / 2 - 18}
              y="155"
              fontSize="8.5"
              fontWeight="700"
              fill="#314865"
            >
              d={distD}m
            </text>

            <line
              x1={posB}
              y1="158"
              x2="300"
              y2="158"
              stroke="#74777e"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <text
              x={(posB + 300) / 2 - 14}
              y="155"
              fontSize="8.5"
              fontWeight="600"
              fill="#43474d"
            >
              x≈{rawX.toFixed(1)}m
            </text>

            {/* Height Bracket */}
            <line
              x1="316"
              y1={towerTopY}
              x2="316"
              y2="130"
              stroke="#006b5c"
              strokeWidth="2"
            />
            <text x="322" y={(towerTopY + 130) / 2} fontSize="9.5" fontWeight="800" fill="#006b5c">
              h≈{calculatedH.toFixed(1)}m
            </text>

            {/* Observer Eye Height Indicator */}
            <line x1="316" y1="130" x2="316" y2="149" stroke="#c87900" strokeWidth="1.5" />
            <text x="322" y="142" fontSize="8" fontWeight="700" fill="#c87900">
              1.6m
            </text>
          </svg>

          {/* Live Calculation HUD inside Visualizer */}
          <div className="w-full flex items-center justify-between bg-surface-container-lowest/90 dark:bg-surface-container-lowest backdrop-blur-sm p-space-xs rounded-lg mt-space-xs border border-outline-variant/20">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              <span className="text-xs text-on-surface-variant font-mono">
                Tinggi relatif segitiga (h):
              </span>
            </div>
            <span className="text-sm sm:text-base font-bold text-secondary">
              {calculatedH.toFixed(2)} m
            </span>
          </div>
        </div>

        {/* Sliders to Adjust Values Dynamically */}
        <div className="grid grid-cols-1 gap-space-sm bg-surface-container-low p-space-sm rounded-lg">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface">Jarak Antar Titik Pengamatan (d)</span>
              <span className="font-bold text-primary dark:text-primary-fixed">{distD} m</span>
            </div>
            <input
              className="w-full accent-primary dark:accent-secondary h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
              max={80}
              min={20}
              type="range"
              value={distD}
              onChange={(e) => setDistD(parseFloat(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface font-medium">Sudut α (Titik A)</span>
                <span className="font-bold text-primary-container dark:text-primary-fixed">
                  {angleAlpha}°
                </span>
              </div>
              <input
                className="w-full accent-primary-container h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
                max={45}
                min={20}
                type="range"
                value={angleAlpha}
                onChange={(e) => setAngleAlpha(parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface font-medium">Sudut β (Titik B)</span>
                <span className="font-bold text-secondary">{angleBeta}°</span>
              </div>
              <input
                className="w-full accent-secondary h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
                max={75}
                min={46}
                type="range"
                value={angleBeta}
                onChange={(e) => setAngleBeta(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RME Guided Workspace: Step-by-Step Problem Solving */}
      <div className="w-full space-y-space-md">
        {/* RME STEP 1: Real-World Extraction */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px] fill-1">
                check_circle
              </span>
              <h4 className="text-sm font-bold text-on-surface">Tahap 1: Ekstraksi Data Nyata</h4>
            </div>
            <span className="text-xs text-secondary bg-secondary-container/30 px-space-xs py-0.5 rounded font-bold">
              Terverifikasi
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Variabel teridentifikasi dari pengukuran lapangan klinometer manual siswa:
          </p>
          <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
            <div className="bg-surface-container p-space-xs rounded-lg text-center">
              <span className="text-[11px] text-on-surface-variant block">Jarak A ke B</span>
              <span className="text-xs sm:text-sm font-bold text-on-surface">
                d = {distD} meter
              </span>
            </div>
            <div className="bg-surface-container p-space-xs rounded-lg text-center">
              <span className="text-[11px] text-on-surface-variant block">
                Tinggi Pandang Mata (t_0)
              </span>
              <span className="text-xs sm:text-sm font-bold text-on-surface">1.60 meter</span>
            </div>
          </div>
        </div>

        {/* RME STEP 2: Mathematical Modeling (ACTIVE) */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-md space-y-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
              <h4 className="text-sm font-bold text-on-surface">
                Tahap 2: Pemodelan Matematis (Horisontal)
              </h4>
            </div>
            <span className="text-xs bg-secondary-container text-on-secondary-container px-space-xs py-0.5 rounded font-bold">
              Fokus Sesi
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Hubungkan hubungan trigonometri tangen pada △TAC dan △TBC terhadap variabel jarak dasar
            menara (x):
          </p>

          {/* Equation Builder Blocks */}
          <div className="space-y-space-xs">
            <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between gap-space-xs font-mono text-xs sm:text-sm">
              <div className="font-semibold text-on-surface">
                tan({angleAlpha}°) ={' '}
                <span className="inline-block border-b-2 border-on-surface px-1">h</span> / (x +{' '}
                {distD})
              </div>
              <span className="material-symbols-outlined text-secondary text-[18px]">
                verified
              </span>
            </div>

            {/* Equation B selection */}
            <div className="bg-surface-container-low p-space-sm rounded-lg space-y-space-xs">
              <span className="text-xs font-bold text-on-surface block">
                Pilih formulasi rasio di Titik B (β = {angleBeta}°):
              </span>
              <div className="space-y-1.5">
                <label className="flex items-center gap-space-sm p-space-xs bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors">
                  <input
                    type="radio"
                    name="rme_model"
                    checked={selectedModelOption === 1}
                    onChange={() => setSelectedModelOption(1)}
                    className="w-4 h-4 accent-secondary cursor-pointer"
                  />
                  <span className="font-mono text-xs text-on-surface">
                    tan({angleBeta}°) = h / x ➔ h = x · tan({angleBeta}°)
                  </span>
                </label>
                <label className="flex items-center gap-space-sm p-space-xs bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors">
                  <input
                    type="radio"
                    name="rme_model"
                    checked={selectedModelOption === 2}
                    onChange={() => setSelectedModelOption(2)}
                    className="w-4 h-4 accent-secondary cursor-pointer"
                  />
                  <span className="font-mono text-xs text-on-surface">
                    sin({angleBeta}°) = h / (x + {distD})
                  </span>
                </label>
                <label className="flex items-center gap-space-sm p-space-xs bg-surface-container-lowest rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors">
                  <input
                    type="radio"
                    name="rme_model"
                    checked={selectedModelOption === 3}
                    onChange={() => setSelectedModelOption(3)}
                    className="w-4 h-4 accent-secondary cursor-pointer"
                  />
                  <span className="font-mono text-xs text-on-surface">
                    tan({angleBeta}°) = (x + {distD}) / h
                  </span>
                </label>
              </div>
            </div>
          </div>

          <button
            className="w-full h-12 bg-primary-container text-on-primary font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-space-xs transition-transform active:scale-[0.98] shadow-sm hover:opacity-90 cursor-pointer"
            onClick={handleValidateModel}
          >
            <span className="material-symbols-outlined text-[18px]">rule</span>
            <span>Validasi & Samakan Persamaan h</span>
          </button>

          {showModelFeedback && (
            <div className="p-space-xs rounded-lg bg-secondary-container text-on-secondary-container text-xs font-medium flex items-center gap-space-xs animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              <span>
                Model Terbukti Tepat: x = {distD} · tan({angleAlpha}°) / (tan({angleBeta}°) - tan(
                {angleAlpha}°)) ≈ {rawX.toFixed(2)} m
              </span>
            </div>
          )}
        </div>

        {/* RME STEP 3: Real Solution & Grounded Reflection */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">
                psychology_alt
              </span>
              <h4 className="text-sm font-bold text-on-surface">Tahap 3: Solusi & Refleksi Kritis</h4>
            </div>
            <span className="text-xs bg-tertiary-fixed text-on-tertiary-fixed font-bold px-space-xs py-0.5 rounded">
              Evaluasi Realita
            </span>
          </div>

          {/* Result Card */}
          <div className="bg-surface-container-high p-space-sm rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant block">Hasil Tinggi Segitiga (h)</span>
              <span className="text-xl sm:text-2xl text-primary dark:text-primary-fixed font-bold">
                {calculatedH.toFixed(2)} m
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-on-surface-variant block">
                Tinggi Total Menara Sebenarnya
              </span>
              <span className="text-base sm:text-lg text-secondary font-bold">
                {totalH.toFixed(2)} m
              </span>
              <span className="text-[10px] text-outline block">(h + tinggi mata 1.6 m)</span>
            </div>
          </div>

          {/* Reflection Input Question */}
          <div className="bg-surface-container-low p-space-sm rounded-lg space-y-space-xs">
            <label className="text-xs sm:text-sm text-on-surface block font-bold">
              Refleksi Kontekstual:
            </label>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Jika 1 lantai gedung standar memiliki tinggi rata-rata 4 meter, apakah hasil
              perhitungan ~{Math.round(totalH)} meter logis untuk menara telekomunikasi kelas 15-16
              lantai?
            </p>
            <div className="grid grid-cols-2 gap-space-xs pt-1">
              <button
                className={`p-space-xs text-left rounded-lg text-xs transition-all cursor-pointer ${
                  selectedReflection === 'A'
                    ? 'bg-secondary-container ring-2 ring-secondary text-on-secondary-container'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-secondary-container/30'
                }`}
                onClick={() => setSelectedReflection('A')}
              >
                <span className="font-bold block text-secondary">A. Logis & Relevan</span>
                <span className="text-[11px]">
                  ~64m / 4m ≈ 16 lantai, selaras dengan konstruksi BTS makro kota.
                </span>
              </button>
              <button
                className={`p-space-xs text-left rounded-lg text-xs transition-all cursor-pointer ${
                  selectedReflection === 'B'
                    ? 'bg-error-container ring-2 ring-error text-on-error-container'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-secondary-container/30'
                }`}
                onClick={() => setSelectedReflection('B')}
              >
                <span className="font-bold block text-error">B. Tidak Logis</span>
                <span className="text-[11px]">
                  Tinggi pandang mata pengamat 1.6m tidak seharusnya dijumlahkan.
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Pedagogical Assistant Card (Trisula Tutor AI) */}
      <div className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl p-space-md shadow-md space-y-space-sm relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-space-xs">
            <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            </div>
            <span className="text-sm font-bold text-on-primary">Trisula Tutor AI</span>
          </div>
          <span className="text-xs bg-on-primary/10 text-secondary-fixed px-space-xs py-0.5 rounded">
            RME Intuition Coach
          </span>
        </div>

        {/* AI Conversational Prompt */}
        <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-lg p-space-sm text-on-primary space-y-1 relative z-10">
          <p className="text-xs text-inverse-on-surface leading-relaxed">{aiMessage}</p>
        </div>

        {/* Action Prompt Chips */}
        <div className="flex flex-wrap gap-space-xs relative z-10 pt-1">
          <button
            className="h-9 px-space-sm rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-primary text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            onClick={handleAskAIHint}
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">
              lightbulb
            </span>
            <span>Petunjuk Tahap 2</span>
          </button>
          <button
            className="h-9 px-space-sm rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-primary text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            onClick={handleSimulateAngles}
          >
            <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
              autoplay
            </span>
            <span>Uji Variasi Sudut Ekstrem</span>
          </button>
        </div>
      </div>

      {/* Primary Bottom Action Bar */}
      <div className="w-full pt-space-xs space-y-space-xs">
        <button
          className={`w-full h-12 text-on-secondary font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all cursor-pointer ${
            isClaimed
              ? 'bg-secondary/70 opacity-90 cursor-default'
              : 'bg-secondary hover:bg-secondary/90'
          }`}
          onClick={handleSubmitAnswer}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isClaimed ? 'check_circle' : 'military_tech'}
          </span>
          <span>{isClaimed ? 'Jawaban Terkirim (+120 XP Diklaim)' : 'Kirim Jawaban & Klaim +120 XP'}</span>
        </button>
        <div className="text-center">
          <span className="text-[11px] text-on-surface-variant">
            Kurikulum Merdeka • Sesi Terakreditasi Mandiri
          </span>
        </div>
      </div>
    </div>
  );
};
