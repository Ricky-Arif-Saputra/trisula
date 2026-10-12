/**
 * MathRenderer — render teks dengan LaTeX menggunakan KaTeX langsung.
 *
 * Format yang didukung:
 *   $$...$$ → display math (block, tengah)
 *   $...$   → inline math
 *   teks biasa tetap tampil apa adanya
 */
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
  className?: string;
}

/** Render satu ekspresi LaTeX menjadi HTML string */
function renderLatex(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr, {
      throwOnError: false,
      displayMode,
      output: 'html',
      trust: false,
    });
  } catch {
    return `<code style="color:#ef4444;font-size:0.85em;">${expr}</code>`;
  }
}

/** Split teks menjadi segmen: { type: 'text'|'inline'|'display', content: string } */
function parseSegments(raw: string) {
  type Seg = { type: 'text' | 'inline' | 'display'; content: string };
  const result: Seg[] = [];
  // Regex: $$(...)$$ terlebih dahulu, lalu $(...)$
  const re = /\$\$([\s\S]*?)\$\$|\$([^\$\n]+?)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) {
      result.push({ type: 'text', content: raw.slice(last, m.index) });
    }
    if (m[1] !== undefined) {
      result.push({ type: 'display', content: m[1] });
    } else if (m[2] !== undefined) {
      result.push({ type: 'inline', content: m[2] });
    }
    last = m.index + m[0].length;
  }
  if (last < raw.length) {
    result.push({ type: 'text', content: raw.slice(last) });
  }
  return result;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  const segments = parseSegments(text);

  return (
    <span className={`math-renderer ${className}`}>
      {segments.map((seg, i) => {
        if (seg.type === 'display') {
          return (
            <span
              key={i}
              className="block overflow-x-auto my-2 text-center"
              dangerouslySetInnerHTML={{ __html: renderLatex(seg.content, true) }}
            />
          );
        }
        if (seg.type === 'inline') {
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: renderLatex(seg.content, false) }}
            />
          );
        }
        // Plain text — preserve newlines
        return (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
            {seg.content}
          </span>
        );
      })}
    </span>
  );
};
