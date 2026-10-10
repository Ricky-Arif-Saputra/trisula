import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import { nilaiJawaban } from '../../lib/aiScoring';
import { useRiwayat } from '../../hooks/useRiwayat';
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
interface RmeAnswers {
  diketahui: string;
  ditanya: string;
  pengerjaan: string;
  kesimpulan: string;
}
export interface RmeKeys {
  ref_diketahui: string;
  ref_ditanya: string;
  ref_pengerjaan: string;
  ref_kesimpulan: string;
  points_diketahui: number;
  points_ditanya: number;
  points_pengerjaan: number;
  points_kesimpulan: number;
}
export interface AiScoreResult {
  evaluation: {
    diketahui: { score: number; max_score: number; reason: string };
    ditanya: { score: number; max_score: number; reason: string };
    pengerjaan: { score: number; max_score: number; reason: string };
    kesimpulan: { score: number; max_score: number; reason: string };
  };
  total_score: number;
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
  { key: 'diketahui' as const, label: 'Diketahui', icon: 'info', color: 'sky', placeholder: 'Tuliskan data atau informasi yang diketahui dari soal...' },
  { key: 'ditanya' as const, label: 'Ditanya', icon: 'help', color: 'violet', placeholder: 'Tuliskan inti permasalahan/pertanyaan...' },
  { key: 'pengerjaan' as const, label: 'Pengerjaan / Proses', icon: 'calculate', color: 'amber', placeholder: 'Tuliskan kalkulasi, langkah, dan rumus pengerjaan...' },
  { key: 'kesimpulan' as const, label: 'Kesimpulan', icon: 'check_circle', color: 'emerald', placeholder: 'Tuliskan kesimpulan akhir pengerjaan...' },
];

