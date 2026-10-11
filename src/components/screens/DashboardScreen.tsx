import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, MathCategory } from '../../types';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';

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

interface DailyActivity { date: string; count: number; }

// ── helpers ──
function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function fmtShort(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function fmtFull(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const STRAND_META: Record<string, { icon: string; grad: string }> = {
  bilangan:     { icon: 'tag',            grad: 'from-blue-500 to-cyan-400' },
  aljabar:      { icon: 'functions',      grad: 'from-violet-500 to-purple-400' },
  geometri:     { icon: 'category',       grad: 'from-emerald-500 to-teal-400' },
  trigonometri: { icon: 'change_history', grad: 'from-amber-500 to-orange-400' },
  peluang:      { icon: 'bar_chart',      grad: 'from-rose-500 to-pink-400' },
};

// ── ActivityChart ──
const ActivityChart: React.FC<{ data: DailyActivity[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const BAR_W = 32;
  const GAP   = 8;
  const CHART_H = 90;
  const LABEL_H = 30;
  const totalW = data.length * (BAR_W + GAP) - GAP;

  return (
    <div className="overflow-x-auto pb-1">
      <svg width={totalW} height={CHART_H + LABEL_H} style={{ display: 'block', minWidth: totalW }}>
        {/* Grid lines */}
        {[0, 0.5, 1].map(pct => (
          <line key={pct}
            x1={0} y1={CHART_H - pct * CHART_H}
            x2={totalW} y2={CHART_H - pct * CHART_H}
            stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4"
          />
        ))}

        {data.map((d, i) => {
          const x = i * (BAR_W + GAP);
          const barH = d.count === 0 ? 3 : Math.max(6, Math.round((d.count / maxCount) * CHART_H));
          const y = CHART_H - barH;
          const isEmpty = d.count === 0;

          return (
            <g key={d.date}>
              {/* Bar */}
              <defs>
                <linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isEmpty ? '#e2e8f0' : '#818cf8'} />
                  <stop offset="100%" stopColor={isEmpty ? '#e2e8f0' : '#6366f1'} />
                </linearGradient>
              </defs>
              <rect x={x} y={y} width={BAR_W} height={barH}
                rx={5} fill={`url(#g${i})`} opacity={isEmpty ? 0.5 : 1} />

              {/* Count label above bar */}
              <text x={x + BAR_W / 2} y={y - 5}
                textAnchor="middle" fontSize={10} fontWeight="700"
                fill={isEmpty ? '#cbd5e1' : '#4f46e5'}>
                {d.count > 0 ? d.count : ''}
              </text>

              {/* Date label below bar */}
              <text x={x + BAR_W / 2} y={CHART_H + 16}
                textAnchor="middle" fontSize={9} fill="#94a3b8">
                {fmtShort(d.date)}
              </text>
            </g>
          );
        })}

        {/* Y-axis max label */}
        <text x={2} y={10} fontSize={9} fill="#94a3b8">{maxCount}</text>
        <text x={2} y={CHART_H / 2 + 4} fontSize={9} fill="#94a3b8">{Math.round(maxCount / 2)}</text>
        <text x={2} y={CHART_H - 2} fontSize={9} fill="#94a3b8">0</text>
      </svg>
    </div>
  );
};

// ── LogoutModal ──
const LogoutModal: React.FC<{ onConfirm: () => void; onCancel: () => void; loading?: boolean }> = ({
  onConfirm, onCancel, loading,
}) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200 text-center">
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
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Keluar...</>
            : <><span className="material-symbols-outlined text-[16px]">logout</span> Keluar</>}
        </button>
      </div>
    </div>
  </div>
);

