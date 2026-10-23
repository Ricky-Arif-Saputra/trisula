/**
 * ExamSession — ujian multi-soal:
 *  1. Intro screen
 *  2. Navigasi soal bebas — draft jawaban TETAP tersimpan saat ganti soal
 *  3. Tombol submit ada di BAWAH soal terakhir, aktif setelah soal terakhir disimpan
 *  4. Layar hasil: benar/salah per soal + total
 */
import React, { useState, useCallback } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { QuizQuestionDynamic } from './QuizQuestionDynamic';
import { supabase } from '../../lib/supabaseClient';
import { numbersMatch } from './LatihanTypes';
import {
  CheckCircle, ChevronRight, User, Hash, BookOpen,
  Clock, AlertTriangle, Send,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type QuestionStatus = 'untouched' | 'ragu' | 'done';

export interface ExamSessionProps {
  questionIds: string[];
  examTitle: string;
  examDuration: number;
  testType: 'pretest' | 'postest';
  strand: string;
  onFinish: () => void;
}

export interface SoalResult {
  questionId: string;
  answerBlocks: Record<string, any[]>;
  finalNumber: string;
  startedAt: string;
  finishedAt: string;
}

export interface AnswerDraft {
  answerBlocks: Record<string, any[]>;
  finalNumber: string;
}

const makeBlankDraft = (): AnswerDraft => {
  const ts = Date.now();
  return {
    answerBlocks: {
      diketahui:  [{ id: `d-${ts}-0`,  type: 'text' as const, value: '' }],
      ditanya:    [{ id: `dt-${ts}-0`, type: 'text' as const, value: '' }],
      pengerjaan: [{ id: `p-${ts}-0`,  type: 'text' as const, value: '' }],
      kesimpulan: [{ id: `k-${ts}-0`,  type: 'text' as const, value: '' }],
    },
    finalNumber: '',
  };
};

// ─────────────────────────────────────────────
// Tata cara
// ─────────────────────────────────────────────
const TATA_CARA = [
  { icon: 'info',         no: '1', label: 'Diketahui',  color: 'bg-sky-500',     desc: 'Tuliskan semua data / informasi yang diketahui dari soal.' },
  { icon: 'help',         no: '2', label: 'Ditanya',    color: 'bg-violet-500',  desc: 'Tuliskan inti pertanyaan — apa yang harus dicari.' },
  { icon: 'calculate',    no: '3', label: 'Pengerjaan', color: 'bg-amber-500',   desc: 'Tunjukkan langkah perhitungan dan isi jawaban angka akhir.' },
  { icon: 'check_circle', no: '4', label: 'Kesimpulan', color: 'bg-emerald-500', desc: 'Tuliskan kesimpulan dari hasil pengerjaan.' },
];

const statusCls: Record<QuestionStatus, string> = {
  untouched: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600',
  ragu:      'bg-amber-100 text-amber-700 border-amber-300 ring-1 ring-amber-300',
  done:      'bg-emerald-500 text-white border-emerald-500',
};

// ─────────────────────────────────────────────
// ExamSession
// ─────────────────────────────────────────────
export const ExamSession: React.FC<ExamSessionProps> = ({
  questionIds, examTitle, examDuration, testType, strand, onFinish,
}) => {
  const { userName, userNisn, user } = useAuth();

  const [phase, setPhase] = useState<'intro' | 'exam' | 'scoring' | 'done'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);

  const [statuses, setStatuses] = useState<QuestionStatus[]>(
    () => questionIds.map(() => 'untouched' as QuestionStatus)
  );

  // Draft per soal — tidak hilang saat ganti soal
  const [drafts, setDrafts] = useState<Record<string, AnswerDraft>>(
    () => Object.fromEntries(questionIds.map(id => [id, makeBlankDraft()]))
  );

  // Hasil final (setelah Simpan per soal)
  const [results, setResults] = useState<Record<string, SoalResult>>({});

  // Hasil akhir setelah submit semua
  const [finalResults, setFinalResults] = useState<{ questionId: string; benar: boolean; finalNumber: string; kunci: string | number | null }[]>([]);
  const [aiProgress, setAiProgress] = useState('');
  const [submitError, setSubmitError] = useState('');

  const totalSoal = questionIds.length;
  const typeLabel = testType === 'pretest' ? 'Pretest' : 'Posttest';
  const typeGrad  = testType === 'pretest' ? 'from-amber-500 to-orange-400' : 'from-emerald-600 to-teal-500';

  const doneCount  = statuses.filter(s => s === 'done').length;
  const raguCount  = statuses.filter(s => s === 'ragu').length;
  const allGreen   = statuses.every(s => s === 'done');
  const isLastQ    = currentIdx === totalSoal - 1;
  const lastQDone  = statuses[totalSoal - 1] === 'done';
  const currentId  = questionIds[currentIdx];

  // ── Update draft ──
  const handleDraftChange = useCallback((questionId: string, draft: AnswerDraft) => {
    setDrafts(prev => ({ ...prev, [questionId]: draft }));
  }, []);

  // ── Simpan soal ──
  const handleQuestionResult = useCallback((result: SoalResult) => {
    setResults(prev => ({ ...prev, [result.questionId]: result }));
    setStatuses(prev => {
      const next = [...prev];
      next[currentIdx] = 'done';
      // Auto-pindah ke soal yang belum dikerjakan (bukan soal terakhir dulu)
      const nextIdx = next.findIndex((s, i) => i !== currentIdx && s === 'untouched');
      if (nextIdx !== -1) {
        setTimeout(() => {
          setCurrentIdx(nextIdx);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
      }
      return next;
    });
  }, [currentIdx]);

  const markRagu = useCallback(() => {
    setStatuses(prev => {
      const next = [...prev];
      next[currentIdx] = 'ragu';
      return next;
    });
    const next = (currentIdx + 1) % totalSoal;
    setCurrentIdx(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIdx, totalSoal]);

  // ── Submit semua ──
  const handleSubmitAll = async () => {
    setSubmitError('');
    // Validasi: semua soal harus done
    if (!allGreen) {
      const belumIdx = statuses.map((s, i) => s !== 'done' ? i + 1 : null).filter(Boolean);
      setSubmitError(`Soal ${belumIdx.join(', ')} belum disimpan.`);
      return;
    }

    setPhase('scoring');

    // Kumpulkan hasil per soal — cek benar/salah dari kunci jawaban angka
    // Ambil rme_keys dari DB untuk tiap soal
    const resultList: { questionId: string; benar: boolean; finalNumber: string; kunci: string | number | null }[] = [];

    for (let qi = 0; qi < questionIds.length; qi++) {
      const qId = questionIds[qi];
      const res = results[qId];
      if (!res) { resultList.push({ questionId: qId, benar: false, finalNumber: '', kunci: null }); continue; }

      setAiProgress(`Memproses soal ${qi + 1} dari ${totalSoal}...`);

      // Fetch kunci dari DB
      let kunci: string | number | null = null;
      try {
        const { data } = await supabase.from('questions').select('rme_keys, content_blocks').eq('id', qId).maybeSingle();
        if (data) {
          let rk = data.rme_keys;
          if (!rk) {
            // fallback dari content_blocks meta
            const meta = (data.content_blocks || []).find((b: any) => String(b.value || '').startsWith('__RME_KEYS__'));
            if (meta) {
              try { rk = JSON.parse(String(meta.value).replace('__RME_KEYS__:', '')); } catch { /* */ }
            }
          }
          if (rk) {
            if (typeof rk === 'string') { try { rk = JSON.parse(rk); } catch { /* */ } }
            kunci = rk?.finalNumericAnswer ?? null;
          }
        }
      } catch { /* skip */ }

      const benar = kunci !== null && numbersMatch(res.finalNumber, kunci);
      resultList.push({ questionId: qId, benar, finalNumber: res.finalNumber, kunci });

      // Simpan ke DB — hapus jawaban lama dulu agar tidak duplikat
      if (user) {
        try {
          // Simpan block sebagai JSON array agar gambar/latex ter-render di PDF
          const answerJson = JSON.stringify({
            diketahui:  JSON.stringify((res.answerBlocks.diketahui || []).map((b: any) => ({ type: b.type, value: b.value }))),
            ditanya:    JSON.stringify((res.answerBlocks.ditanya || []).map((b: any) => ({ type: b.type, value: b.value }))),
            pengerjaan: JSON.stringify((res.answerBlocks.pengerjaan || []).map((b: any) => ({ type: b.type, value: b.value }))),
            kesimpulan: JSON.stringify((res.answerBlocks.kesimpulan || []).map((b: any) => ({ type: b.type, value: b.value }))),
            finalNumber: res.finalNumber,
            isCorrect: benar,
            student_name: userName,
            student_nisn: userNisn,
            started_at: res.startedAt,
            finished_at: res.finishedAt,
          });
          // Hapus jawaban lama user ini untuk soal ini sebelum insert baru
          await supabase.from('jawaban').delete().eq('user_id', user.id).eq('soal_id', qId);
          await supabase.from('jawaban').insert([{
            user_id: user.id, soal_id: qId,
            jawaban: answerJson,
            skor: benar ? 100 : 0, skor_maks: 100,
            alasan: benar ? 'Jawaban angka benar.' : 'Jawaban angka tidak tepat.',
          }]);
        } catch { /* skip */ }
      }
    }

    setFinalResults(resultList);
    setPhase('done');
  };

  // ═══════════════════════════════════════════
  // INTRO
  // ═══════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-4 animate-in fade-in">
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${typeGrad} p-6 text-white shadow-xl`}>
          <div className="absolute right-3 bottom-0 opacity-[0.07] text-[88px] font-black leading-none select-none">∑</div>
          <div className="relative z-10 space-y-1">
            <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/25 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-[12px]">quiz</span>
              {typeLabel} · {strand}
            </span>
            <h1 className="text-2xl font-extrabold leading-tight pt-1">{examTitle}</h1>
            <p className="text-sm opacity-80">{totalSoal} soal · {examDuration} menit · Metode 4 Tahap RME</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 shadow-sm overflow-hidden">
          <div className="p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Identitas Peserta</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <User size={14} className="text-indigo-500" />, label: 'Nama', val: userName || '—' },
                { icon: <Hash size={14} className="text-indigo-500" />, label: 'NISN', val: userNisn || '—' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{item.label}</p>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Rincian Ujian</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <BookOpen size={16} className="text-indigo-500" />, label: 'Soal', value: `${totalSoal}` },
                { icon: <Clock size={16} className="text-amber-500" />, label: 'Durasi', value: `${examDuration} mnt` },
                { icon: <span className="material-symbols-outlined text-emerald-500 text-[18px]">task_alt</span>, label: 'Koreksi', value: 'Kunci Jawaban' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-1">{item.icon}</div>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{item.value}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Tata Cara — 4 Tahap RME</p>
          <div className="grid grid-cols-2 gap-2.5">
            {TATA_CARA.map(t => (
              <div key={t.no} className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                <div className={`w-7 h-7 rounded-lg ${t.color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-white text-[13px]">{t.icon}</span>
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">Tahap {t.no} — {t.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Jawaban yang sudah diketik <strong>tetap tersimpan</strong> meski berpindah soal. Klik <strong>Simpan</strong> di tiap soal untuk menandainya hijau, lalu di soal terakhir klik <strong>Kumpulkan Semua Jawaban</strong>.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onFinish}
            className="px-5 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Kembali
          </button>
          <button onClick={() => setPhase('exam')}
            className={`flex-1 py-3.5 rounded-2xl bg-gradient-to-r ${typeGrad} text-white font-extrabold text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2`}>
            Mulai Ujian <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SCORING / LOADING
  // ═══════════════════════════════════════════
  if (phase === 'scoring') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-6 animate-in fade-in">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-violet-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <CheckCircle size={22} className="text-white" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-extrabold text-slate-800 dark:text-white text-base">Memproses jawaban...</p>
          <p className="text-xs text-indigo-500 font-bold mt-1.5">{aiProgress}</p>
          <p className="text-xs text-slate-400 mt-1">Mohon jangan tutup halaman ini</p>
        </div>
        <div className="flex gap-2">
          {questionIds.map((_, i) => (
            <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all ${
              i < finalResults.length ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 text-slate-400'
            }`}>
              {i < finalResults.length ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // DONE — LAYAR HASIL
  // ═══════════════════════════════════════════
  if (phase === 'done') {
    const benarCount = finalResults.filter(r => r.benar).length;
    const salahCount = finalResults.length - benarCount;
    const nilaiAkhir = Math.round((benarCount / totalSoal) * 100);
    const nilaiColor = nilaiAkhir >= 75 ? 'text-emerald-500' : nilaiAkhir >= 50 ? 'text-amber-500' : 'text-rose-500';
    const nilaiGrad  = nilaiAkhir >= 75 ? 'from-emerald-500 to-teal-400' : nilaiAkhir >= 50 ? 'from-amber-400 to-orange-400' : 'from-rose-500 to-pink-500';

    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-4 animate-in fade-in">

        {/* Hero hasil */}
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${nilaiGrad} p-6 text-white shadow-xl text-center`}>
          <div className="absolute right-3 bottom-0 opacity-[0.07] text-[88px] font-black leading-none select-none">✓</div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold">Ujian Selesai!</h2>
            <p className="text-sm opacity-80 mt-1">{typeLabel} · {strand} · {totalSoal} soal</p>
          </div>
        </div>

        {/* Statistik benar/salah */}
        <div className="grid grid-cols-3 gap-3">
          {/* Nilai */}
          <div className="col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center justify-center shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nilai</p>
            <p className={`text-3xl font-black ${nilaiColor}`}>{nilaiAkhir}</p>
            <p className="text-[10px] text-slate-400">/100</p>
          </div>

          {/* Benar */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-4 flex flex-col items-center justify-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Benar</p>
            <p className="text-3xl font-black text-emerald-600">{benarCount}</p>
            <p className="text-[10px] text-emerald-500">soal</p>
          </div>

          {/* Salah */}
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 p-4 flex flex-col items-center justify-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 mb-1">Salah</p>
            <p className="text-3xl font-black text-rose-500">{salahCount}</p>
            <p className="text-[10px] text-rose-400">soal</p>
          </div>
        </div>

        {/* Detail per soal */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Per Soal</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {finalResults.map((r, i) => (
              <div key={r.questionId} className="flex items-center gap-3 px-4 py-3">
                {/* Nomor */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                  r.benar ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {i + 1}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Soal {i + 1}</p>
                  <p className="text-[10px] text-slate-400">
                    Jawabanmu: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{r.finalNumber || '—'}</span>
                    {r.kunci !== null && (
                      <span className="ml-2">
                        · Kunci: <span className="font-mono font-bold text-emerald-600">{r.kunci}</span>
                      </span>
                    )}
                  </p>
                </div>
                {/* Badge */}
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                  r.benar
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                }`}>
                  {r.benar ? '✓ Benar' : '✗ Salah'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tombol kembali */}
        <button
          onClick={onFinish}
          className={`w-full py-4 rounded-2xl bg-gradient-to-r ${typeGrad} text-white font-extrabold text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2`}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Halaman Ujian
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // EXAM PHASE
  // ═══════════════════════════════════════════
  return (
    <div className="w-full pb-20 animate-in fade-in">

      {/* Navigator soal — sticky */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5 flex-wrap flex-1">
            {questionIds.map((_, qi) => (
              <button
                key={qi}
                onClick={() => { setCurrentIdx(qi); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black border-2 transition-all cursor-pointer ${
                  qi === currentIdx
                    ? 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-300 scale-110'
                    : statusCls[statuses[qi]]
                }`}
                title={`Soal ${qi + 1} — ${statuses[qi]}`}
              >
                {statuses[qi] === 'done' ? '✓' : statuses[qi] === 'ragu' ? '?' : qi + 1}
              </button>
            ))}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-black text-slate-500">Soal {currentIdx + 1}/{totalSoal}</p>
            <p className="text-[9px] text-slate-400">✓{doneCount} · ?{raguCount}</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2 flex gap-3 text-[9px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200 inline-block" /> Belum</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 border border-amber-300 inline-block" /> Ragu-ragu</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Selesai</span>
        </div>
      </div>

      {/* Soal */}
      <div className="px-4 pt-2">
        <QuizQuestionDynamic
          key={currentId}
          questionId={currentId}
          initialDraft={drafts[currentId]}
          onDraftChange={(draft) => handleDraftChange(currentId, draft)}
          onFinish={handleQuestionResult as any}
          nextLabel={currentIdx < totalSoal - 1 ? `Simpan & Soal ${currentIdx + 2}` : 'Simpan Jawaban'}
          onMarkRagu={markRagu}
          soalInfo={{ current: currentIdx + 1, total: totalSoal }}
        />
      </div>

      {/* ── TOMBOL SUBMIT — hanya di soal terakhir, setelah soal terakhir disimpan ── */}
      {isLastQ && lastQDone && (
        <div className="px-4 mt-4 space-y-3 max-w-4xl mx-auto animate-in slide-in-from-bottom-3">

          {/* Progress semua soal */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Pengerjaan</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                allGreen ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {doneCount}/{totalSoal} selesai
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {questionIds.map((_, qi) => (
                <div key={qi} className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-black border-2 ${statusCls[statuses[qi]]}`}>
                  {statuses[qi] === 'done' ? '✓' : statuses[qi] === 'ragu' ? '?' : qi + 1}
                </div>
              ))}
            </div>

            {/* Soal yang belum selesai */}
            {!allGreen && (
              <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
                <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                  Masih ada soal yang belum disimpan:{' '}
                  {statuses.map((s, i) => s !== 'done' ? `Soal ${i + 1}` : null).filter(Boolean).join(', ')}.
                  Kembali ke soal tersebut untuk menyelesaikannya.
                </p>
              </div>
            )}
          </div>

          {/* Error jika ada */}
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-xs font-bold text-rose-700">
              ⚠ {submitError}
            </div>
          )}

          {/* Tombol submit */}
          <button
            onClick={handleSubmitAll}
            disabled={!allGreen}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              allGreen
                ? `bg-gradient-to-r ${typeGrad} text-white cursor-pointer hover:opacity-90 hover:scale-[1.01]`
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
            {allGreen ? 'Kumpulkan & Lihat Hasil' : `Selesaikan dulu semua soal (${doneCount}/${totalSoal})`}
          </button>
        </div>
      )}

      {/* Panduan saat di soal terakhir tapi belum disimpan */}
      {isLastQ && !lastQDone && (
        <div className="px-4 mt-2 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <span className="material-symbols-outlined text-indigo-500 text-[16px]">info</span>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold">
              Ini soal terakhir. Simpan jawaban soal ini dulu, lalu tombol <strong>Kumpulkan Semua</strong> akan muncul.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
