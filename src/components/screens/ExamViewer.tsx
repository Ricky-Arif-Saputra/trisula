import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import html2pdf from 'html2pdf.js';
import { ExamViewerRme } from './ExamViewerRme';

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
  exam_type?: string;
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
  const [doubtful, setDoubtful] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [pastAttempt, setPastAttempt] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch exam package
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // Fetch package
        const { data, error: err } = await supabase
          .from('exam_packages')
          .select('*')
          .eq('id', examId)
          .maybeSingle();
        if (err) throw err;
        if (!data) { setError('Paket ujian tidak ditemukan.'); return; }
        const pkg = { ...data, questions: safeParse(data.questions) } as ExamPackage;
        setExam(pkg);

        // Fetch past attempt if any
        if (user) {
          const { data: attempt } = await supabase
            .from('exam_attempts')
            .select('*')
            .eq('exam_id', examId)
            .eq('user_id', user.id)
            .maybeSingle();
          if (attempt) {
            setPastAttempt(attempt);
            setPhase('result');
            setStartTime(new Date(attempt.created_at));
            setEndTime(new Date(attempt.created_at));
            setLoading(false);
            return;
          }
        }

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
    if (!studentName.trim() || !studentNisn.trim()) {
      alert("Nama Lengkap dan NISN wajib diisi!");
      return;
    }
    setShowIdentityModal(false);
    setStartTime(new Date());
    setPhase('active');
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, selectedOptionId: optionId } : a));
  };

  const toggleDoubtful = () => {
    if (!exam) return;
    const qId = exam.questions[currentIndex].id;
    setDoubtful(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleNext = () => {
    if (!exam) return;
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSubmitConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    setShowSubmitConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate Score
    let correct = 0, wrong = 0, unanswered = 0;
    if (exam) {
      exam.questions.forEach((q: ExamQuestion) => {
        const answer = answers.find(a => a.questionId === q.id);
        const opts = safeParse(q.options);
        if (!answer?.selectedOptionId) { unanswered++; return; }
        const chosen = opts.find((o: ExamOption) => o.id === answer.selectedOptionId);
        if (chosen?.is_correct) correct++; else wrong++;
      });
      const total = exam.questions.length;
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      // Attempt to save to Supabase
      if (user) {
        try {
          await supabase.from('exam_attempts').insert({
            exam_id: exam.id,
            user_id: user.id,
            student_name: studentName,
            student_nisn: studentNisn,
            score: score,
            correct_count: correct,
            wrong_count: wrong,
          });
        } catch (e) {
          console.error("Failed to save exam attempt", e);
        }
      }
    }
    
    setEndTime(new Date());
    setPhase('result');
  };

  // Results calculation for display
  const results = React.useMemo(() => {
    if (!exam || phase !== 'result') return null;
    if (pastAttempt) {
      return {
        correct: pastAttempt.correct_count || 0,
        wrong: pastAttempt.wrong_count || 0,
        unanswered: exam.questions.length - (pastAttempt.correct_count || 0) - (pastAttempt.wrong_count || 0),
        total: exam.questions.length,
        score: pastAttempt.score || 0
      };
    }
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
  }, [exam, answers, phase, pastAttempt]);

  if (exam && (exam.exam_type === 'rme_postest' || exam.exam_type === 'posttest' || exam.test_type === 'postest')) {
    return <ExamViewerRme examId={examId} onBack={onBack} />;
  }

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
          <button onClick={() => setShowIdentityModal(true)} className="mt-6 w-full py-4 bg-white text-indigo-700 font-extrabold rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg">
            <span className="material-symbols-outlined">play_arrow</span> Mulai Ujian
          </button>
        </div>

        {/* Modal Identitas */}
        {showIdentityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Identitas Peserta Ujian</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Silakan lengkapi identitas Anda sebelum timer dimulai.</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                  <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Masukkan nama lengkap" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">NISN <span className="text-rose-500">*</span></label>
                  <input type="number" value={studentNisn} onChange={e => setStudentNisn(e.target.value)} placeholder="Masukkan Nomor Induk Siswa" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowIdentityModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200">
                  Batal
                </button>
                <button onClick={handleStart} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer hover:bg-indigo-700 shadow-md">
                  Mulai Ujian
                </button>
              </div>
            </div>
          </div>
        )}
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

        {/* Question Grid */}
        <div className="px-4 pt-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/30 p-4 shadow-sm flex flex-wrap gap-2">
            {exam.questions.map((q: ExamQuestion, idx: number) => {
              const qId = q.id;
              const hasAnswer = !!answers.find(a => a.questionId === qId)?.selectedOptionId;
              const isDoubtful = doubtful[qId];
              const isActive = idx === currentIndex;
              
              let bgColor = 'bg-slate-100 text-slate-500 border-slate-200';
              if (isDoubtful) bgColor = 'bg-amber-400 text-slate-900 border-amber-500';
              else if (hasAnswer) bgColor = 'bg-emerald-500 text-white border-emerald-600';
              
              return (
                <button
                  key={qId}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition-all cursor-pointer ${bgColor} ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question */}
        <div className="px-4 pt-4 space-y-6">
          {(() => {
            const q = exam.questions[currentIndex];
            const qIdx = currentIndex;
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

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-6">
                    <button onClick={handlePrev} disabled={currentIndex === 0} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span> Sebelumnya
                    </button>
                    <button onClick={toggleDoubtful} className={`flex-1 py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1 ${doubtful[q.id] ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                      <span className="material-symbols-outlined text-[16px]">help</span> Ragu-ragu
                    </button>
                    <button onClick={handleNext} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1">
                      {currentIndex === exam.questions.length - 1 ? 'Submit' : 'Selanjutnya'} <span className="material-symbols-outlined text-[16px]">{currentIndex === exam.questions.length - 1 ? 'send' : 'chevron_right'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Submit Modal Konfirmasi */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Konfirmasi Submit Ujian</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Apakah Anda yakin ingin menyelesaikan dan mengirim jawaban ujian ini? Periksa kembali soal yang masih ditandai ragu-ragu.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200">
                  Periksa Lagi
                </button>
                <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer hover:bg-indigo-700 shadow-md">
                  Ya, Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- PHASE: RESULT ----
  if (phase === 'result' && results) {
    const scoreColor = results.score >= 75 ? '#16a34a' : results.score >= 50 ? '#d97706' : '#dc2626';
    const displayName = pastAttempt
      ? (pastAttempt.student_name || user?.email?.split('@')[0] || 'Peserta Ujian')
      : (studentName || 'Peserta Ujian');
    const displayNisn = pastAttempt
      ? (pastAttempt.student_nisn || user?.id?.substring(0, 10).toUpperCase() || '-')
      : (studentNisn || '-');
    const tanggal = (startTime || new Date()).toLocaleDateString('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
    const waktuMulai = (startTime || new Date()).toLocaleTimeString('id-ID');
    const waktuSelesai = endTime ? endTime.toLocaleTimeString('id-ID') : '-';
    const durasi = startTime && endTime
      ? (() => { const s = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); return `${Math.floor(s/60)} menit ${s%60} detik`; })()
      : '-';

    const handleDownloadPDF = async () => {
      setIsDownloading(true);
      try {
        const element = document.getElementById('pdf-export-template');
        if (!element) throw new Error('Template PDF tidak ditemukan.');
        const opt = {
          margin:      0,
          filename:    `Bukti_Ujian_${displayNisn}_${Date.now()}.pdf`,
          image:       { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF:       { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
          pagebreak:   { mode: 'avoid-all' }
        };
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error('PDF Error:', err);
        alert('Gagal mengunduh PDF. Silakan coba lagi.');
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <div className="flex flex-col w-full pb-16 font-sans px-4 pt-4 animate-in zoom-in-95">

        {/* ── HIDDEN A4 PDF EXPORT TEMPLATE (position:fixed off-screen) ── */}
        <div
          id="pdf-export-template"
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '0',
            width: '794px',
            minHeight: '1123px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '36px',
            boxSizing: 'border-box',
            fontFamily: 'sans-serif',
          }}
        >
          {/* 1. KOP HEADER */}
          <div style={{ borderBottom: '3px solid #0284c7', paddingBottom: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img src="/logo.jpeg" alt="Logo TRISULA" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#0f172a', letterSpacing: '2px' }}>TRISULA</h1>
          </div>

          {/* 2. IDENTITAS PESERTA */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0284c7', marginBottom: '12px', marginTop: 0 }}>
              Informasi Peserta & Ujian
            </h3>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Nama Lengkap', displayName],
                  ['NISN', displayNisn],
                  ['Mata Pelajaran', exam.strand.charAt(0).toUpperCase() + exam.strand.slice(1)],
                  ['Jenis Ujian', exam.test_type === 'pretest' ? 'Pretest Diagnostik' : 'Postest Evaluasi'],
                  ['Tanggal Ujian', tanggal],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: '6px 0', width: '140px', color: '#64748b' }}>{label}</td>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#0f172a' }}>: {value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. KOTAK SKOR AKHIR + WATERMARK */}
          <div style={{ position: 'relative', border: '2px solid #38bdf8', borderRadius: '12px', padding: '28px', textAlign: 'center', marginBottom: '24px', overflow: 'hidden', backgroundColor: '#f0f9ff' }}>
            {/* Watermark */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)', fontSize: '58px', fontWeight: '900', color: '#0284c7', opacity: 0.1, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
              TRISULA EDUMATH
            </div>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1', textTransform: 'uppercase', margin: 0 }}>NILAI AKHIR</p>
            <div style={{ fontSize: '64px', fontWeight: '800', color: '#0284c7', margin: '8px 0' }}>
              {results.score}
            </div>
            <p style={{ fontSize: '11px', color: '#0369a1', margin: 0 }}>Skala Penilaian 0 – 100</p>
          </div>

          {/* 4. STATISTIK HASIL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#166534', margin: 0, fontWeight: 'bold' }}>BENAR</p>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#15803d', margin: '4px 0 0 0' }}>{results.correct}</p>
            </div>
            <div style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#991b1b', margin: 0, fontWeight: 'bold' }}>SALAH</p>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#b91c1c', margin: '4px 0 0 0' }}>{results.wrong}</p>
            </div>
            <div style={{ border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: '#475569', margin: 0, fontWeight: 'bold' }}>TOTAL SOAL</p>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#334155', margin: '4px 0 0 0' }}>{results.total}</p>
            </div>
          </div>

          {/* 5. RINCIAN WAKTU */}
          <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 0', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-around', marginBottom: '32px' }}>
            <span>Waktu Mulai: <strong>{waktuMulai}</strong></span>
            <span>Durasi: <strong>{durasi}</strong></span>
            <span>Waktu Selesai: <strong>{waktuSelesai}</strong></span>
          </div>

          {/* 6. FOOTER LEGALITAS */}
          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', fontSize: '10px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
            Dokumen ini diterbitkan secara resmi oleh platform <strong style={{ color: '#0284c7' }}>TRISULA EduMath</strong> sebagai bukti sah pengerjaan ujian.
          </div>
        </div>

        {/* ── TAMPILAN LAYAR (WEB UI) ── */}
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] rounded-2xl p-6 text-white text-center shadow-xl mb-4 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[150px] transform -rotate-12">workspace_premium</span>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 relative z-10 backdrop-blur-sm">
            <span className="material-symbols-outlined text-3xl">workspace_premium</span>
          </div>
          <h2 className="text-xl font-extrabold relative z-10">Ujian Selesai!</h2>
          <p className="text-indigo-200 text-sm mt-1 relative z-10">{exam.title}</p>
        </div>

        {/* Identity box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl mb-4 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identitas Peserta</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-white">{displayName}</span>
            <span className="text-sm font-medium text-slate-500">NISN: {displayNisn}</span>
          </div>
          <div className="p-6 text-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none">
              <span className="font-black text-6xl text-indigo-900 transform -rotate-12 whitespace-nowrap">TRISULA</span>
            </div>
            <div className="text-7xl font-black relative z-10" style={{ color: scoreColor }}>{results.score}</div>
            <div className="text-sm font-bold text-slate-500 mt-1 relative z-10">Nilai Akhir (Skala 0 – 100)</div>
          </div>
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
          <div className="flex justify-between text-sm"><span className="text-slate-500">Tanggal</span><span className="font-bold">{(startTime || new Date()).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Waktu Mulai</span><span className="font-bold">{waktuMulai}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Waktu Selesai</span><span className="font-bold">{waktuSelesai}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Durasi</span><span className="font-bold">{durasi}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Total Soal</span><span className="font-bold">{results.total} Soal</span></div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold rounded-2xl shadow-lg hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
          >
            {isDownloading ? (
              <><span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>refresh</span> Mengunduh PDF...</>
            ) : (
              <><span className="material-symbols-outlined">download</span> Unduh Bukti (PDF)</>
            )}
          </button>
          <button
            onClick={onBack}
            className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Kembali ke Menu Utama
          </button>
        </div>
      </div>
    );
  }

  return null;
};

