-- ============================================================
-- Tabel: jawaban
-- Deskripsi: Menyimpan hasil penilaian AI per tahap RME per siswa
-- Jalankan di Supabase SQL Editor
-- ============================================================

create table if not exists public.jawaban (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users default auth.uid(),
  soal_id    text        not null,
  jawaban    text        not null,
  skor       numeric,
  skor_maks  numeric,
  alasan     text,
  created_at timestamptz default now()
);

-- Aktifkan Row Level Security
alter table public.jawaban enable row level security;

-- Policy: siswa hanya bisa SELECT baris miliknya
create policy "Siswa bisa membaca jawaban miliknya"
  on public.jawaban
  for select
  using (auth.uid() = user_id);

-- Policy: siswa hanya bisa INSERT baris miliknya
create policy "Siswa bisa menyimpan jawaban miliknya"
  on public.jawaban
  for insert
  with check (auth.uid() = user_id);
