/**
 * ImageBlockInput — input gambar dengan dua mode:
 *  - Upload File dari laptop (ke Supabase Storage bucket 'materi-files')
 *  - Link URL langsung
 *
 * Dipakai di LatihanQuestionForm, UjianQuestionForm, QuizQuestionDynamic.
 */
import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UploadCloud, Link2, Loader2, X } from 'lucide-react';

interface ImageBlockInputProps {
  value: string;
  onChange: (val: string) => void;
  /** Tinggi max preview (default 52 = max-h-52) */
  previewMaxH?: string;
}

export const ImageBlockInput: React.FC<ImageBlockInputProps> = ({
  value,
  onChange,
  previewMaxH = 'max-h-52',
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadErr('Hanya file gambar (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('Ukuran maksimal 5 MB.');
      return;
    }

    setUploading(true);
    setUploadErr(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `soal-gambar/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('materi-files')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('materi-files').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      setUploadErr(err.message?.includes('Bucket not found')
        ? 'Bucket "materi-files" belum dibuat. Buat dulu di Supabase Storage.'
        : err.message || 'Gagal upload gambar.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-sky-50 rounded-xl border border-sky-200">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            tab === 'upload'
              ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
              : 'text-sky-500 hover:text-sky-700'
          }`}
        >
          <UploadCloud size={12} /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            tab === 'url'
              ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
              : 'text-sky-500 hover:text-sky-700'
          }`}
        >
          <Link2 size={12} /> Link URL
        </button>
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div className="space-y-2">
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none ${
              uploading
                ? 'border-sky-300 bg-sky-50/50 cursor-wait'
                : value
                ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50'
                : 'border-sky-300 bg-sky-50/40 hover:bg-sky-50 hover:border-sky-400'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 size={22} className="text-sky-500 animate-spin" />
                <span className="text-xs font-bold text-sky-600">Mengupload...</span>
              </>
            ) : value ? (
              <>
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                  <span className="text-white text-sm font-black">✓</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">Gambar berhasil diupload</span>
                <span className="text-[10px] text-slate-400">Klik untuk ganti dengan file lain</span>
              </>
            ) : (
              <>
                <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <UploadCloud size={22} className="text-sky-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-sky-700">Klik untuk pilih gambar dari laptop</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">JPG · PNG · WEBP · GIF &nbsp;|&nbsp; Maks. 5 MB</p>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
          />
          {uploadErr && (
            <div className="flex items-start gap-1.5 text-[11px] text-rose-600 font-bold bg-rose-50 px-2.5 py-2 rounded-lg border border-rose-200">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{uploadErr}</span>
            </div>
          )}
        </div>
      )}

      {/* URL tab */}
      {tab === 'url' && (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://contoh.com/gambar.jpg"
          className="w-full p-2.5 rounded-xl border border-sky-200 bg-white text-sm outline-none focus:border-sky-400 font-mono text-xs"
        />
      )}

      {/* Preview */}
      {value.trim() && (
        <div className="relative group">
          <img
            src={value}
            alt="preview"
            className={`w-full ${previewMaxH} rounded-xl border-2 border-sky-200 object-contain bg-slate-50`}
            onError={e => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Hapus gambar"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
