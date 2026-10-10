export type Difficulty = 'mudah' | 'sedang' | 'sulit';

export interface RmeHint {
  id: string;
  question: string;
}

export interface RmeKeys {
  ref_diketahui: string;
  ref_ditanya: string;
  ref_pengerjaan: string;
  ref_kesimpulan: string;
  points_diketahui: number;
  points_ditanya: number;
  points_pengerjaan: number;
  points_kesimpulan: number;
  hints?: RmeHint[];
  finalNumericAnswer?: number | string | null;
}

export const RME_META_PREFIX = '__RME_KEYS__';

let _c = 0;
export const uid = (p: string) => `${p}-${++_c}-${Date.now()}`;

export const makeBlankRmeKeys = (): RmeKeys => ({
  ref_diketahui: '',
  ref_ditanya: '',
  ref_pengerjaan: '',
  ref_kesimpulan: '',
  points_diketahui: 20,
  points_ditanya: 10,
  points_pengerjaan: 50,
  points_kesimpulan: 20,
  hints: [],
  finalNumericAnswer: null,
});

export const STAGES = [
  { key: 'diketahui' as const, label: 'Diketahui', icon: 'info', color: 'sky', placeholder: 'Tuliskan data yang diketahui dari soal...' },
  { key: 'ditanya' as const, label: 'Ditanya', icon: 'help', color: 'violet', placeholder: 'Tuliskan apa yang ditanyakan soal...' },
  { key: 'pengerjaan' as const, label: 'Pengerjaan', icon: 'calculate', color: 'amber', placeholder: 'Tuliskan langkah pengerjaanmu...' },
  { key: 'kesimpulan' as const, label: 'Kesimpulan', icon: 'check_circle', color: 'emerald', placeholder: 'Tuliskan kesimpulan dari hasil pengerjaan...' },
] as const;

export const STAGE_COLORS: Record<string, { border: string; bg: string; label: string; badge: string; ring: string }> = {
  sky: { border: 'border-sky-200', bg: 'bg-sky-50/50', label: 'text-sky-700', badge: 'bg-sky-500', ring: 'focus:border-sky-400 focus:ring-sky-200' },
  violet: { border: 'border-violet-200', bg: 'bg-violet-50/50', label: 'text-violet-700', badge: 'bg-violet-500', ring: 'focus:border-violet-400 focus:ring-violet-200' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50/50', label: 'text-amber-700', badge: 'bg-amber-500', ring: 'focus:border-amber-400 focus:ring-amber-200' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50/50', label: 'text-emerald-700', badge: 'bg-emerald-500', ring: 'focus:border-emerald-400 focus:ring-emerald-200' },
};

export const DIFF_BADGE: Record<string, { label: string; cls: string }> = {
  mudah: { label: 'Mudah', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  sedang: { label: 'Sedang', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  sulit: { label: 'Sulit', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

export function stripRmeMetaBlocks<T extends { type?: string; value?: string }>(blocks: T[] | undefined): T[] {
  return (blocks || []).filter(b => !(typeof b.value === 'string' && b.value.startsWith(RME_META_PREFIX)));
}

export function parseRmeKeys(question: { rme_keys?: RmeKeys; content_blocks?: { value?: string }[]; options?: { id: string; text: string }[] }): RmeKeys {
  if (question.rme_keys && typeof question.rme_keys === 'object') {
    return { ...makeBlankRmeKeys(), ...question.rme_keys, hints: question.rme_keys.hints || [] };
  }
  const hidden = (question.content_blocks || []).find(b => typeof b.value === 'string' && b.value.startsWith(RME_META_PREFIX));
  if (hidden?.value) {
    try {
      const parsed = JSON.parse(hidden.value.slice(RME_META_PREFIX.length));
      return { ...makeBlankRmeKeys(), ...parsed, hints: parsed.hints || [] };
    } catch { /* ignore */ }
  }
  const opt = (question.options || []).find(o => o.id === '__rme_keys__');
  if (opt?.text) {
    try {
      const parsed = JSON.parse(opt.text);
      return { ...makeBlankRmeKeys(), ...parsed, hints: parsed.hints || [] };
    } catch { /* ignore */ }
  }
  return makeBlankRmeKeys();
}

export function embedRmeKeys(blocks: { id: string; type: string; value: string }[], keys: RmeKeys) {
  return [
    ...stripRmeMetaBlocks(blocks),
    { id: uid('rme'), type: 'text' as const, value: RME_META_PREFIX + JSON.stringify(keys) },
  ];
}

export function normalizeNumeric(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(',', '.').replace(/\s/g, '');
}

export function numbersMatch(userValue: string, expected: string | number | null | undefined): boolean {
  const a = normalizeNumeric(userValue);
  const b = normalizeNumeric(expected);
  if (!a || !b) return false;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb;
  return a === b;
}
