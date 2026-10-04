import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import { scoreRmeAnswers, AiScoreResult, RmeAnswers, RmeKeys } from '../../lib/aiScoring';
import html2pdf from 'html2pdf.js';

// =====================================================
// Types
// =====================================================
interface ContentBlock { id: string; type: 'text' | 'latex' | 'image'; value: string; }
interface RmeKeys_ {
  ref_diketahui: string; ref_ditanya: string; ref_pengerjaan: string; ref_kesimpulan: string;
  points_diketahui: number; points_ditanya: number; points_pengerjaan: number; points_kesimpulan: number;
}
interface RmeQuestion {
  id: string;
  title?: string;
  content_blocks: ContentBlock[];
  options: any[];
  question_type?: string;
  rme_keys?: RmeKeys_;
}
interface ExamPackage {
  id: string;
  title: string;
  strand: string;
  test_type: 'pretest' | 'postest';
  exam_type?: string;
  duration_minutes: number;
  questions: RmeQuestion[];
  total_max_points?: number;
}
interface ExamViewerRmeProps {
  examId: string;
  onBack: () => void;
}

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

const STAGES = [
  { key: 'diketahui' as const, label: 'Diketahui', icon: 'info', color: 'sky', placeholder: 'Tuliskan hal-hal yang diketahui dari soal di sini...' },
  { key: 'ditanya' as const, label: 'Ditanya', icon: 'help', color: 'violet', placeholder: 'Tuliskan apa yang ditanyakan dalam soal...' },
  { key: 'pengerjaan' as const, label: 'Pengerjaan / Proses', icon: 'calculate', color: 'amber', placeholder: 'Tuliskan langkah-langkah pengerjaanmu, boleh gunakan LaTeX...' },
  { key: 'kesimpulan' as const, label: 'Kesimpulan', icon: 'check_circle', color: 'emerald', placeholder: 'Tuliskan kesimpulan akhir dari jawabanmu...' },
];

const stageBg: Record<string, string> = {
  sky: 'border-sky-300 bg-sky-50 dark:bg-sky-900/10',
  violet: 'border-violet-300 bg-violet-50 dark:bg-violet-900/10',
  amber: 'border-amber-300 bg-amber-50 dark:bg-amber-900/10',
  emerald: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10',
};
const stageLabel: Record<string, string> = {
  sky: 'text-sky-700 dark:text-sky-400',
  violet: 'text-violet-700 dark:text-violet-400',
  amber: 'text-amber-700 dark:text-amber-400',
  emerald: 'text-emerald-700 dark:text-emerald-400',
};
const stageBadge: Record<string, string> = {
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
};

