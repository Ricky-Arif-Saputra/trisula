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
  let response;
  try {
    response = await fetch('/api/nilai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  } catch (e: any) {
    throw new Error(`[Langkah: fetch /api/nilai] Gagal terhubung. Detail: ${e.name}: ${e.message}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (e: any) {
    throw new Error(`[Langkah: baca respons] Respons bukan JSON valid (Status: ${response.status}). Detail: ${e.name}: ${e.message}`);
  }

  if (!response.ok) {
    throw new Error(`[Langkah: periksa status HTTP] Server membalas error (Status: ${response.status}). Pesan dari server: ${data?.error || 'Tidak ada pesan'}`);
  }
  
  if (data.error) {
    throw new Error(`[Langkah: periksa data error] Server mengembalikan error: ${data.error}`);
  }

  return data as NilaiJawabanOutput;
}