// ── DashboardScreen ──
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
        .select('id, soal_id, skor, skor_maks, created_at, jawaban')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(300);
      setRows((data || []) as JawabanRow[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── stats ──
  const total = rows.length;
  const withScore = rows.filter(r => r.skor !== null && r.skor_maks && r.skor_maks > 0);
  const toPercent = (r: JawabanRow) => Math.round((r.skor! / r.skor_maks!) * 100);
  const avg   = withScore.length ? Math.round(withScore.reduce((s, r) => s + toPercent(r), 0) / withScore.length) : 0;
  const best  = withScore.length ? Math.max(...withScore.map(toPercent)) : 0;
  const benar = rows.filter(r => { try { return !!JSON.parse(r.jawaban || '{}').isCorrect; } catch { return false; } }).length;
  const pctBenar = total ? Math.round((benar / total) * 100) : 0;

  // ── daily 7 days ──
  const days = last7Days();
  const daily: DailyActivity[] = days.map(date => ({
    date,
    count: rows.filter(r => r.created_at.slice(0, 10) === date).length,
  }));
  const weekTotal = daily.reduce((s, d) => s + d.count, 0);

  // ── per strand ──
  const strandMap: Record<string, { count: number; scores: number[] }> = {};
  rows.forEach(r => {
    let strand = '';
    try { strand = JSON.parse(r.jawaban || '{}').strand || ''; } catch {}
    if (!strand) return;
    if (!strandMap[strand]) strandMap[strand] = { count: 0, scores: [] };
    strandMap[strand].count++;
    if (r.skor !== null && r.skor_maks && r.skor_maks > 0)
      strandMap[strand].scores.push(toPercent(r));
  });
  const strandStats = Object.entries(strandMap)
    .map(([s, v]) => ({
      strand: s,
      count: v.count,
      avg: v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b) / v.scores.length) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
  };

  // ── score color ──
  const sc = (v: number) => v >= 70 ? 'text-emerald-600' : v >= 50 ? 'text-amber-600' : 'text-rose-500';

  return (
    <div className="flex flex-col w-full pb-20 font-sans">
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => !loggingOut && setShowLogout(false)}
          loading={loggingOut}
        />
      )}

      {/* ───── HERO ───── */}
      <section className="px-4 pt-4 pb-3">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] p-5 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_65%)]" />
          <div className="absolute right-4 bottom-0 opacity-[0.04] text-[100px] font-black leading-none select-none pointer-events-none">∑</div>

          <div className="relative z-10 flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0 text-white font-black text-xl">
              {userName.charAt(0).toUpperCase() || 'S'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold truncate">{userName}</h2>
                {isAdmin && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400/20 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-full shrink-0">
                    Admin
                  </span>
                )}
              </div>
              {userNisn && <p className="text-[11px] text-indigo-300 mt-0.5">NISN: {userNisn}</p>}
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Mini stats strip */}
          <div className="relative z-10 grid grid-cols-3 gap-2 mt-5">
            {[
              { label: 'Total Soal', value: total },
              { label: 'Rata-rata', value: avg },
              { label: '% Benar', value: `${pctBenar}%` },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl py-2.5 text-center">
                <p className="text-lg font-black leading-none text-white">{s.value}</p>
                <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-bold">Memuat data...</span>
        </div>
      ) : total === 0 ? (
        <div className="px-4 py-14 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-slate-300 dark:text-slate-600">menu_book</span>
          </div>
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-200">Belum ada aktivitas</p>
            <p className="text-sm text-slate-400 mt-1">Kerjakan soal untuk melihat statistik di sini.</p>
          </div>
          <button onClick={() => onNavigate?.('latihan')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer hover:bg-indigo-700 transition-colors">
            <span className="material-symbols-outlined text-[16px]">bolt</span> Mulai Berlatih
          </button>
        </div>
      ) : (
        <>
          {/* ───── 4 STAT CARDS ───── */}
          <section className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'emoji_events', label: 'Nilai Tertinggi', value: best, color: 'from-amber-400 to-orange-400', light: 'bg-amber-50 dark:bg-amber-900/20', tc: 'text-amber-600' },
                { icon: 'trending_up',  label: 'Rata-rata Nilai', value: avg,  color: 'from-indigo-500 to-violet-500', light: 'bg-indigo-50 dark:bg-indigo-900/20', tc: 'text-indigo-600' },
                { icon: 'check_circle', label: 'Jawaban Benar',   value: benar, color: 'from-emerald-500 to-teal-400', light: 'bg-emerald-50 dark:bg-emerald-900/20', tc: 'text-emerald-600' },
                { icon: 'target',       label: 'Tingkat Benar',   value: `${pctBenar}%`, color: 'from-violet-500 to-purple-400', light: 'bg-violet-50 dark:bg-violet-900/20', tc: 'text-violet-600' },
              ].map(c => (
                <div key={c.label} className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md shrink-0`}>
                    <span className="material-symbols-outlined text-white text-[18px]">{c.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.label}</p>
                    <p className={`text-2xl font-black leading-tight ${c.tc}`}>{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ───── GRAFIK AKTIVITAS 7 HARI ───── */}
          <section className="px-4 pb-3">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Aktivitas 7 Hari</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{weekTotal} soal dikerjakan minggu ini</p>
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-indigo-500 text-[13px]">bar_chart</span>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">per hari</span>
                </div>
              </div>
              <ActivityChart data={daily} />
            </div>
          </section>

          {/* ───── PER TOPIK ───── */}
          {strandStats.length > 0 && (
            <section className="px-4 pb-3">
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-4">Statistik Per Topik</h3>
                <div className="space-y-4">
                  {strandStats.map(s => {
                    const meta = STRAND_META[s.strand] || { icon: 'school', grad: 'from-slate-400 to-slate-500' };
                    return (
                      <div key={s.strand} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.grad} flex items-center justify-center shadow-sm shrink-0`}>
                          <span className="material-symbols-outlined text-white text-[17px]">{meta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{s.strand}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">{s.count} soal</span>
                              <span className={`text-[11px] font-black ${sc(s.avg)}`}>{s.avg}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${meta.grad} rounded-full transition-all duration-500`}
                              style={{ width: `${s.avg}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ───── RIWAYAT ───── */}
          <section className="px-4 pb-3">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Riwayat Pengerjaan</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {total} total
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.slice(0, 12).map(r => {
                  let isCorrect = false, strand = '', examType = 'Latihan';
                  try {
                    const j = JSON.parse(r.jawaban || '{}');
                    isCorrect = !!j.isCorrect;
                    strand = j.strand || '';
                    if (j.test_type === 'pretest') examType = 'Pretest';
                    else if (j.test_type === 'postest') examType = 'Posttest';
                  } catch {}
                  const score = r.skor !== null && r.skor_maks && r.skor_maks > 0 ? toPercent(r) : null;

                  return (
                    <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'
                      }`}>
                        <span className={`material-symbols-outlined text-[15px] ${isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isCorrect ? 'check_circle' : 'cancel'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          {examType}{strand ? ` — ${strand}` : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {fmtFull(r.created_at)} · {fmtTime(r.created_at)}
                        </p>
                      </div>
                      {score !== null && (
                        <span className={`text-sm font-black shrink-0 ${sc(score)}`}>{score}</span>
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

          {/* ───── AKUN & NAVIGASI ───── */}
          <section className="px-4 pb-3">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm">
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses Cepat</p>
              </div>
              {[
                { icon: 'bolt',          label: 'Latihan Soal',    sub: 'Soal RME interaktif',   screen: 'latihan' as ScreenType, cls: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
                { icon: 'menu_book',     label: 'Materi',          sub: 'Bahan ajar per topik',  screen: 'materi' as ScreenType,  cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: 'quiz',          label: 'Ujian',           sub: 'Pretest & Posttest',    screen: 'ujian' as ScreenType,   cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
              ].map(item => (
                <button key={item.screen} onClick={() => onNavigate?.(item.screen)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-t border-slate-100 dark:border-slate-800 cursor-pointer group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.cls}`}>
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.sub}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 text-[18px]">chevron_right</span>
                </button>
              ))}
            </div>
          </section>

          {/* ───── KELUAR / GANTI AKUN ───── */}
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
