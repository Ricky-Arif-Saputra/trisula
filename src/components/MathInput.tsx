/**
 * MathInput — textarea + live LaTeX preview yang selalu tampil
 *
 * Layout:
 *  [textarea — input syntax]
 *  ─────────────────────────
 *  [preview — hasil render]   ← selalu tampil jika ada konten
 *
 * Preview muncul realtime tanpa klik tombol apapun.
 * Mendukung: teks biasa, $inline$, $$display$$.
 */
import React from 'react';
import { MathRenderer } from './MathRenderer';

interface MathInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  inputClassName?: string;
  accent?: 'indigo' | 'amber' | 'violet' | 'emerald' | 'sky';
  disabled?: boolean;
  /** Label area preview */
  previewLabel?: string;
}

const ACCENT_CLS: Record<string, string> = {
  indigo:  'focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200',
  amber:   'focus:border-amber-400  focus:ring-1 focus:ring-amber-200',
  violet:  'focus:border-violet-400 focus:ring-1 focus:ring-violet-200',
  emerald: 'focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200',
  sky:     'focus:border-sky-400   focus:ring-1 focus:ring-sky-200',
};

export const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  placeholder = 'Ketik teks atau LaTeX: $x^2$ atau $$\\frac{a}{b}$$',
  rows = 3,
  inputClassName = '',
  accent = 'indigo',
  disabled = false,
  previewLabel = 'Tampilan',
}) => {
  const hasContent = value.trim().length > 0;
  const ac = ACCENT_CLS[accent] ?? ACCENT_CLS.indigo;

  return (
    <div className="flex flex-col gap-1.5">
      {/* ── Textarea (selalu tampil untuk edit) ── */}
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg border border-slate-200 bg-white
          text-sm font-mono outline-none resize-y transition-colors
          ${ac}
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${inputClassName}`}
      />

      {/* ── Preview realtime — muncul otomatis jika ada konten ── */}
      {hasContent && (
        <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 px-3 py-2.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1.5 flex items-center gap-1">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="inline"><circle cx="4.5" cy="4.5" r="4.5" fill="#818cf8"/></svg>
            {previewLabel}
          </p>
          <div className="text-sm text-slate-800 leading-relaxed">
            <MathRenderer text={value} />
          </div>
        </div>
      )}
    </div>
  );
};
