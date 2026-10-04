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
  scores: {
    diketahui: number;
    ditanya: number;
    pengerjaan: number;
    kesimpulan: number;
    total: number;
  };
  feedback: {
    diketahui: string;
    ditanya: string;
    pengerjaan: string;
    kesimpulan: string;
  };
}

export async function scoreRmeAnswers(
  answers: RmeAnswers,
  keys: RmeKeys
): Promise<AiScoreResult> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_GOOGLE_AI_KEY || '';
  if (!apiKey) throw new Error('API Key AI tidak ditemukan. Pastikan VITE_GEMINI_API_KEY sudah diset.');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Tugas Anda adalah menilai secara objektif apakah Jawaban Siswa cocok/setara secara matematis dengan Kunci Jawaban Acuan dari Admin pada masing-masing dari 4 tahapan.
Perhatikan kesetaraan matematis (mathematical equivalence), misal: x = 0.5 setara dengan x = 1/2.
Aturan Penilaian Poin:
- Jika jawaban siswa cocok penuh dengan kunci: berikan Poin Maksimal yang ditentukan Admin.
- Jika jawaban siswa cocok sebagian atau ada kesalahan langkah kecil: berikan poin proporsional (di antara 0 hingga Poin Maksimal Admin).
- Jika jawaban tidak relevan atau salah total: berikan 0 poin.

JAWABAN SISWA:
1. Diketahui: ${answers.diketahui || '(kosong)'}
2. Ditanya: ${answers.ditanya || '(kosong)'}
3. Pengerjaan: ${answers.pengerjaan || '(kosong)'}
4. Kesimpulan: ${answers.kesimpulan || '(kosong)'}

KUNCI JAWABAN ACUAN ADMIN:
1. Diketahui: ${keys.ref_diketahui || '(tidak ada kunci)'}  — Poin Maksimal: ${keys.points_diketahui}
2. Ditanya: ${keys.ref_ditanya || '(tidak ada kunci)'}  — Poin Maksimal: ${keys.points_ditanya}
3. Pengerjaan: ${keys.ref_pengerjaan || '(tidak ada kunci)'}  — Poin Maksimal: ${keys.points_pengerjaan}
4. Kesimpulan: ${keys.ref_kesimpulan || '(tidak ada kunci)'}  — Poin Maksimal: ${keys.points_kesimpulan}

Kembalikan HANYA format JSON murni tanpa markdown:
{
  "scores": {
    "diketahui": <number>,
    "ditanya": <number>,
    "pengerjaan": <number>,
    "kesimpulan": <number>,
    "total": <number>
  },
  "feedback": {
    "diketahui": "<alasan singkat>",
    "ditanya": "<alasan singkat>",
    "pengerjaan": "<alasan singkat>",
    "kesimpulan": "<alasan singkat>"
  }
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const raw = response.text?.trim() || '';
  const jsonStr = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  try {
    const result = JSON.parse(jsonStr) as AiScoreResult;
    const s = result.scores;
    s.total = (s.diketahui || 0) + (s.ditanya || 0) + (s.pengerjaan || 0) + (s.kesimpulan || 0);
    return result;
  } catch {
    throw new Error('AI mengembalikan respons tidak valid. Silakan coba lagi.');
  }
}