// Per-stage design tokens
const stageDesign: Record<string, { border: string; bg: string; label: string; badge: string; ring: string }> = {
  sky: {
    border: 'border-sky-200',
    bg: 'bg-sky-50/60',
    label: 'text-sky-700',
    badge: 'bg-sky-500',
    ring: 'focus:ring-sky-400 focus:border-sky-400',
  },
  violet: {
    border: 'border-violet-200',
    bg: 'bg-violet-50/60',
    label: 'text-violet-700',
    badge: 'bg-violet-500',
    ring: 'focus:ring-violet-400 focus:border-violet-400',
  },
  amber: {
    border: 'border-amber-200',
    bg: 'bg-amber-50/60',
    label: 'text-amber-700',
    badge: 'bg-amber-500',
    ring: 'focus:ring-amber-400 focus:border-amber-400',
  },
  emerald: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/60',
    label: 'text-emerald-700',
    badge: 'bg-emerald-500',
    ring: 'focus:ring-emerald-400 focus:border-emerald-400',
  },
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
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const [essayAnswers, setEssayAnswers] = useState<Record<string, RmeAnswers>>({});
  const [aiResults, setAiResults] = useState<Record<string, AiScoreResult>>({});
  const [scoringError, setScoringError] = useState<string | null>(null);

  const { riwayat, loading: riwayatLoading, refetch: refetchRiwayat } = useRiwayat();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch exam ──────────────────────────────────────────────────────────────
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

  // ── Timer ───────────────────────────────────────────────────────────────────
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

    const resultsMap: Record<string, AiScoreResult> = {};
    let totalScore = 0;
    let totalMaxPoints = 0;

    try {
      for (const q of exam.questions) {
        const keys = q.rme_keys as unknown as RmeKeys;
        if (!keys) continue;
        const answers = essayAnswers[q.id] || { diketahui: '', ditanya: '', pengerjaan: '', kesimpulan: '' };

        // Hanya kirim soal_id + jawaban — rubrik & skor_maks diambil server dari DB
        const STAGE_KEYS = ['diketahui', 'ditanya', 'pengerjaan', 'kesimpulan'] as const;
        const evalResults = await Promise.all(
          STAGE_KEYS.map(stage =>
            nilaiJawaban({
              soal_id: `${q.id}_${stage}`,
              jawaban: answers[stage] || '',
            }).catch((e: Error) => {
              // 409 = sudah pernah submit — anggap skor penuh agar UI tidak error
              if (e.message.includes('sudah pernah dikumpulkan')) {
                return { skor: keys[`points_${stage}` as keyof RmeKeys] as unknown as number, alasan: '(sudah pernah dikumpulkan)' };
              }
              throw e;
            })
          )
        );

        const [evalDiketahui, evalDitanya, evalPengerjaan, evalKesimpulan] = evalResults;

        const result: AiScoreResult = {
          evaluation: {
            diketahui:  { score: evalDiketahui.skor,  max_score: keys.points_diketahui,  reason: evalDiketahui.alasan  },
            ditanya:    { score: evalDitanya.skor,    max_score: keys.points_ditanya,    reason: evalDitanya.alasan    },
            pengerjaan: { score: evalPengerjaan.skor, max_score: keys.points_pengerjaan, reason: evalPengerjaan.alasan },
            kesimpulan: { score: evalKesimpulan.skor, max_score: keys.points_kesimpulan, reason: evalKesimpulan.alasan },
          },
          total_score: evalDiketahui.skor + evalDitanya.skor + evalPengerjaan.skor + evalKesimpulan.skor,
        };

        resultsMap[q.id] = result;
        totalScore += result.total_score;
        totalMaxPoints += (keys.points_diketahui + keys.points_ditanya + keys.points_pengerjaan + keys.points_kesimpulan);
      }

      // Commit hasil ke state dan simpan rekap ke exam_attempts
      setAiResults(resultsMap);

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

      // Refresh riwayat (penyimpanan per-tahap sudah dilakukan server di /api/nilai)
      refetchRiwayat();
      setPhase('result');

    } catch (e: any) {
      // Error fatal (bukan 409) — tetap tampilkan halaman hasil dengan pesan error
      setAiResults(resultsMap); // tampilkan hasil parsial yang sudah berhasil
      setScoringError(e.message || 'Gagal menjalankan penilaian AI. Pastikan koneksi internet stabil.');
      setPhase('result');
    }
  };

  // ── PDF Download ─────────────────────────────────────────────────────────
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

  // ── Computed Results ──────────────────────────────────────────────────────
  const computedResults = React.useMemo(() => {
    if (pastAttempt) return pastAttempt;
    if (Object.keys(aiResults).length === 0) return null;
    let totalScore = 0;
    let totalMaxPoints = 0;
    exam?.questions.forEach(q => {
      const r = aiResults[q.id];
      if (r) totalScore += r.total_score;
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
  const scoreBadge = finalScore >= 75
    ? 'bg-gradient-to-br from-emerald-500 to-green-600'
    : finalScore >= 50
    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
    : 'bg-gradient-to-br from-red-500 to-rose-600';

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">psychology</span>
          </div>
        </div>
        <span className="text-sm font-bold text-slate-500">Memuat ujian RME...</span>
      </div>
    </div>
  );

  if (error || !exam) return (
    <div className="p-6 mx-4 mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl shadow-sm flex gap-3 items-start">
      <span className="material-symbols-outlined text-2xl">error</span>
      <div><h3 className="font-bold">Gagal memuat ujian</h3><p className="text-sm">{error || 'Data tidak ditemukan'}</p></div>
    </div>
  );

  // =====================================================
  // PHASE: INTRO
  // =====================================================
  if (phase === 'intro') {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 lg:p-8 animate-in fade-in">
        <div className="w-full max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm flex items-center gap-2 self-start hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Kembali
          </button>

          {/* Hero card */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-8 lg:p-10 text-white text-center shadow-2xl shadow-indigo-500/30 mb-6 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 relative z-10">
              <span className="material-symbols-outlined text-5xl">psychology</span>
            </div>
            <div className="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-4 relative z-10">
              Postest RME — Realistic Mathematics Education
            </div>
            <h1 className="text-2xl lg:text-3xl font-black mb-2 relative z-10">{exam.title}</h1>
            <p className="text-indigo-200 text-sm relative z-10">
              {exam.strand} &middot; {exam.duration_minutes} Menit &middot; {exam.questions.length} Soal Essay
            </p>

            {/* 4 stage info grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 text-left relative z-10">
              {[
                { icon: 'info', label: 'Tahap 1', desc: 'Diketahui', color: 'sky' },
                { icon: 'help', label: 'Tahap 2', desc: 'Ditanya', color: 'violet' },
                { icon: 'calculate', label: 'Tahap 3', desc: 'Pengerjaan', color: 'amber' },
                { icon: 'check_circle', label: 'Tahap 4', desc: 'Kesimpulan', color: 'emerald' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  <div>
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-indigo-200 text-[10px]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: 'schedule', label: 'Durasi', value: `${exam.duration_minutes} Menit` },
              { icon: 'quiz', label: 'Jumlah Soal', value: `${exam.questions.length} Soal` },
              { icon: 'smart_toy', label: 'Penilaian', value: 'AI Otomatis' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-2xl p-4 text-center border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-indigo-500 text-[20px]">{item.icon}</span>
                </div>
                <div className="font-black text-slate-800 text-sm">{item.value}</div>
                <div className="text-[10px] text-slate-400 font-medium">{item.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowIdentityModal(true)}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-xl shadow-indigo-500/30 cursor-pointer transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[24px]">play_arrow</span>
            Mulai Postest RME
          </button>
        </div>

        {/* Identity Modal */}
        {showIdentityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl shadow-slate-900/20 p-7 animate-in zoom-in-95">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600 text-[22px]">badge</span>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">Identitas Peserta</h3>
                  <p className="text-xs text-slate-400 font-medium">Wajib diisi sebelum ujian dimulai</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-semibold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">NISN *</label>
                  <input
                    type="text"
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    placeholder="Masukkan NISN"
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-semibold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowIdentityModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-95"
                >
                  Mulai Ujian
                </button>
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        {/* Animated AI scoring ring */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-violet-500 animate-spin" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-indigo-300 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="material-symbols-outlined text-white text-[22px]">smart_toy</span>
          </div>
        </div>

        <div className="text-center max-w-md">
          <h2 className="text-xl font-black text-slate-800 mb-2">Menilai dengan AI Gemini...</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Sistem AI sedang menganalisis jawaban 4 tahap RME Anda secara matematis dan semantik. Mohon tunggu.
          </p>
        </div>

        {/* Animated progress dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {STAGES.map(s => (
            <div key={s.key} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${stageDesign[s.color].bg} border ${stageDesign[s.color].border} ${stageDesign[s.color].label}`}>
              <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
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
    const totalDuration = (exam.duration_minutes || 60) * 60;
    const progressPct = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

    // Count answered questions
    const answeredCount = exam.questions.filter(q => {
      const ans = essayAnswers[q.id];
      return ans && Object.values(ans).some(v => v.trim());
    }).length;

    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans">
        {/* Sticky exam top bar */}
        <div className="sticky top-16 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
          <div className="w-full px-4 lg:px-8 xl:px-12 py-3 flex items-center justify-between gap-4">
            {/* Student info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200/60 rounded-xl">
                <span className="material-symbols-outlined text-indigo-500 text-[14px]">person</span>
                <span className="text-xs font-bold text-indigo-700">{studentName}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-600 font-bold text-xs">
                Soal {currentQuestionIndex + 1} / {exam.questions.length}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                <span className="material-symbols-outlined text-emerald-500 text-[14px]">check_circle</span>
                <span className="text-xs font-bold text-emerald-700">{answeredCount} selesai</span>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-black text-sm tabular-nums transition-all duration-300 ${
              timerUrgent
                ? 'bg-red-100 border border-red-200 text-red-600 animate-pulse'
                : 'bg-slate-100 border border-slate-200/60 text-slate-700'
            }`}>
              <span className="material-symbols-outlined text-[16px]">timer</span>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 2-column exam layout */}
        <div className="w-full px-4 lg:px-8 xl:px-12 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

            {/* LEFT COLUMN — Question card (5/12) */}
            <div className="lg:col-span-5">
              {/* Question navigator */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Navigasi Soal</div>
                <div className="flex flex-wrap gap-2">
                  {exam.questions.map((q, idx) => {
                    const ans = essayAnswers[q.id];
                    const hasAny = ans && Object.values(ans).some(v => v.trim());
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-9 h-9 rounded-xl text-xs font-black cursor-pointer transition-all duration-200 border-2 ${
                          idx === currentQuestionIndex
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-110'
                            : hasAny
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question card — sticky on laptop */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden lg:sticky lg:top-36">
                <div className="bg-gradient-to-r from-indigo-700 to-violet-700 p-5 text-white">
                  <div className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">
                    Soal {currentQuestionIndex + 1} dari {exam.questions.length}
                  </div>
                  {currentQ?.title && <div className="font-black text-base lg:text-lg leading-snug">{currentQ.title}</div>}
                </div>
                <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
                  {(currentQ?.content_blocks || []).map((block) => (
                    <div key={block.id}>
                      {block.type === 'text' && (
                        <p className="text-sm text-slate-700 leading-relaxed">{block.value}</p>
                      )}
                      {block.type === 'latex' && (
                        <div className="text-sm text-slate-800 overflow-x-auto py-2 px-3 bg-slate-50 rounded-xl border border-slate-200/60">
                          <InlineMath math={block.value} />
                        </div>
                      )}
                      {block.type === 'image' && (
                        <img src={block.value} alt="" className="max-h-56 rounded-xl border border-slate-200 shadow-sm w-full object-contain" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Answer area (7/12) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lembar Jawaban — 4 Tahap RME</div>

              {STAGES.map((stage, stageIdx) => {
                const d = stageDesign[stage.color];
                return (
                  <div
                    key={stage.key}
                    className={`bg-white rounded-2xl border ${d.border} shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md`}
                  >
                    <div className={`px-5 py-3.5 ${d.bg} border-b ${d.border} flex items-center gap-3`}>
                      <div className={`w-8 h-8 rounded-xl ${d.badge} flex items-center justify-center shadow-sm`}>
                        <span className="material-symbols-outlined text-white text-[15px]">{stage.icon}</span>
                      </div>
                      <div>
                        <div className={`font-black text-sm ${d.label} uppercase tracking-wide`}>
                          Tahap {stageIdx + 1} — {stage.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {stage.key === 'pengerjaan' ? 'Tulis langkah-langkah penyelesaian secara rinci' : 'Jawab sesuai tahap ini'}
                        </div>
                      </div>
                      {currentAnswer[stage.key]?.trim() && (
                        <span className="ml-auto w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-white text-[11px] fill-1">check</span>
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <textarea
                        rows={stage.key === 'pengerjaan' ? 7 : 4}
                        value={currentAnswer[stage.key]}
                        onChange={(e) => updateEssayAnswer(currentQ.id, stage.key, e.target.value)}
                        placeholder={stage.placeholder}
                        className={`w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 text-sm leading-relaxed focus:outline-none focus:ring-2 ${d.ring} focus:bg-white resize-y placeholder:text-slate-300 transition-all duration-200 font-[Inter,system-ui,sans-serif]`}
                      />
                      {/* Live KaTeX preview */}
                      {currentAnswer[stage.key].includes('\\') && (
                        <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 overflow-x-auto">
                          <span className="font-bold text-[9px] uppercase text-slate-400 block mb-1">Preview LaTeX:</span>
                          <InlineMath math={currentAnswer[stage.key]} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-2 pb-6">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={() => setCurrentQuestionIndex(i => i - 1)}
                    className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Sebelumnya
                  </button>
                )}
                {!isLast ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(i => i + 1)}
                    className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-md shadow-indigo-500/10 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Selanjutnya <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-500/10 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span> Submit &amp; Nilai AI
                  </button>
                )}
              </div>
            </div>
          </div>
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
    <div className="min-h-screen w-full bg-slate-50 font-sans">
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
        <div style={{ borderBottom: '3px solid #4f46e5', paddingBottom: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/logo.jpeg" alt="Logo TRISULA" style={{ height: '40px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, letterSpacing: '2px', color: '#4f46e5' }}>TRISULA</h1>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#4f46e5', margin: 0 }}>LEMBAR HASIL POSTEST RME</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>{exam?.title}</p>
        </div>
        {/* Identitas */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#4f46e5', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Identitas Peserta</p>
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
        <div style={{ border: '2px solid #a5b4fc', backgroundColor: '#eef2ff', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: '#4338ca', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>NILAI AKHIR (AI)</p>
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
                      <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>
                        {ai.evaluation[s.key]?.score ?? '-'} / {(keys as any)[`points_${s.key}`]}
                      </td>
                      <td style={{ padding: '4px 8px', color: '#64748b', fontSize: '10px' }}>{ai.evaluation[s.key]?.reason || '-'}</td>
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
      <div className="w-full px-4 lg:px-8 xl:px-12 py-6 animate-in zoom-in-95">

        {/* Error alert banner */}
        {scoringError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl shadow-sm flex gap-3 items-start animate-in fade-in">
            <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">warning</span>
            <div>
              <p className="font-bold text-sm">Penilaian AI Gagal</p>
              <p className="text-sm text-red-600 mt-0.5">{scoringError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT — Score card + Identity (4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Big score badge */}
            <div className={`${scoreBadge} rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden`}>
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[160px] -rotate-12">psychology</span>
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                </div>
                <div className="text-7xl font-black mb-1 leading-none">{finalScore}</div>
                <div className="text-sm font-bold opacity-80">Nilai Akhir AI (0–100)</div>
                <div className="text-xs opacity-60 mt-1">
                  Poin: {computedResults?.total_essay_score || 0} / {computedResults?.total_max_points || '-'}
                </div>
              </div>
            </div>

            {/* Identity card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Identitas Peserta</span>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Nama</div>
                  <div className="font-black text-slate-800 text-base">{displayName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">NISN</div>
                  <div className="font-bold text-slate-600 text-sm">{displayNisn}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Ujian</div>
                  <div className="font-semibold text-slate-600 text-sm">{exam?.title}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Tanggal</div>
                  <div className="font-medium text-slate-500 text-sm">{tanggal}</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={onBack}
              className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2 bg-white shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">home</span> Menu Utama
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer ${
                isDownloading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10 active:scale-95'
              }`}
            >
              {isDownloading ? (
                <><div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-500 rounded-full animate-spin" /> Mengunduh...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">download</span> Unduh PDF</>
              )}
            </button>
          </div>

          {/* RIGHT — Per-question AI feedback + riwayat (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-4">


            {/* Riwayat jawaban */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">history</span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Riwayat Jawaban Saya</span>
                </div>
                <button
                  onClick={refetchRiwayat}
                  className="text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                  title="Perbarui riwayat"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {riwayatLoading ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                    Memuat riwayat...
                  </div>
                ) : riwayat.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm italic">Belum ada riwayat jawaban.</div>
                ) : (
                  riwayat.map((item) => {
                    const pct = item.skor_maks && item.skor_maks > 0 ? Math.round(((item.skor ?? 0) / item.skor_maks) * 100) : 0;
                    const badgeColor = pct >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : pct >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-rose-700 bg-rose-50 border-rose-200';
                    return (
                      <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                        <div className={`flex-shrink-0 px-2 py-0.5 rounded-lg border text-xs font-black tabular-nums ${badgeColor}`}>
                          {item.skor ?? '-'}/{item.skor_maks ?? '-'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.soal_id}</div>
                          <div className="text-xs text-slate-600 mt-0.5 truncate">{item.jawaban}</div>
                          {item.alasan && (
                            <div className="text-[10px] text-slate-400 mt-0.5 italic line-clamp-1">{item.alasan}</div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-[9px] text-slate-300 tabular-nums whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Umpan Balik AI per Soal</div>

            {exam.questions.map((q, qIdx) => {
              const ai = displayAiResults[q.id] as AiScoreResult | undefined;
              const ans = displayEssayAnswers[q.id] as RmeAnswers | undefined;
              const keys = q.rme_keys;
              const isOpen = openAccordion === q.id;

              // Compute per-question total
              let qScore = 0;
              let qMax = 0;
              if (ai) {
                STAGES.forEach(s => { qScore += ai.evaluation[s.key]?.score ?? 0; });
              }
              if (keys) {
                qMax = keys.points_diketahui + keys.points_ditanya + keys.points_pengerjaan + keys.points_kesimpulan;
              }
              const qPct = qMax > 0 ? Math.round((qScore / qMax) * 100) : 0;

              return (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  {/* Accordion header */}
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : q.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 text-left cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                      {qIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-sm truncate">{q.title || `Soal ${qIdx + 1}`}</div>
                      {/* Mini progress bar */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${qPct >= 75 ? 'bg-emerald-500' : qPct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                            style={{ width: `${qPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 flex-shrink-0">{qScore}/{qMax} poin</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[20px] flex-shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  </button>

                  {/* Accordion body */}
                  {isOpen && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                      {STAGES.map(stage => {
                        const d = stageDesign[stage.color];
                        const stageScore = ai?.evaluation[stage.key]?.score ?? '-';
                        const maxPts = keys ? (keys as any)[`points_${stage.key}`] : '-';
                        const feedback = ai?.evaluation[stage.key]?.reason || '';
                        const studentAnswer = ans?.[stage.key] || '';

                        return (
                          <div key={stage.key} className={`p-5 ${d.bg}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg ${d.badge} flex items-center justify-center shadow-sm`}>
                                  <span className="material-symbols-outlined text-white text-[13px]">{stage.icon}</span>
                                </div>
                                <span className={`font-black text-sm ${d.label} uppercase tracking-wide`}>{stage.label}</span>
                              </div>
                              <div className={`flex items-center gap-1 px-3 py-1 rounded-xl border shadow-sm ${
                                stageScore === 0 
                                  ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                  : stageScore === maxPts 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                  : 'bg-amber-50 border-amber-200 text-amber-700'
                              }`}>
                                <span className="text-base font-black">{stageScore}</span>
                                <span className="text-xs opacity-70 font-bold">/ {maxPts} Poin</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              {/* 1. Jawaban Anda */}
                              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm text-sm text-slate-700 leading-relaxed">
                                <span className="font-black text-[10px] uppercase text-slate-400 tracking-widest block mb-1.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">edit_document</span> Jawaban Anda
                                </span>
                                {studentAnswer ? (
                                  <div className="whitespace-pre-wrap">{studentAnswer}</div>
                                ) : (
                                  <span className="italic text-slate-400">Tidak ada jawaban</span>
                                )}
                              </div>

                              {/* 2. Kunci Jawaban Acuan */}
                              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3.5 shadow-sm text-sm text-emerald-900 leading-relaxed">
                                <span className="font-black text-[10px] uppercase text-emerald-600 tracking-widest block mb-1.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">key</span> Kunci Jawaban Acuan
                                </span>
                                <div className="whitespace-pre-wrap">{keys ? (keys as any)[`ref_${stage.key}`] || 'Tidak ada kunci' : 'Tidak ada kunci'}</div>
                              </div>

                              {/* 3. Alasan & Evaluasi Penilaian */}
                              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-3.5 shadow-sm text-sm text-indigo-900 leading-relaxed">
                                <span className="font-black text-[10px] uppercase text-indigo-600 tracking-widest block mb-1.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">smart_toy</span> Alasan & Evaluasi Penilaian
                                </span>
                                <div className="whitespace-pre-wrap italic">{feedback || 'Tidak ada evaluasi'}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
