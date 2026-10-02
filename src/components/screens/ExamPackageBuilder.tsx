import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';

// =====================================================
// Types
// =====================================================
type Strand = 'bilangan' | 'aljabar' | 'geometri' | 'trigonometri' | 'peluang';
type BlockType = 'text' | 'latex' | 'image';

interface ContentBlock { id: string; type: BlockType; value: string; }
interface AnswerOption { id: string; text: string; isCorrect: boolean; }
interface QuestionDraft {
  id: string;
  content_blocks: ContentBlock[];
  options: AnswerOption[];
}

interface ExamPackageBuilderProps {
  testType: 'pretest' | 'postest';
  onBack: () => void;
  onSaved: () => void;
}

let _counter = 100;
const uid = (p: string) => `${p}-${++_counter}-${Date.now()}`;

const STRANDS: { value: Strand; label: string; icon: string }[] = [
  { value: 'bilangan', label: 'Bilangan', icon: '123' },
  { value: 'aljabar', label: 'Aljabar', icon: 'functions' },
  { value: 'geometri', label: 'Geometri', icon: 'hexagon' },
  { value: 'trigonometri', label: 'Trigonometri', icon: 'ssid_chart' },
  { value: 'peluang', label: 'Peluang & Data', icon: 'casino' },
];

const makeBlankQuestion = (): QuestionDraft => ({
  id: uid('q'),
  content_blocks: [{ id: uid('blk'), type: 'text', value: '' }],
  options: [
    { id: uid('opt'), text: '', isCorrect: false },
    { id: uid('opt'), text: '', isCorrect: false },
    { id: uid('opt'), text: '', isCorrect: false },
    { id: uid('opt'), text: '', isCorrect: false },
  ],
});

