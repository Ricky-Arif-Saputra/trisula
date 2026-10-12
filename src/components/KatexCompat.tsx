/**
 * KatexCompat — wrapper drop-in untuk InlineMath dan BlockMath
 * dari react-katex, tapi pakai katex@0.18.7 langsung.
 *
 * Dipakai oleh file-file lama yang masih import dari 'react-katex'.
 * Cukup ganti import "from 'react-katex'" → "from '../KatexCompat'"
 * atau "./KatexCompat"
 */
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function render(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math, {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return `<span style="color:#ef4444">${math}</span>`;
  }
}

export const InlineMath: React.FC<{ math: string }> = ({ math }) => (
  <span dangerouslySetInnerHTML={{ __html: render(math, false) }} />
);

export const BlockMath: React.FC<{ math: string }> = ({ math }) => (
  <div
    className="overflow-x-auto my-2 text-center"
    dangerouslySetInnerHTML={{ __html: render(math, true) }}
  />
);
