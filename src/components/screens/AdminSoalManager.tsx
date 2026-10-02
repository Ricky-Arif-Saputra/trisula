import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import { InlineMath } from 'react-katex';

// =====================================================
// Types
// =====================================================
type TestType = 'latihan' | 'pretest' | 'postest';
type Strand = 'bilangan' | 'aljabar' | 'geometri' | 'trigonometri' | 'peluang';
type Difficulty = 'mudah' | 'sedang' | 'sulit';
type BlockType = 'text' | 'latex' | 'image';

interface ContentBlock {
  id: string;
  type: BlockType;
  value: string;
}

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionRow {
  id: string;
  title: string;
  test_type: TestType;
  strand: Strand;
  category: Difficulty;
  content_blocks: ContentBlock[];
  options: { id: string; text: string; is_correct: boolean }[];
  has_simulation: boolean;
  created_by: string;
  created_at?: string;
}

// =====================================================
// Constants
// =====================================================
const TEST_TABS: { value: TestType; label: string; icon: string; color: string }[] = [
  { value: 'latihan', label: 'Tambahkan Soal (Latihan)', icon: 'quiz', color: 'indigo' },
  { value: 'pretest', label: 'Tambahkan Pretest', icon: 'assignment', color: 'amber' },
  { value: 'postest', label: 'Tambahkan Postest', icon: 'assignment_turned_in', color: 'emerald' },
];

