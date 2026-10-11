import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import { RmePosttestBuilder } from './RmePosttestBuilder';
import { MathCategory } from '../../types';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';

interface UjianScreenProps {
  onNavigateToViewer: (examId: string) => void;
}

interface ExamPackage {
  id: string;
  title: string;
  test_type: 'pretest' | 'postest';
  strand: string;
  duration_minutes: number;
  total_max_points?: number;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number;
}

const STRANDS = [
  { id: 'bilangan',     label: 'Bilangan',            icon: '123',          gradient: 'from-blue-600 to-cyan-500' },
  { id: 'aljabar',      label: 'Aljabar',              icon: 'functions',    gradient: 'from-violet-600 to-purple-500' },
  { id: 'geometri',     label: 'Geometri',             icon: 'hexagon',      gradient: 'from-emerald-600 to-teal-500' },
  { id: 'trigonometri', label: 'Trigonometri',         icon: 'ssid_chart',   gradient: 'from-amber-500 to-orange-500' },
  { id: 'peluang',      label: 'Data & Peluang',       icon: 'casino',       gradient: 'from-rose-600 to-pink-500' },
] as const;

export const UjianScreen: React.FC<UjianScreenProps> = ({ onNavigateToViewer }) => {
  const { user, isAdmin } = useAuth();
  const [selectedStrand, setSelectedStrand] = useState<MathCategory | null>(null);

  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [attempts, setAttempts] = useState<Record<string, ExamAttempt>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin: builder state
  const [builderType, setBuilderType] = useState<'pretest' | 'postest' | null>(null);

  const fetchExams = useCallback(async () => {
    if (!selectedStrand || !user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: pkgs, error: pkgsErr } = await supabase
        .from('exam_packages')
        .select('id, title, test_type, strand, duration_minutes, total_max_points')
        .ilike('strand', selectedStrand)
        .in('test_type', ['pretest', 'postest'])
        .order('created_at', { ascending: false });
      if (pkgsErr) throw pkgsErr;

      let userAttempts: ExamAttempt[] = [];
      try {
        const { data: atts } = await supabase
          .from('exam_attempts')
          .select('id, exam_id, score')
          .eq('user_id', user.id);
        if (atts) userAttempts = atts as ExamAttempt[];
      } catch {
        // tabel belum ada, skip
      }

      const attMap = userAttempts.reduce((acc, a) => { acc[a.exam_id] = a; return acc; }, {} as Record<string, ExamAttempt>);
      setExams((pkgs || []) as ExamPackage[]);
      setAttempts(attMap);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat ujian');
    } finally {
      setLoading(false);
    }
  }, [selectedStrand, user]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  // Reset builder saat pindah strand
  useEffect(() => { setBuilderType(null); }, [selectedStrand]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus paket ujian ini? Jawaban siswa ikut terhapus.')) return;
    await supabase.from('exam_packages').delete().eq('id', id);
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const pretests = exams.filter(e => e.test_type === 'pretest');
  const posttests = exams.filter(e => e.test_type === 'postest');
  const currentStrand = STRANDS.find(s => s.id === selectedStrand);

  return (
    <div className="flex flex-col w-full pb-16 font-sans px-4 sm:px-6 pt-4 animate-in fade-in">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-[28px]">quiz</span>
          Ujian Kompetensi
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pilih kategori untuk melihat Pretest dan Posttest.
        </p>
      </div>

      {/* STRAND SELECTOR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {STRANDS.map(strand => (
          <button key={strand.id}
            onClick={() => setSelectedStrand(strand.id as MathCategory)}
            className={`p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] border-2 ${
              selectedStrand === strand.id
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
            }`}>
            <span className={`material-symbols-outlined text-[32px] ${selectedStrand === strand.id ? 'text-white' : 'text-indigo-500'}`}>
              {strand.icon}
            </span>
            <span className="text-xs font-bold leading-tight">{strand.label}</span>
          </button>
        ))}
      </div>

      {/* KONTEN STRAND TERPILIH */}
      {selectedStrand && (
        <div className="space-y-6">

          {/* Sub-header + tombol admin */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {currentStrand && (
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentStrand.gradient} flex items-center justify-center shadow`}>
                  <span className="material-symbols-outlined text-white text-[18px]">{currentStrand.icon}</span>
                </div>
              )}
              <div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white capitalize">
                  {selectedStrand}
                </h2>
                <p className="text-[10px] text-slate-400">
                  {pretests.length} pretest · {posttests.length} posttest
                </p>
              </div>
            </div>

            {/* Tombol tambah untuk admin */}
            {isAdmin && !builderType && (
              <div className="flex gap-2">
                <button
                  onClick={() => setBuilderType('pretest')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold cursor-pointer hover:bg-amber-100 transition-colors">
                  <Plus size={13} /> Tambah Pretest
                </button>
                <button
                  onClick={() => setBuilderType('postest')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors">
                  <Plus size={13} /> Tambah Posttest
                </button>
              </div>
            )}
          </div>

          {/* BUILDER INLINE */}
          {isAdmin && builderType && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                  Buat {builderType === 'pretest' ? 'Pretest' : 'Posttest'} — {selectedStrand}
                </span>
                <button
                  onClick={() => setBuilderType(null)}
                  className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors">
                  <X size={16} />
                </button>
              </div>
              <RmePosttestBuilder
                testType={builderType}
                onBack={() => setBuilderType(null)}
                onSaved={() => { setBuilderType(null); fetchExams(); }}
              />
            </div>
          )}

          {/* DAFTAR UJIAN */}
          {!builderType && (
            <>
              {loading ? (
                <div className="flex items-center gap-3 justify-center py-16 text-slate-400">
                  <Loader2 size={20} className="animate-spin text-indigo-400" />
                  <span className="text-sm">Memuat ujian...</span>
                </div>
              ) : error ? (
                <div className="p-6 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-2xl">
                  <p className="font-bold text-sm">Gagal memuat</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              ) : exams.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 block mb-2">inventory_2</span>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Belum ada ujian</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAdmin ? 'Klik "Tambah Pretest" atau "Tambah Posttest" di atas.' : 'Guru belum membuat ujian untuk materi ini.'}
                  </p>
                  {isAdmin && (
                    <div className="flex gap-3 justify-center mt-4">
                      <button onClick={() => setBuilderType('pretest')}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer hover:bg-amber-600 shadow-md transition-colors">
                        <Plus size={13} /> Tambah Pretest
                      </button>
                      <button onClick={() => setBuilderType('postest')}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700 shadow-md transition-colors">
                        <Plus size={13} /> Tambah Posttest
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* PRETEST */}
                  {pretests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-amber-600 text-[18px]">assignment</span>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Pretest</h3>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{pretests.length}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pretests.map(exam => (
                          <ExamCard
                            key={exam.id}
                            exam={exam}
                            attempt={attempts[exam.id]}
                            isAdmin={isAdmin}
                            colorClass="amber"
                            onStart={() => onNavigateToViewer(exam.id)}
                            onDelete={() => handleDelete(exam.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* POSTTEST */}
                  {posttests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">assignment_turned_in</span>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Posttest</h3>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{posttests.length}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {posttests.map(exam => (
                          <ExamCard
                            key={exam.id}
                            exam={exam}
                            attempt={attempts[exam.id]}
                            isAdmin={isAdmin}
                            colorClass="emerald"
                            onStart={() => onNavigateToViewer(exam.id)}
                            onDelete={() => handleDelete(exam.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tombol tambah di bawah — satu-satunya saat sudah ada konten */}
                  {isAdmin && (
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setBuilderType('pretest')}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 border-2 border-dashed border-amber-300 text-amber-700 text-xs font-bold cursor-pointer hover:bg-amber-100 transition-colors">
                        <Plus size={13} /> Pretest Baru
                      </button>
                      <button onClick={() => setBuilderType('postest')}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300 text-emerald-700 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors">
                        <Plus size={13} /> Posttest Baru
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ExamCard
// ─────────────────────────────────────────────────────────────
const ExamCard: React.FC<{
  exam: ExamPackage;
  attempt?: ExamAttempt;
  isAdmin: boolean;
  colorClass: 'amber' | 'emerald';
  onStart: () => void;
  onDelete: () => void;
}> = ({ exam, attempt, isAdmin, colorClass, onStart, onDelete }) => {
  const isDone = !!attempt;
  const c = colorClass === 'amber'
    ? { badge: 'bg-amber-100 text-amber-700', btn: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-200', strip: 'from-amber-500 to-orange-400' }
    : { badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', border: 'border-emerald-200', strip: 'from-emerald-500 to-teal-400' };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col`}>
      {/* Color strip */}
      <div className={`h-1 bg-gradient-to-r ${c.strip}`} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Meta row */}
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest ${c.badge}`}>
            {exam.test_type === 'pretest' ? 'Pretest' : 'Posttest'}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
            isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            <span className="material-symbols-outlined text-[12px]">{isDone ? 'check_circle' : 'pending'}</span>
            {isDone ? 'Selesai' : 'Belum dikerjakan'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white line-clamp-2 leading-snug">{exam.title}</h3>

        {/* Info row */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">timer</span> {exam.duration_minutes} menit
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">category</span> {exam.strand}
          </span>
          {exam.total_max_points && (
            <span className="flex items-center gap-1">🏆 {exam.total_max_points} poin</span>
          )}
        </div>

        {/* Nilai jika sudah dikerjakan */}
        {isDone && attempt && (
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Nilai Akhir</span>
            <span className={`text-xl font-black ${attempt.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {attempt.score}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button onClick={onStart}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm ${
              isDone
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-none'
                : `${c.btn} text-white shadow-md`
            }`}>
            <span className="material-symbols-outlined text-[15px]">{isDone ? 'visibility' : 'play_arrow'}</span>
            {isDone ? 'Lihat Hasil' : 'Kerjakan'}
          </button>
          {isAdmin && (
            <button onClick={onDelete}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors shrink-0">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
