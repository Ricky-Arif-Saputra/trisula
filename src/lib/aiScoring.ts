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
  const response = await fetch('/api/nilai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Kesalahan server (${response.status})`);
  }
  if (data.error) throw new Error(data.error);

  return data as NilaiJawabanOutput;
}
