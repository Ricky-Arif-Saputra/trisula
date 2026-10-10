import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import { RmePosttestBuilder } from './RmePosttestBuilder';
import { Trash2, Plus, X, Package2 } from 'lucide-react';

interface ExamPackageRow {
  id: string;
  title: string;
  strand: string;
  test_type: string;
  exam_type: string;
  duration_minutes: number;
  total_max_points?: number;
  created_at: string;
}

type FilterType = 'all' | 'latihan' | 'pretest' | 'postest';

export const AdminSoalManager: React.FC = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<ExamPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTestType, setBuilderTestType] = useState<'pretest' | 'postest' | 'latihan'>('postest');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('exam_packages')
        .select('id, title, strand, test_type, exam_type, duration_minutes, total_max_points, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      setPackages(data || []);
    } catch (e) {
      console.error('Error fetching packages:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus paket ujian ini? Semua attempt siswa akan ikut terhapus.')) return;
    await supabase.from('exam_packages').delete().eq('id', id);
    fetchPackages();
  };

  const handleBuilderSaved = () => {
    setIsBuilderOpen(false);
    fetchPackages();
  };

  const openBuilder = (type: 'pretest' | 'postest' | 'latihan') => {
    setBuilderTestType(type);
    setIsBuilderOpen(true);
    // Scroll to bottom after a tick so the builder has rendered
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const filteredPackages = filterType === 'all'
    ? packages
    : packages.filter(p => p.test_type === filterType);

  const typeColors: Record<string, string> = {
    pretest: 'bg-amber-100 text-amber-700 border-amber-200',
    postest: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    latihan: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  const strandIcons: Record<string, string> = {
    bilangan: 'tag',
    aljabar: 'functions',
    geometri: 'category',
    trigonometri: 'change_history',
    peluang: 'bar_chart',
  };

  // Label & style for add button per type
  const addBtnConfig: Record<'pretest' | 'postest' | 'latihan', { label: string; cls: string }> = {
    pretest:  { label: 'Tambah Pretest',  cls: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' },
    postest:  { label: 'Tambah Posttest', cls: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' },
    latihan:  { label: 'Tambah Latihan',  cls: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' },
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl text-white">
        <div className="mb-2">
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Package2 size={22} className="text-indigo-400" />
            Kelola Paket Ujian RME
          </h2>
          <p className="text-sm text-slate-400 mt-1">Buat, edit, dan hapus paket Pretest, Posttest, dan Latihan.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4 border-t border-slate-800 pt-4 flex-wrap">
          {(['all', 'pretest', 'postest', 'latihan'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                setFilterType(f);
                // Close builder when switching tabs
                if (isBuilderOpen) setIsBuilderOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === f
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="ml-1.5 text-[10px] bg-white/20 px-1 rounded-full">
                  {packages.filter(p => p.test_type === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* PACKAGES LIST */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
          Daftar Paket ({filteredPackages.length})
        </h3>
        {loading ? (
          <div className="text-center py-10 text-slate-500 text-sm">Memuat...</div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm bg-slate-800/50 rounded-xl border border-slate-700/50">
            Belum ada paket untuk kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map(pkg => (
              <div key={pkg.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-800 transition-colors group">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">
                      {strandIcons[pkg.strand] || 'functions'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${typeColors[pkg.test_type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {pkg.test_type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 capitalize ml-auto">{pkg.strand}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 line-clamp-2 group-hover:text-white transition-colors">{pkg.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span>{pkg.duration_minutes} menit</span>
                    {pkg.total_max_points && <span>{pkg.total_max_points} poin</span>}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 justify-end border-t border-slate-700/50 pt-3">
                  <button
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-xs cursor-pointer transition-colors"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tombol tambah di bawah daftar — per jenis yang dipilih */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          {isBuilderOpen ? (
            /* judul panel inline saat builder terbuka */
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                Buat Paket — {builderTestType.charAt(0).toUpperCase() + builderTestType.slice(1)}
              </span>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : filterType === 'all' ? (
            /* Ketika "Semua" — tampilkan 3 tombol tambah */
            <div className="flex flex-wrap gap-3">
              {(['pretest', 'postest', 'latihan'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => openBuilder(type)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg cursor-pointer ${addBtnConfig[type].cls}`}
                >
                  <Plus size={14} /> {addBtnConfig[type].label}
                </button>
              ))}
            </div>
          ) : (
            /* Ketika filter spesifik — tombol sesuai jenis aktif */
            <button
              onClick={() => openBuilder(filterType as 'pretest' | 'postest' | 'latihan')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg cursor-pointer ${addBtnConfig[filterType as 'pretest' | 'postest' | 'latihan'].cls}`}
            >
              <Plus size={14} /> {addBtnConfig[filterType as 'pretest' | 'postest' | 'latihan'].label}
            </button>
          )}
        </div>
      </div>

      {/* BUILDER PANEL — di bawah daftar */}
      {isBuilderOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-black text-slate-700 dark:text-slate-200">
              Buat Paket — {builderTestType.charAt(0).toUpperCase() + builderTestType.slice(1)}
            </span>
            <button
              onClick={() => setIsBuilderOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-0">
            <RmePosttestBuilder
              testType={builderTestType}
              onBack={() => setIsBuilderOpen(false)}
              onSaved={handleBuilderSaved}
            />
          </div>
        </div>
      )}
    </div>
  );
};
