import React, { useState } from 'react';
import { ASSETS, COGNITIVE_ASPECTS, STRANDS_DATA, TRISULA_BADGES, INITIAL_STUDENT_PROFILE } from '../../data';
import { ScreenType, MathCategory } from '../../types';

interface DashboardScreenProps {
  initialPerspective?: 'siswa' | 'guru';
  onNavigate?: (screen: ScreenType, category?: MathCategory) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  initialPerspective = 'siswa',
  onNavigate,
}) => {
  const [perspective, setPerspective] = useState<'siswa' | 'guru'>(initialPerspective);
  const [taskAssigned, setTaskAssigned] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  const profile = INITIAL_STUDENT_PROFILE;

  return (
    <div className="flex flex-col w-full pb-12">
      <div className="px-margin-mobile pt-space-md pb-space-2xl space-y-space-lg">
        {/* Mode Guru / Siswa Quick Toggle */}
        <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-space-sm shadow-sm">
          <div className="flex items-center gap-space-sm pl-space-xs">
            <span className="material-symbols-outlined text-primary-container dark:text-primary-fixed text-[20px]">
              swap_horiz
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-surface">Perspektif Tampilan</span>
              <span className="text-[11px] text-on-surface-variant">
                {perspective === 'guru' ? 'Mode Pengajar (Guru)' : 'Mode Siswa Aktif'}
              </span>
            </div>
          </div>
          <div className="flex bg-surface-container-highest rounded-lg p-0.5">
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                perspective === 'siswa'
                  ? 'bg-surface dark:bg-surface-container text-primary-container dark:text-primary-fixed shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setPerspective('siswa')}
            >
              Siswa
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                perspective === 'guru'
                  ? 'bg-surface dark:bg-surface-container text-primary-container dark:text-primary-fixed shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setPerspective('guru')}
            >
              Guru
            </button>
          </div>
        </div>

        {/* 1. Profil & Ringkasan Siswa Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-container via-[#14365d] to-primary rounded-xl p-space-lg text-on-primary shadow-md">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-tertiary-fixed/10 blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-space-md">
            {/* Top row: Avatar & Identity */}
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-md">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md p-1 flex items-center justify-center shadow-inner">
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      alt="Student Ahmad Fauzan"
                      src={ASSETS.ahmadAvatar}
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-on-secondary text-[12px] fill-1">
                      verified
                    </span>
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary-fixed text-[11px] font-bold uppercase tracking-wide">
                    {profile.className}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-on-primary truncate mt-0.5">
                    {profile.name}
                  </h2>
                  <p className="text-xs text-surface-container-highest/90 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-tertiary-fixed-dim text-[16px] fill-1">
                      military_tech
                    </span>
                    <span>{profile.level}</span>
                  </p>
                </div>
              </div>

              {/* Trophy / Rank Badge */}
              <div className="flex flex-col items-center bg-surface-container-lowest/10 backdrop-blur-md px-3 py-2 rounded-xl text-center shadow-sm flex-shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-surface-container-highest">
                  Rank Kelas
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-extrabold text-tertiary-fixed">
                    #{profile.rank}
                  </span>
                  <span className="text-[11px] text-surface-container-highest">
                    /{profile.totalStudents}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Ribbon (XP, Streak, Milestone) */}
            <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
              <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-surface-container-highest">
                    Total XP
                  </span>
                  <span className="material-symbols-outlined text-secondary-fixed-dim text-[16px]">
                    bolt
                  </span>
                </div>
                <p className="text-base font-extrabold text-on-primary mt-1">
                  {profile.totalXp.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-surface-container-highest">
                    Streak
                  </span>
                  <span className="text-[14px]">🔥</span>
                </div>
                <p className="text-base font-extrabold text-tertiary-fixed mt-1">
                  {profile.streakDays} Hari
                </p>
              </div>

              <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-surface-container-highest">
                    RME Index
                  </span>
                  <span className="material-symbols-outlined text-secondary-fixed text-[16px]">
                    insights
                  </span>
                </div>
                <p className="text-base font-extrabold text-secondary-fixed mt-1">
                  {profile.rmeIndex}%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Guru Perspective Insight Drawer (visible when perspective === 'guru') */}
        {perspective === 'guru' && (
          <section className="bg-surface-container-high rounded-xl p-space-lg shadow-md space-y-space-md animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-on-surface">
                    Insight Guru: XII MIPA 2
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Analitik agregat komparatif Ahmad vs Rata-rata Kelas
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary text-[10px] uppercase font-bold">
                Admin Guru
              </span>
            </div>

            <div className="grid grid-cols-2 gap-space-sm">
              <div className="p-3 bg-surface-container-lowest rounded-xl">
                <span className="text-[11px] text-outline">Rata-rata Kelas (Refleksi)</span>
                <p className="text-sm sm:text-base font-bold text-on-surface mt-1">68.4%</p>
                <span className="text-[11px] text-secondary font-bold">Ahmad +9.6% lebih tinggi</span>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-xl">
                <span className="text-[11px] text-outline">Status Ketuntasan Materi</span>
                <p className="text-sm sm:text-base font-bold text-secondary mt-1">Tuntas (4/5)</p>
                <span className="text-[11px] text-on-tertiary-container font-bold">
                  1 Remidial Dimensi Tiga
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-sm rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  assignment_turned_in
                </span>
                <span className="text-xs text-on-surface font-medium">
                  {taskAssigned
                    ? 'Tugas pengayaan Geometri berhasil dikirim ke Ahmad'
                    : 'Kirim tugas pengayaan Geometri khusus Ahmad'}
                </span>
              </div>
              <button
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer ${
                  taskAssigned
                    ? 'bg-surface-container text-on-surface-variant'
                    : 'bg-secondary text-on-secondary hover:opacity-90'
                }`}
                onClick={() => setTaskAssigned(true)}
              >
                {taskAssigned ? 'Terkirim' : 'Tugaskan'}
              </button>
            </div>
          </section>
        )}

        {/* 3. Rekomendasi Latihan Harian RME */}
        <section className="bg-gradient-to-r from-surface-container via-surface-container-low to-surface-container-high rounded-xl p-space-md shadow-sm space-y-space-sm relative overflow-hidden">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center flex-shrink-0 text-tertiary-fixed shadow-sm">
              <span className="material-symbols-outlined text-[22px] fill-1">auto_awesome</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] uppercase font-bold">
                  AI Rekomendasi Hari Ini
                </span>
                <span className="text-[11px] text-outline">Estimasi 15 Menit</span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface font-bold mt-1 leading-snug">
                Perkuat Validasi Solusi pada Soal Dimensi Tiga Ruang Atap
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                Konsep segitiga proyeksi ortogonal dari kerangka atap rumah adat Tongkonan memerlukan
                verifikasi dalil proyeksi.
              </p>
            </div>
          </div>

          <div className="pt-1 flex items-center gap-space-sm">
            <button
              className="flex-1 h-12 rounded-lg bg-primary-container text-on-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-space-xs shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              onClick={() => onNavigate && onNavigate('materi', 'geometri')}
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span>Mulai Latihan Harian (15 Menit)</span>
            </button>
            <button
              className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
                bookmarked
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-highest text-primary-container dark:text-primary-fixed hover:bg-surface-variant'
              }`}
              onClick={() => setBookmarked(!bookmarked)}
              title="Simpan untuk nanti"
            >
              <span className="material-symbols-outlined text-[20px]">
                {bookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>
        </section>

        {/* 4. Radar Chart Kemampuan Pemecahan Masalah (5 Aspek RME) */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-secondary font-bold uppercase tracking-wider">
                Analitik Kognitif
              </span>
              <h3 className="text-base font-bold text-on-surface">5 Aspek Standar RME</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container text-[11px] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>Sangat Kuat di Pemodelan</span>
            </span>
          </div>

          {/* Radar SVG Chart */}
          <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center my-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 300">
              {/* Concentric Pentagons */}
              <polygon
                points="150,126 173,142 164,169 136,169 127,142"
                fill="none"
                stroke="#dae2fd"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <polygon
                points="150,102 196,134 178,188 122,188 104,134"
                fill="none"
                stroke="#dae2fd"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <polygon
                points="150,78 218,127 192,207 108,207 82,127"
                fill="none"
                stroke="#dae2fd"
                strokeWidth="1"
              />
              <polygon
                points="150,54 241,120 206,226 94,226 59,120"
                fill="none"
                stroke="#c4c6ce"
                strokeWidth="1"
              />
              <polygon
                points="150,30 264,113 221,245 79,245 36,113"
                fill="none"
                stroke="#74777e"
                strokeWidth="1.2"
                opacity="0.6"
              />

              {/* Spokes */}
              <line x1="150" y1="150" x2="150" y2="30" stroke="#dae2fd" strokeWidth="1" />
              <line x1="150" y1="150" x2="264" y2="113" stroke="#dae2fd" strokeWidth="1" />
              <line x1="150" y1="150" x2="221" y2="245" stroke="#dae2fd" strokeWidth="1" />
              <line x1="150" y1="150" x2="79" y2="245" stroke="#dae2fd" strokeWidth="1" />
              <line x1="150" y1="150" x2="36" y2="113" stroke="#dae2fd" strokeWidth="1" />

              {/* Student Data Polygon */}
              <polygon
                points="150,44.4 243.5,119.7 214.6,236.4 94.6,224.1 53.1,118.5"
                fill="rgba(101, 250, 222, 0.28)"
                stroke="#007262"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Data points */}
              <circle cx="150" cy="44.4" r="4.5" fill="#007262" stroke="#ffffff" strokeWidth="2" />
              <circle cx="243.5" cy="119.7" r="4.5" fill="#007262" stroke="#ffffff" strokeWidth="2" />
              <circle cx="214.6" cy="236.4" r="4.5" fill="#007262" stroke="#ffffff" strokeWidth="2" />
              <circle cx="94.6" cy="224.1" r="4.5" fill="#007262" stroke="#ffffff" strokeWidth="2" />
              <circle cx="53.1" cy="118.5" r="4.5" fill="#007262" stroke="#ffffff" strokeWidth="2" />

              {/* Text labels */}
              <text x="150" y="24" textAnchor="middle" className="fill-primary dark:fill-primary-fixed text-[10px] font-bold">
                Konteks (88%)
              </text>
              <text x="272" y="115" textAnchor="start" className="fill-primary dark:fill-primary-fixed text-[10px] font-bold">
                Pemodelan (82%)
              </text>
              <text x="226" y="260" textAnchor="middle" className="fill-primary dark:fill-primary-fixed text-[10px] font-bold">
                Komputasi (91%)
              </text>
              <text x="74" y="260" textAnchor="middle" className="fill-primary dark:fill-primary-fixed text-[10px] font-bold">
                Refleksi (78%)
              </text>
              <text x="28" y="115" textAnchor="end" className="fill-primary dark:fill-primary-fixed text-[10px] font-bold">
                Komunikasi (85%)
              </text>
            </svg>
          </div>

          {/* Detailed breakdown bars */}
          <div className="space-y-space-sm pt-space-xs">
            {COGNITIVE_ASPECTS.map((aspect) => (
              <div key={aspect.label} className="flex items-center justify-between text-xs">
                <span className="text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">
                    {aspect.icon}
                  </span>
                  <span>{aspect.label}</span>
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        aspect.score < 80 ? 'bg-on-tertiary-container' : 'bg-secondary'
                      }`}
                      style={{ width: `${aspect.score}%` }}
                    ></div>
                  </div>
                  <span
                    className={`font-bold w-8 text-right ${
                      aspect.score < 80 ? 'text-on-tertiary-container' : 'text-on-surface'
                    }`}
                  >
                    {aspect.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Statistik Penguasaan 5 Materi Pokok */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-primary-container dark:text-primary-fixed font-bold uppercase tracking-wider">
                Kurikulum Merdeka SMA XII
              </span>
              <h3 className="text-base font-bold text-on-surface">5 Materi Pokok</h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('materi')}
              className="text-secondary text-xs font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <span>Detail Silabus</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-space-md">
            {STRANDS_DATA.map((strand) => (
              <div
                key={strand.id}
                onClick={() => onNavigate && onNavigate('materi', strand.id)}
                className="p-space-sm bg-surface-container-low rounded-xl space-y-1.5 cursor-pointer hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container dark:text-primary-fixed font-bold">
                      <span className="material-symbols-outlined text-[18px]">
                        {strand.id === 'bilangan'
                          ? 'percent'
                          : strand.id === 'aljabar'
                          ? 'functions'
                          : strand.id === 'geometri'
                          ? 'deployed_code'
                          : strand.id === 'trigonometri'
                          ? 'change_history'
                          : 'bar_chart'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-on-surface">{strand.name}</h4>
                        {strand.isPriority && (
                          <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed-dim/30 text-on-tertiary-container text-[10px] font-bold">
                            Prioritas
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-medium">
                        {strand.statusText}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-extrabold ${
                      strand.isPriority
                        ? 'text-on-tertiary-container'
                        : strand.percentage >= 90
                        ? 'text-secondary'
                        : 'text-primary-container dark:text-primary-fixed'
                    }`}
                  >
                    {strand.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      strand.isPriority
                        ? 'bg-on-tertiary-container'
                        : strand.percentage >= 90
                        ? 'bg-secondary'
                        : 'bg-primary-container'
                    }`}
                    style={{ width: `${strand.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Lencana & Badge Koleksi Trisula */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-secondary font-bold uppercase tracking-wider">
                Pencapaian Gamifikasi
              </span>
              <h3 className="text-base font-bold text-on-surface">Lencana Koleksi Trisula</h3>
            </div>
            <span className="text-xs font-bold text-on-surface-variant">3/4 Terbuka</span>
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            {TRISULA_BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`p-space-sm rounded-xl flex flex-col items-center text-center relative overflow-hidden ${
                  badge.status === 'in_progress'
                    ? 'bg-surface-container-low border-2 border-dashed border-outline-variant'
                    : 'bg-surface-container-low'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-2"
                  style={{
                    backgroundColor:
                      badge.status === 'in_progress'
                        ? 'var(--color-surface-container-highest)'
                        : badge.id === 'konteks'
                        ? 'rgba(101, 250, 222, 0.4)'
                        : badge.id === 'pemodelan'
                        ? '#d2e4ff'
                        : '#ffdcbc',
                    color: badge.color,
                  }}
                >
                  <span className="material-symbols-outlined text-[26px] fill-1">
                    {badge.icon}
                  </span>
                </div>

                <span className="text-xs font-bold text-on-surface line-clamp-1">
                  {badge.name}
                </span>
                <span className="text-[11px] text-on-surface-variant mt-0.5">
                  {badge.subtext}
                </span>

                {badge.status === 'unlocked' ? (
                  <div className="mt-2 w-full flex justify-center">
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-secondary bg-secondary-container/40 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      <span>Terverifikasi</span>
                    </span>
                  </div>
                ) : (
                  <div className="w-full mt-2 space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-tertiary-fixed-dim"
                        style={{ width: `${badge.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-outline block">
                      {badge.progress}% Diselesaikan
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 7. Ethnomathematics Footer Note */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              className="w-full h-full object-cover rounded-lg"
              alt="Tongkonan architectural sketch"
              src={ASSETS.tongkonanSketch}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-on-surface">Penerapan Etnomatematika Aktif</h5>
            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
              Semua metrik dan skor pemodelan Ahmad diintegrasikan dari modul arsitektur vernakular
              Nusantara dan aplikasi ekonomi maritim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
