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
import { Trash2, Eye, X, Type, Sigma, ImageIcon, Check, AlertCircle, Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type BlockType = 'text' | 'latex' | 'image';
interface ContentBlock { id: string; type: BlockType; value: string; }
type StageKey = 'diketahui' | 'ditanya' | 'pengerjaan' | 'kesimpulan';

interface StageBlocks {
  diketahui: ContentBlock[];
  ditanya: ContentBlock[];
  pengerjaan: ContentBlock[];
  kesimpulan: ContentBlock[];
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
  editing?: ExistingQuestion | null;
  onCancel: () => void;
  onSaved: () => void;
}

// ─────────────────────────────────────────────
// Block meta
// ─────────────────────────────────────────────
const BLOCK_META: Record<BlockType, { label: string; icon: React.ReactNode; border: string; bg: string; placeholder: string }> = {
  text:  { label: 'Teks',  icon: <Type size={12} />,      border: 'border-slate-300',  bg: 'bg-white',     placeholder: 'Tuliskan narasi / keterangan...' },
  latex: { label: 'LaTeX', icon: <Sigma size={12} />,     border: 'border-violet-300', bg: 'bg-violet-50', placeholder: 'Contoh: \\frac{1}{2} x^2 + 3x' },
  image: { label: 'Gambar',icon: <ImageIcon size={12} />, border: 'border-sky-300',    bg: 'bg-sky-50',    placeholder: 'URL gambar (https://...)' },
};

// ─────────────────────────────────────────────
// BlockInput
// ─────────────────────────────────────────────
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
        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
          block.type === 'latex' ? 'text-violet-600' : block.type === 'image' ? 'text-sky-600' : 'text-slate-500'
        }`}>
          {meta.icon} {meta.label}
        </span>
        <div className="flex items-center gap-1">
          {(block.type === 'latex' || block.type === 'text') && (
            <button type="button" onClick={() => setShowPreview(v => !v)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                showPreview ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'
              }`}>
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
          <input value={block.value} onChange={e => onChange(block.id, e.target.value)}
            placeholder={meta.placeholder}
            className="w-full p-2 rounded-lg border border-sky-200 bg-white text-sm outline-none focus:border-sky-400 font-mono text-xs" />
          {block.value.trim() && (
            <img src={block.value} alt="preview" className="max-h-40 rounded-lg border border-sky-200 object-contain" />
          )}
        </div>
      ) : showPreview ? (
        <div className="p-2 rounded-lg border border-slate-200 bg-white min-h-[56px]">
          {block.value.trim()
            ? <MathRenderer text={block.value} className="text-sm" />
            : <span className="text-slate-400 text-xs italic">Kosong</span>}
        </div>
      ) : (
        <textarea rows={block.type === 'latex' ? 2 : 3} value={block.value}
          onChange={e => onChange(block.id, e.target.value)}
          placeholder={meta.placeholder}
          className={`w-full p-2 rounded-lg border text-sm outline-none resize-y ${
            block.type === 'latex'
              ? 'border-violet-200 bg-white focus:border-violet-400 font-mono'
              : 'border-slate-200 focus:border-indigo-400'
          }`} />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// BlockAdder
// ─────────────────────────────────────────────
const BlockAdder: React.FC<{ onAdd: (type: BlockType) => void }> = ({ onAdd }) => (
  <div className="flex gap-2 flex-wrap">
    <button type="button" onClick={() => onAdd('text')}
      className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer transition-colors">
      <Type size={12} /> + Teks
    </button>
    <button type="button" onClick={() => onAdd('latex')}
      className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 cursor-pointer transition-colors">
      <Sigma size={12} /> + LaTeX
    </button>
    <button type="button" onClick={() => onAdd('image')}
      className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 cursor-pointer transition-colors">
      <ImageIcon size={12} /> + Gambar
    </button>
  </div>
);

// ─────────────────────────────────────────────
// StageEditor — editor tahap (tanpa kisi-kisi, ada input poin)
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
}> = ({ label, icon, color, blocks, points, onAddBlock, onUpdateBlock, onRemoveBlock, onChangePoints }) => (
  <div className={`rounded-xl border-2 ${color.border} ${color.bg} p-4 space-y-3`}>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${color.badge} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white text-[14px]">{icon}</span>
        </div>
        <span className={`font-black text-sm ${color.label} uppercase tracking-wide`}>{label}</span>
      </div>
      {/* Poin per tahap */}
      <div className="flex items-center gap-1.5">
        <label className={`text-[10px] font-black uppercase tracking-widest ${color.label}`}>Poin</label>
        <input
          type="number"
          min={0}
          max={100}
          value={points}
          onChange={e => onChangePoints(Math.max(0, Number(e.target.value)))}
          className={`w-16 px-2 py-1 rounded-lg border text-center text-sm font-bold outline-none ${color.border} bg-white`}
        />
      </div>
    </div>

    <label className="text-[10px] font-bold text-slate-500 uppercase block">Kunci acuan tahap ini</label>
    <div className="space-y-2">
      {blocks.map(block => (
        <BlockInput key={block.id} block={block} onChange={onUpdateBlock} onRemove={onRemoveBlock} />
      ))}
      <BlockAdder onAdd={onAddBlock} />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Helpers serialisasi blok
// ─────────────────────────────────────────────
const serializeBlocks = (blocks: ContentBlock[]): string =>
  JSON.stringify(blocks.map(b => ({ type: b.type, value: b.value })));

const parseStageBlocks = (ref: string, prefix: string): ContentBlock[] => {
  if (!ref) return [{ id: uid(prefix), type: 'text', value: '' }];
  try {
    const parsed = JSON.parse(ref);
    if (Array.isArray(parsed))
      return parsed.map((b: any) => ({ id: uid(prefix), type: b.type || 'text', value: b.value || '' }));
  } catch { /* plain text */ }
  return [{ id: uid(prefix), type: 'text', value: ref }];
};

// ─────────────────────────────────────────────
// Main Form
// ─────────────────────────────────────────────
export const UjianQuestionForm: React.FC<UjianQuestionFormProps> = ({
  strand, testType, editing, onCancel, onSaved,
}) => {
  const { user } = useAuth();
  const existingKeys = editing ? parseRmeKeys(editing) : makeBlankRmeKeys();

  const [title, setTitle] = useState(editing?.title || '');

  // Blok narasi soal
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    stripRmeMetaBlocks(editing?.content_blocks).length
      ? (stripRmeMetaBlocks(editing?.content_blocks) as ContentBlock[])
      : [{ id: uid('blk'), type: 'text', value: '' }]
  );

  // Blok per stage
  const [stageBlocks, setStageBlocks] = useState<StageBlocks>(() => ({
    diketahui:  parseStageBlocks(existingKeys.ref_diketahui,  'sd'),
    ditanya:    parseStageBlocks(existingKeys.ref_ditanya,    'st'),
    pengerjaan: parseStageBlocks(existingKeys.ref_pengerjaan, 'sp'),
    kesimpulan: parseStageBlocks(existingKeys.ref_kesimpulan, 'sk'),
  }));

  // Poin per stage (tanpa kisi-kisi, tanpa jawaban akhir angka)
  const [points, setPoints] = useState({
    diketahui:  existingKeys.points_diketahui,
    ditanya:    existingKeys.points_ditanya,
    pengerjaan: existingKeys.points_pengerjaan,
    kesimpulan: existingKeys.points_kesimpulan,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Narasi helpers
  const addBlock    = (type: BlockType) => setBlocks(prev => [...prev, { id: uid('blk'), type, value: '' }]);
  const updateBlock = (id: string, value: string) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b));
  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));

  // Stage helpers
  const addStageBlock    = (sk: StageKey, type: BlockType) =>
    setStageBlocks(prev => ({ ...prev, [sk]: [...prev[sk], { id: uid(`s${sk[0]}`), type, value: '' }] }));
  const updateStageBlock = (sk: StageKey, id: string, value: string) =>
    setStageBlocks(prev => ({ ...prev, [sk]: prev[sk].map(b => b.id === id ? { ...b, value } : b) }));
  const removeStageBlock = (sk: StageKey, id: string) =>
    setStageBlocks(prev => ({ ...prev, [sk]: prev[sk].filter(b => b.id !== id) }));

  const totalPoints = Object.values(points).reduce((a, b) => a + b, 0);

  const handleSave = async () => {
    setMsg(null);
    if (!title.trim()) { setMsg({ type: 'error', text: 'Judul soal wajib diisi.' }); return; }
    if (!stripRmeMetaBlocks(blocks).some(b => b.value.trim())) {
      setMsg({ type: 'error', text: 'Narasi soal wajib diisi.' }); return;
    }

    const rme_keys: RmeKeys = {
      ref_diketahui:  serializeBlocks(stageBlocks.diketahui),
      ref_ditanya:    serializeBlocks(stageBlocks.ditanya),
      ref_pengerjaan: serializeBlocks(stageBlocks.pengerjaan),
      ref_kesimpulan: serializeBlocks(stageBlocks.kesimpulan),
      points_diketahui:  points.diketahui,
      points_ditanya:    points.ditanya,
      points_pengerjaan: points.pengerjaan,
      points_kesimpulan: points.kesimpulan,
      hints: [],
      finalNumericAnswer: null,
    };
    const content_blocks = embedRmeKeys(blocks, rme_keys);

    setSaving(true);
    const payload = {
      title: title.trim(),
      test_type: testType,
      strand,
      category: 'sedang',
      content_blocks,
      options: [],
      has_simulation: false,
      created_by: user?.email || user?.id || 'admin',
      rme_keys,
    };

    try {
      const saveWithoutRme = async () => {
        const { rme_keys: _omit, ...rest } = payload;
        if (editing?.id) {
          const { error } = await supabase.from('questions').update(rest).eq('id', editing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('questions').insert([{ ...rest, id: crypto.randomUUID() }]);
          if (error) throw error;
        }
      };

      if (editing?.id) {
        const { error } = await supabase.from('questions').update(payload).eq('id', editing.id);
        if (error) {
          if (/rme_keys/i.test(error.message || '')) await saveWithoutRme();
          else throw error;
        }
      } else {
        const { error } = await supabase.from('questions').insert([{ ...payload, id: crypto.randomUUID() }]);
        if (error) {
          if (/rme_keys/i.test(error.message || '')) await saveWithoutRme();
          else throw error;
        }
      }
      setMsg({ type: 'success', text: editing ? 'Soal berhasil diperbarui.' : 'Soal berhasil ditambahkan.' });
      setTimeout(() => onSaved(), 700);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal menyimpan soal.' });
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
          <h4 className="font-extrabold text-sm">{editing ? 'Edit Soal' : 'Tambah Soal'} RME</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
            Total: {totalPoints} poin
          </span>
          <button onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Judul */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Judul Soal</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Analisis pertumbuhan penduduk kota X"
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-400" />
        </div>

        {/* Narasi Soal */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Narasi Soal</label>
          <div className="space-y-2">
            {blocks.map(block => (
              <BlockInput key={block.id} block={block} onChange={updateBlock} onRemove={removeBlock} />
            ))}
            <BlockAdder onAdd={addBlock} />
          </div>
        </div>

        {/* 4 Tahap RME — tanpa kisi-kisi, ada input poin */}
        {STAGES.map(stage => {
          const color = STAGE_COLORS[stage.color];
          const sk = stage.key as StageKey;
          return (
            <StageEditor
              key={sk}
              label={`Tahap ${stage.label}`}
              icon={stage.icon}
              color={color}
              blocks={stageBlocks[sk]}
              points={points[sk]}
              onAddBlock={type => addStageBlock(sk, type)}
              onUpdateBlock={(id, val) => updateStageBlock(sk, id, val)}
              onRemoveBlock={id => removeStageBlock(sk, id)}
              onChangePoints={val => setPoints(prev => ({ ...prev, [sk]: val }))}
            />
          );
        })}

        {/* Status */}
        {msg && (
          <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {msg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            {msg.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors">
            Batal
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className={`flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2 text-white ${
              testType === 'pretest' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : (editing ? 'Simpan perubahan' : 'Simpan soal')}
          </button>
        </div>
      </div>
    </div>
  );
};
