import React, { useState } from 'react';
import { MathRenderer } from '../MathRenderer';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import type { Strand } from '../../hooks/useQuestions';
import {
  type Difficulty,
  type RmeHint,
  type RmeKeys,
  STAGES,
  STAGE_COLORS,
  uid,
  makeBlankRmeKeys,
  embedRmeKeys,
  parseRmeKeys,
  stripRmeMetaBlocks,
} from './LatihanTypes';
import { Plus, Trash2, Eye, Edit3, X, Type, Sigma, ImageIcon } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type BlockType = 'text' | 'latex' | 'image';
interface ContentBlock { id: string; type: BlockType; value: string; }

interface ExistingQuestion {
  id: string;
  title: string;
  content_blocks: ContentBlock[];
  rme_keys?: RmeKeys;
  options?: { id: string; text: string }[];
}

interface LatihanQuestionFormProps {
  strand: Strand;
  category: Difficulty;
  editing?: ExistingQuestion | null;
  onCancel: () => void;
  onSaved: () => void;
}

// ─────────────────────────────────────────────
// BlockInput — satu baris isian dengan label tipe
// ─────────────────────────────────────────────
const BLOCK_META: Record<BlockType, { label: string; icon: React.ReactNode; border: string; bg: string; placeholder: string }> = {
  text:  { label: 'Teks',  icon: <Type size={12} />,     border: 'border-slate-300',  bg: 'bg-white',          placeholder: 'Tuliskan narasi / keterangan...' },
  latex: { label: 'LaTeX', icon: <Sigma size={12} />,    border: 'border-violet-300', bg: 'bg-violet-50',      placeholder: 'Contoh: \\frac{1}{2} x^2 + 3x' },
  image: { label: 'Gambar',icon: <ImageIcon size={12} />,border: 'border-sky-300',    bg: 'bg-sky-50',         placeholder: 'URL gambar (https://...)' },
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
        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
          block.type === 'latex' ? 'text-violet-600' : block.type === 'image' ? 'text-sky-600' : 'text-slate-500'
        }`}>
          {meta.icon} {meta.label}
        </span>
        <div className="flex items-center gap-1">
          {(block.type === 'latex' || block.type === 'text') && (
            <button
              type="button"
              onClick={() => setShowPreview(v => !v)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                showPreview ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Eye size={11} /> Preview
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(block.id)}
            className="w-6 h-6 rounded-md text-rose-400 hover:bg-rose-100 flex items-center justify-center cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {block.type === 'image' ? (
        <div className="space-y-1.5">
          <input
            value={block.value}
            onChange={e => onChange(block.id, e.target.value)}
            placeholder={meta.placeholder}
            className="w-full p-2 rounded-lg border border-sky-200 bg-white text-sm outline-none focus:border-sky-400 font-mono text-xs"
          />
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
        <textarea
          rows={block.type === 'latex' ? 2 : 3}
          value={block.value}
          onChange={e => onChange(block.id, e.target.value)}
          placeholder={meta.placeholder}
          className={`w-full p-2 rounded-lg border text-sm outline-none resize-y ${
            block.type === 'latex'
              ? 'border-violet-200 bg-white focus:border-violet-400 font-mono'
              : 'border-slate-200 focus:border-indigo-400'
          }`}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// BlockAdder — tombol pilih jenis blok baru
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
// StageEditor — editor tahap RME berbasis blok
// ─────────────────────────────────────────────
const StageEditor: React.FC<{
  label: string;
  icon: string;
  color: { border: string; bg: string; label: string; badge: string; ring: string };
  blocks: ContentBlock[];
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (id: string, val: string) => void;
  onRemoveBlock: (id: string) => void;
  extra?: React.ReactNode;
}> = ({ label, icon, color, blocks, onAddBlock, onUpdateBlock, onRemoveBlock, extra }) => {
  return (
    <div className={`rounded-xl border-2 ${color.border} ${color.bg} p-4 space-y-3`}>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${color.badge} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white text-[14px]">{icon}</span>
        </div>
        <span className={`font-black text-sm ${color.label} uppercase tracking-wide`}>{label}</span>
      </div>

      {extra}

      <label className="text-[10px] font-bold text-slate-500 uppercase block">Kunci acuan tahap ini</label>

      <div className="space-y-2">
        {blocks.map(block => (
          <BlockInput
            key={block.id}
            block={block}
            onChange={onUpdateBlock}
            onRemove={onRemoveBlock}
          />
        ))}
        <BlockAdder onAdd={onAddBlock} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Form
// ─────────────────────────────────────────────

// Setiap stage punya array blok sendiri
type StageKey = 'diketahui' | 'ditanya' | 'pengerjaan' | 'kesimpulan';

interface StageBlocks {
  diketahui: ContentBlock[];
  ditanya: ContentBlock[];
  pengerjaan: ContentBlock[];
  kesimpulan: ContentBlock[];
}

const makeStageBlocks = (): StageBlocks => ({
  diketahui: [{ id: uid('sd'), type: 'text', value: '' }],
  ditanya:   [{ id: uid('st'), type: 'text', value: '' }],
  pengerjaan:[{ id: uid('sp'), type: 'text', value: '' }],
  kesimpulan:[{ id: uid('sk'), type: 'text', value: '' }],
});

/** Serialisasi stage blocks menjadi satu string (untuk disimpan ke ref_* di rme_keys) */
const serializeBlocks = (blocks: ContentBlock[]): string => {
  // Simpan sebagai JSON agar preview bisa membaca tipe masing-masing
  return JSON.stringify(blocks.map(b => ({ type: b.type, value: b.value })));
};

/** Parse string ref menjadi array blok; fallback ke satu blok teks jika bukan JSON */
const parseStageBlocks = (ref: string, prefix: string): ContentBlock[] => {
  if (!ref) return [{ id: uid(prefix), type: 'text', value: '' }];
  try {
    const parsed = JSON.parse(ref);
    if (Array.isArray(parsed)) {
      return parsed.map((b: any) => ({ id: uid(prefix), type: b.type || 'text', value: b.value || '' }));
    }
  } catch { /* not JSON — treat as plain text */ }
  return [{ id: uid(prefix), type: 'text', value: ref }];
};

export const LatihanQuestionForm: React.FC<LatihanQuestionFormProps> = ({
  strand, category, editing, onCancel, onSaved,
}) => {
  const { user } = useAuth();
  const existingKeys = editing ? parseRmeKeys(editing) : makeBlankRmeKeys();

  const [title, setTitle] = useState(editing?.title || '');

  // Blok narasi soal utama
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    stripRmeMetaBlocks(editing?.content_blocks).length
      ? (stripRmeMetaBlocks(editing?.content_blocks) as ContentBlock[])
      : [{ id: uid('blk'), type: 'text', value: '' }]
  );

  // Blok per stage (parse dari ref_* yang sudah tersimpan)
  const [stageBlocks, setStageBlocks] = useState<StageBlocks>(() => ({
    diketahui:  parseStageBlocks(existingKeys.ref_diketahui,  'sd'),
    ditanya:    parseStageBlocks(existingKeys.ref_ditanya,    'st'),
    pengerjaan: parseStageBlocks(existingKeys.ref_pengerjaan, 'sp'),
    kesimpulan: parseStageBlocks(existingKeys.ref_kesimpulan, 'sk'),
  }));

  // Sisa keys (poin + hints + finalNumericAnswer)
  const [keys, setKeys] = useState<Omit<RmeKeys, 'ref_diketahui' | 'ref_ditanya' | 'ref_pengerjaan' | 'ref_kesimpulan'>>({
    points_diketahui:  existingKeys.points_diketahui,
    points_ditanya:    existingKeys.points_ditanya,
    points_pengerjaan: existingKeys.points_pengerjaan,
    points_kesimpulan: existingKeys.points_kesimpulan,
    hints:             existingKeys.hints || [],
    finalNumericAnswer: existingKeys.finalNumericAnswer ?? null,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── helpers narasi utama ──
  const addBlock    = (type: BlockType) => setBlocks(prev => [...prev, { id: uid('blk'), type, value: '' }]);
  const updateBlock = (id: string, value: string) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b));
  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));

  // ── helpers stage blok ──
  const addStageBlock = (sk: StageKey, type: BlockType) =>
    setStageBlocks(prev => ({ ...prev, [sk]: [...prev[sk], { id: uid(`s${sk[0]}`), type, value: '' }] }));
  const updateStageBlock = (sk: StageKey, id: string, value: string) =>
    setStageBlocks(prev => ({ ...prev, [sk]: prev[sk].map(b => b.id === id ? { ...b, value } : b) }));
  const removeStageBlock = (sk: StageKey, id: string) =>
    setStageBlocks(prev => ({ ...prev, [sk]: prev[sk].filter(b => b.id !== id) }));

  // ── helpers kisi-kisi (hanya question, tanpa answer) ──
  const addHint    = () => setKeys(k => ({ ...k, hints: [...(k.hints || []), { id: uid('hnt'), question: '' }] }));
  const updateHint = (id: string, value: string) =>
    setKeys(k => ({ ...k, hints: (k.hints || []).map(h => h.id === id ? { ...h, question: value } : h) }));
  const removeHint = (id: string) =>
    setKeys(k => ({ ...k, hints: (k.hints || []).filter(h => h.id !== id) }));

  // ── save ──
  const handleSave = async () => {
    setMsg(null);
    if (!title.trim()) { setMsg({ type: 'error', text: 'Judul soal wajib diisi.' }); return; }
    if (!stripRmeMetaBlocks(blocks).some(b => b.value.trim())) {
      setMsg({ type: 'error', text: 'Narasi soal wajib diisi.' }); return;
    }
    if (keys.finalNumericAnswer === null || String(keys.finalNumericAnswer).trim() === '') {
      setMsg({ type: 'error', text: 'Kunci jawaban akhir (angka) wajib diisi.' }); return;
    }
    const emptyHint = (keys.hints || []).find(h => !h.question.trim());
    if (emptyHint) {
      setMsg({ type: 'error', text: 'Setiap kisi-kisi harus memiliki tulisan pemandu.' }); return;
    }

    const numeric = String(keys.finalNumericAnswer).replace(',', '.').trim();
    const rme_keys: RmeKeys = {
      ref_diketahui:  serializeBlocks(stageBlocks.diketahui),
      ref_ditanya:    serializeBlocks(stageBlocks.ditanya),
      ref_pengerjaan: serializeBlocks(stageBlocks.pengerjaan),
      ref_kesimpulan: serializeBlocks(stageBlocks.kesimpulan),
      points_diketahui:  keys.points_diketahui,
      points_ditanya:    keys.points_ditanya,
      points_pengerjaan: keys.points_pengerjaan,
      points_kesimpulan: keys.points_kesimpulan,
      hints: keys.hints || [],
      finalNumericAnswer: Number.isNaN(Number(numeric)) ? numeric : Number(numeric),
    };
    const content_blocks = embedRmeKeys(blocks, rme_keys);

    setSaving(true);
    const payload = {
      title: title.trim(),
      test_type: 'latihan',
      strand,
      category,
      content_blocks,
      options: [],
      has_simulation: (rme_keys.hints || []).length > 0,
      created_by: user?.email || user?.id || 'admin',
      rme_keys,
    };

    try {
      const saveWithoutRmeColumn = async () => {
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
          if (/rme_keys/i.test(error.message || '')) await saveWithoutRmeColumn();
          else throw error;
        }
      } else {
        const { error } = await supabase.from('questions').insert([{ ...payload, id: crypto.randomUUID() }]);
        if (error) {
          if (/rme_keys/i.test(error.message || '')) await saveWithoutRmeColumn();
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

  return (
    <div className="mt-4 rounded-2xl border border-indigo-200 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-indigo-600 text-white flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{strand} · {category}</div>
          <h4 className="font-extrabold text-sm">{editing ? 'Edit Soal RME' : 'Tambah Soal RME'}</h4>
        </div>
        <button onClick={onCancel} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Judul */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Judul Soal</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Diskon dua tahap di toko kelontong"
            className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        {/* Narasi Soal — multi-blok */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Narasi Soal</label>
          <div className="space-y-2">
            {blocks.map(block => (
              <BlockInput key={block.id} block={block} onChange={updateBlock} onRemove={removeBlock} />
            ))}
            <BlockAdder onAdd={addBlock} />
          </div>
        </div>

        {/* 4 Tahap RME — masing-masing pakai blok */}
        {STAGES.map(stage => {
          const color = STAGE_COLORS[stage.color];
          const sk = stage.key as StageKey;
          const isPengerjaan = sk === 'pengerjaan';

          return (
            <StageEditor
              key={sk}
              label={`Tahap ${stage.label}`}
              icon={stage.icon}
              color={color}
              blocks={stageBlocks[sk]}
              onAddBlock={type => addStageBlock(sk, type)}
              onUpdateBlock={(id, val) => updateStageBlock(sk, id, val)}
              onRemoveBlock={id => removeStageBlock(sk, id)}
              extra={isPengerjaan ? (
                <div className="space-y-4">
                  {/* Kunci jawaban akhir */}
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Kunci jawaban akhir (angka)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={keys.finalNumericAnswer ?? ''}
                      onChange={e => setKeys(k => ({ ...k, finalNumericAnswer: e.target.value }))}
                      placeholder="Contoh: 42 atau 12.5"
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-amber-400 font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Dicocokkan persis dengan isian angka siswa.</p>
                  </div>

                  {/* Kisi-kisi — hanya tulisan pemandu, tanpa jawaban */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Kisi-kisi pengerjaan</label>
                      <button
                        type="button"
                        onClick={addHint}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md cursor-pointer hover:bg-indigo-100"
                      >
                        <Plus size={14} /> Tambah kisi-kisi
                      </button>
                    </div>
                    {(keys.hints || []).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        Belum ada kisi-kisi. Tambahkan urutan pemandu untuk siswa.
                      </p>
                    )}
                    <div className="space-y-2">
                      {(keys.hints || []).map((h, i) => (
                        <div key={h.id} className="relative bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <button
                            type="button"
                            onClick={() => removeHint(h.id)}
                            className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                          <span className="text-xs font-bold text-amber-600 mb-2 block">Kisi-kisi #{i + 1}</span>
                          <textarea
                            rows={2}
                            value={h.question}
                            onChange={e => updateHint(h.id, e.target.value)}
                            placeholder="Tulisan pemandu yang akan ditampilkan ke siswa"
                            className="w-full p-2 rounded-md border border-amber-200 bg-white text-xs outline-none resize-y focus:border-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : undefined}
            />
          );
        })}

        {/* Status pesan */}
        {msg && (
          <div className={`p-3 rounded-xl text-sm font-bold ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer disabled:bg-slate-400 hover:bg-indigo-700 transition-colors"
          >
            {saving ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan soal'}
          </button>
        </div>
      </div>
    </div>
  );
};
