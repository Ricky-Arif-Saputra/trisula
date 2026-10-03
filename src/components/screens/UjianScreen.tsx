import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import { MathCategory } from '../../types';

interface UjianScreenProps {
  onNavigateToViewer: (examId: string) => void;
}

interface ExamPackage {
  id: string;
  title: string;
  test_type: 'pretest' | 'postest';
  strand: string;
  duration_minutes: number;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number;
}

const STRANDS = [
  { id: 'bilangan', label: 'Bilangan', icon: '123' },
  { id: 'aljabar', label: 'Aljabar', icon: 'functions' },
  { id: 'geometri', label: 'Geometri', icon: 'hexagon' },
  { id: 'trigonometri', label: 'Trigonometri', icon: 'ssid_chart' },
  { id: 'peluang', label: 'Analisis Data & Peluang', icon: 'casino' },
] as const;

export const UjianScreen: React.FC<UjianScreenProps> = ({ onNavigateToViewer }) => {
  const { user } = useAuth();
  const [selectedStrand, setSelectedStrand] = useState<MathCategory | null>(null);
  
  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [attempts, setAttempts] = useState<Record<string, ExamAttempt>>({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedStrand || !user) return;

    const fetchExamsAndAttempts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Packages
        const { data: pkgs, error: pkgsErr } = await supabase
          .from('exam_packages')
          .select('id, title, test_type, strand, duration_minutes')
          .ilike('strand', selectedStrand);
        if (pkgsErr) throw pkgsErr;

        // Fetch Attempts
        // (If the table doesn't exist yet in the DB, this might throw, we catch it silently for attempts to prevent breaking)
        let userAttempts: ExamAttempt[] = [];
        try {
          const { data: atts, error: attsErr } = await supabase
            .from('exam_attempts')
            .select('id, exam_id, score')
            .eq('user_id', user.id);
          
          if (!attsErr && atts) {
            userAttempts = atts as ExamAttempt[];
          }
        } catch (e) {
          console.log("exam_attempts table not found or error, skipping attempt fetch");
        }

        const attemptsMap = userAttempts.reduce((acc, curr) => {
          acc[curr.exam_id] = curr;
          return acc;
        }, {} as Record<string, ExamAttempt>);

        setExams(pkgs as ExamPackage[]);
        setAttempts(attemptsMap);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat ujian');
      } finally {
        setLoading(false);
      }
    };

    fetchExamsAndAttempts();
  }, [selectedStrand, user]);

  return (
    <div className="flex flex-col w-full pb-16 font-sans px-4 sm:px-6 pt-4 animate-in fade-in">
      {/* HEADER SECTION */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-[28px]">quiz</span>
          Ujian Kompetensi
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pilih kategori materi untuk melihat daftar ujian Pretest dan Postest.</p>
      </div>

      {/* STRAND CATEGORIES */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {STRANDS.map(strand => (
          <button
            key={strand.id}
            onClick={() => setSelectedStrand(strand.id as MathCategory)}
            className={`p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] border-2 ${
              selectedStrand === strand.id
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
            }`}
          >
            <span className={`material-symbols-outlined text-[32px] ${selectedStrand === strand.id ? 'text-white' : 'text-indigo-500'}`}>
              {strand.icon}
            </span>
            <span className="text-xs font-bold leading-tight">{strand.label}</span>
          </button>
        ))}
      </div>

      {/* EXAM LIST */}
      {selectedStrand && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
            Paket Ujian: {selectedStrand}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-700 h-28 rounded-2xl w-full"></div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-2xl">
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 mb-2">inventory_2</span>
              <p className="text-slate-500 font-bold">Belum Ada Ujian</p>
              <p className="text-xs text-slate-400">Tidak ada paket ujian untuk materi ini saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(exam => {
                const attempt = attempts[exam.id];
                const isDone = !!attempt;
                const isPretest = exam.test_type === 'pretest';
                
                return (
                  <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1 ${
                        isPretest ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {isPretest ? 'assignment' : 'assignment_turned_in'}
                        </span>
                        {isPretest ? 'Pretest' : 'Postest'}
                      </div>

                      {/* Status Badge */}
                      <div className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 border ${
                        isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">{isDone ? 'check_circle' : 'pending'}</span>
                        {isDone ? 'Sudah Dikerjakan' : 'Belum Dikerjakan'}
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white line-clamp-2">{exam.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">timer</span> {exam.duration_minutes} Menit</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">category</span> {exam.strand}</span>
                    </div>

                    {isDone && (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Nilai Akhir:</span>
                        <span className={`text-xl font-black ${attempt.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{attempt.score}</span>
                      </div>
                    )}

                    <div className="mt-5 flex gap-2">
                      {!isDone ? (
                        <button onClick={() => onNavigateToViewer(exam.id)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md cursor-pointer transition-colors flex justify-center items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                          Kerjakan Ujian
                        </button>
                      ) : (
                        <>
                          <button onClick={() => onNavigateToViewer(exam.id)} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer transition-colors flex justify-center items-center gap-1.5 border border-slate-200">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                            Lihat Pembahasan
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
