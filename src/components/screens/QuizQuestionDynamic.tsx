import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Question } from '../../hooks/useQuestions';
import { MathRenderer } from '../MathRenderer';
import {
  STAGES,
  STAGE_COLORS,
  parseRmeKeys,
  stripRmeMetaBlocks,
  numbersMatch,
  type RmeHint,
} from './LatihanTypes';
import { Lightbulb, CheckCircle, ChevronRight, Plus, Type, Sigma, ImageIcon, Trash2, Eye, EyeOff } from 'lucide-react';

interface QuizQuestionDynamicProps {
  questionId: string;
  onFinish: () => void;
  onBack?: () => void;
}

type StageKey = 'diketahui' | 'ditanya' | 'pengerjaan' | 'kesimpulan';
type BlockType = 'text' | 'latex' | 'image';
interface AnswerBlock { id: string; type: BlockType; value: string; }

let _bc = 0;
const buid = () => `ab-${++_bc}-${Date.now()}`;

// ─────────────────────────────────────────────────────────────
// AnswerBlockEditor — satu baris input jawaban siswa
// ─────────────────────────────────────────────────────────────
const BLOCK_META: Record<BlockType, { label: string; border: string; bg: string; placeholder: string }> = {
  text:  { label: 'Teks',   border: 'border-slate-300',  bg: 'bg-white',     placeholder: 'Tuliskan jawabanmu...' },
  latex: { label: 'LaTeX',  border: 'border-violet-300', bg: 'bg-violet-50', placeholder: 'Contoh: \\frac{a}{b}' },
  image: { label: 'Gambar', border: 'border-sky-300',    bg: 'bg-sky-50',    placeholder: 'URL gambar (https://...)' },
};

