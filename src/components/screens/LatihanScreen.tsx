import React, { useState, useEffect } from 'react';
import { MathCategory } from '../../types';
import { QuizQuestionDynamic } from './QuizQuestionDynamic';
import { ErrorBoundary } from '../ErrorBoundary';
import { useQuestions, type Question, type Difficulty } from '../../hooks/useQuestions';
import { useAuth } from '../Auth/AuthProvider';
import { LatihanQuestionForm } from './LatihanQuestionForm';
import { DIFF_BADGE, parseRmeKeys, stripRmeMetaBlocks } from './LatihanTypes';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface LatihanScreenProps {
  initialCategory?: MathCategory | null;
  onSelectCategory?: (category: MathCategory | null) => void;
  onClaimXp?: (amount: number) => void;
  onNavigateToSimulasi?: () => void;
}

type QuizMode = 'mandiri' | 'time_attack' | 'lab';

export const LatihanScreen: React.FC<LatihanScreenProps> = ({
  initialCategory = null,
  onSelectCategory,
  onClaimXp,
  onNavigateToSimulasi,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MathCategory | null>(initialCategory);
  
  // Quiz State
  const [quizLevel, setQuizLevel] = useState<'mudah' | 'sedang' | 'sulit'>('mudah');
  const [quizMode, setQuizMode] = useState<QuizMode>('mandiri');
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  
  // Dummy Quiz Progress State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  // ID soal dinamis dari Supabase — disimpan eksplisit di state, bukan localStorage
  const [dbQuestionId, setDbQuestionId] = useState<string>('');
  
  // Sync prop
  useEffect(() => {
    setSelectedCategory(initialCategory);
    setIsQuizActive(false);
    setIsQuizFinished(false);
  }, [initialCategory]);

  const handleSelectCat = (cat: MathCategory | null) => {
    setSelectedCategory(cat);
    if (onSelectCategory) onSelectCategory(cat);
    setIsQuizActive(false);
    setIsQuizFinished(false);
  };

  const handleStartQuiz = (mode: QuizMode) => {
    setQuizMode(mode);
    setIsQuizActive(true);
    setIsQuizFinished(false);
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedAnswer(null);
    setSelectedQuestion(null);
  };

  const handleAnswer = (idx: number, isCorrect: boolean) => {
    setSelectedAnswer(idx);
    setTimeout(() => {
      if (isCorrect) setScore(s => s + 10);
      
      if (currentQuestionIdx < 4) {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsQuizFinished(true);
        setIsQuizActive(false);
        if (onClaimXp) onClaimXp(score + 10); // Claim XP
      }
    }, 1000);
  };

  // ==============================================================
  // VIEW 1: DAFTAR 5 TOPIK LATIHAN UTAMA
  // ==============================================================
  if (selectedCategory === null) {
    return (
      <div className="flex flex-col w-full pb-16 font-sans">
        <section className="px-margin-mobile pt-space-sm pb-space-md flex flex-col gap-space-sm">
          <div className="p-space-lg rounded-2xl bg-gradient-to-br from-[#1e1b4b] to-[#4338ca] text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#818cf8] to-[#c084fc] text-white flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-2xl">
                <span className="material-symbols-outlined">sports_esports</span>
              </div>
              <div>
                <span className="text-[11px] text-[#a5b4fc] uppercase tracking-wider font-extrabold">
                  Exercise & Quiz System
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  Pusat Latihan Matematika
                </h2>
              </div>
            </div>
          </div>
        </section>

        <section className="px-margin-mobile flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['bilangan', 'aljabar', 'geometri', 'trigonometri', 'peluang'] as const).map((cat) => {
              const icons = { bilangan: '🔢', aljabar: '➗', geometri: '📐', trigonometri: '🌊', peluang: '📊' };
              const titles = { bilangan: 'Bilangan', aljabar: 'Aljabar', geometri: 'Geometri & Pengukuran', trigonometri: 'Trigonometri', peluang: 'Data & Peluang' };
              return (
                <div
                  key={cat}
                  onClick={() => handleSelectCat(cat)}
                  className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col gap-4 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{icons[cat]}</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">High Score: 850</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                      {titles[cat]}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">10 Soal • Estimasi 15 Menit</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // ==============================================================
  // VIEW 2: DAFTAR SOAL PER TINGKAT (admin bisa tambah langsung di sini)
  // ==============================================================
  if (!isQuizActive && !isQuizFinished) {
    return (
      <QuizListView
        selectedCategory={selectedCategory as MathCategory}
        quizLevel={quizLevel}
        onChangeLevel={setQuizLevel}
        onSelectQuestion={(idx, id) => {
          if (id) setDbQuestionId(id);
          setSelectedQuestion(idx);
          setQuizMode('mandiri');
          setIsQuizActive(true);
        }}
        onBack={() => handleSelectCat(null)}
      />
    );
  }

  // ==============================================================
  // VIEW 3: VIRTUAL LAB (LEGACY KLINOMETER RE-USED FOR TRIGONOMETRI)
  // ==============================================================
  if (isQuizActive && quizMode === 'lab') {
    return (
      <div className="flex flex-col w-full px-margin-mobile pb-space-2xl space-y-space-md animate-in fade-in pt-4">
         <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-md text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">construction</span>
            <h3 className="font-bold text-lg">Virtual Lab Klinometer Terbuka</h3>
            <p className="text-sm text-on-surface-variant mt-2">
              (Integrasi Lab 3D Trigonometri dari versi sebelumnya berjalan di sini).
            </p>
            <button 
              onClick={() => setIsQuizActive(false)}
              className="mt-6 px-6 py-2 bg-primary text-on-primary font-bold rounded-lg cursor-pointer"
            >
              Tutup Lab
            </button>
         </div>
      </div>
    );
  }

  // ==============================================================
  // VIEW 4: ACTIVE QUIZ UI
  // ==============================================================
  if (isQuizActive) {
    if (quizMode === 'mandiri') {

      // ── Soal dinamis dari Supabase (idx 9000+) ──
      if (selectedQuestion !== null && selectedQuestion >= 9000) {
        return (
          <div className="flex flex-col w-full pb-16 font-sans px-margin-mobile animate-in fade-in pt-4 relative">
            <button
              onClick={() => { setSelectedQuestion(null); setIsQuizActive(false); }}
              className="mb-4 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs flex items-center gap-2 self-start hover:bg-surface-container-highest cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Kembali ke Daftar Soal
            </button>
            <ErrorBoundary>
              <QuizQuestionDynamic
                questionId={dbQuestionId}
                onFinish={() => { setSelectedQuestion(null); setIsQuizActive(false); }}
              />
            </ErrorBoundary>
          </div>
        );
      }

      if (selectedQuestion === null) {
        return (
          <QuizListView
            selectedCategory={selectedCategory as MathCategory}
            quizLevel={quizLevel}
            onChangeLevel={setQuizLevel}
            onSelectQuestion={(idx, id) => {
              if (id) setDbQuestionId(id);
              setSelectedQuestion(idx);
            }}
            onBack={() => setIsQuizActive(false)}
          />
        );
      }
    }
    
    // Fallback if other mode (like time attack if somehow accessed)
    return null;
  }

  // ==============================================================
  // VIEW 5: QUIZ SUMMARY PAGE
  // ==============================================================
  if (isQuizFinished) {
    const accuracy = (score / 50) * 100;
    return (
      <div className="flex flex-col w-full pb-16 font-sans px-margin-mobile animate-in zoom-in-95 pt-8">
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>

          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-secondary to-primary text-white flex items-center justify-center shadow-lg relative z-10">
            <span className="material-symbols-outlined text-5xl">workspace_premium</span>
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-on-surface mb-1">Kuis Selesai!</h2>
            <p className="text-sm text-on-surface-variant">Kamu telah menyelesaikan latihan {selectedCategory}.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full relative z-10">
            <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center border border-outline-variant/20">
              <span className="text-3xl font-black text-primary mb-1">{score}</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Skor Akhir</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center border border-outline-variant/20">
              <span className="text-3xl font-black text-secondary mb-1">{accuracy}%</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Akurasi</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center border border-outline-variant/20">
              <span className="text-3xl font-black text-[#D97706] mb-1">04:12</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Waktu</span>
            </div>
          </div>

          <div className="w-full space-y-3 mt-2 relative z-10">
            <button 
              onClick={() => handleStartQuiz(quizMode)}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Ulangi Latihan
            </button>
            <button 
              onClick={() => handleSelectCat(null)}
              className="w-full py-3.5 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Kembali ke Daftar Topik
            </button>
          </div>

        </div>
      </div>
    );
  }


  return null;
};

// ==============================================================
// QuizListView — Komponen Daftar Soal dengan Supabase Realtime
// Menampilkan soal statis (bilangan/aljabar) + soal dinamis dari DB
// ==============================================================

interface QuizListViewProps {
  selectedCategory: MathCategory;
  quizLevel: 'mudah' | 'sedang' | 'sulit';
  onChangeLevel?: (lvl: 'mudah' | 'sedang' | 'sulit') => void;
  onSelectQuestion: (idx: number, id?: string) => void;
  onBack: () => void;
}

const QuizListView: React.FC<QuizListViewProps> = ({
  selectedCategory, quizLevel, onChangeLevel, onSelectQuestion,
}) => {
  const { isAdmin } = useAuth();
  const { questions, loading, error, refetch } = useQuestions(
    selectedCategory as any,
    'latihan',
    quizLevel as Difficulty,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus soal ini dari daftar latihan?')) return;
    await supabase.from('questions').delete().eq('id', id);
    refetch();
  };

  return (
    <div className="flex flex-col w-full pb-16 font-sans px-margin-mobile animate-in fade-in pt-4">
      <div className="bg-surface-container-lowest dark:bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-md">

        <div className="flex items-center justify-between mb-1 gap-3">
          <h3 className="text-lg font-bold text-on-surface capitalize">
            Latihan {selectedCategory} — <span className="capitalize">{quizLevel}</span>
          </h3>
          <div className="flex items-center gap-2">
            {isAdmin && !formOpen && (
              <button
                onClick={() => { setEditing(null); setFormOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700"
              >
                <Plus size={14} /> Tambah soal
              </button>
            )}
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-full px-2.5 py-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Live</span>
            </div>
          </div>
        </div>
        {onChangeLevel && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['mudah', 'sedang', 'sulit'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => { onChangeLevel(lvl); setFormOpen(false); setEditing(null); }}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-colors border cursor-pointer ${
                  quizLevel === lvl
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface border-transparent hover:bg-surface-container-high'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
        <p className="text-sm text-on-surface-variant mb-5">
          Kerjakan dengan 4 tahap RME. Pada tahap pengerjaan tersedia kisi-kisi jika kamu membutuhkan panduan.
        </p>

        {formOpen && isAdmin && (
          <LatihanQuestionForm
            strand={selectedCategory as any}
            category={quizLevel as Difficulty}
            editing={editing}
            onCancel={() => { setFormOpen(false); setEditing(null); }}
            onSaved={() => { setFormOpen(false); setEditing(null); refetch(); }}
          />
        )}

        <div className="flex flex-col gap-3 mt-4">
          {loading && (
            <div className="space-y-2 mt-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat dari Database...</div>
              {[1, 2].map(i => (
                <div key={i} className="w-full h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/10 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              Gagal memuat soal dari database: {error}
            </div>
          )}

          {!loading && !error && questions.length > 0 && (
            <div className="space-y-2 mt-2">
              {questions.map((q: Question, idx: number) => {
                const diffBadge = DIFF_BADGE[q.category] || DIFF_BADGE.sedang;
                const visibleBlocks = stripRmeMetaBlocks(q.content_blocks);
                const narasiBlok = visibleBlocks.find(b => b.type === 'text');
                const preview = narasiBlok?.value?.slice(0, 80) || '(Berisi persamaan matematika / gambar)';
                const hintCount = parseRmeKeys(q).hints?.length || 0;

                return (
                  <div
                    key={q.id}
                    className="w-full text-left p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest dark:bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer group"
                    onClick={() => onSelectQuestion(9000 + idx, q.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                          {q.title || 'Soal Tanpa Judul'}
                        </div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className={`font-bold px-1.5 py-0.5 rounded uppercase ${diffBadge.cls}`}>
                            {diffBadge.label}
                          </span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 uppercase">RME</span>
                          {hintCount > 0 && <span>{hintCount} kisi-kisi</span>}
                          <span className="truncate max-w-[180px]">{preview}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditing(q); setFormOpen(true); }}
                            className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                            className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      <span className="material-symbols-outlined text-primary text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && questions.length === 0 && !formOpen && (
            <div className="text-center p-10 border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest">
              <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">quiz</span>
              <p className="text-sm font-semibold text-on-surface-variant">
                Belum ada soal untuk {selectedCategory} — {quizLevel}.
              </p>
              {isAdmin ? (
                <button
                  onClick={() => { setEditing(null); setFormOpen(true); }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus size={14} /> Tambah soal di sini
                </button>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Soal akan muncul setelah guru menambahkannya.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


