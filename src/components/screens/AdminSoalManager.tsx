import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import { RmePosttestBuilder } from './RmePosttestBuilder';
import { Trash2, Plus, X, Package2, Download, Users, Loader2, FileArchive } from 'lucide-react';
import JSZip from 'jszip';
import html2pdf from 'html2pdf.js';

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

interface Attempt {
  id: string;
  student_name: string;
  student_nisn: string;
  score: number;
  total_essay_score: number;
  total_max_points: number;
  essay_answers: Record<string, { diketahui: string; ditanya: string; pengerjaan: string; kesimpulan: string }>;
  ai_scores: Record<string, any>;
  created_at: string;
}

type FilterType = 'all' | 'latihan' | 'pretest' | 'postest';

const STAGES = [
  { key: 'diketahui', label: 'Diketahui' },
  { key: 'ditanya', label: 'Ditanya' },
  { key: 'pengerjaan', label: 'Pengerjaan' },
  { key: 'kesimpulan', label: 'Kesimpulan' },
] as const;

// ─────────────────────────────────────────────────────────────
// HTML template untuk satu PDF siswa
// ─────────────────────────────────────────────────────────────
function buildAnswerHtml(attempt: Attempt, pkg: ExamPackageRow): string {
  const stages = STAGES;
  const questionsHtml = Object.entries(attempt.essay_answers || {}).map(([qId, ans], qi) => {
    const ai = attempt.ai_scores?.[qId];
    return `
      <div style="margin-bottom:24px;page-break-inside:avoid;">
        <div style="background:#1e293b;color:white;padding:10px 14px;border-radius:8px 8px 0 0;font-weight:900;font-size:13px;">
          Soal ${qi + 1}
        </div>
        ${stages.map(s => {
          const stageAns = (ans as any)[s.key] || '—';
          const stageScore = ai?.evaluation?.[s.key];
          return `
            <div style="border:1px solid #e2e8f0;border-top:none;padding:10px 14px;font-size:12px;">
              <div style="font-weight:700;color:#64748b;margin-bottom:4px;text-transform:uppercase;font-size:10px;letter-spacing:.06em;">
                Tahap ${s.label}
                ${stageScore ? `<span style="margin-left:8px;background:#f0fdf4;color:#16a34a;padding:1px 6px;border-radius:999px;font-size:10px;">
                  ${stageScore.score}/${stageScore.max_score}
                </span>` : ''}
              </div>
              <div style="white-space:pre-wrap;color:#1e293b;">${stageAns}</div>
              ${stageScore?.reason ? `<div style="margin-top:4px;font-style:italic;color:#94a3b8;font-size:11px;">${stageScore.reason}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');

  const tanggal = new Date(attempt.created_at).toLocaleDateString('id-ID', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return `
    <html><head><meta charset="utf-8"/><style>
      body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; color: #1e293b; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      .meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
      .score-badge { display:inline-block; background: ${attempt.score >= 75 ? '#16a34a' : attempt.score >= 50 ? '#d97706' : '#dc2626'};
        color:white; padding: 6px 16px; border-radius: 999px; font-size: 22px; font-weight: 900; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
      td, th { border: 1px solid #e2e8f0; padding: 6px 10px; }
      th { background: #f8fafc; font-weight: 700; color: #64748b; text-align: left; }
    </style></head><body>
      <h1>${pkg.title}</h1>
      <div class="meta">${pkg.strand} · ${pkg.test_type === 'pretest' ? 'Pretest' : 'Posttest'} · ${tanggal}</div>
      <table>
        <tr><th>Nama</th><td>${attempt.student_name || '—'}</td><th>NISN</th><td>${attempt.student_nisn || '—'}</td></tr>
        <tr><th>Nilai Akhir</th><td><span class="score-badge">${attempt.score}</span></td>
          <th>Poin</th><td>${attempt.total_essay_score || 0} / ${attempt.total_max_points || '?'}</td></tr>
      </table>
      <div style="font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:12px;">
        Jawaban Per Soal
      </div>
      ${questionsHtml}
    </body></html>
  `;
}

// ─────────────────────────────────────────────────────────────
// AnswerDownloadModal — tampilkan daftar attempt + download ZIP
// ─────────────────────────────────────────────────────────────
const AnswerDownloadModal: React.FC<{
  pkg: ExamPackageRow;
  onClose: () => void;
}> = ({ pkg, onClose }) => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('exam_attempts')
          .select('*')
          .eq('exam_id', pkg.id)
          .order('created_at', { ascending: false });
        setAttempts((data || []) as Attempt[]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [pkg.id]);

  const handleDownloadZip = async () => {
    if (attempts.length === 0) return;
    setZipping(true);
    setProgress('Menyiapkan ZIP...');
    try {
      const zip = new JSZip();

      for (let i = 0; i < attempts.length; i++) {
        const att = attempts[i];
        const safeName = (att.student_name || 'noname').replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
        const safeNisn = (att.student_nisn || 'nonisn').replace(/[^0-9]/g, '').trim() || `id${i}`;
        const filename = `${safeName}_${safeNisn}.pdf`;

        setProgress(`Membuat PDF ${i + 1}/${attempts.length}: ${safeName}...`);

        const html = buildAnswerHtml(att, pkg);
        const el = document.createElement('div');
        el.innerHTML = html;
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);

        try {
          const pdfBlob: Blob = await new Promise((resolve, reject) => {
            (html2pdf as any)()
              .set({
                margin: 0,
                filename,
                image: { type: 'jpeg', quality: 0.9 },
                html2canvas: { scale: 1.5, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
              })
              .from(el)
              .outputPdf('blob')
              .then(resolve)
              .catch(reject);
          });
          zip.file(filename, pdfBlob);
        } finally {
          document.body.removeChild(el);
        }
      }

      setProgress('Mengemas ZIP...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Jawaban_${pkg.test_type}_${pkg.strand}_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setProgress(`✅ Selesai! ${attempts.length} PDF dalam ZIP.`);
    } catch (err: any) {
      setProgress(`❌ Gagal: ${err.message}`);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jawaban Siswa</div>
            <h3 className="text-white font-extrabold text-sm mt-0.5 truncate max-w-sm">{pkg.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center gap-3 justify-center py-10 text-slate-400">
              <Loader2 size={18} className="animate-spin" /> Memuat jawaban...
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada siswa yang mengerjakan ujian ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attempts.map((att, i) => (
                <div key={att.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">{att.student_name || 'Tanpa Nama'}</p>
                    <p className="text-[10px] text-slate-500">NISN: {att.student_nisn || '—'} · {new Date(att.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className={`text-lg font-black ${att.score >= 70 ? 'text-emerald-400' : att.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {att.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 space-y-3">
          {progress && (
            <div className="text-xs font-bold text-slate-300 bg-slate-800 rounded-lg px-3 py-2">
              {progress}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-700 transition-colors">
              Tutup
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={zipping || attempts.length === 0}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              {zipping ? (
                <><Loader2 size={15} className="animate-spin" /> Memproses...</>
              ) : (
                <><FileArchive size={15} /> Unduh ZIP ({attempts.length} PDF)</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// AdminSoalManager
// ─────────────────────────────────────────────────────────────
export const AdminSoalManager: React.FC = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<ExamPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTestType, setBuilderTestType] = useState<'pretest' | 'postest' | 'latihan'>('postest');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [downloadPkg, setDownloadPkg] = useState<ExamPackageRow | null>(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('exam_packages')
        .select('id, title, strand, test_type, exam_type, duration_minutes, total_max_points, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      setPackages(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus paket ujian ini? Semua attempt siswa akan ikut terhapus.')) return;
    await supabase.from('exam_packages').delete().eq('id', id);
    fetchPackages();
  };

  const openBuilder = (type: 'pretest' | 'postest' | 'latihan') => {
    setBuilderTestType(type);
    setIsBuilderOpen(true);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const filteredPackages = filterType === 'all' ? packages : packages.filter(p => p.test_type === filterType);

  const typeColors: Record<string, string> = {
    pretest: 'bg-amber-100 text-amber-700 border-amber-200',
    postest: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    latihan: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  const strandIcons: Record<string, string> = {
    bilangan: 'tag', aljabar: 'functions', geometri: 'category', trigonometri: 'change_history', peluang: 'bar_chart',
  };

  const addBtnConfig: Record<'pretest' | 'postest' | 'latihan', { label: string; cls: string }> = {
    pretest: { label: 'Tambah Pretest',  cls: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' },
    postest: { label: 'Tambah Posttest', cls: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' },
    latihan: { label: 'Tambah Latihan',  cls: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' },
  };

  const canDownload = (type: string) => type === 'pretest' || type === 'postest';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Modal download */}
      {downloadPkg && (
        <AnswerDownloadModal pkg={downloadPkg} onClose={() => setDownloadPkg(null)} />
      )}

      {/* HEADER */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl text-white">
        <div className="mb-2">
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Package2 size={22} className="text-indigo-400" />
            Kelola Paket Ujian RME
          </h2>
          <p className="text-sm text-slate-400 mt-1">Buat, edit, hapus paket · Download ZIP jawaban siswa untuk Pretest & Posttest.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4 border-t border-slate-800 pt-4 flex-wrap">
          {(['all', 'pretest', 'postest', 'latihan'] as const).map(f => (
            <button key={f}
              onClick={() => { setFilterType(f); if (isBuilderOpen) setIsBuilderOpen(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
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
                <div className="flex gap-2 mt-4 border-t border-slate-700/50 pt-3">
                  {canDownload(pkg.test_type) && (
                    <button onClick={() => setDownloadPkg(pkg)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs cursor-pointer transition-colors font-bold">
                      <Download size={13} /> Jawaban
                    </button>
                  )}
                  <button onClick={() => handleDelete(pkg.id)}
                    className="ml-auto flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs cursor-pointer transition-colors">
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tombol tambah di bawah */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          {isBuilderOpen ? (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                Buat Paket — {builderTestType.charAt(0).toUpperCase() + builderTestType.slice(1)}
              </span>
              <button onClick={() => setIsBuilderOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 cursor-pointer">
                <X size={14} />
              </button>
            </div>
          ) : filterType === 'all' ? (
            <div className="flex flex-wrap gap-3">
              {(['pretest', 'postest', 'latihan'] as const).map(type => (
                <button key={type} onClick={() => openBuilder(type)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg cursor-pointer ${addBtnConfig[type].cls}`}>
                  <Plus size={14} /> {addBtnConfig[type].label}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => openBuilder(filterType as 'pretest' | 'postest' | 'latihan')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg cursor-pointer ${addBtnConfig[filterType as 'pretest' | 'postest' | 'latihan'].cls}`}>
              <Plus size={14} /> {addBtnConfig[filterType as 'pretest' | 'postest' | 'latihan'].label}
            </button>
          )}
        </div>
      </div>

      {/* BUILDER PANEL */}
      {isBuilderOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-black text-slate-700 dark:text-slate-200">
              Buat Paket — {builderTestType.charAt(0).toUpperCase() + builderTestType.slice(1)}
            </span>
            <button onClick={() => setIsBuilderOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>
          <RmePosttestBuilder
            testType={builderTestType}
            onBack={() => setIsBuilderOpen(false)}
            onSaved={() => { setIsBuilderOpen(false); fetchPackages(); }}
          />
        </div>
      )}
    </div>
  );
};
