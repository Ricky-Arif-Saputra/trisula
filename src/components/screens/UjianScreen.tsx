import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import { UjianQuestionForm } from './UjianQuestionForm';
import { MathCategory } from '../../types';
import {
  Plus, Trash2, X, Loader2, Edit3, FileArchive,
  Download, Users, Check, AlertCircle, Eye, Play,
} from 'lucide-react';
import JSZip from 'jszip';
import html2pdf from 'html2pdf.js';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Question {
  id: string;
  title: string;
  test_type: 'pretest' | 'postest';
  strand: string;
  content_blocks: any[];
  rme_keys?: any;
  options?: any[];
}

interface Attempt {
  id: string;
  user_id: string;
  student_name: string;
  student_nisn: string;
  score: number;
  total_essay_score: number;
  total_max_points: number;
  essay_answers: Record<string, { diketahui: string; ditanya: string; pengerjaan: string; kesimpulan: string }>;
  ai_scores: Record<string, any>;
  created_at: string;
  // exam_id hanya ada di exam_attempts — di sini kita pakai question_id
  question_id?: string;
}

interface QuestionAttempt {
  id: string;
  question_id: string;
  score: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const STRANDS = [
  { id: 'bilangan',     label: 'Bilangan',       icon: '123',          gradient: 'from-blue-600 to-cyan-500' },
  { id: 'aljabar',      label: 'Aljabar',         icon: 'functions',    gradient: 'from-violet-600 to-purple-500' },
  { id: 'geometri',     label: 'Geometri',        icon: 'hexagon',      gradient: 'from-emerald-600 to-teal-500' },
  { id: 'trigonometri', label: 'Trigonometri',    icon: 'ssid_chart',   gradient: 'from-amber-500 to-orange-500' },
  { id: 'peluang',      label: 'Data & Peluang',  icon: 'casino',       gradient: 'from-rose-600 to-pink-500' },
] as const;

const STAGE_LABELS = ['Diketahui', 'Ditanya', 'Pengerjaan', 'Kesimpulan'];
const STAGE_KEYS   = ['diketahui', 'ditanya', 'pengerjaan', 'kesimpulan'] as const;

// ─────────────────────────────────────────────
// PDF builder untuk satu jawaban siswa
// ─────────────────────────────────────────────
function buildAnswerHtml(
  attempt: Attempt,
  question: Question,
  studentName: string,
  studentNisn: string,
): string {
  const tanggal = new Date(attempt.created_at).toLocaleDateString('id-ID', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  const ans = attempt.essay_answers?.[question.id] || {};
  const ai  = attempt.ai_scores?.[question.id];

  const stagesHtml = STAGE_KEYS.map((sk, i) => {
    const stageAns  = (ans as any)[sk] || '—';
    const stageScore = ai?.evaluation?.[sk];
    return `
      <div style="margin-bottom:12px;">
        <div style="background:#f1f5f9;padding:6px 10px;border-radius:6px 6px 0 0;font-weight:700;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.05em;display:flex;justify-content:space-between;">
          <span>Tahap ${i + 1} — ${STAGE_LABELS[i]}</span>
          ${stageScore ? `<span style="color:${stageScore.score / stageScore.max_score >= .7 ? '#16a34a' : '#d97706'};">
            ${stageScore.score} / ${stageScore.max_score} poin</span>` : ''}
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none;padding:8px 10px;font-size:12px;white-space:pre-wrap;min-height:32px;">${stageAns}</div>
        ${stageScore?.reason ? `<div style="border:1px solid #e0e7ff;border-top:none;padding:6px 10px;font-size:11px;color:#6366f1;font-style:italic;">${stageScore.reason}</div>` : ''}
      </div>`;
  }).join('');

  const scoreColor = attempt.score >= 75 ? '#16a34a' : attempt.score >= 50 ? '#d97706' : '#dc2626';

  return `<html><head><meta charset="utf-8"/><style>
    body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:24px;color:#1e293b;font-size:13px;}
    h1{font-size:17px;margin-bottom:4px;} .meta{color:#64748b;font-size:11px;margin-bottom:16px;}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;}
    td,th{border:1px solid #e2e8f0;padding:5px 10px;}
    th{background:#f8fafc;font-weight:700;color:#64748b;text-align:left;}
  </style></head><body>
    <h1>${question.title || 'Soal Ujian'}</h1>
    <div class="meta">${question.strand} · ${question.test_type === 'pretest' ? 'Pretest' : 'Posttest'} · ${tanggal}</div>
    <table>
      <tr><th>Nama</th><td>${studentName || attempt.student_name || '—'}</td>
          <th>NISN</th><td>${studentNisn || attempt.student_nisn || '—'}</td></tr>
      <tr><th>Nilai Akhir</th>
          <td><b style="color:${scoreColor};font-size:18px;">${attempt.score}</b></td>
          <th>Poin</th>
          <td>${attempt.total_essay_score || 0} / ${attempt.total_max_points || '?'}</td></tr>
    </table>
    <div style="font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:10px;">
      Jawaban Siswa — 4 Tahap RME
    </div>
    ${stagesHtml}
  </body></html>`;
}

// ─────────────────────────────────────────────
// DownloadModal — lihat & unduh ZIP jawaban
// ─────────────────────────────────────────────
interface AttemptWithUser extends Attempt {
  student_name: string;
  student_nisn: string;
}

const DownloadModal: React.FC<{
  question: Question;
  onClose: () => void;
}> = ({ question, onClose }) => {
  const [attempts, setAttempts] = useState<AttemptWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Jawaban disimpan di jawaban table dengan soal_id = question.id
        // Tapi untuk ujian RME kita pakai exam_attempts (essay_answers keyed by question id)
        // Coba fetch dari jawaban table dulu
        const { data } = await supabase
          .from('jawaban')
          .select('*')
          .eq('soal_id', question.id)
          .order('created_at', { ascending: false });
        setAttempts((data || []) as AttemptWithUser[]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [question.id]);

  const handleDownloadZip = async () => {
    if (attempts.length === 0) return;
    setZipping(true);
    setProgress('Menyiapkan...');
    try {
      const zip = new JSZip();
      for (let i = 0; i < attempts.length; i++) {
        const att = attempts[i];
        const name = (att.student_name || att.id).replace(/[^a-zA-Z0-9 _\-]/g, '').trim();
        const nisn = (att.student_nisn || `id${i}`).replace(/\D/g, '') || `id${i}`;
        const filename = `${name}_${nisn}.pdf`;
        setProgress(`PDF ${i + 1}/${attempts.length}: ${name}...`);

        // Build minimal answer object
        const mockAttempt: Attempt = {
          ...att,
          essay_answers: { [question.id]: { diketahui: (att as any).jawaban || '', ditanya: '', pengerjaan: '', kesimpulan: '' } },
          ai_scores: { [question.id]: { evaluation: { diketahui: { score: (att as any).skor || 0, max_score: (att as any).skor_maks || 0, reason: (att as any).alasan || '' } } } },
          total_essay_score: (att as any).skor || 0,
          total_max_points: (att as any).skor_maks || 0,
          score: (att as any).skor || 0,
        };

        const html = buildAnswerHtml(mockAttempt, question, att.student_name, att.student_nisn);
        const el = document.createElement('div');
        el.innerHTML = html;
        el.style.cssText = 'position:absolute;left:-9999px;';
        document.body.appendChild(el);
        try {
          const pdfBlob: Blob = await new Promise((resolve, reject) => {
            (html2pdf as any)()
              .set({ margin: 0, filename, image: { type: 'jpeg', quality: 0.9 },
                html2canvas: { scale: 1.5, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
              .from(el).outputPdf('blob').then(resolve).catch(reject);
          });
          zip.file(filename, pdfBlob);
        } finally { document.body.removeChild(el); }
      }
      setProgress('Mengemas ZIP...');
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Jawaban_${question.test_type}_${question.strand}_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setProgress(`✅ Selesai! ${attempts.length} PDF dalam ZIP.`);
    } catch (err: any) {
      setProgress(`❌ Gagal: ${err.message}`);
    } finally { setZipping(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jawaban Siswa</div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white truncate max-w-xs mt-0.5">{question.title}</h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center gap-3 justify-center py-10 text-slate-400">
              <Loader2 size={18} className="animate-spin" /> Memuat...
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-bold">Belum ada jawaban</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attempts.map((att, i) => (
                <div key={att.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300 shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{att.student_name || 'Tanpa Nama'}</p>
                    <p className="text-[10px] text-slate-400">NISN: {att.student_nisn || '—'} · {new Date(att.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className={`text-base font-black shrink-0 ${(att as any).skor >= 70 ? 'text-emerald-600' : (att as any).skor >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>
                    {(att as any).skor ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {progress && (
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              {progress}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors">
              Tutup
            </button>
            <button onClick={handleDownloadZip} disabled={zipping || attempts.length === 0}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
              {zipping ? <><Loader2 size={14} className="animate-spin" /> Memproses...</> : <><FileArchive size={14} /> Unduh ZIP ({attempts.length})</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// AddExamButton — satu tombol tengah dengan pilihan pretest/posttest
// ─────────────────────────────────────────────
const AddExamButton: React.FC<{
  onSelectPretest: () => void;
  onSelectPosttest: () => void;
}> = ({ onSelectPretest, onSelectPosttest }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex justify-center mt-2">
      {open ? (
        <div className="flex gap-3 animate-in fade-in duration-150">
          <button onClick={() => { setOpen(false); onSelectPretest(); }}
            className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-amber-500 text-white text-sm font-bold cursor-pointer hover:bg-amber-600 shadow-lg transition-colors">
            <Plus size={15} /> Tambah Pretest
          </button>
          <button onClick={() => { setOpen(false); onSelectPosttest(); }}
            className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold cursor-pointer hover:bg-emerald-700 shadow-lg transition-colors">
            <Plus size={15} /> Tambah Posttest
          </button>
          <button onClick={() => setOpen(false)}
            className="w-11 h-11 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm font-bold cursor-pointer hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all">
          <Plus size={16} /> Tambah Soal Ujian
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// QuestionCard — kartu satu soal
// ─────────────────────────────────────────────
const QuestionCard: React.FC<{
  q: Question;
  attempt?: QuestionAttempt;
  isAdmin: boolean;
  colorClass: 'amber' | 'emerald';
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
}> = ({ q, attempt, isAdmin, colorClass, onStart, onEdit, onDelete, onDownload }) => {
  const isDone = !!attempt;
  const c = colorClass === 'amber'
    ? { badge: 'bg-amber-100 text-amber-700', btn: 'bg-amber-500 hover:bg-amber-600', strip: 'from-amber-500 to-orange-400' }
    : { badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', strip: 'from-emerald-500 to-teal-400' };

  const totalPoints = q.rme_keys
    ? (q.rme_keys.points_diketahui || 0) + (q.rme_keys.points_ditanya || 0) +
      (q.rme_keys.points_pengerjaan || 0) + (q.rme_keys.points_kesimpulan || 0)
    : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      <div className={`h-1 bg-gradient-to-r ${c.strip}`} />
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${c.badge}`}>
            {q.test_type === 'pretest' ? 'Pretest' : 'Posttest'}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
            isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            <span className="material-symbols-outlined text-[11px]">{isDone ? 'check_circle' : 'pending'}</span>
            {isDone ? 'Selesai' : 'Belum'}
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white line-clamp-2 leading-snug flex-1">
          {q.title || 'Soal Tanpa Judul'}
        </h3>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>{q.strand}</span>
          {totalPoints > 0 && <span>🏆 {totalPoints} poin</span>}
        </div>

        {isDone && attempt && (
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Nilai</span>
            <span className={`text-xl font-black ${attempt.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{attempt.score}</span>
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <button onClick={onStart}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              isDone ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200' : `${c.btn} text-white shadow-sm`
            }`}>
            {isDone ? <><Eye size={12} /> Hasil</> : <><Play size={12} /> Kerjakan</>}
          </button>
          {isAdmin && (
            <>
              <button onClick={onDownload}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 text-indigo-500 hover:bg-indigo-50 flex items-center justify-center cursor-pointer"
                title="Download ZIP jawaban">
                <Download size={13} />
              </button>
              <button onClick={onEdit}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                title="Edit soal">
                <Edit3 size={13} />
              </button>
              <button onClick={onDelete}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                title="Hapus soal">
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// UjianScreen
// ─────────────────────────────────────────────
interface UjianScreenProps {
  onNavigateToViewer: (examId: string) => void;
}

export const UjianScreen: React.FC<UjianScreenProps> = ({ onNavigateToViewer }) => {
  const { user, isAdmin } = useAuth();
  const [selectedStrand, setSelectedStrand] = useState<MathCategory | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Record<string, QuestionAttempt>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state — 'closed' | 'new_pretest' | 'new_postest' | questionId (edit)
  const [formMode, setFormMode] = useState<string>('closed');
  const [downloadQ, setDownloadQ] = useState<Question | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!selectedStrand || !user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: qs, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .ilike('strand', selectedStrand)
        .in('test_type', ['pretest', 'postest'])
        .order('created_at', { ascending: false });
      if (qErr) throw qErr;

      setQuestions((qs || []) as Question[]);

      // Coba fetch attempt dari jawaban table
      try {
        const ids = (qs || []).map((q: any) => q.id);
        if (ids.length > 0) {
          const { data: atts } = await supabase
            .from('jawaban')
            .select('id, soal_id, skor')
            .eq('user_id', user.id)
            .in('soal_id', ids);
          const map: Record<string, QuestionAttempt> = {};
          (atts || []).forEach((a: any) => {
            if (!map[a.soal_id]) map[a.soal_id] = { id: a.id, question_id: a.soal_id, score: a.skor || 0 };
          });
          setAttempts(map);
        }
      } catch { /* skip */ }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat soal');
    } finally { setLoading(false); }
  }, [selectedStrand, user]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
  useEffect(() => { setFormMode('closed'); }, [selectedStrand]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus soal ini? Data jawaban siswa ikut terhapus.')) return;
    await supabase.from('questions').delete().eq('id', id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const pretests  = questions.filter(q => q.test_type === 'pretest');
  const posttests = questions.filter(q => q.test_type === 'postest');
  const currentStrand = STRANDS.find(s => s.id === selectedStrand);

  const editingQ = formMode !== 'closed' && formMode !== 'new_pretest' && formMode !== 'new_postest'
    ? questions.find(q => q.id === formMode) || null
    : null;
  const formTestType: 'pretest' | 'postest' =
    formMode === 'new_pretest' ? 'pretest'
    : formMode === 'new_postest' ? 'postest'
    : (editingQ?.test_type ?? 'pretest');
  const isFormOpen = formMode !== 'closed';

  return (
    <div className="flex flex-col w-full pb-16 font-sans px-4 sm:px-6 pt-4 animate-in fade-in">

      {/* Download modal */}
      {downloadQ && <DownloadModal question={downloadQ} onClose={() => setDownloadQ(null)} />}

      {/* HEADER */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[28px]">quiz</span>
            Ujian Kompetensi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pretest & Posttest — 4 Tahap RME
          </p>
        </div>

        {/* Tombol tambah admin — hanya tampil saat belum pilih strand, di empty state dan bawah grid */}
      </div>

      {/* STRAND SELECTOR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {STRANDS.map(strand => (
          <button key={strand.id}
            onClick={() => setSelectedStrand(strand.id as MathCategory)}
            className={`p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] border-2 ${
              selectedStrand === strand.id
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
            }`}>
            <span className={`material-symbols-outlined text-[32px] ${selectedStrand === strand.id ? 'text-white' : 'text-indigo-500'}`}>
              {strand.icon}
            </span>
            <span className="text-xs font-bold leading-tight">{strand.label}</span>
          </button>
        ))}
      </div>

      {/* ── KONTEN STRAND TERPILIH ── */}
      {selectedStrand && (
        <div className="space-y-5">

          {/* Sub-header */}
          <div className="flex items-center gap-3">
            {currentStrand && (
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentStrand.gradient} flex items-center justify-center shadow shrink-0`}>
                <span className="material-symbols-outlined text-white text-[18px]">{currentStrand.icon}</span>
              </div>
            )}
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white capitalize">{selectedStrand}</h2>
              <p className="text-[10px] text-slate-400">{pretests.length} pretest · {posttests.length} posttest</p>
            </div>
          </div>

          {/* FORM tambah / edit */}
          {isAdmin && isFormOpen && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <UjianQuestionForm
                strand={selectedStrand as any}
                testType={formTestType}
                editing={editingQ}
                onCancel={() => setFormMode('closed')}
                onSaved={() => { setFormMode('closed'); fetchQuestions(); }}
              />
            </div>
          )}

          {/* DAFTAR SOAL */}
          {!isFormOpen && (
            <>
              {loading ? (
                <div className="flex items-center gap-3 justify-center py-16 text-slate-400">
                  <Loader2 size={20} className="animate-spin text-indigo-400" />
                  <span className="text-sm">Memuat soal...</span>
                </div>
              ) : error ? (
                <div className="p-5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 rounded-2xl text-sm">
                  <p className="font-bold">Gagal memuat</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 block mb-2">inventory_2</span>
                  <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">Belum ada soal ujian</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAdmin ? 'Tambahkan soal pretest atau posttest.' : 'Guru belum membuat soal untuk materi ini.'}
                  </p>
                  {isAdmin && (
                    <div className="mt-5">
                      <AddExamButton
                        onSelectPretest={() => setFormMode('new_pretest')}
                        onSelectPosttest={() => setFormMode('new_postest')}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {pretests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-amber-600 text-[18px]">assignment</span>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Pretest</h3>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{pretests.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pretests.map(q => (
                          <QuestionCard key={q.id} q={q} attempt={attempts[q.id]} isAdmin={isAdmin}
                            colorClass="amber"
                            onStart={() => onNavigateToViewer(q.id)}
                            onEdit={() => setFormMode(q.id)}
                            onDelete={() => handleDelete(q.id)}
                            onDownload={() => setDownloadQ(q)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {posttests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">assignment_turned_in</span>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Posttest</h3>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{posttests.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posttests.map(q => (
                          <QuestionCard key={q.id} q={q} attempt={attempts[q.id]} isAdmin={isAdmin}
                            colorClass="emerald"
                            onStart={() => onNavigateToViewer(q.id)}
                            onEdit={() => setFormMode(q.id)}
                            onDelete={() => handleDelete(q.id)}
                            onDownload={() => setDownloadQ(q)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Satu tombol tambah di tengah bawah grid */}
                  {isAdmin && !isFormOpen && (
                    <AddExamButton
                      onSelectPretest={() => setFormMode('new_pretest')}
                      onSelectPosttest={() => setFormMode('new_postest')}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
