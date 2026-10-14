/**
 * MathInput — textarea + live LaTeX preview untuk blok tipe LATEX.
 * Value dianggap pure LaTeX expression (tanpa $ wrapper).
 */
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  inputClassName?: string;
  accent?: 'indigo' | 'amber' | 'violet' | 'emerald' | 'sky';
  disabled?: boolean;
  displayMode?: boolean;
  previewLabel?: string; // diabaikan, untuk kompatibilitas
}

const ACCENT_CLS: Record<string, string> = {
  indigo:  'focus:border-indigo-400',
  amber:   'focus:border-amber-400',
  violet:  'focus:border-violet-500',
  emerald: 'focus:border-emerald-400',
  sky:     'focus:border-sky-400',
};

function renderKatex(expr: string, display: boolean): string {
  if (!expr.trim()) return '';
  try {
    return katex.renderToString(expr.trim(), {
      throwOnError: false,
      displayMode: display,
      output: 'html',
    });
  } catch {
    return `<code style="color:#ef4444;font-size:0.8em;font-family:monospace">${expr}</code>`;
  }
}

export const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  placeholder = '\\frac{a}{b} + x^2',
  rows = 2,
  inputClassName = '',
  accent = 'violet',
  disabled = false,
  displayMode = true,
}) => {
  const hasContent = value.trim().length > 0;
  const rendered = hasContent ? renderKatex(value, displayMode) : '';
  const ac = ACCENT_CLS[accent] ?? ACCENT_CLS.violet;

  return (
    <div className="space-y-1.5">
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
        className={`w-full px-3 py-2 rounded-lg border border-violet-200 bg-white
          text-xs font-mono outline-none resize-y transition-colors
          ${ac}
          disabled:bg-slate-50 disabled:cursor-not-allowed
          ${inputClassName}`}
      />
      {hasContent && rendered && (
        <div className="px-4 py-3 rounded-lg border border-violet-200 bg-violet-50/70 overflow-x-auto">
          <p className="text-[9px] font-black uppercase tracking-widest text-violet-400 mb-1.5">
            ∫ Tampilan LaTeX
          </p>
          <div
            className="text-slate-800"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        </div>
      )}
    </div>
  );
};
