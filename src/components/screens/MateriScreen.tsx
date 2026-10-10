import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathCategory } from '../../types';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import { MathRenderer } from '../MathRenderer';
import {
  Plus, BookOpen, Clock, Play, Eye, Loader2, Edit3, Trash2, Save,
  X, ChevronRight, GripVertical, Type, Sigma, ImageIcon,
  Lightbulb, BookMarked, CheckSquare, Zap, Minus, Heading1,
  ArrowLeft, Check, AlertCircle, PenLine,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type MateriBlockType =
  | 'text' | 'latex' | 'image' | 'heading'
  | 'callout_definition' | 'callout_theorem'
  | 'callout_example' | 'callout_solution'
  | 'divider';

interface MateriBlock {
  id: string;
  type: MateriBlockType;
  value: string;          // konten utama
  callout_title?: string; // judul callout (opsional)
}

interface MateriRow {
  id: string;
  strand: string;
  subtopic_id: string;
  subtopic_title: string;
  blocks: MateriBlock[];
  order_index: number;
  updated_at: string;
}

interface ExamPackage {
  id: string;
  title: string;
  test_type: 'pretest' | 'postest' | 'latihan';
  strand: string;
  duration_minutes: number;
  total_max_points?: number;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number;
}

// ─────────────────────────────────────────────────────────────
// Konstanta
// ─────────────────────────────────────────────────────────────
const SYLLABUS: Record<string, { id: string; title: string }[]> = {
  bilangan:      [{ id: 'intro', title: 'Pengantar Teori Bilangan' }, { id: 'operasi', title: 'Sifat Operasi Hitung' }, { id: 'fpbkpk', title: 'FPB & KPK' }, { id: 'rasio', title: 'Rasio & Skala' }],
  aljabar:       [{ id: 'intro', title: 'Konsep Dasar Aljabar' }, { id: 'linear', title: 'Persamaan Linear' }, { id: 'pertidaksamaan', title: 'Pertidaksamaan Linear' }, { id: 'fungsi', title: 'Sistem Fungsi' }],
  geometri:      [{ id: 'intro', title: 'Elemen Geometri Dasar' }, { id: 'objek', title: 'Objek & Bangun 2D/3D' }, { id: 'transformasi', title: 'Transformasi Geometri' }, { id: 'pengukuran', title: 'Sistem Pengukuran' }],
  trigonometri:  [{ id: 'intro', title: 'Sudut & Lingkaran Satuan' }, { id: 'rasio', title: 'Rasio Trigonometri' }, { id: 'identitas', title: 'Identitas Trigonometri' }, { id: 'grafik', title: 'Grafik Gelombang' }],
  peluang:       [{ id: 'intro', title: 'Konsep Dasar Statistika' }, { id: 'data', title: 'Analisis Data' }, { id: 'kombinatorika', title: 'Kombinatorika' }, { id: 'peluang', title: 'Teori Peluang' }],
};

const STRAND_META: Record<string, { icon: string; color: string; gradient: string; accent: string }> = {
  bilangan:     { icon: 'tag',            color: 'text-blue-600',    gradient: 'from-blue-600 to-cyan-500',     accent: '#2563eb' },
  aljabar:      { icon: 'functions',      color: 'text-violet-600',  gradient: 'from-violet-600 to-purple-500', accent: '#7c3aed' },
  geometri:     { icon: 'category',       color: 'text-emerald-600', gradient: 'from-emerald-600 to-teal-500',  accent: '#059669' },
  trigonometri: { icon: 'change_history', color: 'text-amber-600',   gradient: 'from-amber-500 to-orange-500',  accent: '#d97706' },
  peluang:      { icon: 'bar_chart',      color: 'text-rose-600',    gradient: 'from-rose-600 to-pink-500',     accent: '#e11d48' },
};

let _bid = 0;
const mkid = () => `blk-${++_bid}-${Date.now()}`;

// ─────────────────────────────────────────────────────────────
// Block renderer (student view)
// ─────────────────────────────────────────────────────────────
const BlockRenderer: React.FC<{ block: MateriBlock }> = ({ block }) => {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mt-2 mb-1 tracking-tight">
          {block.value}
        </h3>
      );
    case 'text':
      return (
        <div className="text-sm leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          <MathRenderer text={block.value} />
        </div>
      );
    case 'latex':
      return (
        <div className="my-3 overflow-x-auto py-2">
          <MathRenderer text={`$$${block.value}$$`} className="text-base" />
        </div>
      );
    case 'image':
      return block.value ? (
        <figure className="my-4 flex flex-col items-center gap-2">
          <img src={block.value} alt={block.callout_title || ''} className="max-h-72 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm object-contain" />
          {block.callout_title && <figcaption className="text-xs text-slate-400 italic">{block.callout_title}</figcaption>}
        </figure>
      ) : null;
    case 'callout_definition':
      return (
        <div className="my-4 rounded-xl border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BookMarked size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Definisi</span>
            {block.callout_title && <span className="text-xs font-bold text-blue-600 dark:text-blue-400">— {block.callout_title}</span>}
          </div>
          <div className="text-sm leading-7 text-slate-700 dark:text-slate-300">
            <MathRenderer text={block.value} />
          </div>
        </div>
      );
    case 'callout_theorem':
      return (
        <div className="my-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Teorema</span>
            {block.callout_title && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">— {block.callout_title}</span>}
          </div>
          <div className="text-sm leading-7 text-slate-700 dark:text-slate-300">
            <MathRenderer text={block.value} />
          </div>
        </div>
      );
    case 'callout_example':
      return (
        <div className="my-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Contoh</span>
            {block.callout_title && <span className="text-xs font-bold text-amber-600 dark:text-amber-400">— {block.callout_title}</span>}
          </div>
          <div className="text-sm leading-7 text-slate-700 dark:text-slate-300">
            <MathRenderer text={block.value} />
          </div>
        </div>
      );
    case 'callout_solution':
      return (
        <div className="my-4 rounded-xl border-l-4 border-violet-500 bg-violet-50 dark:bg-violet-900/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={15} className="text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="text-xs font-black text-violet-700 dark:text-violet-400 uppercase tracking-widest">Penyelesaian</span>
            {block.callout_title && <span className="text-xs font-bold text-violet-600 dark:text-violet-400">— {block.callout_title}</span>}
          </div>
          <div className="text-sm leading-7 text-slate-700 dark:text-slate-300">
            <MathRenderer text={block.value} />
          </div>
        </div>
      );
    case 'divider':
      return <hr className="my-6 border-slate-200 dark:border-slate-700" />;
    default:
      return null;
  }
};

