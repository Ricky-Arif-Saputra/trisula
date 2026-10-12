export interface NilaiJawabanInput {
  soalId: string;
  tahap: string;
  jawaban: string;
  rubrik: string;
  skorMaks: number;
}

export interface NilaiJawabanOutput {
  skor: number;
  alasan: string;
}

export async function nilaiTahap(input: NilaiJawabanInput): Promise<NilaiJawabanOutput> {
  // Timeout 25 detik — jika API tidak merespons, jangan hang selamanya
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  let response;
  try {
    response = await fetch('/api/nilai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('Waktu penilaian AI habis (timeout 25 detik). Coba lagi.');
    }
    // Endpoint tidak ada (development lokal) atau network error
    throw new Error(`Tidak dapat terhubung ke server penilaian. Pastikan aplikasi sudah di-deploy ke Vercel.`);
  } finally {
    clearTimeout(timeoutId);
  }

  let data;
  try {
    data = await response.json();
  } catch (e: any) {
    throw new Error(`Respons server tidak valid (Status: ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(`Server error (${response.status}): ${data?.error || 'Tidak ada pesan'}`);
  }

  if (data.error) {
    throw new Error(`AI error: ${data.error}`);
  }

  return data as NilaiJawabanOutput;
}