const STRAND_OPTIONS: { value: Strand; label: string; icon: string }[] = [
  { value: 'bilangan', label: 'Bilangan', icon: '123' },
  { value: 'aljabar', label: 'Aljabar', icon: 'functions' },
  { value: 'geometri', label: 'Geometri', icon: 'hexagon' },
  { value: 'trigonometri', label: 'Trigonometri', icon: 'ssid_chart' },
  { value: 'peluang', label: 'Peluang & Data', icon: 'casino' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string; icon: string }[] = [
  { value: 'mudah', label: 'Mudah', color: 'emerald', icon: 'sentiment_satisfied' },
  { value: 'sedang', label: 'Sedang', color: 'amber', icon: 'sentiment_neutral' },
  { value: 'sulit', label: 'Sulit', color: 'rose', icon: 'sentiment_very_dissatisfied' },
];

const LATEX_SYMBOLS = [
  { label: 'Pecahan', insert: '\\frac{a}{b}' },
  { label: 'Akar', insert: '\\sqrt{x}' },
  { label: 'Pangkat', insert: 'x^{2}' },
  { label: 'Sub', insert: 'x_{i}' },
  { label: 'Pi (π)', insert: '\\pi' },
  { label: 'Sigma (Σ)', insert: '\\sum_{i=1}^{n}' },
  { label: 'Integral', insert: '\\int_{a}^{b}' },
  { label: 'Limit', insert: '\\lim_{x \\to \\infty}' },
  { label: '≤', insert: '\\leq' },
  { label: '≥', insert: '\\geq' },
  { label: '≠', insert: '\\neq' },
  { label: '×', insert: '\\times' },
  { label: '÷', insert: '\\div' },
  { label: '°', insert: '^{\\circ}' },
];

let blockCounter = 0;
const newId = (prefix: string) => `${prefix}-${++blockCounter}-${Date.now()}`;

// =====================================================
// Sub-components
// =====================================================
const ContentBlockItem: React.FC<{
  block: ContentBlock;
  index: number;
  total: number;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}> = ({ block, index, total, onChange, onRemove, onMove }) => {
  const [showLatexSymbols, setShowLatexSymbols] = useState(false);

  const insertSymbol = (sym: string) => {
    onChange(block.id, block.value + ' ' + sym);
  };

  const BLOCK_META = {
    text: { label: 'Teks / Narasi', icon: 'text_fields', color: 'slate', bg: 'bg-slate-50 dark:bg-slate-800/60', border: 'border-slate-200 dark:border-slate-700' },
    latex: { label: 'Persamaan (LaTeX)', icon: 'function', color: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800' },
    image: { label: 'Gambar', icon: 'image', color: 'sky', bg: 'bg-sky-50 dark:bg-sky-900/10', border: 'border-sky-200 dark:border-sky-800' },
  };

  const meta = BLOCK_META[block.type];

  return (
    <div className={`rounded-xl border-2 ${meta.border} ${meta.bg} overflow-hidden transition-all`}>
      {/* Block Header */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${meta.border} bg-white/50 dark:bg-black/10`}>
        <span className={`material-symbols-outlined text-[16px] text-${meta.color}-500`}>{meta.icon}</span>
        <span className={`text-[10px] font-black text-${meta.color}-600 dark:text-${meta.color}-400 uppercase tracking-widest`}>Blok {index + 1} — {meta.label}</span>
        <div className="ml-auto flex items-center gap-1">
          {index > 0 && (
            <button onClick={() => onMove(block.id, 'up')} title="Pindah ke atas"
              className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-slate-800 cursor-pointer">
              <span className="material-symbols-outlined text-[14px]">keyboard_arrow_up</span>
            </button>
          )}
          {index < total - 1 && (
            <button onClick={() => onMove(block.id, 'down')} title="Pindah ke bawah"
              className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-slate-800 cursor-pointer">
              <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
            </button>
          )}
          <button onClick={() => onRemove(block.id)} title="Hapus blok"
            className="w-6 h-6 rounded flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-100 cursor-pointer">
            <span className="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-3">
        {block.type === 'text' && (
          <textarea
            value={block.value}
            onChange={(e) => onChange(block.id, e.target.value)}
            rows={4}
            placeholder="Tuliskan narasi atau deskripsi masalah di sini. Contoh: 'Sebuah perusahaan distribusi memiliki dua fungsi proses pengiriman...'"
            className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm leading-relaxed focus:border-slate-400 dark:focus:border-slate-500 outline-none resize-y placeholder:text-slate-400"
          />
        )}

        {block.type === 'latex' && (
          <div className="space-y-2">
            {/* Symbol Panel Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-indigo-500 font-bold uppercase">Sintaks LaTeX</span>
              <button onClick={() => setShowLatexSymbols(!showLatexSymbols)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">keyboard</span>
                {showLatexSymbols ? 'Sembunyikan Simbol' : 'Sisipkan Simbol'}
              </button>
            </div>
            {/* Symbol Picker */}
            {showLatexSymbols && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 animate-in fade-in slide-in-from-top-1">
                {LATEX_SYMBOLS.map((s) => (
                  <button key={s.label} onClick={() => insertSymbol(s.insert)}
                    className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer">
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            {/* LaTeX Input */}
            <textarea
              value={block.value}
              onChange={(e) => onChange(block.id, e.target.value)}
              rows={3}
              placeholder="Contoh: f(x) = \frac{a}{b} + x^{2} atau S = P \times (1 + r)^{n}"
              className="w-full p-3 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-mono focus:border-indigo-500 outline-none resize-y placeholder:text-slate-400"
            />
            {/* Live Preview */}
            {block.value.trim() && (
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700">
                <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">visibility</span>
                  Live Preview
                </div>
                <div className="text-base text-slate-800 dark:text-white overflow-x-auto min-h-[24px]">
                  <InlineMath math={block.value} />
                </div>
              </div>
            )}
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={block.value}
                onChange={(e) => onChange(block.id, e.target.value)}
                placeholder="https://example.com/gambar-soal.png"
                className="flex-1 p-3 rounded-lg border border-sky-200 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-sky-500 outline-none placeholder:text-slate-400"
              />
            </div>
            {block.value.trim() && (
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-700 text-center animate-in fade-in">
                <div className="text-[9px] font-bold text-sky-400 uppercase tracking-wider mb-2">Pratinjau Gambar</div>
                <img src={block.value} alt="Preview"
                  className="max-h-52 mx-auto rounded-lg object-contain border border-slate-200 dark:border-slate-700"
                  onError={(e) => { (e.target as HTMLImageElement).alt = '⚠️ Gagal memuat gambar — periksa URL'; }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// Komponen Daftar Soal Tersimpan (Realtime)
// =====================================================
const QuestionList: React.FC<{ refresh: number }> = ({ refresh }) => {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setQuestions((data as QuestionRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [refresh, fetchQuestions]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('questions-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'questions',
      }, () => {
        fetchQuestions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQuestions]);

  const STRAND_COLORS: Record<Strand, string> = {
    bilangan: 'bg-blue-100 text-blue-700',
    aljabar: 'bg-purple-100 text-purple-700',
    geometri: 'bg-green-100 text-green-700',
    trigonometri: 'bg-orange-100 text-orange-700',
    peluang: 'bg-pink-100 text-pink-700',
  };

  const DIFF_COLORS: Record<Difficulty, string> = {
    mudah: 'bg-emerald-100 text-emerald-700',
    sedang: 'bg-amber-100 text-amber-700',
    sulit: 'bg-rose-100 text-rose-700',
  };

  const TYPE_COLORS: Record<TestType, string> = {
    latihan: 'bg-indigo-100 text-indigo-700',
    pretest: 'bg-amber-100 text-amber-700',
    postest: 'bg-emerald-100 text-emerald-700',
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus soal ini?')) return;
    await supabase.from('questions').delete().eq('id', id);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      <span className="ml-3 text-sm text-slate-500">Memuat soal...</span>
    </div>
  );

  if (questions.length === 0) return (
    <div className="text-center py-10">
      <span className="material-symbols-outlined text-slate-300 text-5xl block mb-2">quiz</span>
      <p className="text-sm text-slate-400 font-semibold">Belum ada soal. Tambahkan soal pertama!</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <div key={q.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${TYPE_COLORS[q.test_type]}`}>{q.test_type}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STRAND_COLORS[q.strand] || 'bg-slate-100 text-slate-600'}`}>{q.strand}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${DIFF_COLORS[q.category]}`}>{q.category}</span>
              {q.has_simulation && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 uppercase flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px]">science</span> Simulasi
                </span>
              )}
            </div>
            <button onClick={() => handleDelete(q.id)}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer shrink-0">
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
          {q.title && (
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-2">{q.title}</h3>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {q.content_blocks?.find(b => b.type === 'text')?.value || '(Hanya berisi persamaan/gambar)'}
          </p>
          <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {q.options?.length || 0} opsi · {q.content_blocks?.length || 0} blok · oleh {q.created_by}
          </div>
        </div>
      ))}
    </div>
  );
};

