import React, { useState } from 'react';
import { InlineMath } from 'react-katex';
import { MathRenderer } from '../MathRenderer';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import { Plus, Trash2, Eye, Edit3 } from 'lucide-react';

// =====================================================
// Types
// =====================================================
type Strand = 'bilangan' | 'aljabar' | 'geometri' | 'trigonometri' | 'peluang';
type BlockType = 'text' | 'latex' | 'image';

interface ContentBlock { id: string; type: BlockType; value: string; }

export interface RmeHint {
  id: string;
  question: string;
  answer: string;
}

interface RmeStageKey {
  ref: string;
  points: number;
  hints?: RmeHint[];
  finalNumericAnswer?: string;
}

interface RmeQuestion {
  id: string;
  title: string;
  content_blocks: ContentBlock[];
  stage_diketahui: RmeStageKey;
  stage_ditanya: RmeStageKey;
  stage_pengerjaan: RmeStageKey;
  stage_kesimpulan: RmeStageKey;
}

interface RmePosttestBuilderProps {
  testType?: 'latihan' | 'pretest' | 'postest';
  onBack: () => void;
  onSaved: () => void;
}

let _cnt = 200;
const uid = (p: string) => `${p}-${++_cnt}-${Date.now()}`;

const STRANDS: { value: Strand; label: string; icon: string }[] = [
  { value: 'bilangan', label: 'Bilangan', icon: '123' },
  { value: 'aljabar', label: 'Aljabar', icon: 'functions' },
  { value: 'geometri', label: 'Geometri', icon: 'hexagon' },
  { value: 'trigonometri', label: 'Trigonometri', icon: 'ssid_chart' },
  { value: 'peluang', label: 'Peluang & Data', icon: 'casino' },
];

const STAGES: { key: 'diketahui' | 'ditanya' | 'pengerjaan' | 'kesimpulan'; label: string; icon: string; color: string }[] = [
  { key: 'diketahui', label: 'Diketahui', icon: 'info', color: 'sky' },
  { key: 'ditanya', label: 'Ditanya', icon: 'help', color: 'violet' },
  { key: 'pengerjaan', label: 'Pengerjaan', icon: 'calculate', color: 'amber' },
  { key: 'kesimpulan', label: 'Kesimpulan', icon: 'check_circle', color: 'emerald' },
];

const makeBlankQuestion = (): RmeQuestion => ({
  id: uid('rmq'),
  title: '',
  content_blocks: [{ id: uid('blk'), type: 'text', value: '' }],
  stage_diketahui: { ref: '', points: 20 },
  stage_ditanya: { ref: '', points: 10 },
  stage_pengerjaan: { ref: '', points: 50, hints: [], finalNumericAnswer: '' },
  stage_kesimpulan: { ref: '', points: 20 },
});