export const ExamViewerRme: React.FC<ExamViewerRmeProps> = ({ examId, onBack }) => {
  const { user } = useAuth();
  const [exam, setExam] = useState<ExamPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'intro' | 'active' | 'scoring' | 'result'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pastAttempt, setPastAttempt] = useState<any>(null);

  // Per-question essay answers: Record<questionId, { diketahui, ditanya, pengerjaan, kesimpulan }>
  const [essayAnswers, setEssayAnswers] = useState<Record<string, RmeAnswers>>({});
  const [aiResults, setAiResults] = useState<Record<string, AiScoreResult>>({});
  const [scoringError, setScoringError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch exam
  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase.from('exam_packages').select('*').eq('id', examId).maybeSingle();
        if (err) throw err;
        if (!data) { setError('Paket ujian tidak ditemukan.'); return; }
        const pkg = { ...data, questions: safeParse(data.questions) } as ExamPackage;
        setExam(pkg);

        if (user) {
          const { data: attempt } = await supabase.from('exam_attempts').select('*').eq('exam_id', examId).eq('user_id', user.id).maybeSingle();
          if (attempt) {
            setPastAttempt(attempt);
            setPhase('result');
            setLoading(false);
            return;
          }
        }
        setTimeLeft((pkg.duration_minutes || 60) * 60);
        const initialAnswers: Record<string, RmeAnswers> = {};
        safeParse(data.questions).forEach((q: RmeQuestion) => {
          initialAnswers[q.id] = { diketahui: '', ditanya: '', pengerjaan: '', kesimpulan: '' };
        });
        setEssayAnswers(initialAnswers);
      } catch (e: any) {
        setError(e.message || 'Gagal memuat ujian.');
      } finally { setLoading(false); }
    };
    if (examId) fetchExam();
  }, [examId, user]);

  // Timer
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const handleStart = () => {
    if (!studentName.trim() || !studentNisn.trim()) { alert('Nama Lengkap dan NISN wajib diisi!'); return; }
    setShowIdentityModal(false);
    setStartTime(new Date());
    setPhase('active');
  };

  const updateEssayAnswer = (questionId: string, stage: keyof RmeAnswers, value: string) => {
    setEssayAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], [stage]: value } }));
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const now = new Date();
    setEndTime(now);
    setPhase('scoring');
    setScoringError(null);

    if (!exam) return;

    // Run AI scoring for each RME question
    const resultsMap: Record<string, AiScoreResult> = {};
    let totalScore = 0;
    let totalMaxPoints = 0;

    try {
      for (const q of exam.questions) {
        const keys = q.rme_keys;
        if (!keys) continue;
        const answers = essayAnswers[q.id] || { diketahui: '', ditanya: '', pengerjaan: '', kesimpulan: '' };
        const result = await scoreRmeAnswers(answers, keys as RmeKeys);
        resultsMap[q.id] = result;
        totalScore += result.scores.total;
        totalMaxPoints += (keys.points_diketahui + keys.points_ditanya + keys.points_pengerjaan + keys.points_kesimpulan);
      }
    } catch (e: any) {
      setScoringError(e.message || 'Gagal menjalankan penilaian AI.');
      setPhase('result');
    }

    setAiResults(resultsMap);

    // Normalise score to 0-100 scale
    const normalizedScore = totalMaxPoints > 0 ? Math.round((totalScore / totalMaxPoints) * 100) : 0;

    if (user) {
      try {
        await supabase.from('exam_attempts').insert({
          exam_id: exam.id,
          user_id: user.id,
          student_name: studentName,
          student_nisn: studentNisn,
          score: normalizedScore,
          correct_count: 0,
          wrong_count: 0,
          essay_answers: essayAnswers,
          ai_scores: resultsMap,
          total_essay_score: totalScore,
          total_max_points: totalMaxPoints,
        });
      } catch (e) {
        console.error('Failed to save RME exam attempt:', e);
      }
    }

    setPhase('result');
  };

  // ---- PDF Download ----
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('rme-pdf-template');
      if (!element) throw new Error('Template PDF tidak ditemukan.');
      await (html2pdf as any)().set({
        margin: 0,
        filename: `Hasil_Postest_RME_${studentNisn || pastAttempt?.student_nisn || 'siswa'}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(element).save();
    } catch (err: any) {
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally { setIsDownloading(false); }
  };

  // ---- Computed Results ----
  const computedResults = React.useMemo(() => {
    if (pastAttempt) return pastAttempt;
    if (Object.keys(aiResults).length === 0) return null;
    let totalScore = 0;
    let totalMaxPoints = 0;
    exam?.questions.forEach(q => {
      const r = aiResults[q.id];
      if (r) totalScore += r.scores.total;
      const k = q.rme_keys;
      if (k) totalMaxPoints += k.points_diketahui + k.points_ditanya + k.points_pengerjaan + k.points_kesimpulan;
    });
    return {
      score: totalMaxPoints > 0 ? Math.round((totalScore / totalMaxPoints) * 100) : 0,
      total_essay_score: totalScore,
      total_max_points: totalMaxPoints,
      student_name: studentName,
      student_nisn: studentNisn,
    };
  }, [aiResults, pastAttempt, exam, studentName, studentNisn]);

  const tanggal = (startTime || new Date()).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const waktuMulai = (startTime || new Date()).toLocaleTimeString('id-ID');
  const waktuSelesai = endTime ? endTime.toLocaleTimeString('id-ID') : '-';
  const durasi = startTime && endTime
    ? (() => { const s = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); return `${Math.floor(s / 60)} menit ${s % 60} detik`; })()
    : '-';

  const displayName = pastAttempt?.student_name || studentName || '-';
  const displayNisn = pastAttempt?.student_nisn || studentNisn || '-';
  const finalScore = computedResults?.score ?? 0;
  const scoreColor = finalScore >= 75 ? '#16a34a' : finalScore >= 50 ? '#d97706' : '#dc2626';

  // ---- Loading ----
  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-500">Memuat ujian RME...</span>
      </div>
    </div>
  );

  if (error || !exam) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 flex gap-3 items-start">
      <span className="material-symbols-outlined text-2xl">error</span>
      <div><h3 className="font-bold">Gagal memuat ujian</h3><p className="text-sm">{error || 'Data tidak ditemukan'}</p></div>
    </div>
  );

  // =====================================================
  // PHASE: INTRO
  // =====================================================
  if (phase === 'intro') {
    return (
      <div className="flex flex-col w-full pb-16 font-sans px-4 pt-4 animate-in fade-in">
        <button onClick={onBack} className="mb-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 self-start cursor-pointer hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Kembali
        </button>

        <div className="bg-gradient-to-br from-rose-700 to-orange-600 rounded-2xl p-8 text-white text-center shadow-xl mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-5xl">psychology</span>
          </div>
          <div className="inline-block px-3 py-1 bg-white/15 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            Postest RME — Realistic Mathematics Education
          </div>
          <h1 className="text-2xl font-black mb-2">{exam.title}</h1>
          <p className="text-rose-100 text-sm">{exam.strand} · {exam.duration_minutes} Menit · {exam.questions.length} Soal Essay</p>
          <div className="grid grid-cols-2 gap-3 mt-6 text-left">
            {[
              { icon: 'info', label: 'Tahap 1', desc: 'Diketahui' },
              { icon: 'help', label: 'Tahap 2', desc: 'Ditanya' },
              { icon: 'calculate', label: 'Tahap 3', desc: 'Pengerjaan' },
              { icon: 'check_circle', label: 'Tahap 4', desc: 'Kesimpulan' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <div><div className="font-bold text-xs">{item.label}</div><div className="text-rose-200 text-[10px]">{item.desc}</div></div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setShowIdentityModal(true)}
          className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-xl shadow-rose-600/30 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[24px]">play_arrow</span>
          Mulai Postest RME
        </button>

        {/* Identity Modal */}
        {showIdentityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-600 text-[20px]">badge</span>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white">Identitas Peserta</h3>
                  <p className="text-xs text-slate-500">Wajib diisi sebelum ujian dimulai</p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Nama Lengkap *</label>
                  <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Masukkan nama lengkap"
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-sm focus:border-rose-400 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">NISN *</label>
                  <input type="text" value={studentNisn} onChange={(e) => setStudentNisn(e.target.value)} placeholder="Masukkan NISN"
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-sm focus:border-rose-400 outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowIdentityModal(false)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer">Batal</button>
                <button onClick={handleStart} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm cursor-pointer shadow-lg">Mulai Ujian</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =====================================================
  // PHASE: SCORING
  // =====================================================
  if (phase === 'scoring') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        <h2 className="text-lg font-black text-slate-800 dark:text-white">Menilai dengan AI...</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Engine AI sedang membandingkan jawaban Anda dengan kunci dari Admin secara matematis. Mohon tunggu.
        </p>
      </div>
    );
  }

  // =====================================================
  // PHASE: ACTIVE
  // =====================================================
  if (phase === 'active' && exam) {
    const currentQ = exam.questions[currentQuestionIndex];
    const currentAnswer = essayAnswers[currentQ?.id] || { diketahui: '', ditanya: '', pengerjaan: '', kesimpulan: '' };
    const isLast = currentQuestionIndex === exam.questions.length - 1;
    const timerUrgent = timeLeft < 300;

    return (
      <div className="flex flex-col w-full pb-24 font-sans px-4 pt-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4 sticky top-16 z-10 bg-surface/90 backdrop-blur-md py-2">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-bold text-xs">
              {currentQuestionIndex + 1} / {exam.questions.length}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-sm ${timerUrgent ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
            <span className="material-symbols-outlined text-[16px]">timer</span>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {exam.questions.map((q, idx) => {
            const ans = essayAnswers[q.id];
            const hasAny = ans && Object.values(ans).some(v => v.trim());
            return (
              <button key={q.id} onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer transition-all border-2 ${idx === currentQuestionIndex ? 'ring-2 ring-rose-500 ring-offset-1' : ''} ${hasAny ? 'bg-rose-500 border-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-700 to-orange-600 p-4 text-white">
            <div className="text-xs font-bold opacity-75 uppercase">Soal {currentQuestionIndex + 1} dari {exam.questions.length}</div>
            {currentQ?.title && <div className="font-black text-base mt-1">{currentQ.title}</div>}
          </div>
          <div className="p-4 space-y-2">
            {(currentQ?.content_blocks || []).map((block) => (
              <div key={block.id}>
                {block.type === 'text' && <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{block.value}</p>}
                {block.type === 'latex' && <div className="text-sm text-slate-800 dark:text-white overflow-x-auto py-1"><InlineMath math={block.value} /></div>}
                {block.type === 'image' && <img src={block.value} alt="" className="max-h-48 rounded-xl border border-slate-200 shadow-sm" />}
              </div>
            ))}
          </div>
        </div>

        {/* 4 Stage Answer Areas */}
        <div className="space-y-3 mb-6">
          {STAGES.map(stage => (
            <div key={stage.key} className={`rounded-2xl border-2 ${stageBg[stage.color]} p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg ${stageBadge[stage.color]} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white text-[14px]">{stage.icon}</span>
                </div>
                <span className={`font-black text-sm ${stageLabel[stage.color]} uppercase tracking-wide`}>Tahap {stage.label}</span>
              </div>
              <textarea
                rows={stage.key === 'pengerjaan' ? 6 : 3}
                value={currentAnswer[stage.key]}
                onChange={(e) => updateEssayAnswer(currentQ.id, stage.key, e.target.value)}
                placeholder={stage.placeholder}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm leading-relaxed focus:outline-none focus:border-rose-400 resize-y placeholder:text-slate-400"
              />
              {/* Live KaTeX preview if LaTeX detected */}
              {currentAnswer[stage.key].includes('\\') && (
                <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
                  <span className="font-bold text-[9px] uppercase text-slate-400 block mb-1">Preview LaTeX:</span>
                  <InlineMath math={currentAnswer[stage.key]} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestionIndex > 0 && (
            <button onClick={() => setCurrentQuestionIndex(i => i - 1)}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Sebelumnya
            </button>
          )}
          {!isLast ? (
            <button onClick={() => setCurrentQuestionIndex(i => i + 1)}
              className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2">
              Selanjutnya <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">send</span> Submit & Nilai AI
            </button>
          )}
        </div>
      </div>
    );
  }

  // =====================================================
  // PHASE: RESULT
  // =====================================================
  const pastEssayAnswers = pastAttempt?.essay_answers || {};
  const pastAiScores = pastAttempt?.ai_scores || {};
  const displayAiResults = Object.keys(aiResults).length > 0 ? aiResults : pastAiScores;
  const displayEssayAnswers = Object.keys(essayAnswers).length > 0 && Object.values(essayAnswers).some(v => Object.values(v).some(s => s.trim())) ? essayAnswers : pastEssayAnswers;

  return (
    <div className="flex flex-col w-full pb-16 font-sans px-4 pt-4 animate-in zoom-in-95">

      {/* ── HIDDEN A4 PDF EXPORT TEMPLATE ── */}
      <div
        id="rme-pdf-template"
        style={{
          position: 'fixed', left: '-9999px', top: '0',
          width: '794px', minHeight: '1123px', backgroundColor: '#ffffff',
          color: '#0f172a', padding: '36px', boxSizing: 'border-box', fontFamily: 'sans-serif',
        }}
      >
        {/* KOP */}
        <div style={{ borderBottom: '3px solid #e11d48', paddingBottom: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/logo.jpeg" alt="Logo TRISULA" style={{ height: '40px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>TRISULA</h1>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#e11d48', margin: 0 }}>LEMBAR HASIL POSTEST RME</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>{exam?.title}</p>
        </div>
        {/* Identitas */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#e11d48', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Identitas Peserta</p>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Nama', displayName], ['NISN', displayNisn],
                ['Mata Pelajaran', exam?.strand || '-'], ['Tanggal', tanggal],
                ['Waktu Mulai', waktuMulai], ['Durasi', durasi],
              ].map(([l, v]) => (
                <tr key={l}><td style={{ padding: '4px 0', width: '120px', color: '#64748b' }}>{l}</td><td style={{ padding: '4px 0', fontWeight: 'bold' }}>: {v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Score */}
        <div style={{ border: '2px solid #fca5a5', backgroundColor: '#fff7f7', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: '#9f1239', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>NILAI AKHIR (AI)</p>
          <div style={{ fontSize: '60px', fontWeight: '800', color: scoreColor, margin: '8px 0' }}>{finalScore}</div>
          <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>Total Poin: {computedResults?.total_essay_score || 0} / {computedResults?.total_max_points || 0}</p>
        </div>
        {/* Per-question breakdown */}
        {exam?.questions.map((q, idx) => {
          const ai = displayAiResults[q.id] as AiScoreResult | undefined;
          const ans = displayEssayAnswers[q.id] as RmeAnswers | undefined;
          const keys = q.rme_keys;
          if (!ai || !keys) return null;
          return (
            <div key={q.id} style={{ marginBottom: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Soal {idx + 1}{q.title ? ` — ${q.title}` : ''}</p>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>Tahap</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>Jawaban Siswa</th>
                    <th style={{ padding: '4px 8px', textAlign: 'center' }}>Skor</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>Feedback AI</th>
                  </tr>
                </thead>
                <tbody>
                  {STAGES.map(s => (
                    <tr key={s.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569' }}>{s.label}</td>
                      <td style={{ padding: '4px 8px', color: '#1e293b' }}>{ans?.[s.key] || '-'}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#0284c7' }}>
                        {ai.scores[s.key]} / {(keys as any)[`points_${s.key}`]}
                      </td>
                      <td style={{ padding: '4px 8px', color: '#64748b', fontSize: '10px' }}>{ai.feedback[s.key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', fontSize: '9px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
          Dokumen ini diterbitkan oleh <strong>TRISULA EduMath</strong>. Nilai dihitung oleh Engine AI Penilaian Matematis.
        </div>
      </div>

      {/* ── WEB UI ── */}
      {/* Score Banner */}
      <div className="bg-gradient-to-br from-rose-700 to-orange-600 rounded-2xl p-6 text-white text-center shadow-xl mb-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[150px] -rotate-12">psychology</span>
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 relative z-10">
          <span className="material-symbols-outlined text-3xl">workspace_premium</span>
        </div>
        <h2 className="text-xl font-extrabold relative z-10">Postest RME Selesai!</h2>
        <p className="text-rose-200 text-sm mt-1 relative z-10">{exam?.title}</p>
        {scoringError && (
          <div className="mt-3 bg-red-900/40 border border-red-400 rounded-xl p-3 text-sm font-bold text-red-200 relative z-10">
            ⚠️ {scoringError}
          </div>
        )}
      </div>

      {/* Identity + Score */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl mb-4 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Identitas Peserta</span>
          <span className="text-base font-extrabold text-slate-800 dark:text-white">{displayName}</span>
          <span className="text-sm font-medium text-slate-500 block">NISN: {displayNisn}</span>
        </div>
        <div className="p-6 text-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-rose-50 dark:from-slate-900 dark:to-rose-950">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none">
            <span className="font-black text-6xl text-rose-900 -rotate-12 whitespace-nowrap">TRISULA</span>
          </div>
          <div className="text-7xl font-black relative z-10" style={{ color: scoreColor }}>{finalScore}</div>
          <div className="text-sm font-bold text-slate-500 mt-1 relative z-10">Nilai Akhir AI (Skala 0 – 100)</div>
          <div className="text-xs text-slate-400 mt-1 relative z-10">
            Total Poin: {computedResults?.total_essay_score || 0} / {computedResults?.total_max_points || '-'}
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      {exam.questions.map((q, qIdx) => {
        const ai = displayAiResults[q.id] as AiScoreResult | undefined;
        const ans = displayEssayAnswers[q.id] as RmeAnswers | undefined;
        const keys = q.rme_keys;
        return (
          <div key={q.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mb-4 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center">{qIdx + 1}</div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">{q.title || `Soal ${qIdx + 1}`}</span>
            </div>
            <div className="p-4 space-y-3">
              {STAGES.map(stage => {
                const stageScore = ai?.scores[stage.key] ?? '-';
                const maxPts = keys ? (keys as any)[`points_${stage.key}`] : '-';
                const feedback = ai?.feedback[stage.key] || '';
                return (
                  <div key={stage.key} className={`rounded-xl border-2 ${stageBg[stage.color]} p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${stageBadge[stage.color]} flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-white text-[12px]">{stage.icon}</span>
                        </div>
                        <span className={`font-black text-xs ${stageLabel[stage.color]} uppercase`}>{stage.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-base font-black text-indigo-700 dark:text-indigo-400">{stageScore}</span>
                        <span className="text-xs text-slate-400">/ {maxPts}</span>
                      </div>
                    </div>
                    {ans?.[stage.key] && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-100 dark:border-slate-700 mb-2">
                        <span className="font-bold text-[9px] uppercase text-slate-400 block mb-0.5">Jawaban Anda:</span>
                        {ans[stage.key]}
                      </div>
                    )}
                    {feedback && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 italic flex gap-1">
                        <span className="material-symbols-outlined text-[12px] text-slate-400 shrink-0 mt-0.5">smart_toy</span>
                        {feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-2">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">home</span> Menu Utama
        </button>
        <button onClick={handleDownloadPDF} disabled={isDownloading}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${isDownloading ? 'bg-slate-400 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 active:scale-95'}`}>
          {isDownloading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengunduh...</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">download</span> Unduh PDF</>
          )}
        </button>
      </div>
    </div>
  );
};
