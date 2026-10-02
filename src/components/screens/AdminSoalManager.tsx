import React, { useState, useCallback } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import { InlineMath } from 'react-katex';

// =====================================================
// Tipe Data Soal
// =====================================================
interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionPayload {
  soal_text: string;
  soal_latex: string;
  image_url: string;
  cabang_materi: string;
  pilar_rme: string;
  options: AnswerOption[];
  created_by: string;
}

type CabangMateri = 'bilangan' | 'aljabar' | 'geometri' | 'trigonometri' | 'peluang';
type PilarRME = 'pemodelan' | 'komputasi' | 'refleksi' | 'komunikasi';

const CABANG_OPTIONS: { value: CabangMateri; label: string; icon: string }[] = [
  { value: 'bilangan', label: 'Bilangan', icon: '123' },
  { value: 'aljabar', label: 'Aljabar', icon: 'functions' },
  { value: 'geometri', label: 'Geometri', icon: 'hexagon' },
  { value: 'trigonometri', label: 'Trigonometri', icon: 'signal_cellular_alt' },
  { value: 'peluang', label: 'Peluang & Data', icon: 'casino' },
];

const PILAR_OPTIONS: { value: PilarRME; label: string; icon: string; color: string }[] = [
  { value: 'pemodelan', label: 'Pemodelan', icon: 'model_training', color: 'indigo' },
  { value: 'komputasi', label: 'Komputasi', icon: 'calculate', color: 'emerald' },
  { value: 'refleksi', label: 'Refleksi', icon: 'psychology', color: 'amber' },
  { value: 'komunikasi', label: 'Komunikasi', icon: 'forum', color: 'rose' },
];

const LATEX_SYMBOLS = [
  { label: 'Pecahan', insert: '\\frac{a}{b}' },
  { label: 'Pangkat', insert: 'x^{2}' },
  { label: 'Akar', insert: '\\sqrt{x}' },
  { label: 'Pi', insert: '\\pi' },
  { label: 'Sigma', insert: '\\sum_{i=1}^{n}' },
  { label: 'Integral', insert: '\\int_{a}^{b}' },
  { label: 'Limit', insert: '\\lim_{x \\to \\infty}' },
  { label: '≤', insert: '\\leq' },
  { label: '≥', insert: '\\geq' },
  { label: '≠', insert: '\\neq' },
  { label: '×', insert: '\\times' },
  { label: '÷', insert: '\\div' },
];