// =====================================================
// ExamPackageBuilder Component
// =====================================================
export const ExamPackageBuilder: React.FC<ExamPackageBuilderProps> = ({ testType, onBack, onSaved }) => {
  const { user } = useAuth();

  // Metadata state
  const [title, setTitle] = useState('');
  const [strand, setStrand] = useState<Strand>('bilangan');
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Questions state
  const [questions, setQuestions] = useState<QuestionDraft[]>([makeBlankQuestion()]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---- Question manipulation ----
  const addQuestion = () => setQuestions(prev => [...prev, makeBlankQuestion()]);
  const removeQuestion = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id));

  const updateBlock = (qId: string, blockId: string, value: string) =>
    setQuestions(prev => prev.map(q => q.id !== qId ? q : {
      ...q, content_blocks: q.content_blocks.map(b => b.id === blockId ? { ...b, value } : b)
    }));

  const addBlock = (qId: string, type: BlockType) =>
    setQuestions(prev => prev.map(q => q.id !== qId ? q : {
      ...q, content_blocks: [...q.content_blocks, { id: uid('blk'), type, value: '' }]
    }));

  const removeBlock = (qId: string, blockId: string) =>
    setQuestions(prev => prev.map(q => q.id !== qId ? q : {
      ...q, content_blocks: q.content_blocks.filter(b => b.id !== blockId)
    }));

  const updateOption = (qId: string, optId: string, text: string) =>
    setQuestions(prev => prev.map(q => q.id !== qId ? q : {
      ...q, options: q.options.map(o => o.id === optId ? { ...o, text } : o)
    }));

  const setCorrect = (qId: string, optId: string) =>
    setQuestions(prev => prev.map(q => q.id !== qId ? q : {
      ...q, options: q.options.map(o => ({ ...o, isCorrect: o.id === optId }))
    }));

  const addOption = (qId: string) =>
    setQuestions(prev => prev.map(q => q.id !== qId ? q : {
      ...q, options: [...q.options, { id: uid('opt'), text: '', isCorrect: false }]
    }));

  // ---- Save ----
  const handleSave = async () => {
    if (!title.trim()) { setSaveMsg({ type: 'error', text: 'Judul ujian tidak boleh kosong.' }); return; }
    if (questions.length === 0) { setSaveMsg({ type: 'error', text: 'Minimal 1 soal harus ada.' }); return; }

    setIsSaving(true);
    setSaveMsg(null);
    try {
      const payload = {
        title: title.trim(),
        strand,
        test_type: testType,
        duration_minutes: durationMinutes,
        created_by: user?.id || user?.email || 'admin',
        questions: questions.map(q => ({
          id: q.id,
          content_blocks: q.content_blocks,
          options: q.options.map(o => ({
            id: o.id,
            text: o.text,
            is_correct: o.isCorrect,
          })),
        })),
      };

      const { error } = await supabase.from('exam_packages').insert(payload);
      if (error) throw error;
      setSaveMsg({ type: 'success', text: `Paket ${testType} berhasil disimpan!` });
      setTimeout(() => onSaved(), 1500);
    } catch (e: any) {
      setSaveMsg({ type: 'error', text: e.message || 'Gagal menyimpan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const isPretest = testType === 'pretest';
  const accentColor = isPretest ? 'amber' : 'emerald';
  const headerBg = isPretest ? 'from-amber-600 to-yellow-500' : 'from-emerald-600 to-teal-500';

  return (
    <div className="flex flex-col w-full pb-20 font-sans">
      {/* Header */}
      <div className={`bg-gradient-to-r ${headerBg} px-4 py-5 text-white`}>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{isPretest ? 'Pretest' : 'Postest'} Package Builder</div>
            <h2 className="text-lg font-extrabold">Buat Paket Ujian</h2>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* ===== METADATA CARD ===== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Informasi Ujian</span>
          </div>
          <div className="p-5 space-y-4">
            {/* Judul */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                <span className="material-symbols-outlined text-[12px] align-middle mr-1">title</span> Judul Ujian
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder={`Contoh: ${isPretest ? 'Pretest Diagnostik Aljabar' : 'Postest Evaluasi Bilangan'}`}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm focus:border-indigo-500 outline-none placeholder:text-slate-400" />
            </div>

            {/* Strand */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                <span className="material-symbols-outlined text-[12px] align-middle mr-1">category</span> Kategori Materi
              </label>
              <div className="flex flex-wrap gap-2">
                {STRANDS.map(s => (
                  <button key={s.value} onClick={() => setStrand(s.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${strand === s.value ? `bg-indigo-600 text-white border-indigo-600` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-indigo-300'}`}>
                    <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                <span className="material-symbols-outlined text-[12px] align-middle mr-1">timer</span> Durasi Waktu Ujian (Menit)
              </label>
              <div className="flex items-center gap-3">
                <input type="number" min={5} max={180} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-28 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-black text-lg focus:border-indigo-500 outline-none text-center" />
                <span className="text-sm font-bold text-slate-500">Menit</span>
                <div className="flex gap-2">
                  {[15, 30, 45, 60, 90].map(v => (
                    <button key={v} onClick={() => setDurationMinutes(v)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${durationMinutes === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-100'}`}>
                      {v}'
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== DAFTAR SOAL ===== */}
        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Soal Header */}
            <div className="bg-indigo-600 px-5 py-3 flex items-center justify-between">
              <span className="text-white font-black text-sm">Soal {qIdx + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(q.id)} className="text-white/60 hover:text-white cursor-pointer transition-colors flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-[16px]">delete</span> Hapus Soal
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Content Blocks */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Konten Soal</label>
                <div className="space-y-2">
                  {q.content_blocks.map((block, bIdx) => (
                    <div key={block.id} className="flex gap-2 items-start">
                      <div className="flex-1">
                        {block.type === 'text' && (
                          <textarea value={block.value} onChange={e => updateBlock(q.id, block.id, e.target.value)} rows={3}
                            placeholder="Tuliskan narasi/teks soal di sini..."
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:border-indigo-400 outline-none resize-y placeholder:text-slate-400" />
                        )}
                        {block.type === 'latex' && (
                          <div>
                            <input value={block.value} onChange={e => updateBlock(q.id, block.id, e.target.value)}
                              placeholder="Contoh: \frac{a}{b} + c = d"
                              className="w-full p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-800 dark:text-emerald-300 font-mono focus:border-emerald-500 outline-none" />
                            {block.value && (
                              <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                                <code className="text-xs text-emerald-700 font-mono">{block.value}</code>
                              </div>
                            )}
                          </div>
                        )}
                        {block.type === 'image' && (
                          <input value={block.value} onChange={e => updateBlock(q.id, block.id, e.target.value)}
                            placeholder="URL Gambar (https://...)"
                            className="w-full p-3 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-sm text-violet-800 dark:text-violet-300 focus:border-violet-500 outline-none" />
                        )}
                      </div>
                      {q.content_blocks.length > 1 && (
                        <button onClick={() => removeBlock(q.id, block.id)} className="mt-2 w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 flex items-center justify-center cursor-pointer shrink-0 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  {([['text', 'text_fields', 'slate'], ['latex', 'functions', 'emerald'], ['image', 'image', 'violet']] as const).map(([type, icon, color]) => (
                    <button key={type} onClick={() => addBlock(q.id, type as BlockType)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all bg-${color}-100 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-400 hover:opacity-80 border border-${color}-200 dark:border-${color}-800`}>
                      <span className="material-symbols-outlined text-[13px]">{icon}</span>
                      + {type === 'text' ? 'Teks' : type === 'latex' ? 'LaTeX' : 'Gambar'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pilihan Jawaban</label>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={opt.id} className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${opt.isCorrect ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                      <button onClick={() => setCorrect(q.id, opt.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 cursor-pointer transition-all ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-emerald-200'}`}>
                        {opt.isCorrect ? <span className="material-symbols-outlined text-[14px]">check</span> : LETTERS[oIdx]}
                      </button>
                      <input value={opt.text} onChange={e => updateOption(q.id, opt.id, e.target.value)}
                        placeholder={`Opsi ${LETTERS[oIdx]}...`}
                        className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400 font-medium" />
                    </div>
                  ))}
                </div>
                {q.options.length < 6 && (
                  <button onClick={() => addOption(q.id)} className="mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-700 cursor-pointer flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">add</span> + Tambah Opsi
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add question button */}
        <button onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl text-indigo-500 dark:text-indigo-400 font-bold text-sm hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 cursor-pointer transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add_circle</span>
          + Tambah Soal {questions.length + 1}
        </button>

        {/* Save button */}
        {saveMsg && (
          <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            <span className="material-symbols-outlined text-[16px]">{saveMsg.type === 'success' ? 'check_circle' : 'error'}</span>
            {saveMsg.text}
          </div>
        )}

        <button onClick={handleSave} disabled={isSaving}
          className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : `bg-gradient-to-r ${headerBg} text-white hover:opacity-90 cursor-pointer shadow-lg`}`}>
          {isSaving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
          ) : (
            <><span className="material-symbols-outlined">save</span> Simpan Paket {isPretest ? 'Pretest' : 'Postest'} ({questions.length} Soal)</>
          )}
        </button>
      </div>
    </div>
  );
};
