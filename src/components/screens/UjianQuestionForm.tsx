import React, { useState } from 'react';
import { MathRenderer } from '../MathRenderer';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import type { Strand } from '../../hooks/useQuestions';
import {
  type RmeKeys,
  STAGES,
  STAGE_COLORS,
  uid,
  makeBlankRmeKeys,
  embedRmeKeys,
  parseRmeKeys,
  stripRmeMetaBlocks,
} from './LatihanTypes';
import { Trash2, Eye, X, Type, Sigma, ImageIcon, Check, AlertCircle, Loader2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type BlockType = 'text' | 'latex' | 'image';
type StageKey = 'diketahui' | 'ditanya' | 'pengerjaan' | 'kesimpulan';
interface ContentBlock { id: string; type: BlockType; value: string; }

interface StageBlocks {
  diketahui: ContentBlock[];
  ditanya: ContentBlock[];
  pengerjaan: ContentBlock[];
  kesimpulan: ContentBlock[];
}

interface QuestionItem {
  _id: string; // local UI id
  id?: string; // db id for editing
  title: string;
  blocks: ContentBlock[];
  stageBlocks: StageBlocks;
  points: { diketahui: number; ditanya: number; pengerjaan: number; kesimpulan: number };
  finalNumericAnswer: string;
}

interface ExistingQuestion {
  id: string;
  title: string;
  content_blocks: ContentBlock[];
  rme_keys?: RmeKeys;
  options?: { id: string; text: string }[];
}

export interface UjianQuestionFormProps {
  strand: Strand;
  testType: 'pretest' | 'postest';
  /** Daftar soal yang sudah ada (saat edit paket) */
  existingQuestions?: ExistingQuestion[];
  /** Judul ujian yang sudah ada (saat edit) */
  existingExamTitle?: string;
  /** Durasi ujian dalam menit yang sudah ada (saat edit) */
  existingDuration?: number;
  onCancel: () => void;
  onSaved: () => void;
}

// ─────────────────────────────────────────────
// Block rendering helpers
// ─────────────────────────────────────────────
const BLOCK_META: Record<BlockType, { label: string; icon: React.ReactNode; border: string; bg: string; placeholder: string }> = {
  text:  { label: 'Teks',  icon: <Type size={12} />,      border: 'border-slate-300',  bg: 'bg-white',     placeholder: 'Tuliskan narasi / keterangan...' },
  latex: { label: 'LaTeX', icon: <Sigma size={12} />,     border: 'border-violet-300', bg: 'bg-violet-50', placeholder: 'Contoh: \\frac{1}{2} x^2 + 3x' },
  image: { label: 'Gambar',icon: <ImageIcon size={12} />, border: 'border-sky-300',    bg: 'bg-sky-50',    placeholder: 'URL gambar (https://...)' },
};

const BlockInput: React.FC<{
  block: ContentBlock;
  onChange: (id: string, val: string) => void;
  onRemove: (id: string) => void;
}> = ({ block, onChange, onRemove }) => {
  const meta = BLOCK_META[block.type];
  const [showPreview, setShowPreview] = useState(false);
  return (
    <div className={`rounded-xl border ${meta.border} ${meta.bg} p-2.5 space-y-1.5`}>
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${block.type === 'latex' ? 'text-violet-600' : block.type === 'image' ? 'text-sky-600' : 'text-slate-500'}`}>
          {meta.icon} {meta.label}
        </span>
        <div className="flex items-center gap-1">
          {(block.type === 'latex' || block.type === 'text') && (
            <button type="button" onClick={() => setShowPreview(v => !v)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${showPreview ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <Eye size={11} /> Preview
            </button>
          )}
          <button type="button" onClick={() => onRemove(block.id)}
            className="w-6 h-6 rounded-md text-rose-400 hover:bg-rose-100 flex items-center justify-center cursor-pointer">
            <X size={12} />
          </button>
        </div>
      </div>
      {block.type === 'image' ? (
        <div className="space-y-1.5">
          <input value={block.value} onChange={e => onChange(block.id, e.target.value)} placeholder={meta.placeholder}
            className="w-full p-2 rounded-lg border border-sky-200 bg-white text-sm outline-none focus:border-sky-400 font-mono text-xs" />
          {block.value.trim() && <img src={block.value} alt="" className="max-h-40 rounded-lg border border-sky-200 object-contain" />}
        </div>
      ) : showPreview ? (
        <div className="p-2 rounded-lg border border-slate-200 bg-white min-h-[56px]">
          {block.value.trim() ? <MathRenderer text={block.value} className="text-sm" /> : <span className="text-slate-400 text-xs italic">Kosong</span>}
        </div>
      ) : (
        <textarea rows={block.type === 'latex' ? 2 : 3} value={block.value} onChange={e => onChange(block.id, e.target.value)} placeholder={meta.placeholder}
          className={`w-full p-2 rounded-lg border text-sm outline-none resize-y ${block.type === 'latex' ? 'border-violet-200 bg-white focus:border-violet-400 font-mono' : 'border-slate-200 focus:border-indigo-400'}`} />
      )}
    </div>
  );
};

const BlockAdder: React.FC<{ onAdd: (type: BlockType) => void }> = ({ onAdd }) => (
  <div className="flex gap-2 flex-wrap">
    <button type="button" onClick={() => onAdd('text')} className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer">
      <Type size={12} /> + Teks
    </button>
    <button type="button" onClick={() => onAdd('latex')} className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 cursor-pointer">
      <Sigma size={12} /> + LaTeX
    </button>
    <button type="button" onClick={() => onAdd('image')} className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 cursor-pointer">
      <ImageIcon size={12} /> + Gambar
    </button>
  </div>
);

// ─────────────────────────────────────────────
// StageEditor — satu tahap RME
// ─────────────────────────────────────────────
const StageEditor: React.FC<{
  label: string;
  icon: string;
  color: { border: string; bg: string; label: string; badge: string; ring: string };
  blocks: ContentBlock[];
  points: number;
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (id: string, val: string) => void;
  onRemoveBlock: (id: string) => void;
  onChangePoints: (val: number) => void;
  finalNumericAnswer?: string;
  onChangeFinalNumeric?: (val: string) => void;
}> = ({ label, icon, color, blocks, points, onAddBlock, onUpdateBlock, onRemoveBlock, onChangePoints, finalNumericAnswer, onChangeFinalNumeric }) => (
  <div className={`rounded-xl border-2 ${color.border} ${color.bg} p-4 space-y-3`}>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${color.badge} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white text-[14px]">{icon}</span>
        </div>
        <span className={`font-black text-sm ${color.label} uppercase tracking-wide`}>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <label className={`text-[10px] font-black uppercase tracking-widest ${color.label}`}>Poin</label>
        <input type="number" min={0} max={100} value={points}
          onChange={e => onChangePoints(Math.max(0, Number(e.target.value)))}
          className={`w-16 px-2 py-1 rounded-lg border text-center text-sm font-bold outline-none ${color.border} bg-white`} />
      </div>
    </div>

    {onChangeFinalNumeric !== undefined && (
      <div className="bg-white rounded-lg border border-amber-200 p-3 space-y-1">
        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Kunci jawaban akhir (angka)</label>
        <input type="text" inputMode="decimal" value={finalNumericAnswer ?? ''} onChange={e => onChangeFinalNumeric(e.target.value)}
          placeholder="Contoh: 42 atau 12.5"
          className="w-full p-2 rounded-lg border border-amber-200 bg-amber-50 text-sm font-mono outline-none focus:border-amber-400" />
        <p className="text-[10px] text-slate-400">Dicocokkan persis dengan isian angka siswa.</p>
      </div>
    )}

    <label className="text-[10px] font-bold text-slate-500 uppercase block">Kunci acuan tahap ini</label>
    <div className="space-y-2">
      {blocks.map(block => <BlockInput key={block.id} block={block} onChange={onUpdateBlock} onRemove={onRemoveBlock} />)}
      <BlockAdder onAdd={onAddBlock} />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const serializeBlocks = (blocks: ContentBlock[]): string =>
  JSON.stringify(blocks.map(b => ({ type: b.type, value: b.value })));

const parseStageBlocks = (ref: string, prefix: string): ContentBlock[] => {
  if (!ref) return [{ id: uid(prefix), type: 'text', value: '' }];
  try {
    const p = JSON.parse(ref);
    if (Array.isArray(p)) return p.map((b: any) => ({ id: uid(prefix), type: b.type || 'text', value: b.value || '' }));
  } catch { /* plain */ }
  return [{ id: uid(prefix), type: 'text', value: ref }];
};

const makeBlankQuestion = (): QuestionItem => ({
  _id: uid('qi'),
  title: '',
  blocks: [{ id: uid('blk'), type: 'text', value: '' }],
  stageBlocks: {
    diketahui:  [{ id: uid('sd'), type: 'text', value: '' }],
    ditanya:    [{ id: uid('st'), type: 'text', value: '' }],
    pengerjaan: [{ id: uid('sp'), type: 'text', value: '' }],
    kesimpulan: [{ id: uid('sk'), type: 'text', value: '' }],
  },
  points: { diketahui: 20, ditanya: 10, pengerjaan: 50, kesimpulan: 20 },
  finalNumericAnswer: '',
});

const fromExisting = (eq: ExistingQuestion): QuestionItem => {
  const keys = parseRmeKeys(eq);
  return {
    _id: uid('qi'),
    id: eq.id,
    title: eq.title || '',
    blocks: stripRmeMetaBlocks(eq.content_blocks).length
      ? (stripRmeMetaBlocks(eq.content_blocks) as ContentBlock[])
      : [{ id: uid('blk'), type: 'text', value: '' }],
    stageBlocks: {
      diketahui:  parseStageBlocks(keys.ref_diketahui,  'sd'),
      ditanya:    parseStageBlocks(keys.ref_ditanya,    'st'),
      pengerjaan: parseStageBlocks(keys.ref_pengerjaan, 'sp'),
      kesimpulan: parseStageBlocks(keys.ref_kesimpulan, 'sk'),
    },
    points: {
      diketahui:  keys.points_diketahui,
      ditanya:    keys.points_ditanya,
      pengerjaan: keys.points_pengerjaan,
      kesimpulan: keys.points_kesimpulan,
    },
    finalNumericAnswer: keys.finalNumericAnswer != null ? String(keys.finalNumericAnswer) : '',
  };
};

// ─────────────────────────────────────────────
// QuestionItemEditor — editor satu soal dengan accordion
// ─────────────────────────────────────────────
const QuestionItemEditor: React.FC<{
  q: QuestionItem;
  index: number;
  total: number;
  onChange: (updated: QuestionItem) => void;
  onRemove: () => void;
}> = ({ q, index, total, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(true);

  const upd = (patch: Partial<QuestionItem>) => onChange({ ...q, ...patch });

  const addBlock    = (type: BlockType) => upd({ blocks: [...q.blocks, { id: uid('blk'), type, value: '' }] });
  const updateBlock = (id: string, val: string) => upd({ blocks: q.blocks.map(b => b.id === id ? { ...b, value: val } : b) });
  const removeBlock = (id: string) => upd({ blocks: q.blocks.filter(b => b.id !== id) });

  const addStageBlock = (sk: StageKey, type: BlockType) =>
    upd({ stageBlocks: { ...q.stageBlocks, [sk]: [...q.stageBlocks[sk], { id: uid('sb'), type, value: '' }] } });
  const updateStageBlock = (sk: StageKey, id: string, val: string) =>
    upd({ stageBlocks: { ...q.stageBlocks, [sk]: q.stageBlocks[sk].map(b => b.id === id ? { ...b, value: val } : b) } });
  const removeStageBlock = (sk: StageKey, id: string) =>
    upd({ stageBlocks: { ...q.stageBlocks, [sk]: q.stageBlocks[sk].filter(b => b.id !== id) } });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Soal header */}
      <div
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-300">
            {index + 1}
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Soal {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {total > 1 && (
            <button type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-100 flex items-center justify-center cursor-pointer transition-colors">
              <Trash2 size={13} />
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-5 bg-white dark:bg-slate-900">
          {/* Narasi soal — tanpa judul soal */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Narasi / Konteks Soal</label>
            <div className="space-y-2">
              {q.blocks.map(block => <BlockInput key={block.id} block={block} onChange={updateBlock} onRemove={removeBlock} />)}
              <BlockAdder onAdd={addBlock} />
            </div>
          </div>

          {/* 4 Tahap */}
          {STAGES.map(stage => {
            const color = STAGE_COLORS[stage.color];
            const sk = stage.key as StageKey;
            const isPengerjaan = sk === 'pengerjaan';
            return (
              <StageEditor key={sk}
                label={`Tahap ${stage.label}`}
                icon={stage.icon}
                color={color}
                blocks={q.stageBlocks[sk]}
                points={q.points[sk]}
                onAddBlock={type => addStageBlock(sk, type)}
                onUpdateBlock={(id, val) => updateStageBlock(sk, id, val)}
                onRemoveBlock={id => removeStageBlock(sk, id)}
                onChangePoints={val => upd({ points: { ...q.points, [sk]: val } })}
                finalNumericAnswer={isPengerjaan ? q.finalNumericAnswer : undefined}
                onChangeFinalNumeric={isPengerjaan ? val => upd({ finalNumericAnswer: val }) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Form
// ─────────────────────────────────────────────
export const UjianQuestionForm: React.FC<UjianQuestionFormProps> = ({
  strand, testType, existingQuestions, existingExamTitle, existingDuration, onCancel, onSaved,
}) => {
  const { user } = useAuth();

  // Judul & durasi ujian (level paket, bukan level soal)
  const [examTitle, setExamTitle] = useState(existingExamTitle || '');
  const [examDuration, setExamDuration] = useState<number>(existingDuration ?? 60);

  const [questionItems, setQuestionItems] = useState<QuestionItem[]>(
    existingQuestions && existingQuestions.length > 0
      ? existingQuestions.map(fromExisting)
      : [makeBlankQuestion()]
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addQuestion = () => setQuestionItems(prev => [...prev, makeBlankQuestion()]);
  const removeQuestion = (idx: number) => setQuestionItems(prev => prev.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, q: QuestionItem) =>
    setQuestionItems(prev => prev.map((item, i) => i === idx ? q : item));

  const handleSave = async () => {
    setMsg(null);
    if (!examTitle.trim()) { setMsg({ type: 'error', text: 'Judul ujian wajib diisi.' }); return; }
    // Validasi semua soal
    for (let i = 0; i < questionItems.length; i++) {
      const q = questionItems[i];
      if (!stripRmeMetaBlocks(q.blocks).some(b => b.value.trim())) {
        setMsg({ type: 'error', text: `Narasi Soal ${i + 1} wajib diisi.` }); return;
      }
    }

    setSaving(true);
    try {
      // Jika edit (semua soal punya .id), update satu per satu
      if (questionItems.every(q => q.id)) {
        for (const q of questionItems) {
          const rme_keys: RmeKeys = buildRmeKeys(q);
          const content_blocks = embedRmeKeys(q.blocks, rme_keys);
          const payload = { title: examTitle.trim() || `Soal Ujian`, test_type: testType, strand, category: 'sedang', content_blocks, options: [], has_simulation: false, created_by: user?.email || 'admin', rme_keys, exam_title: examTitle.trim(), exam_duration: examDuration };
          const { error } = await supabase.from('questions').update(payload).eq('id', q.id!);
          if (error) throw error;
        }
      } else {
        // Insert semua soal baru sekaligus
        const rows = questionItems.map((q, qi) => {
          const rme_keys: RmeKeys = buildRmeKeys(q);
          const content_blocks = embedRmeKeys(q.blocks, rme_keys);
          return { id: q.id || crypto.randomUUID(), title: `${examTitle.trim()} — Soal ${qi + 1}`, test_type: testType, strand, category: 'sedang', content_blocks, options: [], has_simulation: false, created_by: user?.email || 'admin', rme_keys, exam_title: examTitle.trim(), exam_duration: examDuration };
        });
        const { error } = await supabase.from('questions').insert(rows);
        if (error) {
          // fallback: try without extra columns
          const rowsBase = rows.map(({ rme_keys: _r, exam_title: _et, exam_duration: _ed, ...rest }) => rest);
          const { error: e2 } = await supabase.from('questions').insert(rowsBase);
          if (e2) throw e2;
        }
      }
      setMsg({ type: 'success', text: `${questionItems.length} soal berhasil disimpan!` });
      setTimeout(() => onSaved(), 700);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal menyimpan.' });
    } finally {
      setSaving(false);
    }
  };

  const headerColors: Record<'pretest' | 'postest', string> = {
    pretest: 'bg-amber-500',
    postest: 'bg-emerald-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* Header */}
      <div className={`px-4 py-3 ${headerColors[testType]} text-white flex items-center justify-between`}>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
            {strand} · {testType === 'pretest' ? 'Pretest' : 'Posttest'}
          </div>
          <h4 className="font-extrabold text-sm">
            {existingQuestions ? 'Edit Soal' : 'Tambah Soal'} · {questionItems.length} soal
          </h4>
        </div>
        <button onClick={onCancel} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Judul & Durasi Ujian */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Judul {testType === 'pretest' ? 'Pretest' : 'Posttest'} *
            </label>
            <input
              value={examTitle}
              onChange={e => setExamTitle(e.target.value)}
              placeholder={`Contoh: ${testType === 'pretest' ? 'Pretest' : 'Posttest'} ${strand.charAt(0).toUpperCase() + strand.slice(1)} Semester 1`}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Waktu (menit)
            </label>
            <div className="relative">
              <input
                type="number"
                min={5}
                max={300}
                value={examDuration}
                onChange={e => setExamDuration(Math.max(5, Number(e.target.value)))}
                className="w-full p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none focus:border-indigo-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">mnt</span>
            </div>
          </div>
        </div>

        {/* Panel teknis pengerjaan */}
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500 text-[18px]">info</span>
            <h4 className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Teknis Pengerjaan Siswa</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-800 dark:text-indigo-200">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">1</span>
              <div><span className="font-bold">Diketahui</span> — Siswa menuliskan data/informasi yang diketahui dari soal.</div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">2</span>
              <div><span className="font-bold">Ditanya</span> — Siswa menuliskan apa yang ditanyakan/permasalahan utama.</div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">3</span>
              <div><span className="font-bold">Pengerjaan</span> — Siswa menuliskan langkah-langkah perhitungan dan menjawab angka akhir.</div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">4</span>
              <div><span className="font-bold">Kesimpulan</span> — Siswa menuliskan kesimpulan dari hasil pengerjaan.</div>
            </div>
          </div>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 border-t border-indigo-200 dark:border-indigo-700 pt-2 mt-1">
            Setiap tahap dinilai oleh AI berdasarkan <span className="font-bold">kunci acuan</span> yang Anda isi di bawah. Tahap Pengerjaan memiliki <span className="font-bold">kunci jawaban angka</span> untuk pengecekan otomatis.
          </p>
        </div>

        {/* Daftar soal */}
        {questionItems.map((q, i) => (
          <QuestionItemEditor
            key={q._id}
            q={q}
            index={i}
            total={questionItems.length}
            onChange={updated => updateQuestion(i, updated)}
            onRemove={() => removeQuestion(i)}
          />
        ))}

        {/* Tombol tambah soal */}
        <button type="button" onClick={addQuestion}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold cursor-pointer hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/30 transition-all">
          <Plus size={15} /> Tambah Soal {questionItems.length + 1}
        </button>

        {/* Status */}
        {msg && (
          <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {msg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />} {msg.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors">
            Batal
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className={`flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2 text-white ${testType === 'pretest' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : `Simpan ${questionItems.length} Soal`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Helper buildRmeKeys
// ─────────────────────────────────────────────
function buildRmeKeys(q: QuestionItem): RmeKeys {
  return {
    ref_diketahui:  serializeBlocks(q.stageBlocks.diketahui),
    ref_ditanya:    serializeBlocks(q.stageBlocks.ditanya),
    ref_pengerjaan: serializeBlocks(q.stageBlocks.pengerjaan),
    ref_kesimpulan: serializeBlocks(q.stageBlocks.kesimpulan),
    points_diketahui:  q.points.diketahui,
    points_ditanya:    q.points.ditanya,
    points_pengerjaan: q.points.pengerjaan,
    points_kesimpulan: q.points.kesimpulan,
    hints: [],
    finalNumericAnswer: q.finalNumericAnswer.trim()
      ? (Number.isNaN(Number(q.finalNumericAnswer.replace(',', '.')))
          ? q.finalNumericAnswer.trim()
          : Number(q.finalNumericAnswer.replace(',', '.')))
      : null,
  };
}
