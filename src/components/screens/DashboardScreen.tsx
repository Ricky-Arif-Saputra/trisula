import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, MathCategory } from '../../types';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface DashboardScreenProps {
  initialPerspective?: 'siswa' | 'guru';
  onNavigate?: (screen: ScreenType, category?: MathCategory | null, examId?: string) => void;
}

interface JawabanRow {
  id: string;
  soal_id: string;
  skor: number | null;
  skor_maks: number | null;
  created_at: string;
  jawaban: string;
}

interface DailyActivity { date: string; count: number; avgScore: number; }

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const last7Days = (): string[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

const dayLabel = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit' });

const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

// Sembunyikan email internal @trisula.*
const safeEmail = (email?: string | null): string => {
  if (!email) return '';
  if (email.includes('@trisula.')) return '';
  return email;
};

const scoreColor = (v: number) =>
  v >= 75 ? 'text-emerald-500' : v >= 50 ? 'text-amber-500' : 'text-rose-500';
const scoreBg = (v: number) =>
  v >= 75 ? 'bg-emerald-500' : v >= 50 ? 'bg-amber-500' : 'bg-rose-500';
const scoreBgLight = (v: number) =>
  v >= 75 ? 'bg-emerald-50 dark:bg-emerald-900/20' : v >= 50 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-rose-50 dark:bg-rose-900/20';

const STRAND_META: Record<string, { icon: string; grad: string; ring: string }> = {
  bilangan:     { icon: 'tag',            grad: 'from-blue-500 to-cyan-400',    ring: 'ring-blue-200 dark:ring-blue-800' },
  aljabar:      { icon: 'functions',      grad: 'from-violet-500 to-purple-400',ring: 'ring-violet-200 dark:ring-violet-800' },
  geometri:     { icon: 'category',       grad: 'from-emerald-500 to-teal-400', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  trigonometri: { icon: 'change_history', grad: 'from-amber-500 to-orange-400', ring: 'ring-amber-200 dark:ring-amber-800' },
  peluang:      { icon: 'bar_chart',      grad: 'from-rose-500 to-pink-400',    ring: 'ring-rose-200 dark:ring-rose-800' },
};

// ─────────────────────────────────────────────
// Activity Chart — larger, richer
// ─────────────────────────────────────────────
const ActivityChart: React.FC<{ data: DailyActivity[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const BAR_W  = 42;
  const GAP    = 10;
  const H      = 120;        // chart area height
  const PAD_L  = 28;         // left padding for Y labels
  const PAD_B  = 36;         // bottom padding for X labels
  const totalW = PAD_L + data.length * (BAR_W + GAP) - GAP;
  const svgH   = H + PAD_B;

  const yTicks = [0, Math.ceil(maxCount / 2), maxCount];

  return (
    <div className="overflow-x-auto -mx-1">
      <svg
        width={totalW + 8} height={svgH + 10}
        style={{ display: 'block', minWidth: totalW + 8 }}
      >
        {/* Y grid + labels */}
        {yTicks.map(tick => {
          const y = H - Math.round((tick / maxCount) * H);
          return (
            <g key={tick}>
              <line x1={PAD_L - 4} y1={y} x2={totalW + 4} y2={y}
                stroke="#e2e8f0" strokeWidth={1} strokeDasharray={tick === 0 ? '0' : '4 3'} />
              <text x={PAD_L - 7} y={y + 4} textAnchor="end"
                fontSize={9} fill="#94a3b8" fontWeight="600">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x    = PAD_L + i * (BAR_W + GAP);
          const barH = d.count === 0 ? 3 : Math.max(6, Math.round((d.count / maxCount) * H));
          const y    = H - barH;
          const isEmpty = d.count === 0;
          const gradId = `bg${i}`;

          return (
            <g key={d.date}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isEmpty ? '#e2e8f0' : '#818cf8'} />
                  <stop offset="100%" stopColor={isEmpty ? '#e2e8f0' : '#4f46e5'} />
                </linearGradient>
              </defs>
              <rect x={x} y={y} width={BAR_W} height={barH}
                rx={6} fill={`url(#${gradId})`} opacity={isEmpty ? 0.5 : 1} />

              {/* Count label above bar */}
              {d.count > 0 && (
                <text x={x + BAR_W / 2} y={y - 6}
                  textAnchor="middle" fontSize={11} fontWeight="900"
                  fill="#4f46e5">
                  {d.count}
                </text>
              )}

              {/* Avg score badge inside bar (if enough height) */}
              {d.count > 0 && d.avgScore > 0 && barH > 26 && (
                <text x={x + BAR_W / 2} y={y + barH / 2 + 4}
                  textAnchor="middle" fontSize={9} fontWeight="700"
                  fill="rgba(255,255,255,0.9)">
                  {d.avgScore}
                </text>
              )}

              {/* Day label below */}
              <text x={x + BAR_W / 2} y={H + 16}
                textAnchor="middle" fontSize={9} fill="#64748b" fontWeight="600">
                {dayLabel(d.date)}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block shrink-0" />
          Jumlah soal (angka di atas bar)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-200 inline-block shrink-0" />
          Rata-rata nilai (di dalam bar)
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Score ring
// ─────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 56 }) => {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={`${c * score / 100} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight="900" fill={color}>{score}</text>
    </svg>
  );
};

// ─────────────────────────────────────────────
// Logout modal
// ─────────────────────────────────────────────
const LogoutModal: React.FC<{ onConfirm: () => void; onCancel: () => void; loading?: boolean }> = ({
  onConfirm, onCancel, loading,
}) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 w-full max-w-xs shadow-2xl animate-in zoom-in-95 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-rose-600 text-[30px]">logout</span>
      </div>
      <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">Keluar dari Akun?</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        Sesi aktif akan dihentikan. Login kembali untuk mengakses aplikasi.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors">
          Batal
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /></>
            : <><span className="material-symbols-outlined text-[16px]">logout</span> Keluar</>}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// DashboardScreen
// ─────────────────────────────────────────────
export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user, userName, userNisn, isAdmin, signOut } = useAuth();

  const [rows, setRows]         = useState<JawabanRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('jawaban')
        .select('id, soal_id, skor, skor_maks, created_at, jawaban')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(300);
      setRows((data || []) as JawabanRow[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── computed stats ──
  const total      = rows.length;
  const toP        = (r: JawabanRow) => Math.round((r.skor! / r.skor_maks!) * 100);
  const withScore  = rows.filter(r => r.skor !== null && r.skor_maks && r.skor_maks > 0);
  const avg        = withScore.length ? Math.round(withScore.reduce((s, r) => s + toP(r), 0) / withScore.length) : 0;
  const best       = withScore.length ? Math.max(...withScore.map(toP)) : 0;
  const benar      = rows.filter(r => { try { return !!JSON.parse(r.jawaban || '{}').isCorrect; } catch { return false; } }).length;
  const salah      = total - benar;
  const pctBenar   = total ? Math.round((benar / total) * 100) : 0;
  const streak     = (() => {
    const today = new Date().toISOString().slice(0, 10);
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      if (rows.some(r => r.created_at.slice(0, 10) === ds)) s++; else break;
    }
    return s;
  })();

  // ── daily 7 days ──
  const days = last7Days();
  const daily: DailyActivity[] = days.map(date => {
    const dr = rows.filter(r => r.created_at.slice(0, 10) === date);
    const sc = dr.filter(r => r.skor !== null && r.skor_maks && r.skor_maks > 0);
    return {
      date,
      count: dr.length,
      avgScore: sc.length ? Math.round(sc.reduce((s, r) => s + toP(r), 0) / sc.length) : 0,
    };
  });
  const weekTotal = daily.reduce((s, d) => s + d.count, 0);
  const activeDays = daily.filter(d => d.count > 0).length;

  // ── per strand ──
  const strandMap: Record<string, { count: number; scores: number[] }> = {};
  rows.forEach(r => {
    let strand = '';
    try { strand = JSON.parse(r.jawaban || '{}').strand || ''; } catch {}
    if (!strand) return;
    if (!strandMap[strand]) strandMap[strand] = { count: 0, scores: [] };
    strandMap[strand].count++;
    if (r.skor !== null && r.skor_maks && r.skor_maks > 0)
      strandMap[strand].scores.push(toP(r));
  });
  const strandStats = Object.entries(strandMap)
    .map(([s, v]) => ({
      strand: s,
      count: v.count,
      avg: v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : 0,
      best: v.scores.length ? Math.max(...v.scores) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ── email display ──
  const displayEmail = safeEmail(user?.email);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
  };

  return (
    <div className="flex flex-col w-full pb-20 font-sans">
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => !loggingOut && setShowLogout(false)}
          loading={loggingOut}
        />
      )}

      {/* ══════════════ HERO PROFILE ══════════════ */}
      <section className="px-4 pt-4 pb-3">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] p-6 text-white shadow-2xl">
          {/* Decorative blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
          <div className="absolute right-5 bottom-1 text-[80px] font-black opacity-[0.04] select-none pointer-events-none leading-none">∑</div>

          <div className="relative z-10">
            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-xl text-white font-black text-2xl shrink-0 ring-2 ring-white/20">
                {userName.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold leading-tight">{userName}</h2>
                  {isAdmin && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400/25 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                {userNisn && (
                  <p className="text-[12px] text-indigo-300 mt-0.5 font-bold">NISN: {userNisn}</p>
                )}
                {displayEmail && (
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{displayEmail}</p>
                )}
              </div>
            </div>

            {/* 4 quick stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Soal',    value: total,       icon: 'library_books' },
                { label: 'Avg',     value: avg,         icon: 'trending_up' },
                { label: 'Terbaik', value: best,        icon: 'emoji_events' },
                { label: 'Streak',  value: `${streak}d`, icon: 'local_fire_department' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl py-3 text-center backdrop-blur-sm">
                  <span className="material-symbols-outlined text-indigo-300 text-[14px] block">{s.icon}</span>
                  <p className="text-base font-black text-white mt-0.5 leading-none">{s.value}</p>
                  <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-bold">Memuat data...</span>
        </div>
      ) : total === 0 ? (
        <div className="px-4 py-16 flex flex-col items-center text-center gap-5">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-indigo-400">school</span>
          </div>
          <div>
            <p className="font-extrabold text-slate-700 dark:text-slate-200 text-base">Belum ada aktivitas</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">Kerjakan soal latihan atau ujian untuk melihat statistik lengkap di sini.</p>
          </div>
          <button onClick={() => onNavigate?.('latihan')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30">
            <span className="material-symbols-outlined text-[18px]">bolt</span> Mulai Berlatih
          </button>
        </div>
      ) : (
        <>
          {/* ══════════════ REKAP RINGKAS ══════════════ */}
          <section className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Benar vs Salah */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Benar vs Salah</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-bold text-emerald-600">✓ {benar}</span>
                      <span className="text-[11px] font-bold text-rose-500">✗ {salah}</span>
                    </div>
                    <div className="h-3 bg-rose-100 dark:bg-rose-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pctBenar}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{pctBenar}% berhasil</p>
                  </div>
                </div>
              </div>

              {/* Nilai terbaik ring */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm flex items-center gap-3">
                <ScoreRing score={best} size={60} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nilai Terbaik</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{withScore.length} soal dinilai</p>
                  <p className={`text-[11px] font-bold mt-1 ${scoreColor(avg)}`}>avg: {avg}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════ GRAFIK AKTIVITAS ══════════════ */}
          <section className="px-4 pb-3">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Aktivitas 7 Hari Terakhir</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {weekTotal} soal dikerjakan · aktif {activeDays}/7 hari
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-2xl font-black text-indigo-600">{weekTotal}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">soal/minggu</span>
                </div>
              </div>

              {/* Chart */}
              <ActivityChart data={daily} />

              {/* Weekly summary pills */}
              <div className="grid grid-cols-7 gap-1 mt-4">
                {daily.map(d => (
                  <div key={d.date}
                    className={`h-1.5 rounded-full ${d.count > 0 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════ PER TOPIK ══════════════ */}
          {strandStats.length > 0 && (
            <section className="px-4 pb-3">
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Penguasaan Topik</h3>
                <div className="space-y-4">
                  {strandStats.map((s, idx) => {
                    const meta = STRAND_META[s.strand] || { icon: 'school', grad: 'from-slate-400 to-slate-500', ring: '' };
                    return (
                      <div key={s.strand} className="flex items-center gap-3">
                        {/* Rank */}
                        <div className="w-5 text-center">
                          <span className="text-[10px] font-black text-slate-300 dark:text-slate-600">#{idx + 1}</span>
                        </div>
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.grad} flex items-center justify-center shadow-sm shrink-0`}>
                          <span className="material-symbols-outlined text-white text-[17px]">{meta.icon}</span>
                        </div>
                        {/* Bar + labels */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{s.strand}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 font-medium">{s.count} soal</span>
                              <span className={`text-xs font-black ${scoreColor(s.avg)}`}>{s.avg}</span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${meta.grad} rounded-full transition-all duration-700`}
                              style={{ width: `${s.avg}%` }}
                            />
                          </div>
                        </div>
                        {/* Best badge */}
                        <div className={`shrink-0 text-center px-2 py-1 rounded-lg ${scoreBgLight(s.best)}`}>
                          <span className={`text-[11px] font-black ${scoreColor(s.best)}`}>{s.best}</span>
                          <p className="text-[8px] text-slate-400 leading-none mt-0.5">best</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════ RIWAYAT ══════════════ */}
          <section className="px-4 pb-3">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Riwayat Pengerjaan</h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                  {total} total
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {rows.slice(0, 12).map((r, i) => {
                  let isCorrect = false, strand = '', examType = 'Latihan';
                  try {
                    const j = JSON.parse(r.jawaban || '{}');
                    isCorrect = !!j.isCorrect;
                    strand = j.strand || '';
                    if (j.test_type === 'pretest') examType = 'Pretest';
                    else if (j.test_type === 'postest') examType = 'Posttest';
                  } catch {}
                  const score = r.skor !== null && r.skor_maks && r.skor_maks > 0 ? toP(r) : null;

                  return (
                    <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      {/* Number */}
                      <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 w-4 shrink-0">{i + 1}</span>
                      {/* Status icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'
                      }`}>
                        <span className={`material-symbols-outlined text-[15px] ${isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isCorrect ? 'check_circle' : 'cancel'}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          {examType}{strand ? <span className="text-slate-400 font-normal"> — {strand}</span> : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {fmtFull(r.created_at)} · {fmtTime(r.created_at)}
                        </p>
                      </div>
                      {/* Score */}
                      {score !== null ? (
                        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${scoreBgLight(score)}`}>
                          <span className={`text-xs font-black ${scoreColor(score)}`}>{score}</span>
                        </div>
                      ) : (
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <span className="text-[10px] text-slate-400">—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {total > 12 && (
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[11px] text-slate-400">Menampilkan 12 dari {total} riwayat</p>
                </div>
              )}
            </div>
          </section>

          {/* ══════════════ AKSES CEPAT ══════════════ */}
          <section className="px-4 pb-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: 'bolt',       label: 'Latihan', screen: 'latihan' as ScreenType, grad: 'from-indigo-500 to-violet-500' },
                { icon: 'menu_book',  label: 'Materi',  screen: 'materi' as ScreenType,  grad: 'from-emerald-500 to-teal-400' },
                { icon: 'quiz',       label: 'Ujian',   screen: 'ujian' as ScreenType,   grad: 'from-amber-500 to-orange-400' },
              ].map(item => (
                <button key={item.screen} onClick={() => onNavigate?.(item.screen)}
                  className={`rounded-2xl bg-gradient-to-br ${item.grad} p-4 flex flex-col items-center gap-2 shadow-md cursor-pointer hover:opacity-90 transition-opacity`}>
                  <span className="material-symbols-outlined text-white text-[24px]">{item.icon}</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ══════════════ KELUAR / GANTI AKUN ══════════════ */}
          <section className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowLogout(true)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm font-bold cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
                <span className="material-symbols-outlined text-[18px]">logout</span> Keluar
              </button>
              <button onClick={() => setShowLogout(true)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span> Ganti Akun
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