// ─────────────────────────────────────────────────────────────
// Block editor row (admin)
// ─────────────────────────────────────────────────────────────
const BLOCK_TYPE_META: Record<MateriBlockType, { label: string; icon: React.ReactNode; color: string; hasTitle: boolean; placeholder: string; titlePlaceholder?: string }> = {
  text:               { label: 'Paragraf',    icon: <Type size={13} />,        color: 'border-slate-300 bg-white',              hasTitle: false, placeholder: 'Tuliskan isi paragraf...' },
  latex:              { label: 'LaTeX',       icon: <Sigma size={13} />,       color: 'border-violet-300 bg-violet-50',          hasTitle: false, placeholder: '\\frac{a}{b} + c = d' },
  image:              { label: 'Gambar',      icon: <ImageIcon size={13} />,   color: 'border-sky-300 bg-sky-50',               hasTitle: true,  placeholder: 'URL gambar (https://...)', titlePlaceholder: 'Keterangan gambar (opsional)' },
  heading:            { label: 'Judul',       icon: <Heading1 size={13} />,    color: 'border-indigo-300 bg-indigo-50',          hasTitle: false, placeholder: 'Judul sub-bagian...' },
  callout_definition: { label: 'Definisi',    icon: <BookMarked size={13} />,  color: 'border-blue-300 bg-blue-50',             hasTitle: true,  placeholder: 'Isi definisi (boleh LaTeX inline: $x^2$)...', titlePlaceholder: 'Nama definisi' },
  callout_theorem:    { label: 'Teorema',     icon: <CheckSquare size={13} />, color: 'border-emerald-300 bg-emerald-50',       hasTitle: true,  placeholder: 'Isi teorema...', titlePlaceholder: 'Nama teorema' },
  callout_example:    { label: 'Contoh',      icon: <Lightbulb size={13} />,   color: 'border-amber-300 bg-amber-50',           hasTitle: true,  placeholder: 'Isi contoh soal...', titlePlaceholder: 'Judul contoh (opsional)' },
  callout_solution:   { label: 'Penyelesaian',icon: <Zap size={13} />,         color: 'border-violet-300 bg-violet-50',         hasTitle: true,  placeholder: 'Langkah-langkah penyelesaian...', titlePlaceholder: 'Judul (opsional)' },
  divider:            { label: 'Pemisah',     icon: <Minus size={13} />,       color: 'border-slate-200 bg-slate-50',           hasTitle: false, placeholder: '' },
};

