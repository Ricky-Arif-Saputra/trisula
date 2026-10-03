import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Question } from '../../hooks/useQuestions';

interface QuizQuestionDynamicProps {
  questionId: string;
  onFinish: () => void;
  onBack?: () => void;
}

export const QuizQuestionDynamic: React.FC<QuizQuestionDynamicProps> = ({ questionId, onFinish }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User input states
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchQ = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchErr } = await supabase
          .from('questions')
          .select('*')
          .eq('id', questionId)
          .maybeSingle(); // maybeSingle() aman: tidak throws jika data null
          
        if (fetchErr) {
          throw fetchErr;
        }
        if (!data) {
          setError('Soal tidak ditemukan. Pastikan ID soal valid.');
        } else {
          setQuestion(data as Question);
        }
      } catch (err: any) {
        console.error('Failed to fetch dynamic question:', err);
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
          <span className="text-sm font-bold text-slate-500">Memuat soal dinamis...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-4">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="material-symbols-outlined text-3xl">error</span>
          <div>
            <h3 className="font-bold text-sm">Gagal memuat soal</h3>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return null; // Fallback jika tidak ada question namun tidak loading dan tidak ada error
  }

  // Safe JSON Parser Helper
  const safeParse = (data: any) => {
    if (!data) return [];
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch (e) { return []; }
    }
    return Array.isArray(data) ? data : [];
  };

  // Defensive array checks
  const safeContentBlocks = safeParse(question.content_blocks);
  const safeOptions = safeParse(question.options);

  const handleToggleOption = (optId: string) => {
    if (hasSubmitted) return;
    setSelectedOptions(prev => 
      prev.includes(optId) ? prev.filter(id => id !== optId) : [...prev, optId]
    );
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
  };

  // Evaluate correctness
  const correctOptionIds = safeOptions.filter(o => o.is_correct).map(o => o.id);
  const isAllCorrect = 
    selectedOptions.length === correctOptionIds.length && 
    correctOptionIds.every(id => selectedOptions.includes(id));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 font-sans">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-surface-container p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md font-black">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                Topik: {question.strand} — {question.category}
              </span>
              <h2 className="text-base font-bold text-on-surface font-serif leading-tight">
                {question.title || 'Soal Dinamis'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {question.has_simulation && (
              <span className="px-2 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[10px] font-bold rounded flex items-center gap-1 uppercase">
                <span className="material-symbols-outlined text-[12px]">science</span> RME Aktif
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Dynamic Content Blocks */}
          <div className="space-y-4 mb-6">
            {safeContentBlocks.length === 0 && (
              <p className="text-xs text-on-surface-variant italic">Konten soal kosong.</p>
            )}
            {safeContentBlocks.map((block: any) => {
              if (block?.type === 'text') {
                return (
                  <p key={block?.id} className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                    {block?.value}
                  </p>
                );
              } else if (block?.type === 'latex') {
                return (
                  <div key={block?.id ?? Math.random()} className="my-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
                    <code className="text-emerald-700 dark:text-emerald-400 font-mono text-sm whitespace-pre-wrap">
                      {block?.value || ''}
                    </code>
                  </div>
                );
              } else if (block?.type === 'image') {
                return (
                  <div key={block?.id} className="my-4 flex justify-center">
                    <img src={block?.value} alt="Ilustrasi soal" className="max-h-64 rounded-xl border border-outline-variant/30 shadow-sm" />
                  </div>
                );
              }
              return null;
            })}
          </div>



          {/* Options */}
          <div className="flex flex-col gap-3 mb-6">
            {safeOptions.length === 0 && (
              <p className="text-xs text-on-surface-variant italic">Pilihan jawaban belum tersedia.</p>
            )}
            {safeOptions.map((opt) => {
              const isSelected = selectedOptions.includes(opt.id);
              const isCorrectOpt = opt.is_correct;
              
              let btnClass = "border-outline-variant/30 hover:border-primary text-on-surface";
              if (hasSubmitted) {
                if (isSelected && isCorrectOpt) btnClass = "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
                else if (isSelected && !isCorrectOpt) btnClass = "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400";
                else if (!isSelected && isCorrectOpt) btnClass = "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
                else btnClass = "border-outline-variant/30 text-on-surface-variant opacity-50";
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary ring-2 ring-primary/30";
              }

              return (
                <button key={opt.id} disabled={hasSubmitted} onClick={() => handleToggleOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${btnClass}`}>
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${isSelected ? (hasSubmitted ? (isCorrectOpt ? 'bg-emerald-500 border-emerald-500' : 'bg-rose-500 border-rose-500') : 'bg-primary border-primary') : 'border-outline-variant'}`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                  </div>
                  <div className="flex items-start gap-2 flex-1">
                    <span className="font-bold text-sm shrink-0">{opt.id}.</span>
                    <span className="text-sm font-semibold">{opt.text}</span>
                  </div>
                  {hasSubmitted && !isSelected && isCorrectOpt && <span className="text-[10px] text-amber-600 font-bold shrink-0">*Terlewat</span>}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {!hasSubmitted && (
            <button disabled={selectedOptions.length === 0} onClick={handleSubmit}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedOptions.length > 0 ? 'bg-primary text-on-primary hover:opacity-90 shadow-md cursor-pointer' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'}`}>
              Submit Jawaban
            </button>
          )}

          {/* Feedback & RME Simulation section */}
          {hasSubmitted && (
            <div className="mt-8 pt-8 border-t border-outline-variant/30 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className={`p-4 rounded-xl flex items-start gap-4 border ${isAllCorrect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isAllCorrect ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  <span className="material-symbols-outlined">{isAllCorrect ? 'verified' : 'fact_check'}</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isAllCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {isAllCorrect ? 'Tepat Sekali!' : 'Masih ada yang kurang tepat.'}
                  </h3>
                  <p className={`text-sm ${isAllCorrect ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'}`}>
                    {isAllCorrect ? 'Kamu telah memilih semua jawaban yang benar.' : 'Periksa kembali opsi yang ditandai merah atau terlewat.'}
                  </p>
                </div>
              </div>

              {/* RME Simulation Placeholder (jika diaktifkan) */}
              {question.has_simulation && (
                <div className="border border-violet-200 dark:border-violet-800 rounded-2xl overflow-hidden shadow-md">
                  <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined">science</span>
                      Laboratorium Visualisasi RME
                    </h4>
                    <p className="text-violet-100 text-xs mt-1">
                      Mari kita bedah konsep soal ini dengan simulasi interaktif agar lebih paham!
                    </p>
                  </div>
                  <div className="p-8 bg-white dark:bg-slate-900 text-center">
                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 text-violet-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <span className="material-symbols-outlined text-3xl">model_training</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Modul Simulasi Dinamis sedang disiapkan...
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      (Dalam implementasi penuh, area ini akan me-render komponen Canvas/SVG interaktif spesifik untuk soal ini yang diatur dari backend)
                    </p>
                  </div>
                </div>
              )}

              <button onClick={onFinish}
                className="w-full py-4 rounded-xl font-bold text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Kembali ke Daftar Latihan Soal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
