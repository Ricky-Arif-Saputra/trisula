import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, MathCategory } from '../../types';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import {
  LogOut, RefreshCw, TrendingUp, Award, BookOpen, Zap,
  Clock, CheckCircle, XCircle, BarChart2, Calendar,
  ChevronRight, Star, Target, User,
} from 'lucide-react';

interface DashboardScreenProps {
  initialPerspective?: 'siswa' | 'guru';
  onNavigate?: (screen: ScreenType, category?: MathCategory | null, examId?: string) => void;
}

interface JawabanRow {
  id: string;
  soal_id: string;
  skor: number | null;
  skor_maks: number | null;
  alasan: string | null;
  created_at: string;
  jawaban: string;
}

interface DailyActivity {
  date: string;       // 'YYYY-MM-DD'
  count: number;
  avgScore: number;
}

interface SubjectStat {
  strand: string;
  count: number;
  avgScore: number;
  topScore: number;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const STRAND_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  bilangan:     { icon: 'tag',            color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
  aljabar:      { icon: 'functions',      color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
  geometri:     { icon: 'category',       color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  trigonometri: { icon: 'change_history', color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  peluang:      { icon: 'bar_chart',      color: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-900/20' },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtShort = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

function getDateKey(iso: string) {
  return iso.slice(0, 10);
}

function last7Days(): string[] {
  const arr: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

// ─────────────────────────────────────────────
// Mini bar chart (SVG, no deps)
// ─────────────────────────────────────────────
const ActivityChart: React.FC<{ data: DailyActivity[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const BAR_H = 80;
  const BAR_W = 28;
  const GAP = 6;
  const totalW = data.length * (BAR_W + GAP);

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={BAR_H + 32} style={{ display: 'block' }}>
        {data.map((d, i) => {
          const barH = Math.max(4, Math.round((d.count / maxCount) * BAR_H));
          const x = i * (BAR_W + GAP);
          const y = BAR_H - barH;
          const isEmpty = d.count === 0;
          return (
            <g key={d.date}>
              <rect
                x={x} y={y} width={BAR_W} height={barH}
                rx={4}
                fill={isEmpty ? '#e2e8f0' : '#6366f1'}
                opacity={isEmpty ? 0.4 : 1}
              />
              {d.count > 0 && (
                <text x={x + BAR_W / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#6366f1" fontWeight="700">
                  {d.count}
                </text>
              )}
              <text x={x + BAR_W / 2} y={BAR_H + 16} textAnchor="middle" fontSize={9} fill="#94a3b8">
                {fmtShort(d.date + 'T00:00:00')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────
// Score donut (SVG)
// ─────────────────────────────────────────────
const ScoreDonut: React.FC<{ score: number; size?: number; color?: string }> = ({
  score, size = 72, color = '#6366f1',
}) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size < 60 ? 12 : 16} fontWeight="900" fill={color}>
        {score}
      </text>
    </svg>
  );
};

// ─────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}> = ({ icon, label, value, sub, color = 'text-indigo-600' }) => (
  <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 flex items-start gap-3 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.replace('text-', 'bg-').replace('-600', '-50').replace('-400', '-900/20')} dark:bg-opacity-20`}>
      <span className={color}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className={`text-2xl font-black leading-none ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Logout confirmation modal
// ─────────────────────────────────────────────
const LogoutModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
        <LogOut size={24} className="text-rose-600" />
      </div>
      <h3 className="text-base font-extrabold text-slate-800 dark:text-white text-center mb-1">Keluar dari Akun?</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
        Semua sesi aktif akan dihentikan. Anda perlu login kembali untuk mengakses aplikasi.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors">
          Batal
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
          <LogOut size={15} /> Keluar
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

  const [rows, setRows] = useState<JawabanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('jawaban')
        .select('id, soal_id, skor, skor_maks, alasan, created_at, jawaban')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);
      setRows((data || []) as JawabanRow[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Computed stats ──
  const totalPengerjaan = rows.length;
  const withScore = rows.filter(r => r.skor !== null && r.skor_maks && r.skor_maks > 0);
  const avgScore = withScore.length
    ? Math.round(withScore.reduce((s, r) => s + (r.skor! / r.skor_maks!) * 100, 0) / withScore.length)
    : 0;
  const topScore = withScore.length
    ? Math.round(Math.max(...withScore.map(r => (r.skor! / r.skor_maks!) * 100)))
    : 0;
  const benarCount = rows.filter(r => {
    try { return JSON.parse(r.jawaban || '{}').isCorrect === true; } catch { return false; }
  }).length;
  const completionRate = totalPengerjaan > 0 ? Math.round((benarCount / totalPengerjaan) * 100) : 0;

  // Daily activity last 7 days
  const days = last7Days();
  const dailyActivity: DailyActivity[] = days.map(date => {
    const dayRows = rows.filter(r => getDateKey(r.created_at) === date);
    const scores = dayRows.filter(r => r.skor !== null && r.skor_maks && r.skor_maks > 0);
    return {
      date,
      count: dayRows.length,
      avgScore: scores.length
        ? Math.round(scores.reduce((s, r) => s + (r.skor! / r.skor_maks!) * 100, 0) / scores.length)
        : 0,
    };
  });

  // Per-subject stats (dari soal_id prefix — fallback ke parsed jawaban.strand)
  const strandMap: Record<string, JawabanRow[]> = {};
  rows.forEach(r => {
    let strand = 'lainnya';
    try {
      const j = JSON.parse(r.jawaban || '{}');
      if (j.strand) strand = j.strand;
    } catch {}
    if (!strandMap[strand]) strandMap[strand] = [];
    strandMap[strand].push(r);
  });
  const subjectStats: SubjectStat[] = Object.entries(strandMap).map(([strand, srows]) => {
    const sc = srows.filter(r => r.skor !== null && r.skor_maks && r.skor_maks > 0);
    return {
      strand,
      count: srows.length,
      avgScore: sc.length ? Math.round(sc.reduce((s, r) => s + (r.skor! / r.skor_maks!) * 100, 0) / sc.length) : 0,
      topScore: sc.length ? Math.round(Math.max(...sc.map(r => (r.skor! / r.skor_maks!) * 100))) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
  };

  const recentRows = rows.slice(0, 15);

  return (
    <div className="flex flex-col w-full pb-16 font-sans">
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}

      {/* ── HERO PROFILE ── */}
      <section className="px-4 pt-4 pb-3">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.2),transparent_60%)]" />
          <div className="relative z-10">
            {/* Top row: avatar + actions */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shrink-0">
                  <User size={26} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold leading-tight">{userName}</h2>
                    {isAdmin && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  {userNisn && <p className="text-[11px] text-indigo-300 mt-0.5">NISN: {userNisn}</p>}
                  <p className="text-[11px] text-slate-400 mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Account actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowLogout(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold cursor-pointer hover:bg-rose-500/30 transition-colors whitespace-nowrap"
                >
                  <LogOut size={13} /> Keluar
                </button>
                <button
                  onClick={() => setShowLogout(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-slate-300 text-[11px] font-bold cursor-pointer hover:bg-white/20 transition-colors whitespace-nowrap"
                >
                  <RefreshCw size={13} /> Ganti Akun
                </button>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-white">{totalPengerjaan}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mt-0.5">Pengerjaan</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-white">{avgScore}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mt-0.5">Rata-rata</p>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-white">{completionRate}%</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mt-0.5">Benar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-sm font-bold">Memuat data...</span>
          </div>
        </div>
      ) : totalPengerjaan === 0 ? (
        /* Empty state */
        <div className="px-4 py-12 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen size={36} className="text-slate-300 dark:text-slate-600" />
          </div>
          <div>
            <p className="font-bold text-slate-600 dark:text-slate-300 text-base">Belum ada aktivitas</p>
            <p className="text-sm text-slate-400 mt-1">Mulai kerjakan soal latihan atau ujian untuk melihat statistik di sini.</p>
          </div>
          <button onClick={() => onNavigate?.('latihan')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer hover:bg-indigo-700 transition-colors">
            <Zap size={15} /> Mulai Berlatih
          </button>
        </div>
      ) : (
        <>
          {/* ── STAT CARDS ── */}
          <section className="px-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Award size={18} />} label="Nilai Tertinggi" value={topScore}
                sub="dari semua pengerjaan" color="text-amber-500" />
              <StatCard icon={<Target size={18} />} label="Rata-rata Nilai" value={avgScore}
                sub={`dari ${withScore.length} soal`} color="text-indigo-600" />
              <StatCard icon={<CheckCircle size={18} />} label="Jawaban Benar" value={benarCount}
                sub={`dari ${totalPengerjaan} soal`} color="text-emerald-600" />
              <StatCard icon={<TrendingUp size={18} />} label="Tingkat Benar" value={`${completionRate}%`}
                sub="dari seluruh pengerjaan" color="text-violet-600" />
            </div>
          </section>

          {/* ── GRAFIK AKTIVITAS 7 HARI ── */}
          <section className="px-4 py-3">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 size={16} className="text-indigo-500" />
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Aktivitas 7 Hari Terakhir</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {dailyActivity.reduce((s, d) => s + d.count, 0)} soal
                </span>
              </div>
              <ActivityChart data={dailyActivity} />
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Jumlah soal dikerjakan</span>
              </div>
            </div>
          </section>

          {/* ── PER TOPIK ── */}
          {subjectStats.length > 0 && (
            <section className="px-4 py-3">
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Statistik Per Topik</h3>
                </div>
                <div className="space-y-3">
                  {subjectStats.map(s => {
                    const meta = STRAND_ICONS[s.strand] || { icon: 'school', color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800' };
                    const pct = s.avgScore;
                    return (
                      <div key={s.strand} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
                          <span className={`material-symbols-outlined text-[18px] ${meta.color}`}>{meta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{s.strand}</span>
                            <span className="text-[11px] font-black text-slate-500">{s.count} soal</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-[11px] font-black w-8 text-right ${pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>
                              {pct}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-center">
                          <ScoreDonut score={s.topScore} size={40} color={s.topScore >= 70 ? '#16a34a' : s.topScore >= 50 ? '#d97706' : '#dc2626'} />
                          <p className="text-[9px] text-slate-400 mt-0.5">best</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ── RIWAYAT PENGERJAAN ── */}
          <section className="px-4 py-3">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-indigo-500" />
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Riwayat Pengerjaan</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{totalPengerjaan} total</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRows.map((r) => {
                  let isCorrect = false;
                  let strand = '';
                  let examType = 'Latihan';
                  try {
                    const j = JSON.parse(r.jawaban || '{}');
                    isCorrect = !!j.isCorrect;
                    strand = j.strand || '';
                    if (j.test_type === 'pretest') examType = 'Pretest';
                    else if (j.test_type === 'postest') examType = 'Posttest';
                  } catch {}

                  const score = r.skor !== null && r.skor_maks && r.skor_maks > 0
                    ? Math.round((r.skor / r.skor_maks) * 100)
                    : null;

                  return (
                    <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'
                      }`}>
                        {isCorrect
                          ? <CheckCircle size={16} className="text-emerald-600" />
                          : <XCircle size={16} className="text-rose-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          {examType}{strand ? ` — ${strand}` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar size={10} className="text-slate-400 shrink-0" />
                          <span className="text-[10px] text-slate-400">{fmt(r.created_at)} · {fmtTime(r.created_at)}</span>
                        </div>
                      </div>
                      {score !== null && (
                        <span className={`text-sm font-black shrink-0 ${score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>
                          {score}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {rows.length > 15 && (
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[11px] text-slate-400">Menampilkan 15 dari {rows.length} pengerjaan</p>
                </div>
              )}
            </div>
          </section>

          {/* ── NAVIGASI CEPAT ── */}
          <section className="px-4 py-3 pb-6">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Akses Cepat</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Zap size={16} />, label: 'Latihan', sub: 'Soal RME interaktif', screen: 'latihan' as ScreenType, color: 'text-indigo-600' },
                  { icon: <BookOpen size={16} />, label: 'Materi', sub: 'Bahan ajar topik', screen: 'materi' as ScreenType, color: 'text-emerald-600' },
                  { icon: <Award size={16} />, label: 'Ujian', sub: 'Pretest & Posttest', screen: 'ujian' as ScreenType, color: 'text-amber-600' },
                ].map(item => (
                  <button key={item.screen} onClick={() => onNavigate?.(item.screen)}
                    className="text-left flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors group">
                    <span className={item.color}>{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</p>
                      <p className="text-[10px] text-slate-400">{item.sub}</p>
                    </div>
                    <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </button>
                ))}
                {/* Logout shortcut */}
                <button onClick={() => setShowLogout(true)}
                  className="text-left flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 cursor-pointer transition-colors group">
                  <LogOut size={16} className="text-rose-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Keluar</p>
                    <p className="text-[10px] text-rose-400 dark:text-rose-500">Logout / ganti akun</p>
                  </div>
                  <ChevronRight size={13} className="text-rose-300 group-hover:text-rose-500 shrink-0" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {loggingOut && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-500">Keluar dari akun...</p>
          </div>
        </div>
      )}
    </div>
  );
};
