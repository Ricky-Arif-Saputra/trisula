import React, { useState } from 'react';
import { ASSETS } from '../../data';
import { ScreenType, MathCategory } from '../../types';

interface BerandaScreenProps {
  onNavigate: (screen: ScreenType, category?: MathCategory) => void;
  onOpenTeacherMode: () => void;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  onNavigate,
  onOpenTeacherMode,
}) => {
  const [activeRmeStep, setActiveRmeStep] = useState<number>(1);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const toggleRmeStep = (step: number) => {
    setActiveRmeStep((prev) => (prev === step ? 0 : step));
  };

  const handleDownloadApk = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(10);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 10;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(null), 2500);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile gap-space-xl pb-12">
      {/* HERO SECTION */}
      <section className="flex flex-col gap-space-md pt-2">
        {/* Grade & Methodology Badges */}
        <div className="flex items-center gap-space-xs flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-primary-container dark:text-primary font-bold text-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
            <span>Kurikulum Merdeka 2024</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs">
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>Metodologi RME</span>
          </div>
        </div>

        {/* Tagline & Description */}
        <div className="flex flex-col gap-space-xs">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface leading-tight tracking-tight">
            Dari Dunia Nyata ke{' '}
            <span className="text-secondary underline decoration-secondary-fixed decoration-4 underline-offset-4">
              Solusi Matematis
            </span>
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Kuasai pemecahan masalah dengan TRISULA EduMath. Belajar konsep matematika Kelas XII
            melalui eksplorasi arsitektur nyata, ekonomi perbankan, dan data empiris.
          </p>
        </div>

        {/* Visual Interactive Card */}
        <div
          onClick={() => onNavigate('simulasi')}
          className="relative w-full rounded-xl overflow-hidden bg-primary-container text-on-primary shadow-xl cursor-pointer group transition-all hover:scale-[1.01]"
        >
          <div className="relative h-52 w-full overflow-hidden">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="Indonesian Grade 12 high school student with tablet in front of suspension bridge"
              src={ASSETS.bridgeHero}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/40 to-transparent"></div>

            {/* Live Badge Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface/90 dark:bg-surface-container-lowest/90 backdrop-blur-md text-primary dark:text-primary-fixed font-bold text-xs shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span>Simulasi 3D Aktif</span>
            </div>

            {/* Student floating micro-badge */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/80 backdrop-blur-md text-surface font-mono text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim">
                functions
              </span>
              <span>f(x) = ax² + bx + c</span>
            </div>
          </div>

          {/* Micro Content inside Card */}
          <div className="p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-surface-variant uppercase tracking-wider font-bold">
                Laboratorium Realistik
              </span>
              <span className="text-xs text-secondary-fixed font-bold">Kelas XII SMA/MA</span>
            </div>
            <p className="text-xs text-on-primary-container leading-relaxed">
              Transformasikan lengkungan jembatan gantung menjadi model parabola kalkulus integral
              secara interaktif.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-space-sm">
          <button
            className="w-full h-12 rounded-lg bg-secondary text-surface font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,194,168,0.3)] active:scale-[0.98] transition-all hover:bg-secondary/90 cursor-pointer"
            onClick={() => onNavigate('latihan-rme')}
          >
            <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            <span>Mulai Tantangan Trisula</span>
          </button>
          <button
            className="w-full h-12 rounded-lg bg-surface-container text-on-surface font-semibold text-sm flex items-center justify-center gap-2 active:bg-surface-container-high transition-colors hover:bg-surface-container-high cursor-pointer"
            onClick={onOpenTeacherMode}
          >
            <span className="material-symbols-outlined text-[20px] text-primary-container dark:text-primary-fixed">
              co_present
            </span>
            <span>Masuk sebagai Pendidik / Guru</span>
          </button>
        </div>

        {/* Quick Stats Bento Grid */}
        <div className="grid grid-cols-3 gap-space-xs pt-1">
          <div className="p-space-sm rounded-lg bg-surface-container flex flex-col items-center text-center">
            <span className="text-lg font-extrabold text-secondary">94%</span>
            <span className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
              Peningkatan Nilai Ujian
            </span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container flex flex-col items-center text-center">
            <span className="text-lg font-extrabold text-primary-container dark:text-primary-fixed">
              1.200+
            </span>
            <span className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
              Soal Berbasis Konteks
            </span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container flex flex-col items-center text-center">
            <span className="text-lg font-extrabold text-on-tertiary-container dark:text-tertiary-fixed-dim">
              3 Pilar
            </span>
            <span className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
              Metode RME Terpadu
            </span>
          </div>
        </div>
      </section>

      {/* SECTION: 3 TAHAPAN TRISULA (CORE EDUCATIONAL CONCEPT) */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-secondary text-xs uppercase font-bold tracking-wider">
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
            <span>Pedagogi Khusus</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">3 Tahapan Pendekatan RME</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Dirancang berdasarkan Realistic Mathematics Education agar penalaran konsep terbentuk
            alami tanpa menghafal rumus buta.
          </p>
        </div>

        {/* Interactive Stepper Accordion */}
        <div className="flex flex-col gap-space-sm">
          {/* Prong 1 */}
          <div
            className={`group rounded-lg p-space-md shadow-sm transition-all cursor-pointer ${
              activeRmeStep === 1 ? 'bg-surface-container-low' : 'bg-surface-container-lowest'
            }`}
            onClick={() => toggleRmeStep(1)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
                    Tahap Awal
                  </span>
                  <h4 className="text-sm font-bold text-on-surface truncate">Konteks Realistik</h4>
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary transition-transform duration-300">
                {activeRmeStep === 1 ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {activeRmeStep === 1 && (
              <div className="pt-space-sm flex flex-col gap-space-xs animate-in fade-in">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Siswa dihadapkan pada skenario nyata: simulasi inflasi suku bunga majemuk
                  perbankan, perhitungan gaya tegangan kabel jembatan, atau lintasan proyektil roket.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-primary-container dark:text-primary-fixed font-medium">
                    Studi Lapangan
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-primary-container dark:text-primary-fixed font-medium">
                    Eksplorasi Mandiri
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Prong 2 */}
          <div
            className={`group rounded-lg p-space-md shadow-sm transition-all cursor-pointer ${
              activeRmeStep === 2 ? 'bg-surface-container-low' : 'bg-surface-container-lowest'
            }`}
            onClick={() => toggleRmeStep(2)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-on-primary-container dark:text-primary-fixed-dim font-bold uppercase tracking-wider">
                    Matematisasi
                  </span>
                  <h4 className="text-sm font-bold text-on-surface truncate">
                    Pemodelan Matematis
                  </h4>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-300">
                {activeRmeStep === 2 ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {activeRmeStep === 2 && (
              <div className="pt-space-sm flex flex-col gap-space-xs animate-in fade-in">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Mengabstraksikan masalah konkret ke dalam representasi matematika: merancang diagram
                  Cartesius, menyusun sistem persamaan matriks, dan formulasi turunan diferensial.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-primary-container dark:text-primary-fixed font-medium">
                    Matriks & Aljabar
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-primary-container dark:text-primary-fixed font-medium">
                    Grafik Interaktif
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Prong 3 */}
          <div
            className={`group rounded-lg p-space-md shadow-sm transition-all cursor-pointer ${
              activeRmeStep === 3 ? 'bg-surface-container-low' : 'bg-surface-container-lowest'
            }`}
            onClick={() => toggleRmeStep(3)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-9 h-9 rounded-full bg-tertiary-fixed-dim text-on-tertiary flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-on-tertiary-container font-bold uppercase tracking-wider">
                    Verifikasi & Temuan
                  </span>
                  <h4 className="text-sm font-bold text-on-surface truncate">Solusi & Refleksi</h4>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-300">
                {activeRmeStep === 3 ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {activeRmeStep === 3 && (
              <div className="pt-space-sm flex flex-col gap-space-xs animate-in fade-in">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Mengevaluasi hasil matematis kembali ke parameter dunia nyata. Apakah solusinya
                  masuk akal? Siswa dibimbing dengan koreksi cerdas AI dan refleksi kritis.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-primary-container dark:text-primary-fixed font-medium">
                    Refleksi Kritis
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-primary-container dark:text-primary-fixed font-medium">
                    Umpan Balik AI
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION: FEATURED WEEKLY CHALLENGE */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-on-tertiary-container dark:text-tertiary-fixed-dim text-xs font-bold">
            <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
            <span>Tantangan Mingguan</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold">
            Berakhir dlm 2 Hari
          </span>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-surface-container-lowest p-space-md shadow-md flex flex-col gap-space-sm">
          <div className="flex items-start gap-space-sm">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary-container dark:text-primary-fixed flex-shrink-0">
              <span className="material-symbols-outlined text-[28px]">video_file</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-on-surface leading-snug">
                Optimasi Biaya Konstruksi Jembatan Rangka Baja
              </h4>
              <span className="text-xs text-on-surface-variant">
                Kombinasi Geometri Spasial & Pemrograman Linear
              </span>
            </div>
          </div>

          {/* Real-world context snippet */}
          <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-secondary text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">map</span>
              <span>Proyek Jembatan Selat Sunda II (Simulasi Real)</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              Hitung konfigurasi balok penopang diagonal minimum untuk menahan beban truk tronton 45
              ton dengan biaya material paling ekonomis.
            </p>
          </div>

          {/* Micro metrics of challenge */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-on-surface-variant text-xs font-medium">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">groups</span>
                <span>842 Siswa</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">
                  military_tech
                </span>
                <span>+250 Poin XP</span>
              </div>
            </div>
            <button
              className="h-9 px-4 rounded-lg bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
              onClick={() => onNavigate('latihan-rme')}
            >
              <span>Ikuti</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: 5 STRANDS PREVIEW */}
      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-on-surface">Materi Pembelajaran</h3>
            <p className="text-xs text-on-surface-variant">5 Domain Matematika Kelas XII SMA/MA</p>
          </div>
          <button
            onClick={() => onNavigate('materi')}
            className="text-xs text-secondary font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>Lihat Semua</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Stacked cards */}
        <div className="flex flex-col gap-space-sm">
          {/* Strand 1: Bilangan */}
          <div
            onClick={() => onNavigate('materi', 'bilangan')}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center justify-between gap-space-sm active:bg-surface-container-low transition-colors cursor-pointer hover:shadow-md"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-11 h-11 rounded-lg bg-surface-container-highest text-primary dark:text-primary-fixed flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">savings</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-secondary font-bold uppercase">
                  Domain 01: Bilangan
                </span>
                <h5 className="text-sm font-bold text-on-surface truncate">
                  Bunga Majemuk & Anuitas
                </h5>
                <span className="text-[12px] text-on-surface-variant truncate">
                  Perhitungan KPR, cicilan modal, dan deposito
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant flex-shrink-0">
              arrow_forward_ios
            </span>
          </div>

          {/* Strand 2: Aljabar */}
          <div
            onClick={() => onNavigate('materi', 'aljabar')}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center justify-between gap-space-sm active:bg-surface-container-low transition-colors cursor-pointer hover:shadow-md"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-11 h-11 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">precision_manufacturing</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-secondary font-bold uppercase">
                  Domain 02: Aljabar
                </span>
                <h5 className="text-sm font-bold text-on-surface truncate">
                  Optimasi Operasional Pabrik
                </h5>
                <span className="text-[12px] text-on-surface-variant truncate">
                  Matriks produksi & sistem pertidaksamaan linear
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant flex-shrink-0">
              arrow_forward_ios
            </span>
          </div>

          {/* Strand 3: Geometri */}
          <div
            onClick={() => onNavigate('materi', 'geometri')}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center justify-between gap-space-sm active:bg-surface-container-low transition-colors cursor-pointer hover:shadow-md"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-11 h-11 rounded-lg bg-surface-container text-on-surface flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">domain</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-secondary font-bold uppercase">
                  Domain 03: Geometri Spasial
                </span>
                <h5 className="text-sm font-bold text-on-surface truncate">
                  Prisma & Struktur Arsitektur Modern
                </h5>
                <span className="text-[12px] text-on-surface-variant truncate">
                  Jarak titik ke bidang pada kubah gedung
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant flex-shrink-0">
              arrow_forward_ios
            </span>
          </div>

          {/* Strand 4: Trigonometri */}
          <div
            onClick={() => onNavigate('materi', 'trigonometri')}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center justify-between gap-space-sm active:bg-surface-container-low transition-colors cursor-pointer hover:shadow-md"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-11 h-11 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">square_foot</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-secondary font-bold uppercase">
                  Domain 04: Trigonometri
                </span>
                <h5 className="text-sm font-bold text-on-surface truncate">
                  Sudut Elevasi & Satelit Radar
                </h5>
                <span className="text-[12px] text-on-surface-variant truncate">
                  Klinometer digital dan pelacakan gelombang suara
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant flex-shrink-0">
              arrow_forward_ios
            </span>
          </div>

          {/* Strand 5: Data & Peluang */}
          <div
            onClick={() => onNavigate('materi', 'peluang')}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center justify-between gap-space-sm active:bg-surface-container-low transition-colors cursor-pointer hover:shadow-md"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-11 h-11 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">query_stats</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-secondary font-bold uppercase">
                  Domain 05: Data & Peluang
                </span>
                <h5 className="text-sm font-bold text-on-surface truncate">
                  Distribusi Normal & Epidemiologi
                </h5>
                <span className="text-[12px] text-on-surface-variant truncate">
                  Prediksi kurva penularan & uji hipotesis data
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant flex-shrink-0">
              arrow_forward_ios
            </span>
          </div>
        </div>
      </section>

      {/* SECTION: APK DOWNLOAD BANNER */}
      <section className="rounded-xl bg-primary-container text-on-primary p-space-lg relative overflow-hidden shadow-xl flex flex-col gap-space-md">
        {/* Ambient background element */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-secondary opacity-15 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col gap-space-xs z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-variant/20 text-secondary-fixed w-max text-[11px] font-bold">
            <span className="material-symbols-outlined text-[14px]">offline_pin</span>
            <span>100% Bebas Kuota / Offline Ready</span>
          </div>
          <h3 className="text-xl font-bold leading-tight">Belajar Di Mana Saja, Kapan Saja.</h3>
          <p className="text-xs text-surface-variant leading-relaxed">
            Unduh TRISULA Mobile APK resmi. Dilengkapi kalkulator grafis terintegrasi dan modul RME
            tanpa koneksi internet.
          </p>
        </div>

        <div className="flex flex-col gap-space-xs z-10">
          <button
            className="w-full h-12 rounded-lg bg-secondary text-primary font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-secondary-fixed cursor-pointer"
            onClick={handleDownloadApk}
          >
            <span className="material-symbols-outlined text-[20px]">
              {downloadProgress === 100 ? 'check_circle' : 'download'}
            </span>
            <span>
              {downloadProgress !== null
                ? downloadProgress === 100
                  ? 'Berhasil Diunduh! (38 MB)'
                  : `Mengunduh APK... ${downloadProgress}%`
                : 'Unduh TRISULA Mobile APK (38 MB)'}
            </span>
          </button>

          {/* Download progress bar */}
          {downloadProgress !== null && (
            <div className="w-full bg-surface-variant/30 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-secondary-fixed h-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Platform Icons Indicator */}
          <div className="flex items-center justify-center gap-space-md pt-2 text-surface-variant text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">android</span>
              <span>Android 8.0+</span>
            </div>
            <span className="text-outline">•</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
              <span>PWA / iOS Web</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
