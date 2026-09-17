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

  // Bilangan state
  const [selectedFormula, setSelectedFormula] = useState<'exponential' | 'linear' | null>(null);
  const [nInput, setNInput] = useState<string>('');
  const [bilanganFeedback, setBilanganFeedback] = useState<{
    text: string;
    type: 'idle' | 'success' | 'warning' | 'error';
  }>({
    text: 'Silakan pilih rumus eksponensial dan masukkan kalkulasi tahun untuk melihat evaluasi realistik dari model keuangan siswa.',
    type: 'idle',
  });
  const [showHintBilangan, setShowHintBilangan] = useState<boolean>(false);

  // Aljabar state
  const [selectedCornerPoint, setSelectedCornerPoint] = useState<string | null>(null);
  const [aljabarFeedback, setAljabarFeedback] = useState<string>(
    'Pilihlah salah satu kombinasi titik uji untuk menganalisis risiko bisnis (misalnya pasar yang menuntut variasi produk bukan hanya satu model).'
  );

  // Scratchpad state
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchText, setScratchText] = useState<string>('');

  const insertSymbol = (sym: string) => {
    setScratchText((prev) => prev + sym);
  };

  // Bilangan solver logic
  const handleSelectFormula = (type: 'exponential' | 'linear') => {
    setSelectedFormula(type);
    if (type === 'exponential') {
      setBilanganFeedback({
        text: 'Model eksponensial tepat! Tabungan ini mendapatkan bunga berbunga secara majemuk, bukan penambahan tetap.',
        type: 'success',
      });
    } else {
      setBilanganFeedback({
        text: 'Perhatian: Bunga tunggal berasumsi bahwa nilai pokok tabungan tidak mengakumulasi bunga di tahun berikutnya. Pilih model majemuk.',
        type: 'error',
      });
    }
  };

  const handleValidateBilangan = () => {
    if (selectedFormula !== 'exponential') {
      setBilanganFeedback({
        text: 'Langkah 1 belum tuntas: Tentukan terlebih dahulu rumus pemodelan matematika yang valid.',
        type: 'error',
      });
      return;
    }
    const val = parseFloat(nInput);
    if (isNaN(val)) {
      setBilanganFeedback({
        text: 'Silakan masukkan perkiraan nilai n (tahun) pada kolom input Langkah 2.',
        type: 'warning',
      });
      return;
    }

    if (val >= 6.8 && val <= 7.1) {
      setBilanganFeedback({
        text: 'Luar Biasa! Secara teoritis n ≈ 6,96 tahun. Secara realistik perbankan, bunga dicairkan periodik tahunan sehingga dibutuhkan tepat 7 tahun agar saldo mencapai minimal Rp15.036.000.',
        type: 'success',
      });
    } else if (val > 7.1) {
      setBilanganFeedback({
        text: `Estimasi ${val} tahun memang menghasilkan lebih dari Rp15 juta, namun siswa mencari waktu tercepat (minimum) yaitu tepat pada tahun ke-7.`,
        type: 'warning',
      });
    } else {
      const estimated = Math.round(10000000 * Math.pow(1.06, val)).toLocaleString('id-ID');
      setBilanganFeedback({
        text: `Pada tahun ke-${val}, uang siswa baru bernilai sekitar Rp${estimated}, belum mencapai target Rp15.000.000. Coba kembali!`,
        type: 'warning',
      });
    }
  };

  const handleCornerPoint = (pt: string) => {
    setSelectedCornerPoint(pt);
    if (pt === 'B') {
      setAljabarFeedback(
        'Titik Optimal Terpilih: (18, 8). Memberikan laba maksimal Rp1.800.000 dengan memanfaatkan 100% kapasitas kanvas dan sol karet secara efisien tanpa bahan terbuang.'
      );
    } else if (pt === 'A') {
      setAljabarFeedback(
        'Titik A (0, 20): Laba mencapai Rp1.800.000, namun hanya memproduksi tipe B sehingga meninggalkan sisa sol karet berlebih di gudang UMKM.'
      );
    } else {
      setAljabarFeedback(
        'Titik C (24, 0): Hanya menghasilkan laba Rp1.440.000 (Kurang optimal dibandingkan titik potong B).'
      );
    }
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Hero & Daily Streak Motivation */}
      <section className="px-margin-mobile pt-space-sm pb-space-md flex flex-col gap-space-sm">
        <div className="p-space-md rounded-xl bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-secondary/15 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-secondary-fixed-dim uppercase tracking-wider font-bold">
                    Kurikulum Merdeka XII
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                  <span className="text-xs text-surface-container-highest opacity-90">Fase F+</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold leading-snug">
                  Modul RME Inti Interaktif
                </h2>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 bg-surface-container-lowest/10 px-2.5 py-1 rounded-full text-tertiary-fixed text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">
                  local_fire_department
                </span>
                <span>5 Hari</span>
              </div>
              <span className="text-[10px] text-primary-fixed-dim mt-0.5 font-medium">
                Konsistensi Belajar
              </span>
            </div>
          </div>

          {/* Quick Progress Bar Real-world Milestone */}
          <div className="mt-space-md pt-space-xs relative z-10">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-primary-fixed-dim">Penguasaan 5 Domain Realistis</span>
              <span className="text-secondary-fixed font-bold">60% Tuntas</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-lowest/20 overflow-hidden">
              <div
                className="h-full bg-secondary-fixed rounded-full transition-all duration-500"
                style={{ width: '60%' }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Category Filters (5 Core Strands) */}
      <section className="sticky top-16 z-30 bg-surface/95 dark:bg-surface-container-lowest/95 backdrop-blur-md py-2 px-margin-mobile shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'bilangan'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setSelectedCategory('bilangan')}
          >
            <span className="material-symbols-outlined text-[18px]">percent</span>
            <span>Bilangan</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-secondary text-on-secondary font-bold">
              2/3
            </span>
          </button>

          <button
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'aljabar'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setSelectedCategory('aljabar')}
          >
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
            <span>Aljabar</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant font-bold">
              1/3
            </span>
          </button>

          <button
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'geometri'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setSelectedCategory('geometri')}
          >
            <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
            <span>Geometri</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant font-bold">
              2/3
            </span>
          </button>

          <button
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'trigonometri'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setSelectedCategory('trigonometri')}
          >
            <span className="material-symbols-outlined text-[18px]">architecture</span>
            <span>Trigonometri</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant font-bold">
              0/3
            </span>
          </button>

          <button
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'peluang'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setSelectedCategory('peluang')}
          >
            <span className="material-symbols-outlined text-[18px]">bar_chart</span>
            <span>Data & Peluang</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant font-bold">
              1/3
            </span>
          </button>
        </div>
      </section>

      {/* Dynamic Content Container */}
      <div className="px-margin-mobile flex flex-col gap-space-lg mt-space-md">
        {/* ============================================== */}
        {/* CATEGORY 1: BILANGAN */}
        {/* ============================================== */}
        {selectedCategory === 'bilangan' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            {/* Real-world Context Card */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                  <span>Konteks Realistik 1: Literasi Finansial & Biomedis</span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Bunga & Logaritma
                </span>
              </div>
              <div className="grid grid-cols-1 gap-space-sm mt-1">
                <div className="relative rounded-lg overflow-hidden h-36 bg-surface-container">
                  <img
                    className="w-full h-full object-cover"
                    alt="Indonesian student analyzing financial charts"
                    src={ASSETS.bilanganContext}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/25 to-transparent flex items-end p-space-sm">
                    <p className="text-xs sm:text-sm text-on-primary font-semibold">
                      Simulasi Deposito Perbankan vs. Multiplikasi Koloni Bakteri
                    </p>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Fenomena pertumbuhan majemuk terjadi di ranah riil: saldo tabungan bank
                  syariah/konvensional bertumbuh secara periodik mengikuti suku bunga majemuk, sama
                  persis polanya dengan replikasi sel bakteri di laboratorium mikrobiologi SMA.
                </p>
              </div>
            </div>

            {/* Problem 1: Interactive Workspace Component */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
              {/* Header RME Badge */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">calculate</span>
                  Latihan Mandiri 1 (Bunga Majemuk)
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Bobot: Sedang (HOTS)
                </span>
              </div>

              {/* Problem Statement */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <div className="text-base font-bold text-primary dark:text-primary-fixed">
                  Kapan Nilai Tabungan Mencapai Rp15.000.000?
                </div>
                <p className="text-xs text-on-surface leading-relaxed">
                  Seorang siswa kelas XII menyisihkan uang prestasi sebesar{' '}
                  <strong className="text-primary dark:text-primary-fixed font-semibold">
                    Rp10.000.000
                  </strong>{' '}
                  ke tabungan berjangka dengan bunga majemuk{' '}
                  <strong className="text-primary dark:text-primary-fixed font-semibold">
                    6% per tahun
                  </strong>
                  . Hitung estimasi waktu minimum (dalam tahun bulat) agar nilai akhir tabungan
                  minimal{' '}
                  <strong className="text-primary dark:text-primary-fixed font-semibold">
                    Rp15.000.000
                  </strong>
                  !
                </p>
              </div>

              {/* RME Interactive 3-Phase Stepper Workspace */}
              <div className="flex flex-col gap-space-md bg-surface-container-lowest rounded-lg p-1">
                {/* Stepper Navigator */}
                <div className="flex items-center justify-between px-2 pt-1 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-primary dark:text-primary-fixed">
                      Pemodelan Matematis
                    </span>
                  </div>
                  <div className="text-xs text-secondary font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">touch_app</span> Ketuk
                    Pilihan
                  </div>
                </div>

                {/* Step 1: Horizontal Mathematization */}
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
                  <label className="text-xs text-on-surface-variant font-semibold flex items-center gap-1">
                    <span>Langkah 1: Identifikasi Model Eksponensial Bunga Majemuk</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    <button
                      className={`w-full text-left p-2.5 rounded-lg font-mono text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                        selectedFormula === 'exponential'
                          ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary'
                          : 'bg-surface-container-lowest text-on-surface hover:bg-secondary-container/20'
                      }`}
                      onClick={() => handleSelectFormula('exponential')}
                    >
                      <span>M_n = M_0 · (1 + i)^n</span>
                      {selectedFormula === 'exponential' && (
                        <span className="material-symbols-outlined text-secondary text-[20px]">
                          check_circle
                        </span>
                      )}
                    </button>
                    <button
                      className={`w-full text-left p-2.5 rounded-lg font-mono text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                        selectedFormula === 'linear'
                          ? 'bg-error-container text-on-error-container ring-2 ring-error'
                          : 'bg-surface-container-lowest text-on-surface hover:bg-secondary-container/20'
                      }`}
                      onClick={() => handleSelectFormula('linear')}
                    >
                      <span>M_n = M_0 · (1 + n · i) (Bunga Tunggal)</span>
                      {selectedFormula === 'linear' && (
                        <span className="material-symbols-outlined text-error text-[20px]">
                          cancel
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Step 2: Symbolic Substitution */}
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
                  <label className="text-xs text-on-surface-variant font-semibold">
                    Langkah 2: Substitusi Nilai & Transformasi Logaritma
                  </label>
                  <div className="bg-surface-container-lowest p-3 rounded-lg flex flex-col gap-2 font-mono text-xs text-on-surface">
                    <div className="text-on-surface-variant">
                      15.000.000 ≤ 10.000.000 · (1 + 0,06)^n
                    </div>
                    <div className="text-on-surface-variant">
                      1,5 ≤ (1,06)^n ⟹ n ≥ log(1,5) / log(1,06)
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-primary dark:text-primary-fixed">
                        Input Nilai n:
                      </span>
                      <input
                        className="w-28 px-2 py-1 rounded bg-surface-container text-on-surface font-bold text-center focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={nInput}
                        onChange={(e) => setNInput(e.target.value)}
                        placeholder="Contoh: 6.96"
                        type="number"
                        step="0.1"
                      />
                      <span className="text-xs text-on-surface-variant">tahun</span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Realistic Reflection & Action */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    className="flex-1 py-3 px-4 rounded-lg bg-primary-container text-on-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                    onClick={handleValidateBilangan}
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Validasi Solusi RME</span>
                  </button>
                  <button
                    className="p-3 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    onClick={() => setShowHintBilangan(!showHintBilangan)}
                    title="Bantuan Berpikir"
                  >
                    <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                  </button>
                </div>

                {/* Dynamic Hint Dropper */}
                {showHintBilangan && (
                  <div className="p-3 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-start gap-2 text-xs">
                    <span className="material-symbols-outlined text-[18px] text-tertiary-container flex-shrink-0">
                      info
                    </span>
                    <div>
                      Gunakan nilai aproksimasi log(1,5) ≈ 0,1761 dan log(1,06) ≈ 0,0253. Karena
                      bunga dihitung per siklus tahunan, bulatkan ke atas agar saldo minimal Rp15
                      juta tercapai.
                    </div>
                  </div>
                )}

                {/* AI TRISULA FEEDBACK BOX */}
                <div
                  className={`p-3.5 rounded-xl flex flex-col gap-2 transition-all duration-300 ${
                    bilanganFeedback.type === 'success'
                      ? 'bg-secondary-container/40 border border-secondary/30'
                      : bilanganFeedback.type === 'error'
                      ? 'bg-error-container/30 border border-error/30'
                      : bilanganFeedback.type === 'warning'
                      ? 'bg-tertiary-fixed/40 border border-tertiary/30'
                      : 'bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-secondary text-xs font-bold">
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                      <span>Umpan Balik Cerdas TRISULA AI</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {bilanganFeedback.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Problem 2: Contextual Showcase (Bakteri Eksponensial) */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">biotech</span>
                  Contoh 2: Pertumbuhan Koloni Medis
                </span>
                <span className="text-xs text-secondary font-bold">Studi Kasus</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-on-surface">
                Pembelahan Sel Bakteri E. Coli Laboratorium
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Suatu kultur laboratorium dimulai dengan 500 sel bakteri. Setiap 20 menit, koloni
                melipatgandakan diri dua kali lipat (N(t) = N_0 · 2^(t/20)). Dalam 2 jam (120
                menit), populasi mencapai:
              </p>
              <div className="p-2.5 rounded-lg bg-surface-container flex items-center justify-between font-mono text-xs">
                <span className="text-primary dark:text-primary-fixed font-bold">
                  N(120) = 500 · 2^6 = 32.000 bakteri
                </span>
                <span className="text-xs px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-bold">
                  Terverifikasi
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* CATEGORY 2: ALJABAR */}
        {/* ============================================== */}
        {selectedCategory === 'aljabar' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">storefront</span>
                  <span>Konteks Realistik 2: Ekonomi Sirkular UMKM</span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">Program Linier</span>
              </div>
              <div className="relative rounded-lg overflow-hidden h-36 bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  alt="Indonesian local shoemaking craftsman"
                  src={ASSETS.aljabarContext}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-space-sm">
                  <p className="text-xs sm:text-sm text-on-primary font-semibold">
                    Optimasi Alokasi Bahan Kulit Sintetis & Sol Karet
                  </p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Sentra pengrajin sepatu Cibaduyut menghadapi kendala stok bahan baku mingguan dan
                jam kerja mesin pres. Program linier membantu menghitung kombinasi produksi sepatu
                tipe A & B demi keuntungan operasional maksimum.
              </p>
            </div>

            {/* Problem 1: Program Linier UMKM */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  Latihan Optimasi Produksi
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Fungsi Objektif
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5">
                <div className="text-sm sm:text-base font-bold text-primary dark:text-primary-fixed">
                  Berapa Pasang Sepatu Model A & B?
                </div>
                <p className="text-xs text-on-surface leading-relaxed">
                  Sepatu Casual (x) memberi laba Rp60.000/pasang; Sepatu Sport (y) memberi laba
                  Rp90.000/pasang. Bahan kanvas tersedia 60 m², sol karet tersedia 48 unit.
                </p>
                <div className="font-mono text-xs p-2 rounded bg-surface-container-lowest text-on-surface leading-relaxed">
                  Kendala 1: 2x + 3y ≤ 60 (Kanvas)
                  <br />
                  Kendala 2: 2x + y ≤ 48 (Sol Karet)
                  <br />
                  Fungsi Sasaran: Z = 60.000x + 90.000y
                </div>
              </div>

              {/* Interactive Corner-Point Evaluator */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-on-surface-variant font-semibold">
                  Pilih Titik Ekstrem Garis Selidik (Corner Points):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      selectedCornerPoint === 'A'
                        ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary'
                        : 'bg-surface-container-low hover:bg-secondary-container/30'
                    }`}
                    onClick={() => handleCornerPoint('A')}
                  >
                    <span className="text-xs font-bold block">Titik A (0, 20)</span>
                    <span className="text-[11px] text-on-surface-variant">Laba: Rp1.800.000</span>
                  </button>
                  <button
                    className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      selectedCornerPoint === 'B'
                        ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary'
                        : 'bg-surface-container-low hover:bg-secondary-container/30'
                    }`}
                    onClick={() => handleCornerPoint('B')}
                  >
                    <span className="text-xs font-bold block">Titik B (18, 8)</span>
                    <span className="text-[11px] text-on-surface-variant">Solusi Seimbang (100%)</span>
                  </button>
                  <button
                    className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      selectedCornerPoint === 'C'
                        ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary'
                        : 'bg-surface-container-low hover:bg-secondary-container/30'
                    }`}
                    onClick={() => handleCornerPoint('C')}
                  >
                    <span className="text-xs font-bold block">Titik C (24, 0)</span>
                    <span className="text-[11px] text-on-surface-variant">Laba: Rp1.440.000</span>
                  </button>
                  <button
                    className="p-2.5 rounded-lg text-left bg-surface-container-low hover:bg-secondary-container/30 transition-all cursor-pointer"
                    onClick={() => handleCornerPoint('B')}
                  >
                    <span className="text-xs font-bold block text-secondary">Evaluasi Grafis</span>
                    <span className="text-[11px] text-on-surface-variant">Analisis Garis Selidik</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-1">
                <div className="flex items-center gap-1 text-secondary text-xs font-bold">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                  <span>Refleksi Realistis UMKM</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {aljabarFeedback}
                </p>
              </div>
            </div>

            {/* Problem 2: Marginal Cost Parabola */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
              <span className="text-xs text-secondary font-bold uppercase">
                Contoh 2: Biaya Marjinal Pabrik
              </span>
              <h4 className="text-sm font-bold text-on-surface">Kemasan Biodegradable</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Fungsi biaya total C(x) = 2x² - 80x + 1.200 (ribu rupiah). Biaya minimum dicapai
                saat turunan pertama C'(x) = 4x - 80 = 0 ⟹ x = 20 unit.
              </p>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* CATEGORY 3: GEOMETRI */}
        {/* ============================================== */}
        {selectedCategory === 'geometri' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">roofing</span>
                  <span>Konteks Realistik 3: Arsitektur Nusantara</span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">Dimensi Tiga</span>
              </div>
              <div className="relative rounded-lg overflow-hidden h-36 bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  alt="Traditional Indonesian vernacular architecture"
                  src={ASSETS.geometriContext}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-space-sm">
                  <p className="text-xs sm:text-sm text-on-primary font-semibold">
                    Struktur Rangka Atap Rumah Adat Berbentuk Prisma
                  </p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Struktur kuda-kuda atap tradisional memanfaatkan kekakuan segitiga siku-siku dan
                ruang prisma untuk sirkulasi udara optimal di iklim tropis lembap Indonesia.
              </p>
            </div>

            {/* Problem 1: Prisma Segitiga Atap */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">straighten</span>
                  Latihan Volume & Rangka
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Prisma Segitiga
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <div className="text-sm sm:text-base font-bold text-primary dark:text-primary-fixed">
                  Volume Ruang Udara Atap Rumah
                </div>
                <p className="text-xs text-on-surface leading-relaxed">
                  Atap memiliki panjang bubungan 12 m, lebar alas 8 m, dan tinggi puncak tepat di
                  tengah sebesar 3 m.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface-container flex flex-col gap-2 font-mono text-xs">
                <div className="text-on-surface-variant">
                  1. Luas Penampang Segitiga Depan:
                </div>
                <div className="text-primary dark:text-primary-fixed font-bold">
                  Luas Alas = 1/2 · alas · tinggi = 1/2 · 8 · 3 = 12 m²
                </div>
                <div className="text-on-surface-variant mt-1">2. Volume Prisma Udara:</div>
                <div className="text-primary dark:text-primary-fixed font-bold">
                  Volume = Luas Alas · Panjang = 12 · 12 = 144 m³
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container-low flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0">
                  lightbulb
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-primary dark:text-primary-fixed">
                    Refleksi RME - Insulasi Suhu
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Kapasitas 144 m³ udara ini bertindak sebagai peredam panas alami matahari siang
                    sebelum mencapai plafon kamar siswa di bawahnya.
                  </p>
                </div>
              </div>
            </div>

            {/* Problem 2: Jarak Titik Lampu ke Pojok Lantai */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
              <span className="text-xs text-secondary font-bold uppercase">
                Contoh 2: Ruang Kelas XII-MIPA 1
              </span>
              <h4 className="text-sm font-bold text-on-surface">
                Jarak Titik Lampu Plafon ke Pojok Lantai
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Ruang kelas berukuran 8m × 6m × 4m. Lampu di pusat plafon (4, 3, 4). Jarak ke titik
                pojok (0, 0, 0):
              </p>
              <div className="p-2 rounded bg-surface-container text-xs font-mono text-primary dark:text-primary-fixed font-bold">
                d = √(4² + 3² + 4²) = √(16 + 9 + 16) = √41 ≈ 6,40 meter
              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* CATEGORY 4: TRIGONOMETRI */}
        {/* ============================================== */}
        {selectedCategory === 'trigonometri' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">height</span>
                  <span>Konteks Realistik 4: Eksplorasi Klinometer</span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Trigonometri Analitis
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden h-36 bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  alt="Students measuring building with inclinometer"
                  src={ASSETS.trigonometriContext}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-space-sm">
                  <p className="text-xs sm:text-sm text-on-primary font-semibold">
                    Mengukur Gedung Bertingkat Tanpa Memanjat
                  </p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Dengan klinometer busur sederhana dan meteran pita gulung, siswa memanfaatkan rasio
                tangen dua sudut pandang untuk menentukan elevasi gedung tanpa alat laser scanner.
              </p>
            </div>

            {/* Problem 1: Dua Titik Elevasi */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">navigation</span>
                  Latihan Klinometer Dinamis
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Rasio Tangen
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <div className="text-sm sm:text-base font-bold text-primary dark:text-primary-fixed">
                  Pengukuran Tinggi Gedung Sekolah
                </div>
                <p className="text-xs text-on-surface leading-relaxed">
                  Dari titik A, sudut elevasi puncak gedung adalah 35°. Siswa berjalan 40 meter maju
                  ke titik B, sudut elevasi menjadi 50°. Tinggi mata pengamat 1,5m ditambahkan di
                  akhir.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface-container flex flex-col gap-2 font-mono text-xs">
                <div className="text-on-surface-variant">Model Persamaan Tangen:</div>
                <div className="text-on-surface text-[11px]">
                  Misal x adalah jarak titik B ke gedung, dan h adalah tinggi gedung:
                </div>
                <div className="text-primary dark:text-primary-fixed font-bold">
                  tan 50° = h / x ⟹ x = h / tan 50° ≈ h / 1,1918
                </div>
                <div className="text-primary dark:text-primary-fixed font-bold">
                  tan 35° = h / (x + 40) ⟹ h = (x + 40) · 0,7002
                </div>
                <div className="text-xs text-secondary font-bold mt-1">
                  Solusi Bersama: h ≈ 67,8 meter (Total +1,5m = 69,3 meter)
                </div>
              </div>
            </div>

            {/* Problem 2: Navigasi Selat Sunda */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
              <span className="text-xs text-secondary font-bold uppercase">
                Contoh 2: Navigasi Maritim
              </span>
              <h4 className="text-sm font-bold text-on-surface">
                Vektor Arus Penyeberangan Merak - Bakauheni
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Kapal feri berkecepatan 15 knot mengarah ke Utara, namun arus laut Selat Sunda
                berkecepatan 4 knot mengarah ke Timur. Arah lintasan resultan dihitung dengan θ =
                arctan(4/15) ≈ 14,9° condong ke Timur laut.
              </p>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* CATEGORY 5: DATA & PELUANG */}
        {/* ============================================== */}
        {selectedCategory === 'peluang' && (
          <div className="flex flex-col gap-space-lg animate-in fade-in">
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  <span>Konteks Realistik 5: Analisis UTBK SNBT</span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Distribusi Normal
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden h-36 bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  alt="Student analyzing bell curve normal distribution graphs"
                  src={ASSETS.peluangContext}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-space-sm">
                  <p className="text-xs sm:text-sm text-on-primary font-semibold">
                    Standardisasi Skor UTBK & Penentuan Ambang Kelulusan
                  </p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Panitia SNPMB menerapkan model kurva lonceng (Gaussian) dengan skor standar
                (Z-score) untuk membandingkan performa siswa lintas paket soal tes potensi skolastik
                secara adil.
              </p>
            </div>

            {/* Problem 1: Z-score Ujian 40 Siswa */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">equalizer</span>
                  Latihan Z-Score & Peluang Lolos
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  N(μ, σ²)
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                <div className="text-sm sm:text-base font-bold text-primary dark:text-primary-fixed">
                  Berapa Peluang Siswa Meraih Skor di Atas 650?
                </div>
                <p className="text-xs text-on-surface leading-relaxed">
                  Data simulasi tryout nasional 40 siswa memiliki rata-rata μ = 580 dengan deviasi
                  standar σ = 50. Berapa persentase peluang siswa meraih skor X ≥ 650?
                </p>
              </div>

              {/* Interactive Curve Schema */}
              <div className="p-3 rounded-lg bg-surface-container flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-on-surface">1. Hitung Z-score:</span>
                  <span className="font-mono font-bold text-primary dark:text-primary-fixed">
                    Z = (650 - 580) / 50 = +1,40
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-on-surface">2. Peluang Tabel P(Z ≥ 1,40):</span>
                  <span className="font-mono font-bold text-secondary">
                    1 - 0,9192 = 0,0808 (8,08%)
                  </span>
                </div>

                {/* Micro Visual Bar Histogram Simulation */}
                <div className="mt-2 pt-2 flex items-end justify-between h-14 px-4 bg-surface-container-lowest rounded-md">
                  <div className="w-5 bg-surface-container-highest rounded-t h-4" title="Z < -1"></div>
                  <div className="w-5 bg-surface-container-highest rounded-t h-8" title="Z = -0.5"></div>
                  <div className="w-5 bg-surface-container-highest rounded-t h-12" title="Mean (Z = 0)"></div>
                  <div className="w-5 bg-secondary rounded-t h-7" title="Target: Z = +1.4 (8.08%)"></div>
                  <div className="w-5 bg-surface-container-highest rounded-t h-3" title="Z > 2"></div>
                </div>
                <div className="text-[10px] text-center text-on-surface-variant font-medium">
                  Distribusi Peserta Ujian: Hanya 8 dari 100 siswa berada di kuadran unggulan ini
                </div>
              </div>
            </div>

            {/* Problem 2: Hidroponik Buah */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
              <span className="text-xs text-secondary font-bold uppercase">
                Contoh 2: Panen Hidroponik Smart Green House
              </span>
              <h4 className="text-sm font-bold text-on-surface">Bobot Melon Golden Aroma</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Bobot melon berdistribusi normal dengan rata-rata 1.200 gram dan deviasi 100 gram.
                Standar ekspor supermarket mensyaratkan bobot &gt; 1.000 gram (Z = -2,0). Peluang
                lolos sortasi ekspor mencapai 97,72%.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Interactive Scratchpad Drawer */}
      <div className="mt-space-lg px-margin-mobile">
        <div className="p-space-md rounded-xl bg-surface-container-high text-on-surface flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary dark:text-primary-fixed shadow-xs flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold">
                Coret-coretan Digital & Simbol Cepat
              </div>
              <p className="text-xs text-on-surface-variant">
                Gunakan tombol simbol π, √x, log pada pengerjaan mandiri
              </p>
            </div>
          </div>
          <button
            className="px-3 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => setShowScratchpad(!showScratchpad)}
          >
            {showScratchpad ? 'Tutup Pad' : 'Buka Pad'}
          </button>
        </div>

        {/* Embedded Scratchpad Drawer */}
        {showScratchpad && (
          <div className="mt-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-lg flex flex-col gap-2 border border-outline-variant/30 animate-in fade-in">
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs font-bold text-primary dark:text-primary-fixed">
                Keypad Cepat Matematika RME
              </span>
              <button
                className="text-on-surface-variant hover:text-on-surface text-xs font-bold cursor-pointer"
                onClick={() => setShowScratchpad(false)}
              >
                Tutup
              </button>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['π', '√', '^2', 'log(', '≤', 'θ', '∑'].map((sym) => (
                <button
                  key={sym}
                  className="px-3 py-1.5 rounded bg-surface-container text-primary dark:text-primary-fixed font-mono text-sm font-bold hover:bg-secondary-container hover:text-on-secondary-container transition-colors cursor-pointer"
                  onClick={() => insertSymbol(sym)}
                >
                  {sym === '^2' ? 'x²' : sym === '√' ? '√x' : sym}
                </button>
              ))}
            </div>
            <textarea
              className="w-full p-2.5 rounded bg-surface-container-low text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              value={scratchText}
              onChange={(e) => setScratchText(e.target.value)}
              placeholder="Tuliskan catatan langkah konseptual atau verifikasi hitungan di sini..."
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
};
