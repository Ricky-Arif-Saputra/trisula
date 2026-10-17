import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import katex from 'katex';
import { marked } from 'marked';
import { MathCategory } from '../../types';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import {
  Plus, BookOpen, Loader2, Edit3, Trash2, Save, X,
  ChevronRight, ArrowLeft, Check, AlertCircle, FileText,
  Video, ImageIcon, Link2, Youtube, Music, Eye, EyeOff,
  Calendar, Tag, Download, ExternalLink, PlayCircle,
  GripVertical, UploadCloud,
} from 'lucide-react';

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------
type AttachmentType = 'pdf' | 'video' | 'image' | 'youtube' | 'link' | 'audio';

interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  label: string;
}

interface MateriPost {
  id: string;
  strand: string;
  title: string;
  description: string;
  attachments: Attachment[];
  tags: string[];
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------
// Constants
// -------------------------------------------------------------
const TOPICS: { id: MathCategory; label: string; icon: string; gradient: string; accent: string; desc: string }[] = [  { id: 'bilangan',     label: 'Bilangan',              icon: 'tag',            gradient: 'from-blue-600 to-cyan-500',     accent: '#2563eb', desc: 'Operasi hitung, FPB & KPK, rasio & sifat bilangan' },
  { id: 'aljabar',      label: 'Aljabar',               icon: 'functions',      gradient: 'from-violet-600 to-purple-500', accent: '#7c3aed', desc: 'Persamaan, pertidaksamaan & sistem fungsi' },
  { id: 'geometri',     label: 'Geometri & Pengukuran', icon: 'category',       gradient: 'from-emerald-600 to-teal-500',  accent: '#059669', desc: 'Bangun 2D/3D, transformasi & pengukuran' },
  { id: 'trigonometri', label: 'Trigonometri',           icon: 'change_history', gradient: 'from-amber-500 to-orange-500',  accent: '#d97706', desc: 'Rasio, identitas & grafik gelombang' },
  { id: 'peluang',      label: 'Data & Peluang',         icon: 'bar_chart',      gradient: 'from-rose-600 to-pink-500',     accent: '#e11d48', desc: 'Analisis data, statistik & teori peluang' },
];

const ATTACHMENT_META: Record<AttachmentType, { label: string; icon: React.ReactNode; color: string; placeholder: string; hint: string }> = {  pdf:     { label: 'File PDF',       icon: <FileText size={14} />,    color: 'text-rose-600 bg-rose-50 border-rose-200',     placeholder: 'URL file PDF atau Google Drive share link', hint: 'Link langsung ke file .pdf' },
  video:   { label: 'Video',          icon: <Video size={14} />,       color: 'text-blue-600 bg-blue-50 border-blue-200',     placeholder: 'URL file video (mp4, webm, atau hosting)', hint: 'Link video yang bisa diputar langsung' },
  image:   { label: 'Gambar',         icon: <ImageIcon size={14} />,   color: 'text-sky-600 bg-sky-50 border-sky-200',        placeholder: 'URL gambar (jpg, png, webp...)', hint: 'Gambar akan ditampilkan langsung' },
  youtube: { label: 'YouTube',        icon: <Youtube size={14} />,     color: 'text-red-600 bg-red-50 border-red-200',        placeholder: 'https://youtube.com/watch?v=... atau youtu.be/...', hint: 'Akan di-embed sebagai player' },
  link:    { label: 'Link Eksternal', icon: <Link2 size={14} />,       color: 'text-indigo-600 bg-indigo-50 border-indigo-200', placeholder: 'https://...', hint: 'Link ke sumber belajar lainnya' },
  audio:   { label: 'Audio',          icon: <Music size={14} />,       color: 'text-purple-600 bg-purple-50 border-purple-200', placeholder: 'URL file audio (mp3, ogg...)', hint: 'Audio akan bisa diputar langsung' },
};

let _aid = 0;
const mkaid = () => `att-${++_aid}-${Date.now()}`;

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
const getYoutubeId = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

// -------------------------------------------------------------
// AttachmentViewer � untuk siswa melihat lampiran
// -------------------------------------------------------------
const AttachmentViewer: React.FC<{ att: Attachment }> = ({ att }) => {
  const meta = ATTACHMENT_META[att.type];
  const label = att.label || meta.label;

  if (att.type === 'youtube') {
    const ytId = getYoutubeId(att.url);
    if (!ytId) return (
      <a href={att.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-red-600 hover:underline font-bold">
        <Youtube size={16} /> {label}
      </a>
    );
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-red-600">
          <Youtube size={14} /> {label}
        </div>
        <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-lg" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (att.type === 'image') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600">
          <ImageIcon size={14} /> {label}
        </div>
        <img src={att.url} alt={label}
          className="w-full max-h-80 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
      </div>
    );
  }

  if (att.type === 'video') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
          <Video size={14} /> {label}
        </div>
        <video controls className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-black max-h-80">
          <source src={att.url} />
          Browser Anda tidak mendukung pemutar video.
        </video>
      </div>
    );
  }

  if (att.type === 'audio') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <Music size={18} className="text-purple-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 truncate">{label}</p>
          <audio controls className="w-full mt-1.5 h-8">
            <source src={att.url} />
          </audio>
        </div>
      </div>
    );
  }

  if (att.type === 'pdf') {
    return (
      <a href={att.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors group cursor-pointer">
        <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{label}</p>
          <p className="text-[11px] text-rose-600 mt-0.5">Buka / unduh PDF</p>
        </div>
        <Download size={16} className="text-rose-400 group-hover:text-rose-600 transition-colors shrink-0" />
      </a>
    );
  }

  // link
  return (
    <a href={att.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
        <ExternalLink size={18} className="text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{label}</p>
        <p className="text-[11px] text-indigo-500 truncate mt-0.5">{att.url}</p>
      </div>
      <ExternalLink size={16} className="text-indigo-400 group-hover:text-indigo-600 shrink-0" />
    </a>
  );
};

// -------------------------------------------------------------
// PostCard � card ringkasan materi untuk daftar
// -------------------------------------------------------------
// -------------------------------------------------------------
// MarkdownContent — pipeline: KaTeX → marked → dangerouslySetInnerHTML
// Ini pendekatan paling reliable: tidak ada konflik plugin versi.
// -------------------------------------------------------------

// Konfigurasi marked sekali saja
const markedRenderer = new marked.Renderer();

// Override link agar buka di tab baru
markedRenderer.link = ({ href, text }: { href: string; text: string }) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer" class="materi-link">${text}</a>`;

marked.setOptions({ renderer: markedRenderer, gfm: true, breaks: false });

/** Render semua $$...$$ dan $...$ menjadi HTML KaTeX */
function applyKatex(src: string): string {
  // Lindungi blok kode ``` dari pemrosesan LaTeX
  const codeBlocks: string[] = [];
  let out = src.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (m) => {
    codeBlocks.push(m);
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  // 1. Display math — $$...$$ (multi-line, supports aligned/cases dll)
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: true, throwOnError: false, trust: true,
        strict: (errCode: string) => errCode === 'unicodeTextInMathMode' ? 'ignore' : 'warn',
        macros: { '\\dfrac': '\\frac', '\\multicolumn': '' },
      });
    } catch { return `<code class="materi-code-inline">${expr}</code>`; }
  });

  // 2. Inline math — $...$
  //    Regex: $ lalu konten (tidak mengandung $, newline), lalu $
  //    Tambah toleransi untuk ^ { } \ spasi dll
  out = out.replace(/\$([^$\n]{1,400}?)\$/g, (_m, expr) => {
    const e = expr.trim();
    if (!e) return _m;
    try {
      return katex.renderToString(e, {
        displayMode: false, throwOnError: false, trust: true,
        strict: (errCode: string) => errCode === 'unicodeTextInMathMode' ? 'ignore' : 'warn',
        macros: { '\\dfrac': '\\frac' },
      });
    } catch { return `<code class="materi-code-inline">${e}</code>`; }
  });

  // Kembalikan blok kode
  out = out.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);

  return out;
}

