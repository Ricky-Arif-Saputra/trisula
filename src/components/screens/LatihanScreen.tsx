import React, { useState, useEffect } from 'react';
import { MathCategory } from '../../types';
import { QuizQuestionDynamic } from './QuizQuestionDynamic';
import { ErrorBoundary } from '../ErrorBoundary';
import { useQuestions, type Question, type Difficulty } from '../../hooks/useQuestions';
import { useAuth } from '../Auth/AuthProvider';
import { LatihanQuestionForm } from './LatihanQuestionForm';
import { DIFF_BADGE, parseRmeKeys, stripRmeMetaBlocks } from './LatihanTypes';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';

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
        {/* Hero */}
        <section className="px-4 pt-4 pb-3">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-7 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(167,139,250,0.2),transparent_60%)]" />
            <div className="absolute right-4 bottom-0 opacity-[0.06] select-none text-[110px] font-black leading-none pointer-events-none">π</div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
                <span className="material-symbols-outlined text-indigo-300 text-[14px]">sports_esports</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Exercise & Quiz</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight mb-2">Pusat Latihan Matematika</h2>
              <p className="text-sm text-indigo-200/80">Pilih topik dan mulai berlatih dengan metode RME 4 tahap</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pilih Topik Latihan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(['bilangan', 'aljabar', 'geometri', 'trigonometri', 'peluang'] as const).map((cat, i) => {
              const meta: Record<string, { emoji: string; title: string; desc: string; gradient: string; icon: string }> = {
                bilangan:     { emoji: '🔢', title: 'Bilangan',              desc: 'Operasi hitung, FPB & KPK, rasio',   gradient: 'from-blue-600 to-cyan-500',     icon: 'tag' },
                aljabar:      { emoji: '➕', title: 'Aljabar',               desc: 'Persamaan, pertidaksamaan, fungsi',  gradient: 'from-violet-600 to-purple-500', icon: 'functions' },
                geometri:     { emoji: '📐', title: 'Geometri & Pengukuran', desc: 'Bangun 2D/3D, transformasi, luas',  gradient: 'from-emerald-600 to-teal-500',  icon: 'category' },
                trigonometri: { emoji: '🌊', title: 'Trigonometri',          desc: 'Rasio, identitas, grafik gelombang', gradient: 'from-amber-500 to-orange-500',  icon: 'change_history' },
                peluang:      { emoji: '📊', title: 'Data & Peluang',        desc: 'Statistik, kombinatorika, peluang', gradient: 'from-rose-600 to-pink-500',     icon: 'bar_chart' },
              };
              const m = meta[cat];
              return (
                <button key={cat} onClick={() => handleSelectCat(cat)}
                  className="text-left rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group overflow-hidden flex flex-col">
                  <div className={`h-1 w-full bg-gradient-to-r ${m.gradient}`} />
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-lg`}>
                        <span className="material-symbols-outlined text-white text-[22px]">{m.icon}</span>
                      </div>
                      <span className="text-xl">{m.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        Mudah · Sedang · Sulit
                      </span>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </button>
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
    <div className="flex flex-col w-full pb-16 font-sans px-4 animate-in fade-in pt-4">
      {/* Header kartu */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden mb-4">
        {/* Accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="p-5">
          {/* Judul + Live badge */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-0.5">Latihan</div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white capitalize leading-tight">
                {selectedCategory} <span className="text-slate-400 font-normal">—</span> <span className="capitalize text-indigo-600">{quizLevel}</span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Level tabs */}
          {onChangeLevel && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['mudah', 'sedang', 'sulit'] as const).map(lvl => (
                <button key={lvl}
                  onClick={() => { onChangeLevel(lvl); setFormOpen(false); setEditing(null); }}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                    quizLevel === lvl
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                  }`}>
                  {lvl}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Kerjakan dengan 4 tahap RME. Tahap Pengerjaan tersedia kisi-kisi sebagai panduan.
          </p>
        </div>
      </div>

      {/* Daftar soal */}
      <div className="space-y-2">
        {loading && (
          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Memuat dari Database...</div>
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-[72px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/10 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            Gagal memuat soal: {error}
          </div>
        )}

        {!loading && !error && questions.length > 0 && questions.map((q: Question, idx: number) => {
          const diffBadge = DIFF_BADGE[q.category] || DIFF_BADGE.sedang;
          const visibleBlocks = stripRmeMetaBlocks(q.content_blocks);
          const narasiBlok = visibleBlocks.find(b => b.type === 'text');
          const preview = narasiBlok?.value?.slice(0, 90) || '(Berisi persamaan matematika / gambar)';
          const hintCount = parseRmeKeys(q).hints?.length || 0;
          return (
            <div key={q.id}
              className="w-full text-left p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
              onClick={() => onSelectQuestion(9000 + idx, q.id)}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {q.title || 'Soal Tanpa Judul'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className={`font-bold px-1.5 py-0.5 rounded-full text-[9px] uppercase ${diffBadge.cls}`}>{diffBadge.label}</span>
                    <span className="font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-[9px] uppercase">RME</span>
                    {hintCount > 0 && <span className="text-amber-600 dark:text-amber-400">{hintCount} kisi-kisi</span>}
                    <span className="truncate max-w-[160px] text-slate-400">{preview}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {isAdmin && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setEditing(q); setFormOpen(true); }}
                      className="w-8 h-8 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center cursor-pointer transition-colors" title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                      className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center justify-center cursor-pointer transition-colors" title="Hapus">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
                <div className="w-8 h-8 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 flex items-center justify-center transition-colors ml-1">
                  <span className="material-symbols-outlined text-white text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && !error && questions.length === 0 && !formOpen && (
          <div className="text-center py-14 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
            <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 block mb-2">quiz</span>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Belum ada soal untuk {selectedCategory} — {quizLevel}
            </p>
            {!isAdmin && <p className="text-xs text-slate-400 mt-1">Soal akan muncul setelah guru menambahkannya.</p>}
          </div>
        )}
      </div>

      {/* Form tambah/edit soal admin */}
      {isAdmin && (
        <div className="mt-4">
          {formOpen ? (
            <LatihanQuestionForm
              strand={selectedCategory as any}
              category={quizLevel as Difficulty}
              editing={editing}
              onCancel={() => { setFormOpen(false); setEditing(null); }}
              onSaved={() => { setFormOpen(false); setEditing(null); refetch(); }}
            />
          ) : (
            <button onClick={() => { setEditing(null); setFormOpen(true); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-500 dark:text-indigo-400 text-sm font-bold cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 transition-all">
              <Plus size={15} /> Tambah Soal Latihan
            </button>
          )}
        </div>
      )}
    </div>
  );
};


