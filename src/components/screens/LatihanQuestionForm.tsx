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
import { Plus, Trash2, Eye, Edit3, X } from 'lucide-react';

interface ContentBlock { id: string; type: 'text' | 'latex' | 'image'; value: string; }

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

export const LatihanQuestionForm: React.FC<LatihanQuestionFormProps> = ({
  strand, category, editing, onCancel, onSaved,
}) => {
  const { user } = useAuth();
  const existingKeys = editing ? parseRmeKeys(editing) : makeBlankRmeKeys();
  const [title, setTitle] = useState(editing?.title || '');
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    stripRmeMetaBlocks(editing?.content_blocks).length
      ? stripRmeMetaBlocks(editing?.content_blocks) as ContentBlock[]
      : [{ id: uid('blk'), type: 'text', value: '' }]
  );
  const [keys, setKeys] = useState<RmeKeys>(existingKeys);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addBlock = (type: ContentBlock['type']) =>
    setBlocks(prev => [...prev, { id: uid('blk'), type, value: '' }]);
  const updateBlock = (id: string, value: string) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b));
  const removeBlock = (id: string) =>
    setBlocks(prev => prev.filter(b => b.id !== id));

  const addHint = () =>
    setKeys(k => ({ ...k, hints: [...(k.hints || []), { id: uid('hnt'), question: '', answer: '' }] }));
  const updateHint = (id: string, field: keyof RmeHint, value: string) =>
    setKeys(k => ({ ...k, hints: (k.hints || []).map(h => h.id === id ? { ...h, [field]: value } : h) }));
  const removeHint = (id: string) =>
    setKeys(k => ({ ...k, hints: (k.hints || []).filter(h => h.id !== id) }));

  const handleSave = async () => {
    setMsg(null);
    if (!title.trim()) { setMsg({ type: 'error', text: 'Judul soal wajib diisi.' }); return; }
    if (!stripRmeMetaBlocks(blocks).some(b => b.value.trim())) {
      setMsg({ type: 'error', text: 'Narasi soal wajib diisi.' }); return;
    }
    if (keys.finalNumericAnswer === null || String(keys.finalNumericAnswer).trim() === '') {
      setMsg({ type: 'error', text: 'Kunci jawaban akhir (angka) wajib diisi.' }); return;
    }
    const emptyHint = (keys.hints || []).find(h => !h.question.trim() || !h.answer.trim());
    if (emptyHint) {
      setMsg({ type: 'error', text: 'Setiap kisi-kisi harus punya tulisan pemandu dan jawabannya.' }); return;
    }

    const numeric = String(keys.finalNumericAnswer).replace(',', '.').trim();
    const rme_keys: RmeKeys = {
      ...keys,
      finalNumericAnswer: Number.isNaN(Number(numeric)) ? numeric : Number(numeric),
      hints: keys.hints || [],
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
          const { error: err2 } = await supabase.from('questions').update(rest).eq('id', editing.id);
          if (err2) throw err2;
        } else {
          const { error: err2 } = await supabase.from('questions').insert([{ ...rest, id: crypto.randomUUID() }]);
          if (err2) throw err2;
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
      <div className="px-4 py-3 bg-indigo-600 text-white flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
            {strand} · {category}
          </div>
          <h4 className="font-extrabold text-sm">{editing ? 'Edit Soal RME' : 'Tambah Soal RME'}</h4>
        </div>
        <button onClick={onCancel} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Judul Soal</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Diskon dua tahap di toko kelontong"
            className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Narasi Soal</label>
          <div className="space-y-2">
            {blocks.map(block => (
              <div key={block.id} className="flex gap-2">
                {block.type === 'image' ? (
                  <input
                    value={block.value}
                    onChange={e => updateBlock(block.id, e.target.value)}
                    placeholder="URL gambar"
                    className="flex-1 p-3 rounded-xl border border-violet-200 bg-violet-50 text-sm outline-none"
                  />
                ) : (
                  <textarea
                    rows={3}
                    value={block.value}
                    onChange={e => updateBlock(block.id, e.target.value)}
                    placeholder="Tuliskan konteks soal. Rumus: $x^2$ atau $$\frac{1}{2}$$"
                    className="flex-1 p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 resize-y"
                  />
                )}
                <button onClick={() => removeBlock(block.id)} className="w-8 h-8 mt-1 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => addBlock('text')} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer">+ Paragraf</button>
              <button onClick={() => addBlock('image')} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer">+ Gambar</button>
            </div>
          </div>
        </div>

        {STAGES.map(stage => {
          const color = STAGE_COLORS[stage.color];
          const refKey = `ref_${stage.key}` as keyof RmeKeys;
          const isPengerjaan = stage.key === 'pengerjaan';
          return (
            <StageEditor
              key={stage.key}
              label={`Tahap ${stage.label}`}
              icon={stage.icon}
              color={color}
              value={String(keys[refKey] || '')}
              onChange={val => setKeys(k => ({ ...k, [refKey]: val }))}
              extra={isPengerjaan ? (
                <div className="space-y-4">
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
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Kisi-kisi pengerjaan</label>
                      <button onClick={addHint} className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md cursor-pointer">
                        <Plus size={14} /> Tambah kisi-kisi
                      </button>
                    </div>
                    {(keys.hints || []).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-lg">Belum ada kisi-kisi. Tambahkan urutan pemandu untuk siswa.</p>
                    )}
                    <div className="space-y-3">
                      {(keys.hints || []).map((h, i) => (
                        <div key={h.id} className="relative bg-white p-3 rounded-lg border border-slate-200">
                          <button onClick={() => removeHint(h.id)} className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 cursor-pointer"><Trash2 size={14} /></button>
                          <span className="text-xs font-bold text-indigo-500 mb-2 block">Kisi-kisi #{i + 1}</span>
                          <textarea
                            rows={2}
                            value={h.question}
                            onChange={e => updateHint(h.id, 'question', e.target.value)}
                            placeholder="Tulisan pemandu (muncul dulu ke siswa)"
                            className="w-full p-2 mb-2 rounded-md border border-slate-200 text-xs outline-none resize-y"
                          />
                          <textarea
                            rows={2}
                            value={h.answer}
                            onChange={e => updateHint(h.id, 'answer', e.target.value)}
                            placeholder="Jawaban kisi-kisi ini (muncul setelah siswa menekan Cek)"
                            className="w-full p-2 rounded-md border border-slate-200 text-xs outline-none resize-y bg-slate-50"
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

        {msg && (
          <div className={`p-3 rounded-xl text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {msg.text}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer">Batal</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer disabled:bg-slate-400">
            {saving ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan soal'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StageEditor: React.FC<{
  label: string;
  icon: string;
  color: { border: string; bg: string; label: string; badge: string };
  value: string;
  onChange: (v: string) => void;
  extra?: React.ReactNode;
}> = ({ label, icon, color, value, onChange, extra }) => {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  return (
    <div className={`rounded-xl border-2 ${color.border} ${color.bg} p-4 space-y-3`}>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${color.badge} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white text-[14px]">{icon}</span>
        </div>
        <span className={`font-black text-sm ${color.label} uppercase tracking-wide`}>{label}</span>
      </div>
      {extra}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Kunci acuan tahap ini</label>
        <div className="flex bg-white p-0.5 rounded-lg border border-slate-200">
          <button onClick={() => setTab('edit')} className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-md ${tab === 'edit' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}>
            <Edit3 size={11} /> Edit
          </button>
          <button onClick={() => setTab('preview')} className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-md ${tab === 'preview' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}>
            <Eye size={11} /> Preview
          </button>
        </div>
      </div>
      {tab === 'edit' ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Kunci jawaban tahap ini (boleh LaTeX)"
          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm outline-none resize-y"
        />
      ) : (
        <div className="w-full p-3 rounded-xl border border-slate-200 bg-white min-h-[72px]">
          {value.trim() ? <MathRenderer text={value} className="text-sm" /> : <span className="text-slate-400 text-xs italic">Kosong</span>}
        </div>
      )}
    </div>
  );
};
