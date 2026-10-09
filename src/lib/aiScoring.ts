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

export function calculateLocalRmeScore(answers: RmeAnswers, keys: RmeKeys): AiScoreResult {
  const evaluateStage = (answer: string, ref: string, maxPoints: number) => {
    if (!answer || answer.trim() === '') {
      return { score: 0, max_score: maxPoints, reason: "Jawaban kosong (Penilaian Lokal)" };
    }
    const score = answer.trim().length > 5 ? maxPoints : Math.floor(maxPoints / 2);
    return { score, max_score: maxPoints, reason: "Berdasarkan evaluasi sistem luring (Penilaian Lokal)" };
  };

  const evalDiketahui = evaluateStage(answers.diketahui, keys.ref_diketahui, keys.points_diketahui);
  const evalDitanya = evaluateStage(answers.ditanya, keys.ref_ditanya, keys.points_ditanya);
  const evalPengerjaan = evaluateStage(answers.pengerjaan, keys.ref_pengerjaan, keys.points_pengerjaan);
  const evalKesimpulan = evaluateStage(answers.kesimpulan, keys.ref_kesimpulan, keys.points_kesimpulan);

  return {
    evaluation: {
      diketahui: evalDiketahui,
      ditanya: evalDitanya,
      pengerjaan: evalPengerjaan,
      kesimpulan: evalKesimpulan,
    },
    total_score: evalDiketahui.score + evalDitanya.score + evalPengerjaan.score + evalKesimpulan.score
  };
}

export async function scoreRmeAnswers(
  answers: RmeAnswers,
  keys: RmeKeys
): Promise<AiScoreResult> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key AI tidak terdeteksi.');
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
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = response.text?.trim() || '';
    const jsonStr = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    const result = JSON.parse(jsonStr) as AiScoreResult;
    return result;
  } catch (error) {
    console.warn("AI Scoring failed, falling back to local scoring:", error);
    return calculateLocalRmeScore(answers, keys);
  }
}
