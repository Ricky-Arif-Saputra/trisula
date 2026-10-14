/**
 * ExamSession — wrapper untuk ujian multi-soal berurutan.
 *
 * Alur:
 *   1. Intro screen (nama, NISN, judul, durasi, tata cara) → tombol "Mulai Ujian"
 *   2. Soal 1 → selesai → Soal 2 → ... → Soal N
 *   3. Ringkasan akhir → tombol kembali
 */
import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { QuizQuestionDynamic } from './QuizQuestionDynamic';
import { CheckCircle, ClipboardList, Clock, User, Hash, BookOpen, ChevronRight } from 'lucide-react';

interface ExamSessionProps {
  questionIds: string[];
  examTitle: string;
  examDuration: number;   // menit
  testType: 'pretest' | 'postest';
  strand: string;
  onFinish: () => void;   // kembali ke daftar ujian
}

const TATA_CARA = [
  { icon: 'info',          label: 'Tahap 1 — Diketahui',   desc: 'Tuliskan semua data/informasi yang diketahui dari soal.' },
  { icon: 'help',          label: 'Tahap 2 — Ditanya',     desc: 'Tuliskan inti pertanyaan / apa yang harus dicari.' },
  { icon: 'calculate',     label: 'Tahap 3 — Pengerjaan',  desc: 'Tunjukkan langkah-langkah perhitungan dan isi jawaban angka akhir.' },
  { icon: 'check_circle',  label: 'Tahap 4 — Kesimpulan',  desc: 'Tuliskan kesimpulan dari hasil pengerjaan.' },
];

type Phase = 'intro' | 'exam' | 'done';

export const ExamSession: React.FC<ExamSessionProps> = ({
  questionIds,
  examTitle,
  examDuration,
  testType,
  strand,
  onFinish,
}) => {
  const { userName, userNisn } = useAuth();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finishedIds, setFinishedIds] = useState<string[]>([]);

  const totalSoal = questionIds.length;
  const typeLabel = testType === 'pretest' ? 'Pretest' : 'Posttest';
  const typeColor = testType === 'pretest'
    ? 'from-amber-500 to-orange-400'
    : 'from-emerald-600 to-teal-400';
  const typeBg = testType === 'pretest'
    ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-emerald-50 border-emerald-200 text-emerald-700';

  /* ── Intro screen ── */
  if (phase === 'intro') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-5 animate-in fade-in">
        {/* Header kartu */}
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${typeColor} p-7 text-white shadow-2xl`}>
          <div className="absolute right-4 bottom-0 opacity-[0.08] text-[90px] font-black leading-none select-none pointer-events-none">∑</div>
          <div className="relative z-10">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/20 border border-white/30 rounded-full px-3 py-1 mb-3`}>
              <span className="material-symbols-outlined text-[13px]">quiz</span>
              {typeLabel} · {strand}
            </span>
            <h1 className="text-xl font-extrabold leading-tight mb-1">{examTitle}</h1>
            <p className="text-sm opacity-80">{totalSoal} soal · {examDuration} menit · 4 Tahap RME</p>
          </div>
        </div>

        {/* Identitas peserta */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Identitas Peserta</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <User size={16} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Nama</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">{userName || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <Hash size={16} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">NISN</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">{userNisn || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rincian ujian */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Rincian Ujian</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <BookOpen size={18} className="text-indigo-500" />, label: 'Jumlah Soal', value: `${totalSoal} soal` },
              { icon: <Clock size={18} className="text-amber-500" />,   label: 'Durasi',       value: `${examDuration} menit` },
              { icon: <ClipboardList size={18} className="text-emerald-500" />, label: 'Metode', value: '4 Tahap RME' },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1.5">{item.icon}</div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          {/* Nomor soal */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold self-center">Soal:</span>
            {questionIds.map((_, qi) => (
              <div key={qi} className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400">
                {qi + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Tata cara */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tata Cara Pengerjaan (Metode RME)</p>
          <div className="space-y-3">
            {TATA_CARA.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-[14px]">{t.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200">{t.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
              ⚠️ Pastikan jawaban terisi di semua tahap sebelum mengklik "Cek jawaban akhir". Setiap tahap dinilai secara otomatis oleh AI.
            </p>
          </div>
        </div>

        {/* Tombol Mulai */}
        <div className="flex gap-3">
          <button onClick={onFinish}
            className="px-5 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors">
            Kembali
          </button>
          <button onClick={() => setPhase('exam')}
            className={`flex-1 py-3.5 rounded-2xl bg-gradient-to-r ${typeColor} text-white font-extrabold text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2`}>
            Mulai Ujian <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Done screen ── */
  if (phase === 'done') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-10 flex flex-col items-center text-center gap-5 animate-in fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl">
          <CheckCircle size={40} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Ujian Selesai!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Kamu telah menyelesaikan <span className="font-bold">{totalSoal} soal</span> {typeLabel}.<br/>
            Hasil penilaian AI sudah tersimpan.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${typeBg}`}>
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {finishedIds.length} dari {totalSoal} soal dikerjakan
        </div>
        <button onClick={onFinish}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer transition-colors shadow-md">
          Kembali ke Daftar Ujian
        </button>
      </div>
    );
  }

  /* ── Exam phase ── */
  const currentId = questionIds[currentIdx];

  const handleQuestionFinish = () => {
    setFinishedIds(prev => [...prev, currentId]);
    if (currentIdx < totalSoal - 1) {
      // Ada soal berikutnya
      setCurrentIdx(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Semua soal selesai
      setPhase('done');
    }
  };

  return (
    <div className="w-full pb-16 animate-in fade-in">
      {/* Progress header */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-2 mb-2">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Nomor soal chips */}
          <div className="flex gap-1.5 flex-wrap flex-1">
            {questionIds.map((_, qi) => (
              <div key={qi} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black transition-all ${
                qi < currentIdx
                  ? 'bg-emerald-500 text-white'
                  : qi === currentIdx
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
              }`}>
                {qi < currentIdx ? '✓' : qi + 1}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-400 shrink-0">
            {currentIdx + 1}/{totalSoal}
          </span>
        </div>
      </div>

      <div className="px-4">
        <QuizQuestionDynamic
          key={currentId}  /* force remount untuk soal baru */
          questionId={currentId}
          onFinish={handleQuestionFinish}
          nextLabel={currentIdx < totalSoal - 1
            ? `Lanjut ke Soal ${currentIdx + 2}`
            : 'Selesaikan Ujian'}
        />
      </div>
    </div>
  );
};