// =====================================================
// Komponen Utama
// =====================================================
export const AdminSoalManager: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [soalText, setSoalText] = useState('');
  const [soalLatex, setSoalLatex] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [cabangMateri, setCabangMateri] = useState<CabangMateri>('bilangan');
  const [pilarRme, setPilarRme] = useState<PilarRME>('pemodelan');
  const [options, setOptions] = useState<AnswerOption[]>([
    { id: 'opt-A', text: '', isCorrect: false },
    { id: 'opt-B', text: '', isCorrect: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showLatexPanel, setShowLatexPanel] = useState(false);

  // =====================================================
  // PROTEKSI: Jika bukan Admin → tampilkan 403 Forbidden
  // =====================================================
  if (!isAdmin) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 font-sans mt-10">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border-2 border-rose-300 dark:border-rose-800 shadow-xl overflow-hidden text-center p-12">
          <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-rose-500 text-5xl">shield_lock</span>
          </div>
          <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400 mb-2">403 — Akses Ditolak</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
            Halaman Manajemen Soal hanya dapat diakses oleh <strong>Admin</strong> atau <strong>Guru</strong> yang terdaftar dalam sistem TRISULA EduMath.
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs text-slate-500 font-mono">
            <span className="material-symbols-outlined text-[14px]">person</span>
            Peran Anda saat ini: <strong className="text-slate-700 dark:text-slate-300">Siswa</strong>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // Handler Opsi Jawaban
  // =====================================================
  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions(prev => [...prev, { id: `opt-${nextLetter}`, text: '', isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const updateOptionText = (id: string, text: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  };

  const setCorrectOption = (id: string) => {
    setOptions(prev => prev.map(o => ({ ...o, isCorrect: o.id === id })));
  };

  const insertLatexSymbol = (symbol: string) => {
    setSoalLatex(prev => prev + ' ' + symbol);
  };

  // =====================================================
  // Handler Simpan ke Supabase
  // =====================================================
  const handleSave = useCallback(async () => {
    setSaveResult(null);

    if (!soalText.trim()) {
      setSaveResult({ type: 'error', msg: 'Teks narasi soal tidak boleh kosong.' });
      return;
    }
    if (!options.some(o => o.isCorrect)) {
      setSaveResult({ type: 'error', msg: 'Pilih minimal satu jawaban yang benar.' });
      return;
    }
    if (options.some(o => !o.text.trim())) {
      setSaveResult({ type: 'error', msg: 'Semua opsi jawaban harus diisi.' });
      return;
    }

    setIsSaving(true);

    const payload: QuestionPayload = {
      soal_text: soalText,
      soal_latex: soalLatex,
      image_url: imageUrl,
      cabang_materi: cabangMateri,
      pilar_rme: pilarRme,
      options: options.map((o, i) => ({
        id: String.fromCharCode(65 + i),
        text: o.text,
        isCorrect: o.isCorrect,
      })),
      created_by: user?.email || 'unknown',
    };

    try {
      const { error } = await supabase
        .from('questions')
        .insert([payload]);

      if (error) throw error;

      setSaveResult({ type: 'success', msg: 'Soal berhasil disimpan ke database!' });

      // Reset form
      setTimeout(() => {
        setSoalText('');
        setSoalLatex('');
        setImageUrl('');
        setOptions([
          { id: 'opt-A', text: '', isCorrect: false },
          { id: 'opt-B', text: '', isCorrect: false },
        ]);
        setSaveResult(null);
        setShowModal(false);
      }, 2000);
    } catch (err: any) {
      setSaveResult({ type: 'error', msg: `Gagal menyimpan: ${err.message || 'Unknown error'}` });
    } finally {
      setIsSaving(false);
    }
  }, [soalText, soalLatex, imageUrl, cabangMateri, pilarRme, options, user]);

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="w-full font-sans">
      {/* Tombol Utama Admin */}
      <button
        onClick={() => { setShowModal(true); setSaveResult(null); }}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        + Tambahkan Soal
      </button>

      {/* ===== MODAL OVERLAY ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-8 pb-8 overflow-y-auto">
          <div className="w-full max-w-3xl mx-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">

            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white">edit_document</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Tambah Soal Pembelajaran</h2>
                  <p className="text-slate-300 text-xs">Panel Manajemen — Admin/Guru</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Metadata Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">category</span>
                    Cabang Materi
                  </label>
                  <select value={cabangMateri} onChange={(e) => setCabangMateri(e.target.value as CabangMateri)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm focus:border-emerald-500 outline-none transition-colors cursor-pointer">
                    {CABANG_OPTIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">psychology</span>
                    Pilar RME
                  </label>
                  <select value={pilarRme} onChange={(e) => setPilarRme(e.target.value as PilarRME)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm focus:border-emerald-500 outline-none transition-colors cursor-pointer">
                    {PILAR_OPTIONS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Teks Soal (Narasi) */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">description</span>
                  Narasi / Teks Soal
                </label>
                <textarea
                  value={soalText}
                  onChange={(e) => setSoalText(e.target.value)}
                  rows={5}
                  placeholder="Tuliskan narasi soal berbasis konteks realistis (RME) di sini. Contoh: 'Seorang pelaku UMKM mengamati...'"
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm leading-relaxed focus:border-emerald-500 outline-none resize-y transition-colors placeholder:text-slate-400"
                />
              </div>

              {/* Input LaTeX */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">function</span>
                    Persamaan Matematika (LaTeX)
                  </label>
                  <button onClick={() => setShowLatexPanel(!showLatexPanel)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">symbols</span>
                    {showLatexPanel ? 'Tutup Simbol' : 'Sisipkan Simbol'}
                  </button>
                </div>

                {/* Panel Simbol LaTeX */}
                {showLatexPanel && (
                  <div className="mb-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                    {LATEX_SYMBOLS.map((s) => (
                      <button key={s.label}
                        onClick={() => insertLatexSymbol(s.insert)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                        title={s.insert}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  value={soalLatex}
                  onChange={(e) => setSoalLatex(e.target.value)}
                  rows={3}
                  placeholder="Contoh: f(x) = \frac{a}{b} + x^{2}"
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-mono focus:border-indigo-500 outline-none resize-y transition-colors placeholder:text-slate-400"
                />

                {/* Live Preview LaTeX */}
                {soalLatex.trim() && (
                  <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">visibility</span>
                      Live Preview
                    </div>
                    <div className="text-lg text-slate-800 dark:text-white overflow-x-auto">
                      <InlineMath math={soalLatex} />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Gambar */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">image</span>
                  URL Gambar Aset (Opsional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); setShowImagePreview(false); }}
                    placeholder="https://example.com/gambar-soal.png"
                    className="flex-1 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:border-emerald-500 outline-none transition-colors placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => setShowImagePreview(!showImagePreview)}
                    disabled={!imageUrl.trim()}
                    className={`px-4 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors ${imageUrl.trim() ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">preview</span>
                    Pratinjau
                  </button>
                </div>
                {showImagePreview && imageUrl.trim() && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center animate-in fade-in">
                    <img src={imageUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).alt = 'Gagal memuat gambar'; }} />
                  </div>
                )}
              </div>

              {/* ===== OPSI JAWABAN DINAMIS ===== */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">checklist</span>
                  Opsi Jawaban
                </label>
                <div className="space-y-3">
                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <div key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${opt.isCorrect ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                        {/* Label Huruf */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {letter}
                        </div>
                        {/* Input Teks */}
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOptionText(opt.id, e.target.value)}
                          placeholder={`Jawaban opsi ${letter}`}
                          className="flex-1 p-2 rounded-lg bg-transparent text-sm font-semibold text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                        />
                        {/* Tombol Jawaban Benar */}
                        <button onClick={() => setCorrectOption(opt.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600'}`}>
                          <span className="material-symbols-outlined text-[14px]">{opt.isCorrect ? 'check_circle' : 'radio_button_unchecked'}</span>
                          {opt.isCorrect ? 'Benar' : 'Pilih'}
                        </button>
                        {/* Tombol Hapus */}
                        {options.length > 2 && (
                          <button onClick={() => removeOption(opt.id)}
                            className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/10 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {options.length < 8 && (
                  <button onClick={addOption}
                    className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-bold text-xs hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Tambah Pilihan Jawaban ({String.fromCharCode(65 + options.length)})
                  </button>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              {/* Save Result */}
              {saveResult && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in ${saveResult.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                  <span className="material-symbols-outlined text-[18px]">{saveResult.type === 'success' ? 'check_circle' : 'error'}</span>
                  {saveResult.msg}
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  Batal
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${isSaving ? 'bg-slate-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/30 active:scale-95'}`}>
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Simpan Soal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