/** Konversi markdown + katex → HTML siap render */
function mdToHtml(content: string): string {
  // Step 1: render LaTeX dulu (sebelum marked karena marked bisa rusak $)
  const withMath = applyKatex(content);
  // Step 2: render markdown → HTML
  const html = marked.parse(withMath) as string;
  // Step 3: inject class CSS ke elemen HTML yang dihasilkan marked
  return html
    .replace(/<h1>/g, '<h1 class="materi-h1">')
    .replace(/<h2>/g, '<h2 class="materi-h2">')
    .replace(/<h3>/g, '<h3 class="materi-h3">')
    .replace(/<h4>/g, '<h4 class="materi-h4">')
    .replace(/<p>/g, '<p class="materi-p">')
    .replace(/<ul>/g, '<ul class="materi-ul">')
    .replace(/<ol>/g, '<ol class="materi-ol">')
    .replace(/<li>/g, '<li class="materi-li">')
    .replace(/<strong>/g, '<strong class="materi-strong">')
    .replace(/<em>/g, '<em class="materi-em">')
    .replace(/<pre><code/g, '<pre class="materi-pre"><code class="materi-code-block"')
    .replace(/<code>/g, '<code class="materi-code-inline">')
    .replace(/<blockquote>/g, '<blockquote class="materi-blockquote">')
    .replace(/<hr>/g, '<div class="materi-hr"><span>✦</span></div>')
    .replace(/<hr\/>/g, '<div class="materi-hr"><span>✦</span></div>')
    .replace(/<table>/g, '<div class="materi-table-wrap"><table class="materi-table">')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<thead>/g, '<thead class="materi-thead">')
    .replace(/<th>/g, '<th class="materi-th">')
    .replace(/<th align="center">/g, '<th class="materi-th" style="text-align:center">')
    .replace(/<th align="right">/g, '<th class="materi-th" style="text-align:right">')
    .replace(/<tr>/g, '<tr class="materi-tr">')
    .replace(/<td>/g, '<td class="materi-td">')
    .replace(/<td align="center">/g, '<td class="materi-td" style="text-align:center">')
    .replace(/<td align="right">/g, '<td class="materi-td" style="text-align:right">')
    .replace(/<td style="text-align:center">/g, '<td class="materi-td" style="text-align:center">')
    .replace(/<td style="text-align:right">/g, '<td class="materi-td" style="text-align:right">')
    // Display math block — bungkus dalam div bergaya
    .replace(/<span class="katex-display">/g, '<span class="katex-display materi-katex-display">');
}

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const html = React.useMemo(() => mdToHtml(content), [content]);
  return (
    <div
      className="materi-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
const PostCard: React.FC<{
  post: MateriPost;
  isAdmin: boolean;
  accentGradient: string;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ post, isAdmin, accentGradient, onOpen, onEdit, onDelete }) => {
  const attTypes = [...new Set(post.attachments.map(a => a.type))];
  return (
    <div className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Color top strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${accentGradient}`} />

      <div className="p-4 flex-1 flex flex-col gap-2.5">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <Calendar size={10} /> {formatDate(post.created_at)}
          </span>
          {post.tags.length > 0 && post.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              {tag}
            </span>
          ))}
          {!post.published && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-0.5">
              <EyeOff size={9} /> Draft
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Description */}
        {post.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        )}

        {/* Attachment type badges */}
        {attTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {attTypes.map(type => {
              const m = ATTACHMENT_META[type];
              return (
                <span key={type} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.color}`}>
                  {m.icon} {m.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button onClick={onOpen}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 dark:border dark:border-white/20 text-white text-xs font-bold cursor-pointer hover:bg-slate-700 dark:hover:bg-white/20 transition-colors">
            <Eye size={13} /> Buka Materi
          </button>
          {isAdmin && (
            <>
              <button onClick={onEdit}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-center cursor-pointer transition-colors">
                <Edit3 size={14} />
              </button>
              <button onClick={onDelete}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center justify-center cursor-pointer transition-colors">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// PostDetail — full width, premium layout
// -------------------------------------------------------------
const PostDetail: React.FC<{
  post: MateriPost;
  accentGradient: string;
  isAdmin: boolean;
  onBack: () => void;
  onEdit: () => void;
}> = ({ post, accentGradient, isAdmin, onBack, onEdit }) => (
  <div className="w-full">
    {/* ── HERO BANNER full-width ── */}
    <div className={`relative w-full bg-gradient-to-br ${accentGradient} text-white overflow-hidden`}>
      {/* decorative blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.18),transparent_60%)]" />
      <div className="absolute right-8 bottom-0 opacity-[0.06] text-[160px] font-black leading-none select-none pointer-events-none">∑</div>

      <div className="relative z-10 px-6 lg:px-12 pt-8 pb-10 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-white/60 mb-5">
          <span>Materi</span>
          <ChevronRight size={12} />
          <span className="text-white/90">{post.title}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-white/15 border border-white/25 uppercase tracking-widest">
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4 max-w-3xl">{post.title}</h1>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-sm text-white/70 flex-wrap">
          <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(post.created_at)}</span>
          {post.attachments.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">attach_file</span>
              {post.attachments.length} bahan ajar
            </span>
          )}
          {isAdmin && (
            <button onClick={onEdit}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold cursor-pointer hover:bg-white/25 transition-colors">
              <Edit3 size={12} /> Edit
            </button>
          )}
        </div>
      </div>
    </div>

    {/* ── BODY: dua kolom di desktop ── */}
    <div className="max-w-6xl mx-auto px-4 lg:px-12 py-8">
      <div className="flex gap-8 items-start">

        {/* MAIN CONTENT — kiri, lebar */}
        <div className="flex-1 min-w-0">
          {post.description && (
            <div className="bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
              {/* Konten header strip */}
              <div className={`h-1 w-full bg-gradient-to-r ${accentGradient}`} />
              <div className="p-8 lg:p-10">
                <MarkdownContent content={post.description} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Oleh: {post.created_by}</span>
            <span>Diperbarui {formatDate(post.updated_at)}</span>
          </div>
        </div>

        {/* SIDEBAR — kanan, hanya tampil jika ada lampiran (desktop) */}
        {post.attachments.length > 0 && (
          <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0 sticky top-20">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className={`px-4 py-3 bg-gradient-to-r ${accentGradient}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Bahan Ajar</p>
                <p className="text-sm font-extrabold text-white">{post.attachments.length} Lampiran</p>
              </div>
              <div className="p-3 space-y-2">
                {post.attachments.map(att => (
                  <AttachmentViewer key={att.id} att={att} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lampiran mobile (di bawah konten) */}
      {post.attachments.length > 0 && (
        <div className="lg:hidden mt-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Bahan Ajar &amp; Referensi</p>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
          {post.attachments.map(att => (
            <AttachmentViewer key={att.id} att={att} />
          ))}
        </div>
      )}
    </div>
  </div>
);

const AttachmentEditorRow: React.FC<{
  att: Attachment;
  index: number;
  total: number;
  onChange: (id: string, field: keyof Attachment, val: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}> = ({ att, index, total, onChange, onRemove, onMove }) => {
  const meta = ATTACHMENT_META[att.type];
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr(null);
    try {
      const ext = file.name.split('.').pop();
      const path = `materi/${att.type}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('materi-files')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('materi-files').getPublicUrl(path);
      onChange(att.id, 'url', data.publicUrl);
      if (!att.label) onChange(att.id, 'label', file.name.replace(/\.[^/.]+$/, ''));
    } catch (err: any) {
      setUploadErr(err.message || 'Gagal mengupload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const canUploadFile = att.type in FILE_UPLOAD_ACCEPT;

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${meta.color.replace('text-', 'border-').split(' ')[0]} bg-white dark:bg-slate-900`}>
      <div className="flex items-center gap-2">
        <GripVertical size={13} className="text-slate-300 shrink-0" />
        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${meta.color.split(' ')[0]}`}>
          {meta.icon} {meta.label}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => onMove(att.id, 'up')} disabled={index === 0}
            className="w-6 h-6 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-30">
            <ChevronRight size={12} className="-rotate-90" />
          </button>
          <button type="button" onClick={() => onMove(att.id, 'down')} disabled={index === total - 1}
            className="w-6 h-6 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-30">
            <ChevronRight size={12} className="rotate-90" />
          </button>
          <button type="button" onClick={() => onRemove(att.id)}
            className="w-6 h-6 rounded text-rose-400 hover:bg-rose-100 flex items-center justify-center cursor-pointer">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Label */}
      <input
        value={att.label}
        onChange={e => onChange(att.id, 'label', e.target.value)}
        placeholder="Nama / label (misal: Modul Bab 1)"
        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:border-indigo-400"
      />

      {/* URL input */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400">Tautan URL</p>
        <input
          value={att.url}
          onChange={e => onChange(att.id, 'url', e.target.value)}
          placeholder={meta.placeholder}
          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none focus:border-indigo-400"
        />
        <p className="text-[10px] text-slate-400">{meta.hint}</p>
      </div>

      {/* File upload fisik */}
      {canUploadFile && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400">� atau upload file langsung �</p>
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed transition-colors cursor-pointer
              ${uploading
                ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 cursor-wait'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 bg-slate-50 dark:bg-slate-800/50'
              }`}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="text-indigo-500 animate-spin shrink-0" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Mengupload...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {att.url ? 'Ganti dengan file baru' : 'Klik untuk pilih file'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {FILE_UPLOAD_ACCEPT[att.type]} � Maks. 50 MB
                  </p>
                </div>
                {att.url && <Check size={14} className="text-emerald-500 shrink-0" />}
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_UPLOAD_ACCEPT[att.type]}
            onChange={handleFileUpload}
            className="hidden"
          />
          {uploadErr && (
            <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
              <AlertCircle size={10} /> {uploadErr}
            </p>
          )}
        </div>
      )}

      {/* Preview thumbnails */}
      {att.type === 'image' && att.url.trim() && (
        <img src={att.url} alt="" className="max-h-24 rounded-lg border border-slate-200 object-contain" />
      )}
      {att.type === 'youtube' && att.url.trim() && getYoutubeId(att.url) && (
        <img
          src={`https://img.youtube.com/vi/${getYoutubeId(att.url)}/mqdefault.jpg`}
          alt="thumbnail"
          className="max-h-24 rounded-lg border border-red-200 object-contain"
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// PostForm � form tambah / edit materi (admin)
// -------------------------------------------------------------
const PostForm: React.FC<{
  strand: string;
  existing: MateriPost | null;
  onSaved: (post: MateriPost) => void;
  onClose: () => void;
}> = ({ strand, existing, onSaved, onClose }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [attachments, setAttachments] = useState<Attachment[]>(existing?.attachments || []);
  const [tagsRaw, setTagsRaw] = useState((existing?.tags || []).join(', '));
  const [published, setPublished] = useState(existing?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addAtt = (type: AttachmentType) =>
    setAttachments(prev => [...prev, { id: mkaid(), type, url: '', label: '' }]);
  const updateAtt = (id: string, field: keyof Attachment, val: string) =>
    setAttachments(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
  const removeAtt = (id: string) =>
    setAttachments(prev => prev.filter(a => a.id !== id));
  const moveAtt = (id: string, dir: 'up' | 'down') =>
    setAttachments(prev => {
      const idx = prev.findIndex(a => a.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

  const handleSave = async () => {
    setMsg(null);
    if (!title.trim()) { setMsg({ type: 'error', text: 'Judul wajib diisi.' }); return; }
    setSaving(true);
    try {
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        strand,
        title: title.trim(),
        description: description.trim(),
        attachments,
        tags,
        published,
        created_by: user?.email || user?.id || 'admin',
        updated_at: new Date().toISOString(),
      };
      let result;
      if (existing?.id) {
        result = await supabase.from('materi_posts').update(payload).eq('id', existing.id).select().single();
      } else {
        result = await supabase.from('materi_posts').insert([payload]).select().single();
      }
      if (result.error) throw result.error;
      setMsg({ type: 'success', text: 'Berhasil disimpan!' });
      setTimeout(() => onSaved(result.data as MateriPost), 600);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Gagal menyimpan.' });
    } finally {
      setSaving(false);
    }
  };

  const attTypeGroups: { label: string; types: AttachmentType[] }[] = [
    { label: 'Media',    types: ['image', 'video', 'audio'] },
    { label: 'Dokumen',  types: ['pdf', 'link'] },
    { label: 'Platform', types: ['youtube'] },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
            {existing ? 'Edit Materi' : 'Materi Baru'}
          </div>
          <h3 className="text-white font-extrabold text-sm mt-0.5">
            {existing ? existing.title : `Topik: ${strand}`}
          </h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer text-white">
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Judul */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Judul *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Modul Persamaan Linear Satu Variabel"
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-400" />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Deskripsi / Ringkasan</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={3} placeholder="Tuliskan pengantar singkat tentang materi ini..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none resize-y focus:border-indigo-400 leading-relaxed" />
        </div>

        {/* Tags */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Tag (pisah koma)</label>
          <input value={tagsRaw} onChange={e => setTagsRaw(e.target.value)}
            placeholder="Contoh: Kelas 10, Semester 1, Wajib"
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-400" />
        </div>

        {/* Publikasi */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button type="button" onClick={() => setPublished(v => !v)}
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${published ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${published ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{published ? 'Dipublikasikan' : 'Draft (tidak terlihat siswa)'}</p>
            <p className="text-[10px] text-slate-400">Aktifkan agar materi bisa diakses siswa</p>
          </div>
        </div>

        {/* Lampiran */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Bahan Ajar & Lampiran</label>
          <div className="space-y-2 mb-3">
            {attachments.map((att, i) => (
              <AttachmentEditorRow key={att.id} att={att} index={i} total={attachments.length}
                onChange={updateAtt} onRemove={removeAtt} onMove={moveAtt} />
            ))}
          </div>
          {/* Type picker */}
          <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">+ Tambah Lampiran</p>
            {attTypeGroups.map(g => (
              <div key={g.label} className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{g.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {g.types.map(type => {
                    const m = ATTACHMENT_META[type];
                    return (
                      <button key={type} type="button" onClick={() => addAtt(type)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border ${m.color} cursor-pointer hover:opacity-80 transition-opacity`}>
                        {m.icon} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status msg */}
        {msg && (
          <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {msg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />} {msg.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors">
            Batal
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer disabled:bg-slate-400 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Menyimpan...' : existing ? 'Simpan Perubahan' : 'Publikasikan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// TopicScreen � daftar & detail materi satu topik
// -------------------------------------------------------------
const TopicScreen: React.FC<{
  topic: typeof TOPICS[number];
  onBack: () => void;
}> = ({ topic, onBack }) => {
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState<MateriPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'closed' | 'new' | string>('closed'); // 'closed' | 'new' | postId (edit)

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const query = supabase
        .from('materi_posts')
        .select('*')
        .ilike('strand', topic.id)
        .order('created_at', { ascending: false });
      const { data } = await query;
      setPosts((data as MateriPost[]) || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [topic.id]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus materi ini?')) return;
    await supabase.from('materi_posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
    if (openPostId === id) setOpenPostId(null);
  };

  const openPost = posts.find(p => p.id === openPostId);
  const editPost = typeof formMode === 'string' && formMode !== 'closed' && formMode !== 'new'
    ? posts.find(p => p.id === formMode) || null
    : null;
  const isFormOpen = formMode !== 'closed';

  // -- Render post detail --
  if (openPost && !isFormOpen) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sticky topbar */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 px-4 lg:px-10 py-3 max-w-7xl mx-auto">
            <button onClick={() => setOpenPostId(null)}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-colors shrink-0">
              <ArrowLeft size={18} />
            </button>
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow shrink-0`}>
              <span className="material-symbols-outlined text-white text-[14px]">{topic.icon}</span>
            </div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white truncate flex-1">{openPost.title}</h2>
            {isAdmin && (
              <button onClick={() => setFormMode(openPost.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                <Edit3 size={12} /> Edit
              </button>
            )}
          </div>
        </div>
        <PostDetail
          post={openPost}
          accentGradient={topic.gradient}
          isAdmin={isAdmin}
          onBack={() => setOpenPostId(null)}
          onEdit={() => setFormMode(openPost.id)}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Topic sticky header */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 px-4 lg:px-10 py-3 max-w-7xl mx-auto">
          <button onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-colors shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <span className="material-symbols-outlined text-white text-[18px]">{topic.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">{topic.label}</h2>
            <p className="text-[10px] text-slate-400">{posts.length} bahan ajar tersedia</p>
          </div>
          {isAdmin && !isFormOpen && (
            <button onClick={() => setFormMode('new')}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${topic.gradient} text-white text-xs font-bold cursor-pointer hover:opacity-90 shadow-md`}>
              <Plus size={13} /> Tambah Materi
            </button>
          )}
        </div>
      </div>

      {/* Hero banner topik */}
      {!isFormOpen && posts.length > 0 && (
        <div className={`relative w-full bg-gradient-to-br ${topic.gradient} text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.2),transparent_60%)]" />
          <div className="relative z-10 px-6 lg:px-12 py-8 max-w-7xl mx-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Topik Materi</p>
            <h1 className="text-2xl lg:text-3xl font-extrabold leading-tight mb-1">{topic.label}</h1>
            <p className="text-sm text-white/70">{topic.desc}</p>
          </div>
        </div>
      )}

      <div className="px-4 lg:px-10 py-6 max-w-7xl mx-auto">
        {/* Form tambah/edit */}
        {isFormOpen && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <PostForm
              strand={topic.id}
              existing={editPost}
              onSaved={(post) => {
                setPosts(prev => {
                  const idx = prev.findIndex(p => p.id === post.id);
                  if (idx >= 0) { const n = [...prev]; n[idx] = post; return n; }
                  return [post, ...prev];
                });
                setFormMode('closed');
              }}
              onClose={() => setFormMode('closed')}
            />
          </div>
        )}

        {/* List */}
        {!isFormOpen && (
          <>
            {loading ? (
              <div className="flex items-center gap-3 justify-center py-16 text-slate-400">
                <Loader2 size={20} className="animate-spin text-indigo-400" />
                <span className="text-sm">Memuat materi...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center text-center py-20 gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <BookOpen size={36} className="text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-600 dark:text-slate-300">Belum ada materi</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAdmin ? 'Klik "+ Tambah Materi" untuk mulai mengunggah bahan ajar.' : 'Pengajar belum mengunggah materi untuk topik ini.'}
                  </p>
                </div>
                {isAdmin && (
                  <button onClick={() => setFormMode('new')}
                    className={`flex items-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r ${topic.gradient} text-white text-sm font-bold cursor-pointer hover:opacity-90 shadow-lg`}>
                    <Plus size={15} /> Tambah Materi Sekarang
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isAdmin={isAdmin}
                    accentGradient={topic.gradient}
                    onOpen={() => setOpenPostId(post.id)}
                    onEdit={() => setFormMode(post.id)}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MateriScreen � halaman pilih topik (5 materi pokok)
// -------------------------------------------------------------
interface MateriScreenProps {
  initialCategory?: MathCategory | null;
  onSelectCategory?: (category: MathCategory | null) => void;
  onNavigateToProblem?: () => void;
  onNavigateToRmeExam?: (examId: string) => void;
}

export const MateriScreen: React.FC<MateriScreenProps> = ({
  initialCategory = null,
  onSelectCategory,
  onNavigateToRmeExam,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MathCategory | null>(initialCategory);

  useEffect(() => { setSelectedCategory(initialCategory); }, [initialCategory]);

  const handleSelectCat = (cat: MathCategory | null) => {
    setSelectedCategory(cat);
    onSelectCategory?.(cat);
  };

  const topic = TOPICS.find(t => t.id === selectedCategory);

  if (topic) {
    return <TopicScreen topic={topic} onBack={() => handleSelectCat(null)} />;
  }

  // -- Halaman pilih topik --
  return (
    <div className="flex flex-col w-full pb-16 font-sans">
      {/* Hero */}
      <section className="px-4 pt-4 pb-3">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-2xl border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="absolute right-0 bottom-0 opacity-[0.04] select-none text-[120px] font-black leading-none pointer-events-none pr-4 pb-2">?</div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-3 py-1 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Bahan Ajar</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight leading-tight mb-2">Materi Pembelajaran</h2>
            <p className="text-sm text-slate-400">5 topik matematika � Bahan ajar dikelola langsung oleh pengajar</p>
          </div>
        </div>
      </section>

      {/* Grid 5 topik */}
      <section className="px-4 py-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pilih Topik</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOPICS.map((t, i) => (
            <button key={t.id} onClick={() => handleSelectCat(t.id)}
              className="text-left rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group overflow-hidden flex flex-col">
              {/* Top gradient bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${t.gradient}`} />
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="material-symbols-outlined text-white text-[22px]">{t.icon}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full tracking-wider">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {t.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{t.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  Lihat bahan ajar
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