// =====================================================
// Komponen Utama AdminSoalManager
// =====================================================
export const AdminSoalManager: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Form state
  const [testType, setTestType] = useState<TestType>('latihan');
  const [strand, setStrand] = useState<Strand>('bilangan');
  const [difficulty, setDifficulty] = useState<Difficulty>('mudah');
  const [title, setTitle] = useState('');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: newId('blk'), type: 'text', value: '' },
  ]);
  const [options, setOptions] = useState<AnswerOption[]>([
    { id: newId('opt'), text: '', isCorrect: false },
    { id: newId('opt'), text: '', isCorrect: false },
  ]);
  const [hasSimulation, setHasSimulation] = useState(false);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // =====================================================
  // PROTEKSI: Jika bukan Admin → tampilkan 403 Forbidden
  // =====================================================
  if (!isAdmin) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 font-sans mt-10">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border-2 border-rose-300 dark:border-rose-800 shadow-xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-rose-500 text-5xl">shield_lock</span>
          </div>
          <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400 mb-2">403 — Akses Ditolak</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
            Halaman Manajemen Soal hanya dapat diakses oleh <strong>Admin</strong> atau <strong>Guru</strong> yang terdaftar dalam sistem TRISULA EduMath.
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs text-slate-500 font-mono">
            <span className="material-symbols-outlined text-[14px]">person</span>
            Peran saat ini: <strong className="text-slate-700 dark:text-slate-300">Siswa</strong>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // Content Block Handlers
  // =====================================================
  const addBlock = (type: BlockType) => {
    setContentBlocks(prev => [...prev, { id: newId('blk'), type, value: '' }]);
  };

  const removeBlock = (id: string) => {
    setContentBlocks(prev => prev.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, value: string) => {
    setContentBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b));
  };

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    setContentBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  // =====================================================
  // Answer Option Handlers
  // =====================================================
  const addOption = () => {
    if (options.length >= 8) return;
    setOptions(prev => [...prev, { id: newId('opt'), text: '', isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const updateOptionText = (id: string, text: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  };

  // Multi-correct: CHECKBOX toggle (bukan radio)
  const toggleCorrect = (id: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o));
  };

  // =====================================================
  // Reset Form
  // =====================================================
  const resetForm = () => {
    setTestType('latihan');
    setStrand('bilangan');
    setDifficulty('mudah');
    setTitle('');
    setContentBlocks([{ id: newId('blk'), type: 'text', value: '' }]);
    setOptions([
      { id: newId('opt'), text: '', isCorrect: false },
      { id: newId('opt'), text: '', isCorrect: false },
    ]);
    setHasSimulation(false);
    setSaveResult(null);
  };

  const handleClose = () => {
    resetForm();
    setShowModal(false);
  };

  // =====================================================
  // Simpan ke Supabase
  // =====================================================
  const handleSave = async () => {
    setSaveResult(null);

    const hasContent = contentBlocks.some(b => b.value.trim());
    if (!hasContent) {
      setSaveResult({ type: 'error', msg: 'Minimal satu blok konten harus diisi.' });
      return;
    }
    if (options.some(o => !o.text.trim())) {
      setSaveResult({ type: 'error', msg: 'Semua opsi jawaban harus diisi.' });
      return;
    }
    if (!options.some(o => o.isCorrect)) {
      setSaveResult({ type: 'error', msg: 'Pilih minimal satu jawaban yang benar.' });
      return;
    }

    setIsSaving(true);

    const payload = {
      title: title || 'Soal Tanpa Judul',
      test_type: testType,
      strand,
      category: difficulty,
      content_blocks: contentBlocks,
      options: options.map((o, i) => ({
        id: String.fromCharCode(65 + i),
        text: o.text,
        is_correct: o.isCorrect,
      })),
      has_simulation: hasSimulation,
      created_by: user?.email || 'unknown',
    };

    try {
      const { error } = await supabase.from('questions').insert([payload]);
      if (error) throw error;

      setSaveResult({ type: 'success', msg: '✅ Soal berhasil disimpan! Daftar soal diperbarui otomatis.' });
      setRefreshKey(k => k + 1);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setSaveResult({ type: 'error', msg: `Gagal menyimpan: ${err.message || 'Unknown error'}` });
    } finally {
      setIsSaving(false);
    }
  };

  const activeTab = TEST_TABS.find(t => t.value === testType)!;

  return (
    <div className="w-full font-sans space-y-6">

      {/* ===== Header Panel ===== */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1a3050] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-white font-black text-lg">Panel Manajemen Soal</h1>
              <p className="text-slate-300 text-xs">TRISULA EduMath — Admin/Guru</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-[10px] font-bold uppercase">Realtime Aktif</span>
            </div>
            <button onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Tambah Soal
            </button>
          </div>
        </div>

        {/* Daftar Soal */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-indigo-500">list</span>
              Daftar Soal Tersimpan
            </h2>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              20 terbaru · auto-sync
            </span>
          </div>
          <QuestionList refresh={refreshKey} />
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/70 backdrop-blur-sm pt-6 pb-6 overflow-y-auto">
          <div className="w-full max-w-3xl mx-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1a3050] p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-${activeTab.color}-500 flex items-center justify-center shadow`}>
                  <span className="material-symbols-outlined text-white text-[18px]">{activeTab.icon}</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">{activeTab.label}</h2>
                  <p className="text-slate-400 text-xs">Isi seluruh bagian soal dengan lengkap</p>
                </div>
              </div>
              <button onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">

              {/* ===== 1. TAB JENIS SOAL ===== */}
              <div>
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">
                  Jenis Soal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TEST_TABS.map(tab => (
                    <button key={tab.value} onClick={() => setTestType(tab.value)}
                      className={`p-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${testType === tab.value ? `border-${tab.color}-500 bg-${tab.color}-50 dark:bg-${tab.color}-900/10 text-${tab.color}-700 dark:text-${tab.color}-400` : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
                      <span className={`material-symbols-outlined text-[22px] ${testType === tab.value ? `text-${tab.color}-500` : 'text-slate-400'}`}>{tab.icon}</span>
                      {tab.label.replace('Tambahkan ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== 2. METADATA: Bidang & Kesulitan ===== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">category</span>
                    Bidang Soal
                  </label>
                  <select value={strand} onChange={(e) => setStrand(e.target.value as Strand)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm focus:border-indigo-500 outline-none cursor-pointer">
                    {STRAND_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">signal_cellular_alt</span>
                    Tingkat Kesulitan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTY_OPTIONS.map(d => (
                      <button key={d.value} onClick={() => setDifficulty(d.value)}
                        className={`py-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${difficulty === d.value ? `border-${d.color}-500 bg-${d.color}-50 dark:bg-${d.color}-900/10 text-${d.color}-700 dark:text-${d.color}-400` : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
                        <span className={`material-symbols-outlined text-[14px]`}>{d.icon}</span>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== 2B. METADATA: Judul ===== */}
              <div>
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1">title</span>
                  Judul / Topik Soal
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Literasi Keuangan, Persamaan Linier, dll."
                  className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm focus:border-indigo-500 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* ===== 3. BLOK KONTEN DINAMIS ===== */}
              <div>
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1">view_agenda</span>
                  Konten Soal (Blok Dinamis)
                </label>

                {contentBlocks.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm font-semibold">
                    Tambahkan blok konten di bawah ini →
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  {contentBlocks.map((block, idx) => (
                    <ContentBlockItem
                      key={block.id}
                      block={block}
                      index={idx}
                      total={contentBlocks.length}
                      onChange={updateBlock}
                      onRemove={removeBlock}
                      onMove={moveBlock}
                    />
                  ))}
                </div>

                {/* Add Block Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => addBlock('text')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">text_fields</span>
                    + Teks
                  </button>
                  <button onClick={() => addBlock('latex')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 font-bold text-xs transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">function</span>
                    + Persamaan (LaTeX)
                  </button>
                  <button onClick={() => addBlock('image')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/10 font-bold text-xs transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">image</span>
                    + Gambar
                  </button>
                </div>
              </div>

              {/* ===== 4. OPSI JAWABAN (Multi-Correct Checkbox) ===== */}
              <div>
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1">checklist</span>
                  Opsi Jawaban
                  <span className="ml-2 text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                    ✓ MULTI-JAWABAN BENAR
                  </span>
                </label>

                <div className="space-y-2.5">
                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <div key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${opt.isCorrect ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>

                        {/* Checkbox */}
                        <button onClick={() => toggleCorrect(opt.id)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 hover:border-emerald-400'}`}
                          title="Tandai sebagai jawaban benar">
                          {opt.isCorrect && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                        </button>

                        {/* Label Huruf */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                          {letter}
                        </div>

                        {/* Input */}
                        <input type="text" value={opt.text} onChange={(e) => updateOptionText(opt.id, e.target.value)}
                          placeholder={`Jawaban opsi ${letter}`}
                          className="flex-1 bg-transparent text-sm font-semibold text-slate-800 dark:text-white outline-none placeholder:text-slate-400 min-w-0" />

                        {opt.isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span> BENAR
                          </span>
                        )}

                        {/* Hapus */}
                        {options.length > 2 && (
                          <button onClick={() => removeOption(opt.id)}
                            className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {options.length < 8 && (
                  <button onClick={addOption}
                    className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 font-bold text-xs hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Tambah Pilihan ({String.fromCharCode(65 + options.length)})
                  </button>
                )}
              </div>

              {/* ===== 5. TOGGLE SIMULASI RME ===== */}
              <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors cursor-pointer ${hasSimulation ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                onClick={() => setHasSimulation(!hasSimulation)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasSimulation ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <span className={`material-symbols-outlined ${hasSimulation ? 'text-white' : 'text-slate-400'}`}>science</span>
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${hasSimulation ? 'text-violet-700 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      Sertakan Simulasi RME
                    </div>
                    <div className="text-[10px] text-slate-400">Aktifkan untuk soal yang dilengkapi modul simulasi interaktif untuk pemahaman siswa</div>
                  </div>
                </div>
                {/* Toggle Switch */}
                <div className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${hasSimulation ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${hasSimulation ? 'left-6' : 'left-0.5'}`} />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
              {saveResult && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in ${saveResult.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                  <span className="material-symbols-outlined text-[18px]">{saveResult.type === 'success' ? 'check_circle' : 'error'}</span>
                  {saveResult.msg}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">info</span>
                  Soal akan langsung tampil di daftar setelah disimpan (Realtime Sync)
                </div>
                <div className="flex gap-3">
                  <button onClick={handleClose}
                    className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    Batal
                  </button>
                  <button onClick={handleSave} disabled={isSaving}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${isSaving ? 'bg-slate-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-600/30 active:scale-95'}`}>
                    {isSaving ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">save</span>Simpan Soal</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
