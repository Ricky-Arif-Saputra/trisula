import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';

// =====================================================
// Types
// =====================================================
interface ContentBlock { id: string; type: 'text' | 'latex' | 'image'; value: string; }
interface ExamOption { id: string; text: string; is_correct: boolean; }
interface ExamQuestion {
  id: string;
  title?: string;
  content_blocks: ContentBlock[];
  options: ExamOption[];
}
interface ExamPackage {
  id: string;
  title: string;
  strand: string;
  test_type: 'pretest' | 'postest';
  duration_minutes: number;
  questions: ExamQuestion[];
  created_at?: string;
}

interface StudentAnswer { questionId: string; selectedOptionId: string | null; }

interface ExamViewerProps {
  examId: string;
  onBack: () => void;
}

// =====================================================
// Helpers
// =====================================================
const safeParse = (data: any): any[] => {
  if (!data) return [];
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return []; } }
  return Array.isArray(data) ? data : [];
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// =====================================================
// PDF Export (pure HTML snapshot via browser print)
// =====================================================
const exportPDF = (params: {
  studentName: string;
  examTitle: string;
  strand: string;
  testType: string;
  startTime: Date;
  endTime: Date;
  totalQ: number;
  correct: number;
  wrong: number;
  score: number;
}) => {
  const { studentName, examTitle, strand, testType, startTime, endTime, totalQ, correct, wrong, score } = params;
  const dateStr = startTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const startStr = startTime.toLocaleTimeString('id-ID');
  const endStr = endTime.toLocaleTimeString('id-ID');
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  const durationStr = `${Math.floor(duration / 60)} menit ${duration % 60} detik`;

  const html = `
  <!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
  <title>Hasil ${testType} — TRISULA EduMath</title>
  <style>
    body { font-family: 'Georgia', serif; margin: 40px; color: #1e293b; }
    .header { text-align: center; border-bottom: 3px solid #4338ca; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: 900; color: #4338ca; letter-spacing: 4px; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    .badge { display: inline-block; background: #ede9fe; color: #5b21b6; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 8px; text-transform: uppercase; }
    h2 { color: #1e1b4b; font-size: 20px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    td { padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 14px; }
    td:first-child { background: #f8fafc; font-weight: 700; width: 200px; }
    .score-box { text-align: center; margin: 30px 0; padding: 24px; border: 3px solid #4338ca; border-radius: 12px; background: linear-gradient(135deg, #eef2ff, #f5f3ff); }
    .score-val { font-size: 64px; font-weight: 900; color: #4338ca; }
    .score-label { font-size: 16px; color: #64748b; margin-top: 4px; }
    .stat-row { display: flex; gap: 20px; justify-content: center; margin: 20px 0; }
    .stat { text-align: center; padding: 12px 24px; border-radius: 8px; min-width: 100px; }
    .stat.correct { background: #dcfce7; }
    .stat.wrong { background: #fee2e2; }
    .stat .val { font-size: 28px; font-weight: 800; }
    .stat .lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px; }
    .watermark { color: #4338ca; font-weight: 700; }
    @media print { body { margin: 20px; } }
  </style></head><body>
  <div class="header">
    <div class="logo">TRISULA</div>
    <div class="subtitle">EduMath — Platform Pembelajaran Matematika Interaktif</div>
    <div class="badge">Bukti Pengerjaan Resmi · ${testType.toUpperCase()}</div>
  </div>
  <h2>${examTitle}</h2>
  <p style="color:#64748b;font-size:13px;">Kategori Materi: <strong>${strand.charAt(0).toUpperCase() + strand.slice(1)}</strong></p>
  <table>
    <tr><td>Nama Siswa</td><td>${studentName}</td></tr>
    <tr><td>Tanggal Pengerjaan</td><td>${dateStr}</td></tr>
    <tr><td>Waktu Mulai</td><td>${startStr}</td></tr>
    <tr><td>Waktu Selesai</td><td>${endStr}</td></tr>
    <tr><td>Durasi Digunakan</td><td>${durationStr}</td></tr>
    <tr><td>Jumlah Soal</td><td>${totalQ} Soal</td></tr>
  </table>
  <div class="score-box">
    <div class="score-val">${score}</div>
    <div class="score-label">Nilai Akhir (Skala 0 – 100)</div>
  </div>
  <div class="stat-row">
    <div class="stat correct"><div class="val" style="color:#16a34a">${correct}</div><div class="lbl">Jawaban Benar</div></div>
    <div class="stat wrong"><div class="val" style="color:#dc2626">${wrong}</div><div class="lbl">Jawaban Salah</div></div>
    <div class="stat" style="background:#f1f5f9"><div class="val" style="color:#64748b">${totalQ - correct - wrong}</div><div class="lbl">Tidak Dijawab</div></div>
  </div>
  <div class="footer">
    <span class="watermark">TRISULA EduMath</span> · Dokumen ini diterbitkan secara otomatis oleh sistem pada ${endStr}, ${dateStr}.<br/>
    Dokumen ini sah tanpa tanda tangan basah.
  </div>
  </body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  }
};

// =====================================================
// Main ExamViewer Component
// =====================================================
export const ExamViewer: React.FC<ExamViewerProps> = ({ examId, onBack }) => {
  const { user } = useAuth();
  const [exam, setExam] = useState<ExamPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exam state
  const [phase, setPhase] = useState<'intro' | 'active' | 'result'>('intro');
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch exam package
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('exam_packages')
          .select('*')
          .eq('id', examId)
          .maybeSingle();
        if (err) throw err;
        if (!data) { setError('Paket ujian tidak ditemukan.'); return; }
        const pkg = { ...data, questions: safeParse(data.questions) } as ExamPackage;
        setExam(pkg);
        setTimeLeft((pkg.duration_minutes || 30) * 60);
        setAnswers(pkg.questions.map((q: ExamQuestion) => ({ questionId: q.id, selectedOptionId: null })));
      } catch (e: any) {
        setError(e.message || 'Gagal memuat ujian.');
      } finally { setLoading(false); }
    };
    if (examId) fetch();
  }, [examId]);

  // Countdown timer
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const handleStart = () => {
    setStartTime(new Date());
    setPhase('active');
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, selectedOptionId: optionId } : a));
  };

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setEndTime(new Date());
    setPhase('result');
  };

  // Results calculation
  const results = React.useMemo(() => {
    if (!exam || phase !== 'result') return null;
    let correct = 0, wrong = 0, unanswered = 0;
    exam.questions.forEach((q: ExamQuestion) => {
      const answer = answers.find(a => a.questionId === q.id);
      const opts = safeParse(q.options);
      if (!answer?.selectedOptionId) { unanswered++; return; }
      const chosen = opts.find((o: ExamOption) => o.id === answer.selectedOptionId);
      if (chosen?.is_correct) correct++; else wrong++;
    });
    const total = exam.questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, wrong, unanswered, total, score };
  }, [exam, answers, phase]);

  // ---- Loading & Error states ----
  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-500">Memuat paket ujian...</span>
      </div>
    </div>
  );

  if (error || !exam) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 flex gap-3 items-start">
      <span className="material-symbols-outlined text-2xl">error</span>
      <div><h3 className="font-bold">Gagal memuat ujian</h3><p className="text-sm">{error || 'Data tidak ditemukan'}</p></div>
    </div>
  );

  // ---- PHASE: INTRO ----
  if (phase === 'intro') {
    return (
      <div className="flex flex-col w-full pb-16 font-sans px-4 pt-4 animate-in fade-in">
        <button onClick={onBack} className="mb-4 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs flex items-center gap-2 self-start hover:bg-surface-container-highest cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Kembali
        </button>
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] rounded-2xl p-8 text-white text-center shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">{exam.test_type === 'pretest' ? 'assignment' : 'assignment_turned_in'}</span>
          </div>
          <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            {exam.test_type === 'pretest' ? 'Pretest Diagnostik' : 'Postest Evaluasi'}
          </div>
          <h1 className="text-2xl font-extrabold mb-2">{exam.title}</h1>
          <p className="text-indigo-200 text-sm capitalize">Materi: {exam.strand}</p>
          <div className="grid grid-cols-2 gap-4 mt-6 text-center">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-black">{exam.questions.length}</div>
              <div className="text-xs text-indigo-200 uppercase font-bold mt-1">Soal</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-black">{exam.duration_minutes}</div>
              <div className="text-xs text-indigo-200 uppercase font-bold mt-1">Menit</div>
            </div>
          </div>
          <p className="text-sm text-indigo-200 mt-4">Pastikan koneksi internet stabil. Timer akan berjalan setelah tombol Mulai ditekan.</p>
          <button onClick={handleStart} className="mt-6 w-full py-4 bg-white text-indigo-700 font-extrabold rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg">
            <span className="material-symbols-outlined">play_arrow</span> Mulai Ujian
          </button>
        </div>
      </div>
    );
  }

  // ---- PHASE: ACTIVE ----
  if (phase === 'active') {
    const timerCritical = timeLeft <= 60;
    return (
      <div className="flex flex-col w-full pb-20 font-sans">
        {/* Sticky Header + Timer */}
        <div className={`sticky top-0 z-30 flex items-center justify-between px-4 py-3 shadow-md border-b ${timerCritical ? 'bg-rose-600 border-rose-700' : 'bg-[#1e1b4b] border-indigo-900'}`}>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-sm truncate max-w-[200px]">{exam.title}</span>
            <span className="text-indigo-200 text-[10px] uppercase">{exam.test_type}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-lg ${timerCritical ? 'bg-white text-rose-600 animate-pulse' : 'bg-white/10 text-white'}`}>
            <span className="material-symbols-outlined text-[18px]">timer</span>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Questions */}
        <div className="px-4 pt-4 space-y-6">
          {exam.questions.map((q: ExamQuestion, qIdx: number) => {
            const blocks = safeParse(q.content_blocks);
            const opts = safeParse(q.options);
            const ans = answers.find(a => a.questionId === q.id);
            return (
              <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 border-b border-outline-variant/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">{qIdx + 1}</div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Soal {qIdx + 1} dari {exam.questions.length}</span>
                </div>
                <div className="p-5">
                  {/* Content blocks */}
                  <div className="space-y-3 mb-5">
                    {blocks.map((block: ContentBlock) => {
                      if (block?.type === 'text') return <p key={block.id} className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">{block.value}</p>;
                      if (block?.type === 'latex') return <div key={block.id} className="my-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"><code className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{block.value}</code></div>;
                      if (block?.type === 'image') return <div key={block.id} className="my-3 flex justify-center"><img src={block.value} alt="" className="max-h-48 rounded-xl border border-slate-200 shadow-sm" /></div>;
                      return null;
                    })}
                  </div>
                  {/* Options */}
                  <div className="flex flex-col gap-2">
                    {opts.map((opt: ExamOption, oIdx: number) => {
                      const letters = ['A', 'B', 'C', 'D', 'E'];
                      const isSelected = ans?.selectedOptionId === opt.id;
                      return (
                        <button key={opt.id} onClick={() => handleAnswer(q.id, opt.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-700 dark:text-slate-300'}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{letters[oIdx] || oIdx + 1}</div>
                          <span className="text-sm font-medium">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl">
          <button onClick={handleSubmit} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold rounded-2xl shadow-lg hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 transition-opacity">
            <span className="material-symbols-outlined">send</span> Submit & Selesai Ujian
          </button>
        </div>
      </div>
    );
  }

  // ---- PHASE: RESULT ----
  if (phase === 'result' && results) {
    const scoreColor = results.score >= 75 ? 'text-emerald-600' : results.score >= 50 ? 'text-amber-500' : 'text-rose-600';
    const scoreBg = results.score >= 75 ? 'from-emerald-50 to-teal-50 border-emerald-300' : results.score >= 50 ? 'from-amber-50 to-yellow-50 border-amber-300' : 'from-rose-50 to-pink-50 border-rose-300';

    const handleDownloadPDF = () => {
      exportPDF({
        studentName: user?.email?.split('@')[0] || 'Siswa',
        examTitle: exam.title,
        strand: exam.strand,
        testType: exam.test_type,
        startTime: startTime!,
        endTime: endTime!,
        totalQ: results.total,
        correct: results.correct,
        wrong: results.wrong,
        score: results.score,
      });
    };

    return (
      <div className="flex flex-col w-full pb-16 font-sans px-4 pt-4 animate-in zoom-in-95">
        {/* Result Header */}
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] rounded-2xl p-6 text-white text-center shadow-xl mb-5">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-3xl">workspace_premium</span>
          </div>
          <h2 className="text-xl font-extrabold">Ujian Selesai!</h2>
          <p className="text-indigo-200 text-sm mt-1">{exam.title}</p>
        </div>

        {/* Score Box */}
        <div className={`border-2 rounded-2xl p-6 bg-gradient-to-br ${scoreBg} text-center mb-4`}>
          <div className={`text-7xl font-black ${scoreColor}`}>{results.score}</div>
          <div className="text-sm font-bold text-slate-500 mt-1">Nilai Akhir (Skala 0 – 100)</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-emerald-600">{results.correct}</div>
            <div className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Benar</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-rose-600">{results.wrong}</div>
            <div className="text-[10px] font-bold text-rose-500 uppercase mt-1">Salah</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-slate-500">{results.unanswered}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Kosong</div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-slate-500">Tanggal</span><span className="font-bold">{startTime?.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Waktu Mulai</span><span className="font-bold">{startTime?.toLocaleTimeString('id-ID')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Waktu Selesai</span><span className="font-bold">{endTime?.toLocaleTimeString('id-ID')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Total Soal</span><span className="font-bold">{results.total} Soal</span></div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={handleDownloadPDF}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold rounded-2xl shadow-lg hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 transition-opacity">
            <span className="material-symbols-outlined">download</span>
            Unduh Hasil (PDF)
          </button>
          <button onClick={onBack}
            className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return null;
};
