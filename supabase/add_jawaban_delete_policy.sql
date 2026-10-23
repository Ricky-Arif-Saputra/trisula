-- Tambahkan policy DELETE agar siswa bisa menghapus jawaban lama miliknya sendiri
-- (diperlukan agar "hapus sebelum insert ulang" berfungsi)
-- Jalankan di Supabase SQL Editor

CREATE POLICY IF NOT EXISTS "Siswa bisa menghapus jawaban miliknya"
  ON public.jawaban
  FOR DELETE
  USING (auth.uid() = user_id);
