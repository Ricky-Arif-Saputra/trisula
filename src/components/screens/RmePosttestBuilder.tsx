import React, { useState } from 'react';
import { InlineMath } from 'react-katex';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';

// =====================================================
// Types
// =====================================================
type Strand = 'bilangan' | 'aljabar' | 'geometri' | 'trigonometri' | 'peluang';
type BlockType = 'text' | 'latex' | 'image';

interface ContentBlock { id: string; type: BlockType; value: string; }

interface RmeStageKey {
  ref: string;
  points: number;
}

interface RmeQuestion {
  id: string;
  title: string;
  content_blocks: ContentBlock[];
  // 4-stage RME keys
  stage_diketahui: RmeStageKey;
  stage_ditanya: RmeStageKey;
  stage_pengerjaan: RmeStageKey;
  stage_kesimpulan: RmeStageKey;
}

interface RmePosttestBuilderProps {
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
  stage_diketahui: { ref: '', points: 25 },
  stage_ditanya: { ref: '', points: 25 },
  stage_pengerjaan: { ref: '', points: 35 },
  stage_kesimpulan: { ref: '', points: 15 },
});

// =====================================================
// Sub: Stage Key Input Panel
// =====================================================
const StageKeyPanel: React.FC<{
  stage: typeof STAGES[number];
  value: RmeStageKey;
  onChange: (val: RmeStageKey) => void;
}> = ({ stage, value, onChange }) => {
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

  return (
    <div className={`rounded-xl border-2 ${colorMap[stage.color]} p-4 space-y-3`}>
      <div className="flex items-center justify-between gap-3">
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

      {/* Ref answer textarea */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
          Kunci Jawaban Acuan (teks / LaTeX)
        </label>
        <textarea
          rows={3}
          value={value.ref}
          onChange={(e) => onChange({ ...value, ref: e.target.value })}
          placeholder={`Contoh kunci "${stage.label}": tulis teks biasa atau sintaks LaTeX, misal: x = \\frac{3}{2}`}
          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-mono leading-relaxed focus:border-indigo-400 outline-none resize-y placeholder:text-slate-400"
        />
      </div>

      {/* Live KaTeX Preview */}
      {value.ref.trim() && (
        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[11px]">visibility</span>
            Live Preview KaTeX
          </div>
          <div className="text-sm text-slate-800 dark:text-white overflow-x-auto">
            {(() => {
              try {
                // Render inline math for any LaTeX detected
                const hasLatex = value.ref.includes('\\') || value.ref.includes('^') || value.ref.includes('_') || value.ref.includes('frac');
                if (hasLatex) {
                  return <InlineMath math={value.ref} />;
                }
                return <span>{value.ref}</span>;
              } catch {
                return <span className="text-rose-500 text-xs">LaTeX tidak valid</span>;
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// Main RmePosttestBuilder
// =====================================================
export const RmePosttestBuilder: React.FC<RmePosttestBuilderProps> = ({ onBack, onSaved }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [strand, setStrand] = useState<Strand>('bilangan');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [questions, setQuestions] = useState<RmeQuestion[]>([makeBlankQuestion()]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---- Question manipulation ----
  const addQuestion = () => setQuestions(prev => [...prev, makeBlankQuestion()]);
  const removeQuestion = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id));

  const updateTitle = (id: string, t: string) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, title: t } : q));

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

  // ---- Save ----
  const handleSave = async () => {
    setSaveMsg(null);
    if (!title.trim()) { setSaveMsg({ type: 'error', text: 'Judul paket ujian harus diisi.' }); return; }
    if (questions.length === 0) { setSaveMsg({ type: 'error', text: 'Minimal 1 soal harus ditambahkan.' }); return; }

    // Validate: each question must have at least one content block with value
    for (const q of questions) {
      if (!q.content_blocks.some(b => b.value.trim())) {
        setSaveMsg({ type: 'error', text: `Semua soal harus memiliki konten yang diisi.` });
        return;
      }
    }

    setIsSaving(true);

    // Build questions JSON (include rme_keys for AI scoring)
    const builtQuestions = questions.map((q, idx) => ({
      id: q.id,
      title: q.title || `Soal ${idx + 1}`,
      content_blocks: q.content_blocks,
      options: [], // RME Posttest = essay, no MC options
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
      },
    }));

    const totalPoints = questions.reduce((acc, q) =>
      acc + q.stage_diketahui.points + q.stage_ditanya.points + q.stage_pengerjaan.points + q.stage_kesimpulan.points, 0
    );

    const payload = {
      title: title.trim(),
      strand,
      test_type: 'postest',
      exam_type: 'rme_posttest',
      duration_minutes: durationMinutes,
      questions: builtQuestions,
      total_max_points: totalPoints,
      created_by: user?.email || 'unknown',
    };

    try {
      const { error } = await supabase.from('exam_packages').insert([payload]);
      if (error) throw error;
      setSaveMsg({ type: 'success', text: `✅ Paket Postest RME "${title}" berhasil disimpan!` });
      setTimeout(() => onSaved(), 2000);
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: `Gagal menyimpan: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full font-sans space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-700 to-orange-600 rounded-2xl p-6 text-white flex items-center gap-4 shadow-lg">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">psychology</span>
          </div>
          <div>
            <h1 className="text-xl font-black">Pembuat Soal Postest RME</h1>
            <p className="text-orange-100 text-xs mt-0.5">4 Tahap: Diketahui · Ditanya · Pengerjaan · Kesimpulan · Penilaian AI</p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-rose-500">settings</span>
          Pengaturan Paket Ujian
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Judul Paket Ujian</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Postest RME – Bilangan Riil"
              className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-sm focus:border-rose-400 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Durasi (Menit)</label>
            <input
              type="number"
              min={10}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
              className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold text-sm focus:border-rose-400 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Bidang (Strand)</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STRANDS.map(s => (
              <button
                key={s.value}
                onClick={() => setStrand(s.value)}
                className={`py-2 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${strand === s.value ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {/* Question Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white font-black text-sm">{qIdx + 1}</div>
                <input
                  type="text"
                  value={q.title}
                  onChange={(e) => updateTitle(q.id, e.target.value)}
                  placeholder={`Judul Soal ${qIdx + 1} (opsional)`}
                  className="bg-transparent text-white font-bold text-sm placeholder:text-slate-400 outline-none flex-1"
                />
              </div>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(q.id)}
                  className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 flex items-center justify-center cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              )}
            </div>

            <div className="p-5 space-y-5">
              {/* Context/Problem Content */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">article</span>
                  Konteks / Narasi Soal
                </label>
                <div className="space-y-2">
                  {q.content_blocks.map((block) => (
                    <div key={block.id} className="relative">
                      {block.type === 'text' && (
                        <div className="flex gap-2">
                          <textarea
                            rows={3}
                            value={block.value}
                            onChange={(e) => updateBlock(q.id, block.id, e.target.value)}
                            placeholder="Tuliskan narasi/konteks soal di sini..."
                            className="flex-1 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm leading-relaxed focus:border-rose-400 outline-none resize-y placeholder:text-slate-400"
                          />
                          {q.content_blocks.length > 1 && (
                            <button onClick={() => removeBlock(q.id, block.id)}
                              className="w-8 h-8 self-start mt-2 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 flex items-center justify-center cursor-pointer">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          )}
                        </div>
                      )}
                      {block.type === 'latex' && (
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-2">
                            <textarea
                              rows={2}
                              value={block.value}
                              onChange={(e) => updateBlock(q.id, block.id, e.target.value)}
                              placeholder="Sintaks LaTeX, contoh: f(x) = \frac{x}{2}"
                              className="w-full p-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-mono focus:border-indigo-400 outline-none resize-y"
                            />
                            {block.value.trim() && (
                              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-sm text-slate-800 dark:text-white overflow-x-auto">
                                <InlineMath math={block.value} />
                              </div>
                            )}
                          </div>
                          {q.content_blocks.length > 1 && (
                            <button onClick={() => removeBlock(q.id, block.id)}
                              className="w-8 h-8 self-start mt-2 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 flex items-center justify-center cursor-pointer">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => addBlock(q.id, 'text')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold hover:border-slate-300 cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">text_fields</span> + Teks
                  </button>
                  <button onClick={() => addBlock(q.id, 'latex')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-500 text-xs font-bold hover:border-indigo-300 cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">function</span> + LaTeX
                  </button>
                </div>
              </div>

              {/* 4 Stage Keys */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">key</span>
                  Kunci Jawaban Acuan Per Tahap (Digunakan Penilaian AI)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STAGES.map(stage => (
                    <StageKeyPanel
                      key={stage.key}
                      stage={stage}
                      value={(q as any)[`stage_${stage.key}`] as RmeStageKey}
                      onChange={(val) => updateStage(q.id, stage.key, val)}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2 text-xs text-slate-500 font-mono bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[14px] text-indigo-400">calculate</span>
                  Total Poin Soal ini:
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {q.stage_diketahui.points + q.stage_ditanya.points + q.stage_pengerjaan.points + q.stage_kesimpulan.points}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question */}
      <button onClick={addQuestion}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-700 text-rose-500 dark:text-rose-400 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors cursor-pointer flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        Tambah Soal RME Baru
      </button>

      {/* Footer Save */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        {saveMsg && (
          <div className={`flex-1 p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${saveMsg.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
            <span className="material-symbols-outlined text-[18px]">{saveMsg.type === 'success' ? 'check_circle' : 'error'}</span>
            {saveMsg.text}
          </div>
        )}
        <div className="flex gap-3 ml-auto">
          <button onClick={onBack}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
            Batal
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${isSaving ? 'bg-slate-400 text-white cursor-wait' : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer active:scale-95'}`}>
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">save</span>Simpan Paket Postest RME</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
