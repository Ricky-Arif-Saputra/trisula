/**
 * ExamSession — ujian multi-soal dengan:
 *  1. Intro screen premium
 *  2. Navigasi soal bebas via kotak nomor
 *  3. Status soal: abu=belum, kuning=ragu-ragu, hijau=selesai
 *  4. Penilaian AI di akhir (setelah semua soal selesai)
 */
import React, { useState, useCallback } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { QuizQuestionDynamic } from './QuizQuestionDynamic';
import { supabase } from '../../lib/supabaseClient';
import { nilaiTahap } from '../../lib/aiScoring';
import {
  CheckCircle, ChevronRight, User, Hash, BookOpen,
  Clock, AlertTriangle, Loader2, Award,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type QuestionStatus = 'untouched' | 'ragu' | 'done';

interface ExamSessionProps {
  questionIds: string[];
  examTitle: string;
  examDuration: number;
  testType: 'pretest' | 'postest';
  strand: string;
  onFinish: () => void;
}

interface SoalResult {
  questionId: string;
  answerBlocks: Record<string, any[]>;
  finalNumber: string;
  startedAt: string;
  finishedAt: string;
}

// ─────────────────────────────────────────────
// Tata cara
// ─────────────────────────────────────────────
const TATA_CARA = [
  { icon: 'info',         no: '1', label: 'Diketahui',  color: 'bg-sky-500',     desc: 'Tuliskan semua data / informasi yang diketahui dari soal.' },
  { icon: 'help',         no: '2', label: 'Ditanya',    color: 'bg-violet-500',  desc: 'Tuliskan inti pertanyaan — apa yang harus dicari.' },
  { icon: 'calculate',    no: '3', label: 'Pengerjaan', color: 'bg-amber-500',   desc: 'Tunjukkan langkah perhitungan dan isi jawaban angka akhir.' },
  { icon: 'check_circle', no: '4', label: 'Kesimpulan', color: 'bg-emerald-500', desc: 'Tuliskan kesimpulan dari hasil pengerjaan.' },
];

// ─────────────────────────────────────────────
// StatusChip — kotak nomor soal
// ─────────────────────────────────────────────
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
  // Simpan jawaban per soal agar bisa dinilai di akhir
  const [results, setResults] = useState<Record<string, SoalResult>>({});
  const [aiProgress, setAiProgress] = useState('');
  const [aiScoresSummary, setAiScoresSummary] = useState<Record<string, number>>({});

  const totalSoal = questionIds.length;
  const typeLabel = testType === 'pretest' ? 'Pretest' : 'Posttest';
  const typeGrad  = testType === 'pretest' ? 'from-amber-500 to-orange-400' : 'from-emerald-600 to-teal-500';
  const typeSolid = testType === 'pretest' ? 'bg-amber-500' : 'bg-emerald-600';

  const allDone = statuses.every(s => s === 'done' || s === 'ragu');
  const doneCount = statuses.filter(s => s === 'done').length;
  const raguCount = statuses.filter(s => s === 'ragu').length;

  // ── Callback dari QuizQuestionDynamic saat soal selesai ──
  const handleQuestionResult = useCallback((result: SoalResult) => {
    setResults(prev => ({ ...prev, [result.questionId]: result }));
    setStatuses(prev => {
      const next = [...prev];
      next[currentIdx] = 'done';
      // Auto-pindah ke soal berikutnya yang belum dikerjakan — pakai `next` (fresh state)
      const nextUntouched = next.findIndex((s, i) => i !== currentIdx && s === 'untouched');
      if (nextUntouched !== -1) {
        // defer untuk menghindari update bersamaan
        setTimeout(() => {
          setCurrentIdx(nextUntouched);
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
    // Pindah ke soal berikutnya
    const next = (currentIdx + 1) % totalSoal;
    setCurrentIdx(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIdx, totalSoal]);

  // ── Submit semua & nilai AI ──
  const handleSubmitAll = async () => {
    setPhase('scoring');
    const summary: Record<string, number> = {};

    for (let qi = 0; qi < questionIds.length; qi++) {
      const qId = questionIds[qi];
      const res = results[qId];
      if (!res) continue;

      setAiProgress(`Menilai soal ${qi + 1} dari ${totalSoal}...`);
      const scoreMap: Record<string, { skor: number; skor_maks: number; alasan: string }> = {};
      const stageKeys = ['diketahui', 'ditanya', 'pengerjaan', 'kesimpulan'] as const;

      for (let si = 0; si < stageKeys.length; si++) {
        const sk = stageKeys[si];
        const blocks = res.answerBlocks[sk] || [];
        const jawabanTahap = blocks
          .map((b: any) => {
            if (!b.value?.trim()) return '';
            if (b.type === 'latex') return `$$${b.value.trim()}$$`;
            if (b.type === 'image') return '[gambar]';
            return b.value.trim();
          })
          .filter(Boolean)
          .join('\n');

        if (si > 0) await new Promise(r => setTimeout(r, 1200));

        try {
          const result = await nilaiTahap({
            soalId: qId,
            tahap: sk,
            jawaban: jawabanTahap || '—',
            rubrik: `Berikan nilai untuk tahap ${sk}`,
            skorMaks: 20,
          });
          scoreMap[sk] = { skor: result.skor, skor_maks: 20, alasan: result.alasan };
        } catch {
          scoreMap[sk] = { skor: 0, skor_maks: 20, alasan: 'Gagal dinilai.' };
        }
      }

      const totalSkor = Object.values(scoreMap).reduce((s, v) => s + v.skor, 0);
      const totalMaks = Object.values(scoreMap).reduce((s, v) => s + v.skor_maks, 0);
      const normScore = totalMaks > 0 ? Math.round(totalSkor / totalMaks * 100) : 0;
      summary[qId] = normScore;

      if (user) {
        const isCorrect = res.finalNumber !== '';
        const answerJson = JSON.stringify({
          diketahui:  (res.answerBlocks.diketahui || []).map((b: any) => b.value).join('\n'),
          ditanya:    (res.answerBlocks.ditanya || []).map((b: any) => b.value).join('\n'),
          pengerjaan: (res.answerBlocks.pengerjaan || []).map((b: any) => b.value).join('\n'),
          kesimpulan: (res.answerBlocks.kesimpulan || []).map((b: any) => b.value).join('\n'),
          finalNumber: res.finalNumber,
          isCorrect,
          ai_scores: scoreMap,
          total_skor: totalSkor,
          total_maks: totalMaks,
          student_name: userName,
          student_nisn: userNisn,
          started_at: res.startedAt,
          finished_at: res.finishedAt,
        });
        await supabase.from('jawaban').insert([{
          user_id: user.id, soal_id: qId,
          jawaban: answerJson, skor: normScore, skor_maks: 100,
          alasan: `Skor AI: ${normScore}/100`,
        }]).then(() => {});
      }
    }

    setAiScoresSummary(summary);
    setPhase('done');
  };

  // ═══════════════════════════════════════════
  // INTRO SCREEN
  // ═══════════════════════════════════════════
  if (phase === 'intro') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-4 animate-in fade-in">
        {/* Hero */}
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

        {/* Identitas + Rincian dalam satu kartu */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 shadow-sm overflow-hidden">
          {/* Identitas */}
          <div className="p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Identitas Peserta</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <User size={14} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Nama</p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{userName || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <Hash size={14} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">NISN</p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{userNisn || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian */}
          <div className="p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Rincian Ujian</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <BookOpen size={16} className="text-indigo-500" />, label: 'Soal', value: `${totalSoal}` },
                { icon: <Clock size={16} className="text-amber-500" />,    label: 'Durasi', value: `${examDuration} mnt` },
                { icon: <span className="material-symbols-outlined text-emerald-500 text-[18px]">psychology</span>, label: 'Penilaian', value: 'AI Otomatis' },
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

        {/* Tata cara ringkas */}
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
              Isi semua tahap setiap soal. Penilaian AI dijalankan setelah semua soal selesai. Kamu bisa tandai soal sebagai <strong>ragu-ragu</strong> untuk dikerjakan lagi sebelum mengumpulkan.
            </p>
          </div>
        </div>

        {/* Tombol */}
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
  // SCORING SCREEN
  // ═══════════════════════════════════════════
  if (phase === 'scoring') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-6 animate-in fade-in">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-violet-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[22px]">smart_toy</span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-extrabold text-slate-800 dark:text-white text-base">AI sedang menilai jawabanmu...</p>
          <p className="text-xs text-indigo-500 font-bold mt-1.5">{aiProgress}</p>
          <p className="text-xs text-slate-400 mt-1">Mohon jangan tutup halaman ini</p>
        </div>
        {/* Progress dots */}
        <div className="flex gap-2">
          {questionIds.map((qId, i) => {
            const scored = aiScoresSummary[qId] !== undefined;
            return (
              <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all ${
                scored ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 text-slate-400'
              }`}>
                {scored ? '✓' : i + 1}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // DONE SCREEN
  // ═══════════════════════════════════════════
  if (phase === 'done') {
    const avgScore = Object.keys(aiScoresSummary).length > 0
      ? Math.round(Object.values(aiScoresSummary).reduce((a, b) => a + b, 0) / Object.values(aiScoresSummary).length)
      : 0;
    const scoreColor = avgScore >= 75 ? 'text-emerald-500' : avgScore >= 50 ? 'text-amber-500' : 'text-rose-500';
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-10 flex flex-col items-center text-center gap-5 animate-in fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl">
          <CheckCircle size={40} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Ujian Selesai!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {totalSoal} soal {typeLabel} — dinilai oleh AI
          </p>
        </div>
        {/* Nilai rata-rata */}
        {avgScore > 0 && (
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Award size={20} className={scoreColor} />
              <p className="text-sm font-black text-slate-700 dark:text-slate-200 flex-1">Rata-rata Nilai AI</p>
              <p className={`text-2xl font-black ${scoreColor}`}>{avgScore}</p>
            </div>
            {/* Per soal */}
            <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              {questionIds.map((qId, i) => {
                const s = aiScoresSummary[qId] ?? '?';
                const sc = typeof s === 'number' ? (s >= 75 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-slate-400';
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-xl ${sc} text-white text-xs font-black flex items-center justify-center`}>{s}</div>
                    <p className="text-[9px] text-slate-400">Soal {i + 1}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <button onClick={onFinish}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer transition-colors shadow-md">
          Kembali ke Daftar Ujian
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // EXAM PHASE
  // ═══════════════════════════════════════════
  const currentId = questionIds[currentIdx];

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
            <p className="text-[9px] text-slate-400">
              ✓{doneCount} · ?{raguCount}
            </p>
          </div>
        </div>
        {/* Legenda warna */}
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
          onFinish={handleQuestionResult as any}
          nextLabel={currentIdx < totalSoal - 1 ? `Simpan & Soal ${currentIdx + 2}` : 'Simpan Jawaban'}
          onMarkRagu={markRagu}
          showSubmitAll={allDone}
          onSubmitAll={handleSubmitAll}
          soalInfo={{ current: currentIdx + 1, total: totalSoal }}
        />
      </div>
    </div>
  );
};
