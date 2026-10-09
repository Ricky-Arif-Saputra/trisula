import { GoogleGenAI } from '@google/genai';

export interface RmeAnswers {
  diketahui: string;
  ditanya: string;
  pengerjaan: string;
  kesimpulan: string;
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
}

export interface AiScoreResult {
  evaluation: {
    diketahui: { score: number; max_score: number; reason: string };
    ditanya: { score: number; max_score: number; reason: string };
    pengerjaan: { score: number; max_score: number; reason: string };
    kesimpulan: { score: number; max_score: number; reason: string };
  };
  total_score: number;
}

export async function scoreRmeAnswers(
  answers: RmeAnswers,
  keys: RmeKeys
): Promise<AiScoreResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API Key AI tidak terdeteksi. Harap minta Admin untuk mengisi VITE_GEMINI_API_KEY di file .env terlebih dahulu sebelum fitur penilaian AI dapat digunakan.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Tugas Anda adalah membandingkan Jawaban 4 Tahap Siswa dengan Kunci Acuan Guru secara presisi (perhatikan kesetaraan rumus LaTeX).
Untuk tiap tahap, tentukan berapa poin yang didapat siswa (0 hingga Poin Maksimal) dan BERIKAN ALASAN SINGKAT mengapa poin tersebut diberikan.

JAWABAN SISWA:
1. Diketahui: ${answers.diketahui || '(kosong)'}
2. Ditanya: ${answers.ditanya || '(kosong)'}
3. Pengerjaan: ${answers.pengerjaan || '(kosong)'}
4. Kesimpulan: ${answers.kesimpulan || '(kosong)'}

KUNCI JAWABAN ACUAN ADMIN:
1. Diketahui: ${keys.ref_diketahui || '(tidak ada kunci)'}  — Poin Maks: ${keys.points_diketahui}
2. Ditanya: ${keys.ref_ditanya || '(tidak ada kunci)'}  — Poin Maks: ${keys.points_ditanya}
3. Pengerjaan: ${keys.ref_pengerjaan || '(tidak ada kunci)'}  — Poin Maks: ${keys.points_pengerjaan}
4. Kesimpulan: ${keys.ref_kesimpulan || '(tidak ada kunci)'}  — Poin Maks: ${keys.points_kesimpulan}

Kembalikan HANYA format JSON murni tanpa markdown:
{
  "evaluation": {
    "diketahui": { "score": <number>, "max_score": ${keys.points_diketahui}, "reason": "<alasan>" },
    "ditanya": { "score": <number>, "max_score": ${keys.points_ditanya}, "reason": "<alasan>" },
    "pengerjaan": { "score": <number>, "max_score": ${keys.points_pengerjaan}, "reason": "<alasan>" },
    "kesimpulan": { "score": <number>, "max_score": ${keys.points_kesimpulan}, "reason": "<alasan>" }
  },
  "total_score": <total_score_sum>
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const raw = response.text?.trim() || '';
  const jsonStr = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  try {
    const result = JSON.parse(jsonStr) as AiScoreResult;
    return result;
  } catch {
    throw new Error('AI mengembalikan respons tidak valid. Silakan coba lagi.');
  }
}
