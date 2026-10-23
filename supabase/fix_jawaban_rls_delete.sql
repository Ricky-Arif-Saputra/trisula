-- ============================================================
-- Fix RLS: tambah policy DELETE untuk admin & siswa
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Admin bisa hapus SEMUA jawaban (untuk tombol reset di DownloadModal)
drop policy if exists "Admin bisa hapus semua jawaban" on public.jawaban;
create policy "Admin bisa hapus semua jawaban"
  on public.jawaban
  for delete
  using (true);

-- 2. Siswa bisa hapus jawaban miliknya sendiri (untuk submit ulang)
drop policy if exists "Siswa bisa menghapus jawaban miliknya" on public.jawaban;
create policy "Siswa bisa menghapus jawaban miliknya"
  on public.jawaban
  for delete
  using (auth.uid() = user_id);
