/**
 * MathInput
 * ──────────────────────────────────────────────────────────────
 * Textarea dengan live-preview LaTeX selalu aktif.
 *
 * Cara kerja:
 *  • User mengetik di textarea (value disimpan as-is, misal "$x^2 + 1$")
 *  • Selama ada konten, DI BAWAH textarea langsung tampil hasil render
 *    LaTeX — bukan syntax mentah.
 *  • Tidak perlu klik tombol apapun; preview muncul realtime.
 *  • Mendukung: teks biasa, $inline$, dan $$display$$.
 */
import React, { useRef } from 'react';
import { MathRenderer } from './MathRenderer';

interface MathInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  /** Extra className untuk textarea */
  inputClassName?: string;
  /** Warna aksen border-fokus */
  accent?: 'indigo' | 'amber' | 'violet' | 'emerald' | 'sky';
  disabled?: boolean;
}

const ACCENT: Record<string, string> = {
  indigo:  'focus:border-indigo-400',
  amber:   'focus:border-amber-400',
  violet:  'focus:border-violet-400',
  emerald: 'focus:border-emerald-400',
  sky:     'focus:border-sky-400',
};

export const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  placeholder = 'Ketik teks atau LaTeX: $x^2$ atau $$\\frac{a}{b}$$',
  rows = 3,
  inputClassName = '',
  accent = 'indigo',
  disabled = false,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const hasContent = value.trim().length > 0;

  return (
    <div className="space-y-1">
      {/* Input area */}
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm
          outline-none resize-y transition-colors font-mono
          ${ACCENT[accent] ?? ACCENT.indigo}
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${inputClassName}`}
      />

      {/* Live preview — always shown when there's content */}
      {hasContent && (
        <div className="px-3 py-2 rounded-lg border border-indigo-100 bg-slate-50 min-h-[32px]">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
            Tampilan
          </span>
          <MathRenderer text={value} className="text-sm text-slate-800" />
        </div>
      )}
    </div>
  );
};
