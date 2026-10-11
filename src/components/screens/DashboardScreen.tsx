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
  id: string; soal_id: string;
  skor: number | null; skor_maks: number | null;
  created_at: string; jawaban: string;
}
interface Daily { date: string; count: number; avg: number; }

// ─────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────
const last7 = (): string[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

const dayLabel = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

// Sembunyikan email internal (e.g. @trisula.internal / @trisula.com)
const displayEmail = (email?: string | null) => {
  if (!email) return null;
  if (/@trisula\./i.test(email)) return null;
  return email;
};

const sc = (v: number) =>
  v >= 75 ? 'text-emerald-400' : v >= 50 ? 'text-amber-400' : 'text-rose-400';
const scBg = (v: number) =>
  v >= 75 ? 'bg-emerald-500/20 border-emerald-500/30' : v >= 50 ? 'bg-amber-500/20 border-amber-500/30' : 'bg-rose-500/20 border-rose-500/30';
const scSolid = (v: number) =>
  v >= 75 ? '#10b981' : v >= 50 ? '#f59e0b' : '#ef4444';

const STRAND_META: Record<string, { icon: string; g1: string; g2: string }> = {
  bilangan:     { icon: 'tag',            g1: '#3b82f6', g2: '#06b6d4' },
  aljabar:      { icon: 'functions',      g1: '#8b5cf6', g2: '#a855f7' },
  geometri:     { icon: 'category',       g1: '#10b981', g2: '#14b8a6' },
  trigonometri: { icon: 'change_history', g1: '#f59e0b', g2: '#f97316' },
  peluang:      { icon: 'bar_chart',      g1: '#ef4444', g2: '#ec4899' },
};

// ─────────────────────────────────────────────
// Activity Chart – tall, full-width, informative
// ─────────────────────────────────────────────
const ActivityChart: React.FC<{ data: Daily[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const N = data.length;
  const BAR_W  = 42;
  const GAP    = 12;
  const H      = 140;
  const PAD_L  = 24;
  const PAD_B  = 40;
  const totalW = PAD_L + N * (BAR_W + GAP) - GAP + 8;

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={H + PAD_B} style={{ display: 'block', minWidth: totalW }}>
        <defs>
          {data.map((_, i) => (
            <linearGradient key={i} id={`gb${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          ))}
        </defs>

        {/* Y grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = H - pct * H;
          const val = Math.round(pct * maxCount);
          return (
            <g key={pct}>
              <line x1={PAD_L} y1={y} x2={totalW - 4} y2={y}
                stroke={pct === 0 ? '#475569' : '#1e293b'} strokeWidth={pct === 0 ? 1.5 : 1}
                strokeDasharray={pct === 0 ? '0' : '3 3'} />
              <text x={PAD_L - 5} y={y + 4} textAnchor="end"
                fontSize={9} fill="#64748b" fontWeight="600">{val}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = PAD_L + i * (BAR_W + GAP);
          const barH = d.count === 0 ? 2 : Math.max(8, Math.round((d.count / maxCount) * H));
          const y = H - barH;
          const empty = d.count === 0;

          return (
            <g key={d.date}>
              {/* Bar */}
              <rect x={x} y={y} width={BAR_W} height={barH}
                rx={7} fill={empty ? '#1e293b' : `url(#gb${i})`}
                opacity={empty ? 0.4 : 1} />

              {/* Count label – always shown above */}
              <text x={x + BAR_W / 2} y={y - 7}
                textAnchor="middle" fontSize={12} fontWeight="900"
                fill={empty ? '#475569' : '#818cf8'}>
                {d.count}
              </text>

              {/* Avg score inside bar when tall enough */}
              {d.count > 0 && barH >= 30 && d.avg > 0 && (
                <text x={x + BAR_W / 2} y={y + barH / 2 + 4}
                  textAnchor="middle" fontSize={10} fontWeight="700"
                  fill="rgba(255,255,255,0.85)">
                  {d.avg}
                </text>
              )}

              {/* Day label */}
              <text x={x + BAR_W / 2} y={H + 18}
                textAnchor="middle" fontSize={10} fill="#64748b" fontWeight="600">
                {dayLabel(d.date)}
              </text>

              {/* Dot under label */}
              <circle cx={x + BAR_W / 2} cy={H + 30} r={3}
                fill={d.count > 0 ? '#4f46e5' : '#334155'} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────
// Circular score ring
// ─────────────────────────────────────────────
const Ring: React.FC<{ val: number; size?: number; thick?: number }> = ({
  val, size = 64, thick = 6,
}) => {
  const r = (size - thick) / 2;
  const c = 2 * Math.PI * r;
  const color = scSolid(val);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#1e293b" strokeWidth={thick} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={thick}
        strokeDasharray={`${c * val / 100} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size < 56 ? 11 : 14} fontWeight="900" fill={color}>{val}</text>
    </svg>
  );
};

// ─────────────────────────────────────────────
// Logout Modal
// ─────────────────────────────────────────────
const LogoutModal: React.FC<{
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}> = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-7 w-full max-w-xs shadow-2xl animate-in zoom-in-95 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-rose-400 text-[28px]">logout</span>
      </div>
      <h3 className="text-base font-extrabold text-white mb-1">Keluar dari Akun?</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        Sesi aktif akan dihentikan. Login kembali untuk mengakses aplikasi.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-700 transition-colors">
          Batal
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><span className="material-symbols-outlined text-[16px]">logout</span> Keluar</>}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user, userName, userNisn, isAdmin, signOut } = useAuth();
  const [rows, setRows]             = useState<JawabanRow[]>([]);
  const [loading, setLoading]       = useState(true);
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
    } catch { /* */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── computed ──
  const toP = (r: JawabanRow) => Math.round((r.skor! / r.skor_maks!) * 100);
  const total     = rows.length;
  const scored    = rows.filter(r => r.skor !== null && r.skor_maks && r.skor_maks > 0);
  const avg       = scored.length ? Math.round(scored.reduce((s, r) => s + toP(r), 0) / scored.length) : 0;
  const best      = scored.length ? Math.max(...scored.map(toP)) : 0;
  const benar     = rows.filter(r => { try { return !!JSON.parse(r.jawaban||'{}').isCorrect; } catch { return false; } }).length;
  const pctBenar  = total ? Math.round(benar / total * 100) : 0;
  const streak    = (() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (rows.some(r => r.created_at.slice(0,10) === d.toISOString().slice(0,10))) s++; else break;
    }
    return s;
  })();

  // daily 7 days
  const days  = last7();
  const daily: Daily[] = days.map(date => {
    const dr = rows.filter(r => r.created_at.slice(0,10) === date);
    const sc2 = dr.filter(r => r.skor !== null && r.skor_maks && r.skor_maks > 0);
    return {
      date,
      count: dr.length,
      avg: sc2.length ? Math.round(sc2.reduce((s,r) => s + toP(r), 0) / sc2.length) : 0,
    };
  });
  const weekTotal  = daily.reduce((s, d) => s + d.count, 0);
  const activeDays = daily.filter(d => d.count > 0).length;

  // per strand
  const strandMap: Record<string, { count:number; scores:number[] }> = {};
  rows.forEach(r => {
    let strand = '';
    try { strand = JSON.parse(r.jawaban||'{}').strand || ''; } catch {}
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
      avg: v.scores.length ? Math.round(v.scores.reduce((a,b)=>a+b,0)/v.scores.length) : 0,
      best: v.scores.length ? Math.max(...v.scores) : 0,
    }))
    .sort((a,b) => b.count - a.count);

  const email = displayEmail(user?.email);
  const initial = userName.charAt(0).toUpperCase() || 'S';

  return (
    <div className="flex flex-col w-full pb-20 font-sans bg-slate-950 min-h-screen">
      {showLogout && (
        <LogoutModal
          onConfirm={async () => { setLoggingOut(true); await signOut(); }}
          onCancel={() => !loggingOut && setShowLogout(false)}
          loading={loggingOut}
        />
      )}

      {/* ══════ HERO ══════ */}
      <section className="px-4 pt-4 pb-3">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 border border-white/5 shadow-2xl">
          {/* Glows */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
          {/* Watermark */}
          <div className="absolute right-4 bottom-0 text-[88px] font-black opacity-[0.04] select-none pointer-events-none leading-none text-white">∑</div>

          <div className="relative z-10">
            {/* Profile row */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-xl text-white font-black text-2xl ring-2 ring-white/15">
                  {initial}
                </div>
                {streak > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-[10px]">local_fire_department</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[17px] font-extrabold text-white leading-tight truncate">{userName}</h2>
                  {isAdmin && (
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest bg-amber-400/20 border border-amber-400/30 text-amber-300 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                {userNisn && <p className="text-[12px] text-indigo-300 font-bold mt-0.5">NISN: {userNisn}</p>}
                {email && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{email}</p>}
              </div>
            </div>

            {/* Stat grid 2×2 */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: String(total),   icon: 'library_books',         label: 'Soal',     color: 'text-indigo-300' },
                { val: String(avg),     icon: 'trending_up',           label: 'Rata-rata', color: 'text-cyan-300' },
                { val: String(best),    icon: 'emoji_events',          label: 'Terbaik',  color: 'text-amber-300' },
                { val: `${streak}🔥`,  icon: 'local_fire_department', label: 'Streak',   color: 'text-orange-300' },
              ].map(s => (
                <div key={s.label} className="bg-white/8 border border-white/10 rounded-2xl p-2.5 text-center">
                  <p className={`text-[17px] font-black leading-none ${s.color}`}>{s.val}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-400">Memuat data...</span>
        </div>
      ) : total === 0 ? (
        <div className="px-4 py-16 flex flex-col items-center text-center gap-5">
          <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-indigo-400">school</span>
          </div>
          <div>
            <p className="font-extrabold text-white text-base">Belum ada aktivitas</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs leading-relaxed">Kerjakan soal latihan atau ujian untuk melihat statistik di sini.</p>
          </div>
          <button onClick={() => onNavigate?.('latihan')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-lg shadow-indigo-600/30">
            <span className="material-symbols-outlined text-[18px]">bolt</span> Mulai Berlatih
          </button>
        </div>
      ) : (
        <>
          {/* ══════ REKAP RINGKAS ══════ */}
          <section className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Benar vs salah */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Akurasi Jawaban</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-400">{benar}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Benar</p>
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${pctBenar}%` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-rose-400">{total - benar}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Salah</p>
                  </div>
                </div>
                <p className={`text-[11px] font-black text-center ${sc(pctBenar)}`}>{pctBenar}% tingkat keberhasilan</p>
              </div>

              {/* Nilai ring */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-3">
                <Ring val={best} size={64} thick={7} />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Nilai Terbaik</p>
                  <p className={`text-xl font-black ${sc(best)} mt-0.5`}>{best}</p>
                  <p className="text-[10px] text-slate-500 mt-1">avg: <span className={`font-black ${sc(avg)}`}>{avg}</span></p>
                  <p className="text-[10px] text-slate-500">{scored.length} soal dinilai</p>
                </div>
              </div>
            </div>
          </section>

          {/* ══════ GRAFIK AKTIVITAS ══════ */}
          <section className="px-4 pb-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Aktivitas 7 Hari Terakhir</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <span className="text-indigo-400 font-black">{weekTotal}</span> soal · aktif
                    <span className="text-indigo-400 font-black"> {activeDays}</span>/7 hari
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-400">{weekTotal}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">minggu ini</p>
                </div>
              </div>
              <ActivityChart data={daily} />
              {/* Streak dots */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest shrink-0">Streak:</span>
                <div className="flex gap-1">
                  {daily.map(d => (
                    <div key={d.date} className={`h-2 flex-1 rounded-full ${d.count > 0 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                  ))}
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-5 mt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />Jumlah soal (atas bar)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 inline-block" />Rata-rata nilai (dalam bar)</span>
              </div>
            </div>
          </section>

          {/* ══════ PER TOPIK ══════ */}
          {strandStats.length > 0 && (
            <section className="px-4 pb-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
                <h3 className="text-sm font-extrabold text-white mb-4">Penguasaan per Topik</h3>
                <div className="space-y-4">
                  {strandStats.map((s, idx) => {
                    const m = STRAND_META[s.strand] || { icon: 'school', g1: '#64748b', g2: '#94a3b8' };
                    return (
                      <div key={s.strand} className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-600 w-4 shrink-0">#{idx+1}</span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `linear-gradient(135deg,${m.g1},${m.g2})` }}>
                          <span className="material-symbols-outlined text-white text-[17px]">{m.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-200 capitalize">{s.strand}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-500">{s.count} soal</span>
                              <span className={`text-[11px] font-black ${sc(s.avg)}`}>{s.avg}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${s.avg}%`, background: `linear-gradient(90deg,${m.g1},${m.g2})` }} />
                          </div>
                        </div>
                        <div className={`shrink-0 border rounded-lg px-2 py-1 text-center min-w-[40px] ${scBg(s.best)}`}>
                          <span className={`text-xs font-black ${sc(s.best)}`}>{s.best}</span>
                          <p className="text-[8px] text-slate-500 leading-none mt-0.5">best</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ══════ RIWAYAT ══════ */}
          <section className="px-4 pb-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white">Riwayat Pengerjaan</h3>
                <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{total} total</span>
              </div>
              <div className="divide-y divide-slate-800/70">
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
                    <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/40 transition-colors">
                      <span className="text-[10px] font-black text-slate-600 w-4 shrink-0">{i+1}</span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-500/15 border border-emerald-500/25' : 'bg-rose-500/15 border border-rose-500/25'
                      }`}>
                        <span className={`material-symbols-outlined text-[14px] ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCorrect ? 'check_circle' : 'cancel'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">
                          {examType}{strand && <span className="text-slate-500 font-normal"> — {strand}</span>}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{fmtDate(r.created_at)} · {fmtTime(r.created_at)}</p>
                      </div>
                      {score !== null ? (
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${scBg(score)}`}>
                          <span className={`text-xs font-black ${sc(score)}`}>{score}</span>
                        </div>
                      ) : (
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                          <span className="text-[10px] text-slate-600">—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {total > 12 && (
                <div className="px-5 py-3 border-t border-slate-800 text-center">
                  <p className="text-[11px] text-slate-500">Menampilkan 12 dari {total}</p>
                </div>
              )}
            </div>
          </section>

          {/* ══════ AKSES CEPAT ══════ */}
          <section className="px-4 pb-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: 'bolt',      label: 'Latihan', screen: 'latihan' as ScreenType, g: 'from-indigo-600 to-violet-600' },
                { icon: 'menu_book', label: 'Materi',  screen: 'materi'  as ScreenType, g: 'from-emerald-600 to-teal-500' },
                { icon: 'quiz',      label: 'Ujian',   screen: 'ujian'   as ScreenType, g: 'from-amber-500 to-orange-500' },
              ].map(item => (
                <button key={item.screen} onClick={() => onNavigate?.(item.screen)}
                  className={`rounded-2xl bg-gradient-to-br ${item.g} p-4 flex flex-col items-center gap-2 shadow-lg cursor-pointer hover:opacity-90 transition-opacity active:scale-95`}>
                  <span className="material-symbols-outlined text-white text-[26px]">{item.icon}</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ══════ KELUAR / GANTI AKUN ══════ */}
          <section className="px-4 pb-6">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowLogout(true)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold cursor-pointer hover:bg-rose-500/15 transition-colors">
                <span className="material-symbols-outlined text-[18px]">logout</span> Keluar
              </button>
              <button onClick={() => setShowLogout(true)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold cursor-pointer hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span> Ganti Akun
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
