-- ============================================================
-- Fix: Policy RLS tabel jawaban
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Kembalikan policy INSERT untuk siswa
--    (dihapus di schema_soal.sql sebelumnya)
drop policy if exists "Siswa bisa menyimpan jawaban miliknya" on public.jawaban;

create policy "Siswa bisa menyimpan jawaban miliknya"
  on public.jawaban
  for insert
  with check (auth.uid() = user_id);

-- 2. Admin/guru bisa membaca SEMUA jawaban (untuk download ZIP)
drop policy if exists "Admin bisa baca semua jawaban" on public.jawaban;

create policy "Admin bisa baca semua jawaban"
  on public.jawaban
  for select
  using (true);

-- 3. Pastikan siswa juga bisa baca miliknya (sudah ada, tapi pastikan tidak conflict)
drop policy if exists "Siswa bisa membaca jawaban miliknya" on public.jawaban;

create policy "Siswa bisa membaca jawaban miliknya"
  on public.jawaban
  for select
  using (auth.uid() = user_id);