// =====================================================
// Sub: Stage Key Input Panel
// =====================================================
const StageKeyPanel: React.FC<{
  stage: typeof STAGES[number];
  value: RmeStageKey;
  onChange: (val: RmeStageKey) => void;
}> = ({ stage, value, onChange }) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const isPhase3 = stage.key === 'pengerjaan';

  const colorMap: Record<string, string> = {
    sky: 'border-sky-300 bg-sky-50 dark:bg-sky-900/10',
    violet: 'border-violet-300 bg-violet-50 dark:bg-violet-900/10',
    amber: 'border-amber-300 bg-amber-50 dark:bg-amber-900/10',
    emerald: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10',
  };
  const labelColor: Record<string, string> = {
    sky: 'text-sky-700 dark:text-sky-400',
    violet: 'text-violet-700 dark:text-violet-400',
    amber: 'text-amber-700 dark:text-amber-400',
    emerald: 'text-emerald-700 dark:text-emerald-400',
  };
  const badgeColor: Record<string, string> = {
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  };

  const addHint = () => {
    onChange({
      ...value,
      hints: [...(value.hints || []), { id: uid('hnt'), question: '', answer: '' }]
    });
  };

  const updateHint = (hintId: string, field: 'question' | 'answer', text: string) => {
    onChange({
      ...value,
      hints: (value.hints || []).map(h => h.id === hintId ? { ...h, [field]: text } : h)
    });
  };

  const removeHint = (hintId: string) => {
    onChange({
      ...value,
      hints: (value.hints || []).filter(h => h.id !== hintId)
    });
  };

  return (
    <div className={`rounded-xl border-2 ${colorMap[stage.color]} p-4 space-y-4`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${badgeColor[stage.color]} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-white text-[14px]">{stage.icon}</span>
          </div>
          <span className={`font-black text-sm ${labelColor[stage.color]} uppercase tracking-wide`}>
            Tahap {stage.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Poin Maks.</label>
          <input
            type="number"
            min={0}
            max={100}
            value={value.points}
            onChange={(e) => onChange({ ...value, points: parseInt(e.target.value) || 0 })}
            className="w-16 px-2 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-black text-sm text-center focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {isPhase3 && (
        <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hasil Akhir Angka Pasti</label>
              <input
                type="number"
                step="any"
                value={value.finalNumericAnswer || ''}
                onChange={e => onChange({ ...value, finalNumericAnswer: e.target.value })}
                placeholder="Contoh: 42"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-indigo-400 outline-none"
              />
            </div>
            <div className="flex-1 text-xs text-slate-500 italic mt-4">
              Digunakan sistem untuk verifikasi jawaban akhir otomatis (jika ada).
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Kisi-Kisi Bertahap (Hints)</label>
              <button onClick={addHint} className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors">
                <Plus size={14} /> Tambah Kisi-Kisi
              </button>
            </div>
            {(value.hints || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">Tidak ada kisi-kisi.</p>
            ) : (
              <div className="space-y-3">
                {(value.hints || []).map((h, i) => (
                  <div key={h.id} className="relative bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <button onClick={() => removeHint(h.id)} className="absolute top-2 right-2 text-rose-400 hover:text-rose-600"><Trash2 size={14}/></button>
                    <span className="text-xs font-bold text-indigo-500 mb-2 block">Kisi-Kisi #{i+1}</span>
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={h.question}
                        onChange={e => updateHint(h.id, 'question', e.target.value)}
                        placeholder="Pertanyaan pemandu (Bisa LaTeX, contoh: $x^2=4$)"
                        className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs focus:border-indigo-400 outline-none resize-y"
                      />
                      <textarea
                        rows={2}
                        value={h.answer}
                        onChange={e => updateHint(h.id, 'answer', e.target.value)}
                        placeholder="Jawaban pemandu (Bisa LaTeX)"
                        className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs focus:border-indigo-400 outline-none resize-y bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor & Preview Toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">
            {isPhase3 ? "Uraian Penyelesaian Lengkap" : "Kunci Jawaban Acuan"}
          </label>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Edit3 size={12} /> Edit Teks
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Eye size={12} /> Render LaTeX
            </button>
          </div>
        </div>
        
        {activeTab === 'edit' ? (
          <textarea
            rows={4}
            value={value.ref}
            onChange={(e) => onChange({ ...value, ref: e.target.value })}
            placeholder={`Gunakan $$...$$ untuk block rumus, dan $...$ untuk inline rumus.\nContoh: Nilai dari $x$ adalah $$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$`}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-mono leading-relaxed focus:border-indigo-400 outline-none resize-y placeholder:text-slate-400"
          />
        ) : (
          <div className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 min-h-[100px]">
            {value.ref.trim() ? (
              <MathRenderer text={value.ref} className="text-sm text-slate-800 dark:text-white" />
            ) : (
              <span className="text-slate-400 text-xs italic">Kunci jawaban kosong...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// Main RmePosttestBuilder
// =====================================================
export const RmePosttestBuilder: React.FC<RmePosttestBuilderProps> = ({ onBack, onSaved, testType = 'postest' }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [strand, setStrand] = useState<Strand>('bilangan');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [questions, setQuestions] = useState<RmeQuestion[]>([makeBlankQuestion()]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addQuestion = () => setQuestions(prev => [...prev, makeBlankQuestion()]);
  const removeQuestion = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id));
  const updateTitle = (id: string, t: string) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, title: t } : q));
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
  const updateStage = (qId: string, stageKey: string, val: RmeStageKey) =>
    setQuestions(prev => prev.map(q => q.id !== qId ? q : {
      ...q, [`stage_${stageKey}`]: val
    } as RmeQuestion));

  const handleSave = async () => {
    setSaveMsg(null);
    if (!title.trim()) { setSaveMsg({ type: 'error', text: 'Judul paket ujian harus diisi.' }); return; }
    if (questions.length === 0) { setSaveMsg({ type: 'error', text: 'Minimal 1 soal harus ditambahkan.' }); return; }
    for (const q of questions) {
      if (!q.content_blocks.some(b => b.value.trim())) {
        setSaveMsg({ type: 'error', text: `Semua soal harus memiliki konten yang diisi.` });
        return;
      }
    }

    setIsSaving(true);
    const builtQuestions = questions.map((q, idx) => ({
      id: q.id,
      title: q.title || `Soal ${idx + 1}`,
      content_blocks: q.content_blocks,
      options: [], 
      question_type: 'rme_posttest',
      rme_keys: {
        ref_diketahui: q.stage_diketahui.ref,
        ref_ditanya: q.stage_ditanya.ref,
        ref_pengerjaan: q.stage_pengerjaan.ref,
        ref_kesimpulan: q.stage_kesimpulan.ref,
        points_diketahui: q.stage_diketahui.points,
        points_ditanya: q.stage_ditanya.points,
        points_pengerjaan: q.stage_pengerjaan.points,
        points_kesimpulan: q.stage_kesimpulan.points,
        hints: q.stage_pengerjaan.hints || [],
        finalNumericAnswer: q.stage_pengerjaan.finalNumericAnswer ? parseFloat(q.stage_pengerjaan.finalNumericAnswer) : null,
      },
    }));

    const totalPoints = questions.reduce((acc, q) =>
      acc + q.stage_diketahui.points + q.stage_ditanya.points + q.stage_pengerjaan.points + q.stage_kesimpulan.points, 0
    );

    const payload = {
      title: title.trim(),
      strand,
      test_type: testType,
      exam_type: 'rme_posttest',
      duration_minutes: durationMinutes,
      questions: builtQuestions,
      total_max_points: totalPoints,
      created_by: user?.email || 'unknown',
    };

    try {
      const { error } = await supabase.from('exam_packages').insert([payload]);
      if (error) throw error;
      setSaveMsg({ type: 'success', text: `✅ Paket Ujian/Latihan RME "${title}" berhasil disimpan!` });
      setTimeout(() => onSaved(), 2000);
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err.message || 'Terjadi kesalahan saat menyimpan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const headerBg = 'from-violet-600 to-fuchsia-500';

  return (
    <div className="flex flex-col w-full pb-20 font-sans">
      <div className={`bg-gradient-to-r ${headerBg} px-4 py-5 text-white`}>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80">RME Builder</div>
            <h2 className="text-lg font-extrabold">Buat Studi Kasus RME</h2>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Informasi Utama</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5"><span className="material-symbols-outlined text-[12px] align-middle mr-1">title</span> Judul Paket</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Analisis Ketinggian Roket (Aljabar)" className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Kategori Materi</label>
              <div className="flex flex-wrap gap-2">
                {STRANDS.map(s => (
                  <button key={s.value} onClick={() => setStrand(s.value)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${strand === s.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-600 border-transparent hover:border-indigo-300'}`}>
                    <span className="material-symbols-outlined text-[14px]">{s.icon}</span>{s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Durasi Waktu (Menit)</label>
              <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className="w-24 p-2 rounded-xl border text-center font-bold outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-800 px-5 py-3 flex items-center justify-between text-white">
              <span className="font-black text-sm">Soal Kasus {qIdx + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(q.id)} className="text-white/60 hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer">
                  <Trash2 size={14}/> Hapus
                </button>
              )}
            </div>
            
            <div className="p-5 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Narasi Studi Kasus (Konten)</label>
                <div className="space-y-3">
                  {q.content_blocks.map((block) => (
                    <div key={block.id} className="flex gap-2">
                      <div className="flex-1 relative">
                        {block.type === 'text' && (
                          <textarea rows={3} value={block.value} onChange={e => updateBlock(q.id, block.id, e.target.value)} placeholder="Deskripsikan studi kasus di sini. Bisa pakai Math: $\frac{1}{2}$" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 resize-y" />
                        )}
                        {block.type === 'latex' && (
                          <input value={block.value} onChange={e => updateBlock(q.id, block.id, e.target.value)} placeholder="Latex syntax (legacy)" className="w-full p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-mono outline-none" />
                        )}
                        {block.type === 'image' && (
                          <input value={block.value} onChange={e => updateBlock(q.id, block.id, e.target.value)} placeholder="Image URL" className="w-full p-3 rounded-xl border border-violet-300 bg-violet-50 text-violet-800 outline-none" />
                        )}
                      </div>
                      <button onClick={() => removeBlock(q.id, block.id)} className="mt-2 w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center shrink-0 cursor-pointer">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => addBlock(q.id, 'text')} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200">+ Teks / Paragraf</button>
                    <button onClick={() => addBlock(q.id, 'image')} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200">+ URL Gambar</button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 space-y-4">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">4</span>
                  Tahapan RME & Rubrik AI
                </h4>
                
                <StageKeyPanel stage={STAGES[0]} value={q.stage_diketahui} onChange={v => updateStage(q.id, 'diketahui', v)} />
                <StageKeyPanel stage={STAGES[1]} value={q.stage_ditanya} onChange={v => updateStage(q.id, 'ditanya', v)} />
                <StageKeyPanel stage={STAGES[2]} value={q.stage_pengerjaan} onChange={v => updateStage(q.id, 'pengerjaan', v)} />
                <StageKeyPanel stage={STAGES[3]} value={q.stage_kesimpulan} onChange={v => updateStage(q.id, 'kesimpulan', v)} />
              </div>
            </div>
          </div>
        ))}

        <button onClick={addQuestion} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
          <Plus size={18}/> Tambah Studi Kasus Baru
        </button>
        
        {saveMsg && (
          <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            <span className="material-symbols-outlined">{saveMsg.type === 'success' ? 'check_circle' : 'error'}</span>
            {saveMsg.text}
          </div>
        )}

        <button onClick={handleSave} disabled={isSaving} className={`w-full py-4 rounded-2xl font-black text-white shadow-xl shadow-indigo-200 transition-all cursor-pointer ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1'}`}>
          {isSaving ? 'Menyimpan Paket...' : 'SIMPAN PAKET RME'}
        </button>
      </div>
    </div>
  );
};