const BlockEditorRow: React.FC<{
  block: MateriBlock;
  index: number;
  total: number;
  onChange: (id: string, field: keyof MateriBlock, val: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}> = ({ block, index, total, onChange, onRemove, onMove }) => {
  const meta = BLOCK_TYPE_META[block.type];
  const [preview, setPreview] = useState(false);

  if (block.type === 'divider') {
    return (
      <div className="flex items-center gap-2 group">
        <div className="flex-1 border-t-2 border-dashed border-slate-300 dark:border-slate-600" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pemisah</span>
        <div className="flex-1 border-t-2 border-dashed border-slate-300 dark:border-slate-600" />
        <button onClick={() => onRemove(block.id)} className="w-6 h-6 rounded text-rose-400 hover:bg-rose-50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${meta.color} p-3 space-y-2 group`}>
      {/* Header row */}
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-slate-300 cursor-grab shrink-0" />
        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
          block.type.startsWith('callout') ? 'text-slate-600' :
          block.type === 'latex' ? 'text-violet-600' :
          block.type === 'image' ? 'text-sky-600' :
          block.type === 'heading' ? 'text-indigo-600' : 'text-slate-500'
        }`}>
          {meta.icon} {meta.label}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {(block.type === 'text' || block.type === 'latex' || block.type.startsWith('callout')) && (
            <button type="button" onClick={() => setPreview(v => !v)}
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${preview ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <Eye size={10} /> {preview ? 'Edit' : 'Preview'}
            </button>
          )}
          <button type="button" onClick={() => onMove(block.id, 'up')} disabled={index === 0}
            className="w-6 h-6 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-30">
            <ChevronRight size={12} className="-rotate-90" />
          </button>
          <button type="button" onClick={() => onMove(block.id, 'down')} disabled={index === total - 1}
            className="w-6 h-6 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-30">
            <ChevronRight size={12} className="rotate-90" />
          </button>
          <button type="button" onClick={() => onRemove(block.id)}
            className="w-6 h-6 rounded text-rose-400 hover:bg-rose-100 flex items-center justify-center cursor-pointer">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Judul callout / keterangan gambar */}
      {meta.hasTitle && (
        <input
          value={block.callout_title || ''}
          onChange={e => onChange(block.id, 'callout_title', e.target.value)}
          placeholder={meta.titlePlaceholder}
          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold outline-none focus:border-indigo-400"
        />
      )}

      {/* Konten utama */}
      {block.type === 'image' ? (
        <div className="space-y-1.5">
          <input
            value={block.value}
            onChange={e => onChange(block.id, 'value', e.target.value)}
            placeholder={meta.placeholder}
            className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white text-xs font-mono outline-none focus:border-sky-400"
          />
          {block.value.trim() && (
            <img src={block.value} alt="" className="max-h-32 rounded-lg border border-sky-200 object-contain" />
          )}
        </div>
      ) : block.type === 'heading' ? (
        <input
          value={block.value}
          onChange={e => onChange(block.id, 'value', e.target.value)}
          placeholder={meta.placeholder}
          className="w-full px-2.5 py-2 rounded-lg border border-indigo-200 bg-white text-sm font-bold outline-none focus:border-indigo-400"
        />
      ) : preview ? (
        <div className="p-3 rounded-lg border border-slate-200 bg-white min-h-[60px]">
          {block.value.trim()
            ? <MathRenderer text={block.type === 'latex' ? `$$${block.value}$$` : block.value} className="text-sm" />
            : <span className="text-slate-400 text-xs italic">Kosong</span>}
        </div>
      ) : (
        <textarea
          rows={block.type === 'latex' ? 2 : 4}
          value={block.value}
          onChange={e => onChange(block.id, 'value', e.target.value)}
          placeholder={meta.placeholder}
          className={`w-full px-2.5 py-2 rounded-lg border text-sm outline-none resize-y ${
            block.type === 'latex'
              ? 'border-violet-200 bg-white focus:border-violet-400 font-mono text-xs'
              : 'border-slate-200 bg-white focus:border-indigo-400 leading-relaxed'
          }`}
        />
      )}
    </div>
  );
};

// Block type picker
const BlockTypePicker: React.FC<{ onAdd: (type: MateriBlockType) => void }> = ({ onAdd }) => {
  const groups: { label: string; types: MateriBlockType[] }[] = [
    { label: 'Konten',   types: ['text', 'latex', 'image', 'heading'] },
    { label: 'Callout',  types: ['callout_definition', 'callout_theorem', 'callout_example', 'callout_solution'] },
    { label: 'Layout',   types: ['divider'] },
  ];
  return (
    <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50 space-y-2">
      {groups.map(g => (
        <div key={g.label} className="space-y-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{g.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {g.types.map(type => {
              const m = BLOCK_TYPE_META[type];
              return (
                <button key={type} type="button" onClick={() => onAdd(type)}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border ${m.color} cursor-pointer hover:opacity-80 transition-opacity`}>
                  {m.icon} {m.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Admin Materi Editor (in-page, per subtopik)
// ─────────────────────────────────────────────────────────────
const MateriEditor: React.FC<{
  strand: string;
  subtopicId: string;
  subtopicTitle: string;
  existingMateri: MateriRow | null;
  onSaved: (row: MateriRow) => void;
  onClose: () => void;
}> = ({ strand, subtopicId, subtopicTitle, existingMateri, onSaved, onClose }) => {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<MateriBlock[]>(existingMateri?.blocks || []);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addBlock = (type: MateriBlockType) =>
    setBlocks(prev => [...prev, { id: mkid(), type, value: '', callout_title: '' }]);
  const updateBlock = (id: string, field: keyof MateriBlock, val: string) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: val } : b));
  const removeBlock = (id: string) =>
    setBlocks(prev => prev.filter(b => b.id !== id));
  const moveBlock = (id: string, dir: 'up' | 'down') =>
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const payload = {
        strand,
        subtopic_id: subtopicId,
        subtopic_title: subtopicTitle,
        blocks,
        created_by: user?.email || user?.id || 'admin',
        updated_at: new Date().toISOString(),
      };
      let result;
      if (existingMateri?.id) {
        result = await supabase.from('materi').update(payload).eq('id', existingMateri.id).select().single();
      } else {
        result = await supabase.from('materi').insert([{ ...payload, order_index: 0 }]).select().single();
      }
      if (result.error) throw result.error;
      setMsg({ type: 'success', text: 'Materi berhasil disimpan!' });
      setTimeout(() => { onSaved(result.data as MateriRow); }, 800);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal menyimpan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-700 shadow-xl overflow-hidden">
      {/* Header editor */}
      <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Edit Materi</div>
          <h3 className="text-white font-extrabold text-sm mt-0.5">{subtopicTitle}</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer text-white">
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-3">
        {blocks.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            <PenLine size={32} className="mx-auto mb-2 opacity-30" />
            <p>Belum ada konten. Tambahkan blok di bawah.</p>
          </div>
        )}

        {blocks.map((block, i) => (
          <BlockEditorRow
            key={block.id}
            block={block}
            index={i}
            total={blocks.length}
            onChange={updateBlock}
            onRemove={removeBlock}
            onMove={moveBlock}
          />
        ))}

        <BlockTypePicker onAdd={addBlock} />

        {msg && (
          <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {msg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />} {msg.text}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors">
            Batal
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer disabled:bg-slate-400 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Menyimpan...' : 'Simpan Materi'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ExamPackageCard
// ─────────────────────────────────────────────────────────────
const ExamPackageCard: React.FC<{
  pkg: ExamPackage;
  attempt?: ExamAttempt;
  onNavigate?: (examId: string) => void;
  colorClass: 'amber' | 'emerald';
}> = ({ pkg, attempt, onNavigate, colorClass }) => {
  const isDone = !!attempt;
  const c = {
    amber: {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      btn: 'bg-amber-500 hover:bg-amber-600',
      border: 'border-amber-200 dark:border-amber-800/50',
      glow: 'shadow-amber-100 dark:shadow-amber-900/20',
    },
    emerald: {
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-700',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      glow: 'shadow-emerald-100 dark:shadow-emerald-900/20',
    },
  }[colorClass];
  return (
    <div className={`bg-white dark:bg-slate-800/80 border ${c.border} rounded-2xl p-4 shadow-sm hover:shadow-md ${c.glow} transition-all group flex flex-col`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${c.badge}`}>
          {pkg.test_type === 'pretest' ? 'Pretest' : 'Posttest'}
        </span>
        {isDone && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Check size={10} /> Selesai
          </span>
        )}
      </div>
      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1">{pkg.title}</h4>
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
        <span className="flex items-center gap-1"><Clock size={11} /> {pkg.duration_minutes} menit</span>
        {pkg.total_max_points && <span className="flex items-center gap-1">🏆 {pkg.total_max_points} poin</span>}
      </div>
      {isDone && attempt && (
        <div className="mb-3 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500">Nilai Anda</span>
          <span className={`text-lg font-black ${attempt.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{attempt.score}</span>
        </div>
      )}
      <button onClick={() => onNavigate?.(pkg.id)}
        className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-auto ${
          isDone ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 shadow-none' : `${c.btn} text-white shadow-lg`
        }`}>
        {isDone ? <><Eye size={13} /> Lihat Pembahasan</> : <><Play size={13} /> Kerjakan Sekarang</>}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MateriScreen (main export)
// ─────────────────────────────────────────────────────────────
interface MateriScreenProps {
  initialCategory?: MathCategory | null;
  onSelectCategory?: (category: MathCategory | null) => void;
  onNavigateToProblem?: () => void;
  onNavigateToRmeExam?: (examId: string) => void;
}

export const MateriScreen: React.FC<MateriScreenProps> = ({
  initialCategory = null,
  onSelectCategory,
  onNavigateToProblem,
  onNavigateToRmeExam,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MathCategory | null>(initialCategory);
  const [activeSubtopic, setActiveSubtopic] = useState<string>('intro');
  const { isAdmin, user } = useAuth();

  // Materi data per subtopik — cache in map
  const [materiMap, setMateriMap] = useState<Record<string, MateriRow>>({});
  const [loadingMateri, setLoadingMateri] = useState(false);

  // Editor state
  const [editingSubtopic, setEditingSubtopic] = useState<string | null>(null);

  // Exam state
  const [examPackages, setExamPackages] = useState<ExamPackage[]>([]);
  const [examAttempts, setExamAttempts] = useState<Record<string, ExamAttempt>>({});
  const [loadingExams, setLoadingExams] = useState(false);

  // Scroll to content on subtopic change
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setActiveSubtopic('intro');
    setEditingSubtopic(null);
  }, [initialCategory]);

  // Fetch all materi for a strand
  const fetchMateri = useCallback(async (strand: string) => {
    setLoadingMateri(true);
    try {
      const { data } = await supabase.from('materi').select('*').ilike('strand', strand);
      if (data) {
        const map: Record<string, MateriRow> = {};
        (data as MateriRow[]).forEach(row => { map[row.subtopic_id] = row; });
        setMateriMap(map);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingMateri(false); }
  }, []);

  const fetchExamPackages = useCallback(async () => {
    if (!selectedCategory) return;
    setLoadingExams(true);
    try {
      const { data: pkgs } = await supabase
        .from('exam_packages')
        .select('id, title, test_type, strand, duration_minutes, total_max_points')
        .ilike('strand', selectedCategory)
        .in('test_type', ['pretest', 'postest'])
        .order('created_at', { ascending: false });
      setExamPackages(pkgs || []);
      if (user && pkgs && pkgs.length > 0) {
        const ids = (pkgs as ExamPackage[]).map(p => p.id);
        const { data: atts } = await supabase.from('exam_attempts').select('id, exam_id, score').eq('user_id', user.id).in('exam_id', ids);
        const attMap = (atts || []).reduce((acc: Record<string, ExamAttempt>, a: ExamAttempt) => { acc[a.exam_id] = a; return acc; }, {});
        setExamAttempts(attMap);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingExams(false); }
  }, [selectedCategory, user]);

  useEffect(() => {
    if (selectedCategory) { fetchMateri(selectedCategory); fetchExamPackages(); }
  }, [selectedCategory, fetchMateri, fetchExamPackages]);

  // scroll to content area when subtopic changes
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeSubtopic]);

  const handleSelectCat = (cat: MathCategory | null) => {
    setSelectedCategory(cat);
    setEditingSubtopic(null);
    setActiveSubtopic('intro');
    onSelectCategory?.(cat);
  };

  // ── CATEGORY SELECTION VIEW ──────────────────────────────
  if (selectedCategory === null) {
    return (
      <div className="flex flex-col w-full pb-16 font-sans">
        {/* Hero */}
        <section className="px-4 pt-4 pb-2">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-2xl border border-slate-700">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute right-6 bottom-0 opacity-5 select-none text-[96px] font-black leading-none">∑</div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                <BookOpen size={26} className="text-white" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Modul Kurikulum</div>
                <h2 className="text-2xl font-extrabold tracking-tight leading-tight">Materi Pembelajaran</h2>
                <p className="text-xs text-slate-400 mt-1">5 topik · Dilengkapi LaTeX & soal interaktif</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Pilih Topik</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(['bilangan', 'aljabar', 'geometri', 'trigonometri', 'peluang'] as const).map(cat => {
              const meta = STRAND_META[cat];
              const titles: Record<string, string> = { bilangan: 'Teori Bilangan', aljabar: 'Aljabar Modern', geometri: 'Geometri & Pengukuran', trigonometri: 'Trigonometri', peluang: 'Data & Probabilitas' };
              const descs: Record<string, string> = { bilangan: 'Operasi hitung, FPB/KPK, rasio & sifat bilangan', aljabar: 'Persamaan, pertidaksamaan & sistem fungsi', geometri: 'Objek 2D/3D, transformasi & pengukuran', trigonometri: 'Rasio, identitas & grafik gelombang', peluang: 'Analisis data, statistik & peluang' };
              const subtopics = SYLLABUS[cat] || [];
              return (
                <button key={cat} onClick={() => handleSelectCat(cat)}
                  className="text-left p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-md`}>
                      <span className="material-symbols-outlined text-white text-[22px]">{meta.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {subtopics.length} Sub-topik
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold text-slate-800 dark:text-white group-hover:${meta.color} transition-colors`}>{titles[cat]}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{descs[cat]}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors mt-auto">
                    Mulai belajar <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // ── DETAIL TOPIK VIEW ──────────────────────────────────────
  const meta = STRAND_META[selectedCategory] || STRAND_META.aljabar;
  const syllabus = SYLLABUS[selectedCategory] || [];
  const currentSubtopic = syllabus.find(s => s.id === activeSubtopic);
  const currentMateri = materiMap[activeSubtopic] || null;
  const pretestPackages = examPackages.filter(p => p.test_type === 'pretest');
  const postestPackages = examPackages.filter(p => p.test_type === 'postest');
  const completedCount = syllabus.filter(s => materiMap[s.id]?.blocks?.length > 0).length;
  const progressPct = syllabus.length > 0 ? Math.round((completedCount / syllabus.length) * 100) : 0;

  return (
    <div className="flex flex-col w-full min-h-screen pb-16 font-sans bg-slate-50 dark:bg-slate-900">
      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => handleSelectCat(null)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow shrink-0`}>
            <span className="material-symbols-outlined text-white text-[18px]">{meta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white capitalize truncate">{selectedCategory}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden max-w-[80px]">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-400">{completedCount}/{syllabus.length} subtopik</span>
            </div>
          </div>
          <button onClick={() => onNavigateToProblem?.()}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-colors">
            <Play size={13} /> Latihan
          </button>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* ── Sidebar silabus ── */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Silabus</p>
            <nav className="space-y-1">
              {syllabus.map((item, i) => {
                const hasContent = (materiMap[item.id]?.blocks?.length || 0) > 0;
                const isActive = activeSubtopic === item.id;
                return (
                  <button key={item.id}
                    onClick={() => { setActiveSubtopic(item.id); setEditingSubtopic(null); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
                      isActive ? 'bg-indigo-600 text-white' : hasContent ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {hasContent && !isActive ? <Check size={11} /> : i + 1}
                    </div>
                    <span className="truncate text-xs">{item.title}</span>
                  </button>
                );
              })}
            </nav>

            {/* Exam packages in sidebar */}
            {(pretestPackages.length > 0 || postestPackages.length > 0) && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ujian</p>
                {pretestPackages.slice(0, 2).map(pkg => (
                  <button key={pkg.id} onClick={() => onNavigateToRmeExam?.(pkg.id)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors cursor-pointer">
                    <div className="text-[9px] font-black uppercase text-amber-600 tracking-widest">Pretest</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">{pkg.title}</div>
                  </button>
                ))}
                {postestPackages.slice(0, 2).map(pkg => (
                  <button key={pkg.id} onClick={() => onNavigateToRmeExam?.(pkg.id)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors cursor-pointer">
                    <div className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Posttest</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">{pkg.title}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0" ref={contentRef}>

          {/* Mobile subtopic tabs */}
          <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
            {syllabus.map((item, i) => {
              const hasContent = (materiMap[item.id]?.blocks?.length || 0) > 0;
              const isActive = activeSubtopic === item.id;
              return (
                <button key={item.id}
                  onClick={() => { setActiveSubtopic(item.id); setEditingSubtopic(null); }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                  {hasContent && !isActive && <Check size={10} className="text-emerald-500" />}
                  {!hasContent && <span className="opacity-60">{i + 1}.</span>}
                  {item.title}
                </button>
              );
            })}
          </div>

          {/* ── Exam packages banner ── */}
          {(pretestPackages.length > 0 || postestPackages.length > 0) && editingSubtopic === null && (
            <div className="mx-4 md:mx-6 mt-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ujian Terkait</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pretestPackages.map(pkg => (
                  <ExamPackageCard key={pkg.id} pkg={pkg} attempt={examAttempts[pkg.id]} onNavigate={onNavigateToRmeExam} colorClass="amber" />
                ))}
                {postestPackages.map(pkg => (
                  <ExamPackageCard key={pkg.id} pkg={pkg} attempt={examAttempts[pkg.id]} onNavigate={onNavigateToRmeExam} colorClass="emerald" />
                ))}
              </div>
            </div>
          )}

          {/* ── Subtopic content ── */}
          <div className="mx-4 md:mx-6 mt-5 mb-6">
            {/* Subtopic header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${meta.color}`}>{selectedCategory}</span>
                  <span className="text-slate-300 dark:text-slate-600 text-xs">›</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {syllabus.findIndex(s => s.id === activeSubtopic) + 1} / {syllabus.length}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 tracking-tight">
                  {currentSubtopic?.title || 'Pengantar'}
                </h2>
              </div>

              {/* Admin controls */}
              {isAdmin && editingSubtopic !== activeSubtopic && (
                <button
                  onClick={() => setEditingSubtopic(activeSubtopic)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-xs font-bold cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                  <Edit3 size={13} />
                  {currentMateri ? 'Edit Materi' : 'Tambah Materi'}
                </button>
              )}
            </div>

            {/* Admin editor */}
            {isAdmin && editingSubtopic === activeSubtopic && currentSubtopic && (
              <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                <MateriEditor
                  strand={selectedCategory}
                  subtopicId={activeSubtopic}
                  subtopicTitle={currentSubtopic.title}
                  existingMateri={currentMateri}
                  onSaved={(row) => {
                    setMateriMap(prev => ({ ...prev, [row.subtopic_id]: row }));
                    setEditingSubtopic(null);
                  }}
                  onClose={() => setEditingSubtopic(null)}
                />
              </div>
            )}

            {/* Content display */}
            {editingSubtopic !== activeSubtopic && (
              <>
                {loadingMateri ? (
                  <div className="flex items-center gap-3 py-10 text-slate-400 text-sm justify-center">
                    <Loader2 size={18} className="animate-spin text-indigo-400" />
                    Memuat materi...
                  </div>
                ) : currentMateri && currentMateri.blocks.length > 0 ? (
                  <article className="max-w-3xl space-y-1 prose-sm">
                    {currentMateri.blocks.map(block => (
                      <BlockRenderer key={block.id} block={block} />
                    ))}
                    {/* Updated at */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Terakhir diperbarui: {new Date(currentMateri.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      {isAdmin && (
                        <button onClick={() => setEditingSubtopic(activeSubtopic)}
                          className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 cursor-pointer font-bold">
                          <Edit3 size={11} /> Edit
                        </button>
                      )}
                    </div>
                  </article>
                ) : (
                  /* Empty state */
                  <div className="py-16 flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <BookOpen size={28} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">Materi belum tersedia</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {isAdmin ? 'Klik "Tambah Materi" di atas untuk mulai menulis konten.' : 'Konten akan segera ditambahkan oleh pengajar.'}
                      </p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => setEditingSubtopic(activeSubtopic)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-colors">
                        <Plus size={14} /> Tambah Materi Sekarang
                      </button>
                    )}
                  </div>
                )}

                {/* Subtopic navigation */}
                {!loadingMateri && (
                  <div className="mt-8 flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {(() => {
                      const currentIdx = syllabus.findIndex(s => s.id === activeSubtopic);
                      const prev = syllabus[currentIdx - 1];
                      const next = syllabus[currentIdx + 1];
                      return (
                        <>
                          {prev ? (
                            <button onClick={() => setActiveSubtopic(prev.id)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              <ChevronRight size={14} className="rotate-180" />
                              <span className="hidden sm:inline">{prev.title}</span>
                              <span className="sm:hidden">Sebelumnya</span>
                            </button>
                          ) : <div />}
                          {next && (
                            <button onClick={() => setActiveSubtopic(next.id)}
                              className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors bg-gradient-to-r ${meta.gradient} text-white shadow-md hover:opacity-90`}>
                              <span className="hidden sm:inline">{next.title}</span>
                              <span className="sm:hidden">Berikutnya</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
