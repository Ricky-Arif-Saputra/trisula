import React, { useState, useEffect } from 'react';
import { MathCategory } from '../../types';

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
  const [quizLevel, setQuizLevel] = useState<'mudah' | 'sedang' | 'sulit'>('sedang');
  const [quizMode, setQuizMode] = useState<QuizMode>('mandiri');
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  
  // Dummy Quiz Progress State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
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
  // VIEW 2: QUIZ DASHBOARD / PREPARATION
  // ==============================================================
  if (!isQuizActive && !isQuizFinished) {
    return (
      <div className="flex flex-col w-full pb-16 font-sans px-margin-mobile animate-in fade-in">
        
        {/* PREPARATION CARD */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-md flex flex-col gap-6 mt-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined text-[32px]">quiz</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface capitalize">Latihan: {selectedCategory}</h2>
            <p className="text-sm text-on-surface-variant">Pilih tingkat kesulitan dan mode latihan untuk memulai.</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tingkat Kesulitan</label>
            <div className="grid grid-cols-3 gap-2">
              {(['mudah', 'sedang', 'sulit'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setQuizLevel(lvl)}
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
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mode Latihan</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => handleStartQuiz('mandiri')}
                className="p-4 rounded-xl border-2 border-transparent hover:border-secondary/50 bg-surface-container cursor-pointer transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined">menu_book</span>
                  <span className="font-bold text-sm">Latihan Mandiri</span>
                </div>
                <p className="text-xs text-on-surface-variant">Feedback instan dan pembahasan step-by-step setelah setiap soal.</p>
              </div>

              <div 
                onClick={() => handleStartQuiz('time_attack')}
                className="p-4 rounded-xl border-2 border-transparent hover:border-error/50 bg-surface-container cursor-pointer transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined">timer</span>
                  <span className="font-bold text-sm">Time Attack</span>
                </div>
                <p className="text-xs text-on-surface-variant">Kuis berwaktu seperti ujian. Skor akhir dihitung berdasarkan kecepatan.</p>
              </div>
            </div>
          </div>
          
          {selectedCategory === 'trigonometri' && (
             <div className="pt-4 border-t border-outline-variant/20">
                <button 
                  onClick={() => handleStartQuiz('lab')}
                  className="w-full py-3 rounded-xl bg-tertiary-container text-on-tertiary-container font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer transition-opacity"
                >
                  <span className="material-symbols-outlined">science</span>
                  Buka Virtual Lab: Klinometer
                </button>
             </div>
          )}
        </div>
      </div>
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
    const dummyQuestions = [
      { q: "Berapakah hasil dari 2x + 5 = 15?", options: ["x = 5", "x = 10", "x = 2", "x = 4"], correct: 0 },
      { q: "Jika f(x) = 3x - 2, maka f(4) adalah...", options: ["10", "12", "14", "8"], correct: 0 },
      { q: "Luas segitiga dengan alas 6cm dan tinggi 8cm adalah...", options: ["24 cm²", "48 cm²", "14 cm²", "36 cm²"], correct: 0 },
      { q: "Nilai dari sin(30°) adalah...", options: ["0.5", "1", "0.866", "0"], correct: 0 },
      { q: "Peluang muncul angka pada koin adalah...", options: ["1/2", "1/4", "1/6", "1"], correct: 0 },
    ];
    const currentQ = dummyQuestions[currentQuestionIdx];

    return (
      <div className="flex flex-col w-full pb-16 font-sans px-margin-mobile animate-in fade-in pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
            Soal {currentQuestionIdx + 1} dari 5
          </span>
          {quizMode === 'time_attack' && (
            <span className="text-sm font-bold text-error flex items-center gap-1 timer-urgent">
              <span className="material-symbols-outlined text-[18px]">timer</span>
              14:59
            </span>
          )}
        </div>

        <div className="w-full bg-surface-container-high h-2 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${((currentQuestionIdx + 1) / 5) * 100}%` }}
          />
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-md">
          <h3 className="text-lg font-bold text-on-surface mb-6 leading-relaxed">
            {currentQ.q}
          </h3>

          <div className="flex flex-col gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQ.correct;
              
              let btnClass = "border-outline-variant/30 hover:border-primary hover:bg-primary/5 text-on-surface";
              if (selectedAnswer !== null) {
                if (isSelected && isCorrect) btnClass = "border-secondary bg-secondary/10 text-secondary";
                else if (isSelected && !isCorrect) btnClass = "border-error bg-error/10 text-error";
                else if (isCorrect) btnClass = "border-secondary bg-secondary/10 text-secondary";
              }

              return (
                <button
                  key={idx}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswer(idx, isCorrect)}
                  className={`w-full text-left p-4 rounded-xl border-2 font-semibold transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {selectedAnswer !== null && isCorrect && <span className="material-symbols-outlined text-secondary">check_circle</span>}
                  {selectedAnswer !== null && isSelected && !isCorrect && <span className="material-symbols-outlined text-error">cancel</span>}
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && quizMode === 'mandiri' && (
             <div className="mt-6 p-4 bg-secondary-container/20 rounded-xl border border-secondary/30 animate-in fade-in slide-in-from-bottom-2">
                <h4 className="text-sm font-bold text-secondary mb-1 flex items-center gap-1">
                   <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                   Pembahasan:
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                   Jawaban yang tepat adalah opsi pertama. Gunakan operasi aljabar dasar untuk menyelesaikan persamaan. 
                   Pindahkan konstanta ke satu sisi dan variabel ke sisi lainnya.
                </p>
             </div>
          )}
        </div>
      </div>
    );
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