const AnswerBlockEditor: React.FC<{
  block: AnswerBlock;
  onChange: (id: string, val: string) => void;
  onRemove: (id: string) => void;
}> = ({ block, onChange, onRemove }) => {
  const meta = BLOCK_META[block.type];
  const [showPrev, setShowPrev] = useState(false);

  return (
    <div className={`rounded-xl border ${meta.border} ${meta.bg} p-2.5 space-y-1.5`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest ${
          block.type === 'latex' ? 'text-violet-600' : block.type === 'image' ? 'text-sky-600' : 'text-slate-500'
        }`}>
          {block.type === 'latex' ? <Sigma size={11} className="inline mr-1" /> : block.type === 'image' ? <ImageIcon size={11} className="inline mr-1" /> : <Type size={11} className="inline mr-1" />}
          {meta.label}
        </span>
        <div className="flex items-center gap-1">
          {(block.type === 'text' || block.type === 'latex') && (
            <button type="button" onClick={() => setShowPrev(v => !v)}
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${showPrev ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <Eye size={10} /> Preview
            </button>
          )}
          <button type="button" onClick={() => onRemove(block.id)}
            className="w-6 h-6 rounded-md text-rose-400 hover:bg-rose-100 flex items-center justify-center cursor-pointer">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {block.type === 'image' ? (
        <div className="space-y-1.5">
          <input value={block.value} onChange={e => onChange(block.id, e.target.value)}
            placeholder={meta.placeholder}
            className="w-full p-2 rounded-lg border border-sky-200 bg-white text-xs font-mono outline-none focus:border-sky-400" />
          {block.value.trim() && (
            <img src={block.value} alt="preview" className="max-h-40 rounded-lg border border-sky-200 object-contain" />
          )}
        </div>
      ) : showPrev ? (
        <div className="p-2 rounded-lg border border-slate-200 bg-white min-h-[44px]">
          {block.value.trim() ? <MathRenderer text={block.value} className="text-sm" /> : <span className="text-slate-400 text-xs italic">Kosong</span>}
        </div>
      ) : (
        <textarea rows={block.type === 'latex' ? 2 : 3} value={block.value} onChange={e => onChange(block.id, e.target.value)}
          placeholder={meta.placeholder}
          className={`w-full p-2 rounded-lg border text-sm outline-none resize-y ${block.type === 'latex' ? 'border-violet-200 bg-white focus:border-violet-400 font-mono text-xs' : 'border-slate-200 focus:border-indigo-400'}`} />
      )}
    </div>
  );
};

const AnswerBlockAdder: React.FC<{ onAdd: (t: BlockType) => void; colorCls?: string }> = ({ onAdd, colorCls = 'border-slate-200' }) => (
  <div className="flex gap-1.5 flex-wrap">
    <button type="button" onClick={() => onAdd('text')}
      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-white border ${colorCls} text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors`}>
      <Type size={11} /> + Teks
    </button>
    <button type="button" onClick={() => onAdd('latex')}
      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 cursor-pointer transition-colors">
      <Sigma size={11} /> + LaTeX
    </button>
    <button type="button" onClick={() => onAdd('image')}
      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 cursor-pointer transition-colors">
      <ImageIcon size={11} /> + Gambar
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export const QuizQuestionDynamic: React.FC<QuizQuestionDynamicProps> = ({ questionId, onFinish }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stageIdx, setStageIdx] = useState(0);

  // Jawaban siswa per stage — multi blok
  const [answerBlocks, setAnswerBlocks] = useState<Record<StageKey, AnswerBlock[]>>({
    diketahui:  [{ id: buid(), type: 'text', value: '' }],
    ditanya:    [{ id: buid(), type: 'text', value: '' }],
    pengerjaan: [{ id: buid(), type: 'text', value: '' }],
    kesimpulan: [{ id: buid(), type: 'text', value: '' }],
  });

  // Kisi-kisi
  const [showHints, setShowHints] = useState(false);
  const [activeHint, setActiveHint] = useState(0);
  const [hintAnswerRevealed, setHintAnswerRevealed] = useState<boolean[]>([]);

  const [finalNumber, setFinalNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [numericCorrect, setNumericCorrect] = useState(false);

  useEffect(() => {
    const fetchQ = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchErr } = await supabase
          .from('questions')
          .select('*')
          .eq('id', questionId)
          .maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!data) {
          setError('Soal tidak ditemukan. Pastikan ID soal valid.');
        } else {
          setQuestion(data as Question);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat soal dari database.');
      } finally {
        setLoading(false);
      }
    };
    if (questionId) fetchQ();
  }, [questionId]);

  // ── answer block helpers ──
  const addAnswerBlock = (sk: StageKey, type: BlockType) =>
    setAnswerBlocks(prev => ({ ...prev, [sk]: [...prev[sk], { id: buid(), type, value: '' }] }));
  const updateAnswerBlock = (sk: StageKey, id: string, value: string) =>
    setAnswerBlocks(prev => ({ ...prev, [sk]: prev[sk].map(b => b.id === id ? { ...b, value } : b) }));
  const removeAnswerBlock = (sk: StageKey, id: string) =>
    setAnswerBlocks(prev => ({ ...prev, [sk]: prev[sk].filter(b => b.id !== id) }));

  // ── flat text representation for summary display ──
  const answerText = (sk: StageKey) =>
    answerBlocks[sk].map(b => b.value.trim()).filter(Boolean).join('\n') || '—';

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-500">Memuat soal...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200">
          <h3 className="font-bold text-sm">Gagal memuat soal</h3>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const keys = parseRmeKeys(question);
  const hints: RmeHint[] = keys.hints || [];
  const contentBlocks = stripRmeMetaBlocks(question.content_blocks || []);
  const stage = STAGES[stageIdx];
  const color = STAGE_COLORS[stage.color];
  const isLast = stageIdx === STAGES.length - 1;

  const handleSubmit = () => {
    setNumericCorrect(numbersMatch(finalNumber, keys.finalNumericAnswer));
    setSubmitted(true);
  };

  const openHints = () => {
    setShowHints(true);
    setActiveHint(0);
    setHintAnswerRevealed(Array(hints.length).fill(false));
  };

  const revealHintAnswer = (i: number) =>
    setHintAnswerRevealed(prev => prev.map((v, idx) => idx === i ? true : v));

  return (
    <div className="w-full max-w-4xl mx-auto p-1 md:p-2 font-sans">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-lg overflow-hidden">

        {/* Judul soal */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-700 p-5 text-white">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block">
            {question.strand} — {question.category} · 4 Tahap RME
          </span>
          <h2 className="text-base font-bold leading-tight mt-1">{question.title || 'Soal Latihan'}</h2>
        </div>

        {/* Narasi soal */}
        <div className="p-5 space-y-3 border-b border-outline-variant/20">
          {contentBlocks.length === 0 && <p className="text-xs text-on-surface-variant italic">Konten soal kosong.</p>}
          {contentBlocks.map((block: any) => {
            if (block?.type === 'image') {
              return <img key={block.id} src={block.value} alt="" className="max-h-56 rounded-xl border border-slate-200 mx-auto" />;
            }
            return (
              <div key={block.id} className="text-sm leading-relaxed text-on-surface">
                <MathRenderer text={block.value || ''} />
              </div>
            );
          })}
        </div>

        {/* ── PROSES PENGERJAAN ── */}
        {!submitted && (
          <div className="p-5 space-y-4">
            {/* Progress bar */}
            <div className="flex gap-1">
              {STAGES.map((s, i) => (
                <div key={s.key}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${i <= stageIdx ? STAGE_COLORS[s.color].badge : 'bg-slate-200'}`} />
              ))}
            </div>

            {/* Stage card */}
            <div className={`rounded-2xl border-2 ${color.border} overflow-hidden`}>
              <div className={`px-4 py-3 ${color.bg} flex items-center gap-3`}>
                <div className={`w-8 h-8 rounded-xl ${color.badge} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white text-[15px]">{stage.icon}</span>
                </div>
                <div>
                  <div className={`font-black text-sm ${color.label} uppercase`}>Tahap {stageIdx + 1} — {stage.label}</div>
                  <div className="text-[10px] text-slate-400">Isi jawabanmu, boleh campurkan teks, LaTeX, dan gambar.</div>
                </div>
              </div>

              <div className="p-4 space-y-3 bg-white">
                {/* Multi-blok jawaban siswa */}
                {answerBlocks[stage.key as StageKey].map(block => (
                  <AnswerBlockEditor
                    key={block.id}
                    block={block}
                    onChange={(id, val) => updateAnswerBlock(stage.key as StageKey, id, val)}
                    onRemove={(id) => removeAnswerBlock(stage.key as StageKey, id)}
                  />
                ))}
                <AnswerBlockAdder
                  onAdd={type => addAnswerBlock(stage.key as StageKey, type)}
                  colorCls={color.border}
                />

                {/* Kisi-kisi — hanya di tahap Pengerjaan */}
                {stage.key === 'pengerjaan' && (
                  <div className="space-y-3 pt-1">
                    {hints.length > 0 && !showHints && (
                      <button onClick={openHints}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 text-amber-800 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-100 transition-colors">
                        <Lightbulb size={16} /> Saya butuh kisi-kisi
                      </button>
                    )}

                    {showHints && (
                      <div className="space-y-3">
                        {hints.map((hint, i) => {
                          if (i > activeHint) return null;
                          const answered = hintAnswerRevealed[i];
                          const isLastHint = i === hints.length - 1;
                          const isActive = i === activeHint;

                          return (
                            <div key={hint.id} className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-3">
                              {/* Header kisi-kisi */}
                              <div className="flex items-center gap-2">
                                <Lightbulb size={14} className="text-amber-500 shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                                  Kisi-kisi {i + 1} dari {hints.length}
                                </span>
                              </div>

                              {/* Pertanyaan pemandu */}
                              <div className="text-sm text-slate-800 bg-white rounded-lg p-3 border border-amber-100">
                                <MathRenderer text={hint.question} />
                              </div>

                              {/* Jawaban kisi-kisi (setelah di-reveal) */}
                              {answered && hint.answer && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1">
                                  <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Jawaban kisi-kisi</div>
                                  <div className="text-sm text-slate-800">
                                    <MathRenderer text={hint.answer} />
                                  </div>
                                </div>
                              )}

                              {/* Tombol aksi — hanya pada kisi-kisi paling aktif */}
                              {isActive && (
                                <div className="flex gap-2 flex-wrap">
                                  {!answered && hint.answer && (
                                    <button onClick={() => revealHintAnswer(i)}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-amber-300 text-amber-700 font-bold text-xs cursor-pointer hover:bg-amber-50 transition-colors">
                                      <Eye size={13} /> Lihat Jawaban
                                    </button>
                                  )}
                                  {!isLastHint && (
                                    <button onClick={() => setActiveHint(i + 1)}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-white font-bold text-xs cursor-pointer hover:bg-amber-600 transition-colors">
                                      Kisi-kisi berikutnya <ChevronRight size={13} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Input jawaban akhir */}
                    <div className="pt-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Jawaban akhir (angka)</label>
                      <input type="text" inputMode="decimal" value={finalNumber}
                        onChange={e => setFinalNumber(e.target.value)}
                        placeholder="Contoh: 42"
                        className="w-full p-3 rounded-xl border-2 border-amber-200 font-mono text-lg outline-none focus:border-amber-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigasi antar tahap */}
            <div className="flex gap-2">
              {stageIdx > 0 && (
                <button onClick={() => setStageIdx(i => i - 1)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                  Sebelumnya
                </button>
              )}
              {!isLast ? (
                <button onClick={() => setStageIdx(i => i + 1)}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-1 cursor-pointer hover:bg-indigo-700 transition-colors">
                  Lanjut <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!finalNumber.trim()}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:bg-slate-300 cursor-pointer flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors">
                  <CheckCircle size={16} /> Cek jawaban akhir
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── HASIL ── */}
        {submitted && (
          <div className="p-5 space-y-4">
            {/* Verdict */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${numericCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${numericCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                <span className="material-symbols-outlined">{numericCorrect ? 'verified' : 'close'}</span>
              </div>
              <div>
                <h3 className={`font-bold ${numericCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {numericCorrect ? 'Jawaban akhir tepat!' : 'Jawaban akhir belum tepat'}
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  Isianmu: <span className="font-mono font-bold">{finalNumber || '—'}</span>
                  {' · '}Kunci: <span className="font-mono font-bold">{keys.finalNumericAnswer ?? '—'}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Angka dicocokkan persis dengan kunci jawaban.</p>
              </div>
            </div>

            {/* Rekap per tahap */}
            {STAGES.map(s => (
              <div key={s.key} className={`rounded-xl border ${STAGE_COLORS[s.color].border} p-4`}>
                <div className={`text-xs font-black uppercase mb-2 ${STAGE_COLORS[s.color].label}`}>Tahap {s.label}</div>

                {/* Jawaban siswa (render blok) */}
                <div className="text-xs text-slate-500 mb-1">Jawabanmu</div>
                <div className="space-y-1 mb-3">
                  {answerBlocks[s.key as StageKey].some(b => b.value.trim()) ? (
                    answerBlocks[s.key as StageKey].map(b => {
                      if (!b.value.trim()) return null;
                      if (b.type === 'image') return <img key={b.id} src={b.value} alt="" className="max-h-32 rounded-lg border border-slate-200 object-contain" />;
                      return <div key={b.id} className="text-sm"><MathRenderer text={b.value} /></div>;
                    })
                  ) : (
                    <p className="text-sm text-slate-400 italic">—</p>
                  )}
                </div>

                {/* Kunci acuan */}
                {keys[`ref_${s.key}` as 'ref_diketahui'] && (
                  <>
                    <div className="text-xs font-bold text-indigo-600 mb-1">Kunci acuan</div>
                    <RefBlocks raw={String(keys[`ref_${s.key}` as 'ref_diketahui'])} />
                  </>
                )}
              </div>
            ))}

            <button onClick={onFinish}
              className="w-full py-3 rounded-xl bg-surface-container-high font-bold text-sm cursor-pointer hover:bg-surface-container-highest transition-colors">
              Kembali ke daftar soal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// RefBlocks — render kunci acuan (JSON blok baru atau string lama)
// ─────────────────────────────────────────────────────────────
const RefBlocks: React.FC<{ raw: string }> = ({ raw }) => {
  if (!raw) return null;
  try {
    const blocks = JSON.parse(raw);
    if (Array.isArray(blocks)) {
      return (
        <div className="space-y-1">
          {blocks.map((b: { type: string; value: string }, i: number) => {
            if (!b.value?.trim()) return null;
            if (b.type === 'image') {
              return <img key={i} src={b.value} alt="" className="max-h-40 rounded-lg border border-slate-200 object-contain" />;
            }
            return <MathRenderer key={i} text={b.value} className="text-sm" />;
          })}
        </div>
      );
    }
  } catch { /* not JSON — plain string */ }
  return <MathRenderer text={raw} className="text-sm" />;
};
