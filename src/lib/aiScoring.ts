import { supabase } from './supabaseClient';

// ── Tipe ──────────────────────────────────────────────────────────────────────

/** Input yang dikirim ke /api/nilai — hanya data, BUKAN rubrik/skorMaks */
export interface NilaiJawabanInput {
  soal_id: string;
  jawaban: string;
}

export interface NilaiJawabanOutput {
  skor: number;
  alasan: string;
}

// ── Ambil token sesi aktif ────────────────────────────────────────────────────
async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// ── Panggil Serverless Function /api/nilai ────────────────────────────────────
// Rubrik dan skorMaks tidak lagi dikirim dari browser — server mengambilnya sendiri.
export async function nilaiJawaban(input: NilaiJawabanInput): Promise<NilaiJawabanOutput> {
  const token = await getAuthToken();
  if (!token) throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');

  const response = await fetch('/api/nilai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      soal_id: input.soal_id,
      jawaban: input.jawaban,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Kesalahan server (${response.status})`);
  }
  if (data.error) throw new Error(data.error);

  return data as NilaiJawabanOutput;
}

// ── simpanJawaban: sekarang dilakukan server-side di /api/nilai ───────────────
// Fungsi ini dipertahankan sebagai no-op agar kode pemanggil tidak perlu diubah.
// Klien tidak lagi menyimpan langsung ke Supabase.
export async function simpanJawaban(_input: {
  soal_id: string;
  jawaban: string;
  skor: number;
  skor_maks: number;
  alasan: string;
}): Promise<string | null> {
  // Penyimpanan sudah dilakukan oleh server (/api/nilai).
  // Fungsi ini sengaja dikosongkan agar tidak ada double-write.
  return null;
}
