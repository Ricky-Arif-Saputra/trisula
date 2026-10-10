import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../components/Auth/AuthProvider';

export interface JawabanRecord {
  id: string;
  soal_id: string;
  jawaban: string;
  skor: number | null;
  skor_maks: number | null;
  alasan: string | null;
  created_at: string;
}

export function useRiwayat() {
  const { user } = useAuth();
  const [riwayat, setRiwayat] = useState<JawabanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRiwayat = useCallback(async () => {
    if (!user) {
      setRiwayat([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('jawaban')
        .select('id, soal_id, jawaban, skor, skor_maks, alasan, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (err) throw err;
      setRiwayat((data as JawabanRecord[]) || []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  return { riwayat, loading, error, refetch: fetchRiwayat };
}
