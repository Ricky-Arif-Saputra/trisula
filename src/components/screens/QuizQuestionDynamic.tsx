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
import { Lightbulb, CheckCircle, ChevronRight } from 'lucide-react';

interface QuizQuestionDynamicProps {
  questionId: string;
  onFinish: () => void;
  onBack?: () => void;
}

type StageKey = 'diketahui' | 'ditanya' | 'pengerjaan' | 'kesimpulan';

export const QuizQuestionDynamic: React.FC<QuizQuestionDynamicProps> = ({ questionId, onFinish }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stageIdx, setStageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<StageKey, string>>({
    diketahui: '', ditanya: '', pengerjaan: '', kesimpulan: '',
  });
  const [showHints, setShowHints] = useState(false);
  const [activeHint, setActiveHint] = useState(0);
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

  return (
    <div className="w-full max-w-4xl mx-auto p-1 md:p-2 font-sans">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-violet-700 p-5 text-white">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block">
            {question.strand} — {question.category} · 4 Tahap RME
          </span>
          <h2 className="text-base font-bold leading-tight mt-1">{question.title || 'Soal Latihan'}</h2>
        </div>

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

        {!submitted && (
          <div className="p-5 space-y-4">
            <div className="flex gap-1">
              {STAGES.map((s, i) => (
                <div
                  key={s.key}
                  className={`flex-1 h-1.5 rounded-full ${i <= stageIdx ? STAGE_COLORS[s.color].badge : 'bg-slate-200'}`}
                />
              ))}
            </div>

            <div className={`rounded-2xl border-2 ${color.border} overflow-hidden`}>
              <div className={`px-4 py-3 ${color.bg} flex items-center gap-3`}>
                <div className={`w-8 h-8 rounded-xl ${color.badge} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white text-[15px]">{stage.icon}</span>
                </div>
                <div>
                  <div className={`font-black text-sm ${color.label} uppercase`}>Tahap {stageIdx + 1} — {stage.label}</div>
                  <div className="text-[10px] text-slate-400">Isi sesuai tahap ini, lalu lanjut.</div>
                </div>
              </div>
              <div className="p-4 space-y-4 bg-white">
                <textarea
                  rows={stage.key === 'pengerjaan' ? 6 : 4}
                  value={answers[stage.key]}
                  onChange={e => setAnswers(prev => ({ ...prev, [stage.key]: e.target.value }))}
                  placeholder={stage.placeholder}
                  className={`w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm outline-none resize-y ${color.ring}`}
                />

                {stage.key === 'pengerjaan' && (
                  <>
                    {hints.length > 0 && !showHints && (
                      <button
                        onClick={() => {
                          setShowHints(true);
                          setActiveHint(0);
                        }}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 text-amber-800 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lightbulb size={16} /> Saya butuh kisi-kisi
                      </button>
                    )}

                    {showHints && hints.map((hint, i) => {
                      if (i > activeHint) return null;
                      const isLast = i === hints.length - 1;
                      return (
                        <div key={hint.id} className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                          <div className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                            Kisi-kisi {i + 1} dari {hints.length}
                          </div>
                          <div className="text-sm text-slate-800">
                            <MathRenderer text={hint.question} />
                          </div>
                          {i === activeHint && !isLast && (
                            <button
                              onClick={() => setActiveHint(i + 1)}
                              className="w-full py-2 rounded-lg bg-amber-500 text-white font-bold text-xs cursor-pointer hover:bg-amber-600 transition-colors"
                            >
                              Kisi-kisi berikutnya →
                            </button>
                          )}
                        </div>
                      );
                    })}

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Jawaban akhir (angka saja)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={finalNumber}
                        onChange={e => setFinalNumber(e.target.value)}
                        placeholder="Contoh: 42"
                        className="w-full p-3 rounded-xl border-2 border-amber-200 font-mono text-lg outline-none focus:border-amber-400"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {stageIdx > 0 && (
                <button
                  onClick={() => setStageIdx(i => i - 1)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm cursor-pointer"
                >
                  Sebelumnya
                </button>
              )}
              {!isLast ? (
                <button
                  onClick={() => setStageIdx(i => i + 1)}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  Lanjut <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!finalNumber.trim()}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:bg-slate-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Cek jawaban akhir
                </button>
              )}
            </div>
          </div>
        )}

        {submitted && (
          <div className="p-5 space-y-4">
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${numericCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${numericCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
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

            {STAGES.map(s => (
              <div key={s.key} className={`rounded-xl border ${STAGE_COLORS[s.color].border} p-4`}>
                <div className={`text-xs font-black uppercase mb-2 ${STAGE_COLORS[s.color].label}`}>Tahap {s.label}</div>
                <div className="text-xs text-slate-500 mb-1">Jawabanmu</div>
                <p className="text-sm whitespace-pre-wrap mb-3">{answers[s.key] || '—'}</p>
                {keys[`ref_${s.key}` as 'ref_diketahui'] && (
                  <>
                    <div className="text-xs font-bold text-indigo-600 mb-1">Kunci acuan</div>
                    <RefBlocks raw={String(keys[`ref_${s.key}` as 'ref_diketahui'])} />
                  </>
                )}
              </div>
            ))}

            <button
              onClick={onFinish}
              className="w-full py-3 rounded-xl bg-surface-container-high font-bold text-sm cursor-pointer"
            >
              Kembali ke daftar soal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Render kunci acuan stage — mendukung format JSON blok baru maupun string plain lama
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
  } catch { /* not JSON */ }
  // Fallback: plain string / single LaTeX
  return <MathRenderer text={raw} className="text-sm" />;
};
