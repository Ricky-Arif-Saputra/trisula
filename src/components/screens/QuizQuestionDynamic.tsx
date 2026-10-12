import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import type { Question } from '../../hooks/useQuestions';
import { MathRenderer } from '../MathRenderer';
import { MathInput } from '../MathInput';
import {
  STAGES,
  STAGE_COLORS,
  parseRmeKeys,
  stripRmeMetaBlocks,
  numbersMatch,
  type RmeHint,
} from './LatihanTypes';
import { nilaiTahap } from '../../lib/aiScoring';
import { Lightbulb, CheckCircle, ChevronRight, Plus, Type, Sigma, ImageIcon, Trash2 } from 'lucide-react';

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

  return (
    <div className={`rounded-xl border ${meta.border} ${meta.bg} p-2.5 space-y-1.5`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest ${
          block.type === 'latex' ? 'text-violet-600' : block.type === 'image' ? 'text-sky-600' : 'text-slate-500'
        }`}>
          {block.type === 'latex' ? <Sigma size={11} className="inline mr-1" /> : block.type === 'image' ? <ImageIcon size={11} className="inline mr-1" /> : <Type size={11} className="inline mr-1" />}
          {meta.label}
        </span>
        <button type="button" onClick={() => onRemove(block.id)}
          className="w-6 h-6 rounded-md text-rose-400 hover:bg-rose-100 flex items-center justify-center cursor-pointer">
          <Trash2 size={11} />
        </button>
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
      ) : block.type === 'latex' ? (
        <MathInput
          value={block.value}
          onChange={v => onChange(block.id, v)}
          rows={2}
          placeholder={meta.placeholder}
          displayMode={true}
        />
      ) : (
        /* Teks biasa — cukup satu textarea, tidak perlu preview */
        <textarea
          rows={3}
          value={block.value}
          onChange={e => onChange(block.id, e.target.value)}
          placeholder={meta.placeholder}
          className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm outline-none resize-y focus:border-indigo-400"
        />
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
  const { user, userName, userNisn } = useAuth();
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
  const [startedAt] = useState<string>(new Date().toISOString());

  // AI scoring state
  const [scoring, setScoring] = useState(false);  // sedang memanggil AI
  const [scoringStage, setScoringStage] = useState('');  // label tahap yang sedang dinilai
  const [aiScores, setAiScores] = useState<Record<string, { skor: number; skor_maks: number; alasan: string }>>({});

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

  const handleSubmit = async () => {
    if (!question) return;
    const isCorrect = numbersMatch(finalNumber, keys.finalNumericAnswer);
    setNumericCorrect(isCorrect);
    setSubmitted(true);
    setScoring(true);

    const stageKeys = ['diketahui', 'ditanya', 'pengerjaan', 'kesimpulan'] as const;
    const scoreMap: Record<string, { skor: number; skor_maks: number; alasan: string }> = {};

    // Panggil AI per tahap — jika gagal (lokal/timeout), isi dengan fallback
    const STAGE_LABELS_MAP: Record<string, string> = {
      diketahui: 'Diketahui', ditanya: 'Ditanya', pengerjaan: 'Pengerjaan', kesimpulan: 'Kesimpulan',
    };
    for (let si = 0; si < stageKeys.length; si++) {
      const sk = stageKeys[si];      // Flatten multi-blok ke teks yang bisa dibaca AI
      // - blok teks: ambil apa adanya
      // - blok latex: wrap dengan $$ agar AI tahu itu persamaan matematika
      // - blok gambar: skip (AI tidak bisa memproses gambar)
      const jawabanTahap = answerBlocks[sk]
        .map(b => {
          if (!b.value.trim()) return '';
          if (b.type === 'latex') return `$$${b.value.trim()}$$`;
          if (b.type === 'image') return '[gambar]';
          return b.value.trim();
        })
        .filter(Boolean)
        .join('\n');
      const rubrik   = (keys as any)[`ref_${sk}`] as string || '';
      const skorMaks = (keys as any)[`points_${sk}`] as number || 20;

      // Update progress label
      setScoringStage(`Menilai Tahap ${STAGE_LABELS_MAP[sk]} (${si + 1}/4)...`);

      // Jeda antar tahap untuk menghindari rate limit Gemini
      if (si > 0) {
        await new Promise(r => setTimeout(r, 1500));
      }

      // Flatten rubrik: bisa berupa JSON blok array atau plain string
      let rubrikText = rubrik;
      try {
        const parsed = JSON.parse(rubrik);
        if (Array.isArray(parsed)) {
          rubrikText = parsed
            .map((b: { type: string; value: string }) => {
              if (!b.value?.trim()) return '';
              if (b.type === 'latex') return `$$${b.value.trim()}$$`;
              return b.value.trim();
            })
            .filter(Boolean)
            .join('\n');
        }
      } catch { /* plain string, pakai langsung */ }

      try {
        const result = await nilaiTahap({
          soalId:   question.id,
          tahap:    sk,
          jawaban:  jawabanTahap || '—',
          rubrik:   rubrikText || `Berikan nilai untuk tahap ${sk}`,
          skorMaks,
        });
        scoreMap[sk] = { skor: result.skor, skor_maks: skorMaks, alasan: result.alasan };
        // Update progress secara realtime
        setAiScores(prev => ({ ...prev, [sk]: scoreMap[sk] }));
      } catch (e: any) {
        // API tidak tersedia (dev lokal) atau timeout — beri skor 0 dengan keterangan
        const isNetworkErr = e.message?.includes('Tidak dapat terhubung') || e.message?.includes('timeout');
        scoreMap[sk] = {
          skor: 0,
          skor_maks: skorMaks,
          alasan: isNetworkErr
            ? 'Penilaian AI tidak tersedia (perlu deploy ke Vercel). Skor ini belum final.'
            : `Gagal dinilai: ${e.message}`,
        };
      }
    }

    setAiScores(scoreMap);
    setScoring(false);

    // Hitung total skor
    const totalSkor = Object.values(scoreMap).reduce((s, v) => s + v.skor, 0);
    const totalMaks = Object.values(scoreMap).reduce((s, v) => s + v.skor_maks, 0);
    const normScore = totalMaks > 0 ? Math.round((totalSkor / totalMaks) * 100) : 0;

    // Simpan ke tabel jawaban
    if (user) {
      try {
        const answerJson = JSON.stringify({
          diketahui:  answerBlocks.diketahui.map(b => b.value).join('\n'),
          ditanya:    answerBlocks.ditanya.map(b => b.value).join('\n'),
          pengerjaan: answerBlocks.pengerjaan.map(b => b.value).join('\n'),
          kesimpulan: answerBlocks.kesimpulan.map(b => b.value).join('\n'),
          finalNumber,
          isCorrect,
          ai_scores: scoreMap,
          total_skor: totalSkor,
          total_maks: totalMaks,
          student_name: userName,
          student_nisn: userNisn,
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          test_type: question.test_type,
          strand: question.strand,
        });
        const { error: insertErr } = await supabase.from('jawaban').insert([{
          user_id:   user.id,
          soal_id:   question.id,
          jawaban:   answerJson,
          skor:      normScore,
          skor_maks: 100,
          alasan:    isCorrect ? 'Jawaban angka akhir benar.' : 'Jawaban angka akhir tidak tepat.',
        }]);
        if (insertErr) console.error('Gagal simpan jawaban:', insertErr.message);
      } catch (e) { console.error(e); }
    }
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
                </button>              )}
            </div>
          </div>
        )}

        {/* ── LOADING AI ── */}
        {submitted && scoring && (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-700">AI sedang menilai jawabanmu...</p>
              <p className="text-xs text-indigo-500 font-bold mt-1">{scoringStage}</p>
              <p className="text-xs text-slate-400 mt-1">Mohon tunggu, proses ini otomatis</p>
            </div>
            {/* Progress dots */}
            <div className="flex gap-2">
              {['Diketahui','Ditanya','Pengerjaan','Kesimpulan'].map((label, i) => {
                const stageKeyMap = ['diketahui','ditanya','pengerjaan','kesimpulan'];
                const isDone = aiScores[stageKeyMap[i]] !== undefined;
                const isCurrent = scoringStage.includes(label);
                return (
                  <div key={label} className={`flex flex-col items-center gap-1`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isDone ? 'bg-emerald-500 text-white' :
                      isCurrent ? 'bg-indigo-600 text-white animate-pulse' :
                      'bg-slate-200 text-slate-400'
                    }`}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── HASIL ── */}
        {submitted && !scoring && (
          <div className="p-5 space-y-4">
            {/* Verdict jawaban angka */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${numericCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${numericCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                <span className="material-symbols-outlined">{numericCorrect ? 'verified' : 'close'}</span>
              </div>
              <div>
                <h3 className={`font-bold ${numericCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {numericCorrect ? 'Jawaban angka tepat!' : 'Jawaban angka belum tepat'}
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  Isianmu: <span className="font-mono font-bold">{finalNumber || '—'}</span>
                  {' · '}Kunci: <span className="font-mono font-bold">{keys.finalNumericAnswer ?? '—'}</span>
                </p>
              </div>
            </div>

            {/* Skor total AI */}
            {Object.keys(aiScores).length > 0 && (() => {
              const total = Object.values(aiScores).reduce((s, v) => s + v.skor, 0);
              const maks  = Object.values(aiScores).reduce((s, v) => s + v.skor_maks, 0);
              const pct   = maks > 0 ? Math.round(total / maks * 100) : 0;
              const c     = pct >= 75 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                          : pct >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200'
                          : 'text-rose-600 bg-rose-50 border-rose-200';
              return (
                <div className={`flex items-center justify-between p-4 rounded-xl border ${c}`}>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Total Skor AI</p>
                    <p className="text-2xl font-black mt-0.5">{pct}<span className="text-sm font-bold">/100</span></p>
                  </div>
                  <div className="text-right text-xs opacity-70">
                    <p>{total} / {maks} poin</p>
                    <p className="mt-0.5">dari 4 tahap</p>
                  </div>
                </div>
              );
            })()}

            {/* Detail per tahap */}
            {STAGES.map(s => {
              const ai = aiScores[s.key];
              const color = STAGE_COLORS[s.color];
              return (
                <div key={s.key} className={`rounded-xl border-2 ${color.border} overflow-hidden`}>
                  {/* Header tahap */}
                  <div className={`px-4 py-2.5 ${color.bg} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${color.badge} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-white text-[12px]">{s.icon}</span>
                      </div>
                      <span className={`text-xs font-black uppercase ${color.label}`}>Tahap {s.label}</span>
                    </div>
                    {ai && (
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        ai.skor / ai.skor_maks >= 0.75
                          ? 'bg-emerald-100 text-emerald-700'
                          : ai.skor / ai.skor_maks >= 0.5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {ai.skor} / {ai.skor_maks} poin
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    {/* Jawaban siswa */}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jawabanmu</p>
                      <div className="space-y-2">
                        {answerBlocks[s.key as StageKey].some(b => b.value.trim()) ? (
                          answerBlocks[s.key as StageKey].map(b => {
                            if (!b.value.trim()) return null;
                            if (b.type === 'image') {
                              return <img key={b.id} src={b.value} alt="" className="max-h-32 rounded-lg border object-contain" />;
                            }
                            if (b.type === 'latex') {
                              // Blok latex: value adalah pure expression, render sebagai display math
                              return (
                                <div key={b.id} className="overflow-x-auto py-1">
                                  <MathRenderer text={`$$${b.value}$$`} className="text-sm" />
                                </div>
                              );
                            }
                            // Teks biasa (bisa mengandung $inline$ atau $$display$$)
                            return <div key={b.id} className="text-sm text-slate-700"><MathRenderer text={b.value} /></div>;
                          })
                        ) : (
                          <p className="text-sm text-slate-400 italic">—</p>
                        )}
                      </div>
                    </div>

                    {/* Feedback AI */}
                    {ai && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">smart_toy</span>
                          Evaluasi AI
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">{ai.alasan}</p>
                      </div>
                    )}

                    {/* Kunci acuan */}
                    {keys[`ref_${s.key}` as 'ref_diketahui'] && (
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Kunci Acuan</p>
                        <div className="bg-indigo-50/50 rounded-lg p-2">
                          <RefBlocks raw={String(keys[`ref_${s.key}` as 'ref_diketahui'])} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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
