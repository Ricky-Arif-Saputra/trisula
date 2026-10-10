-- ============================================================
-- Schema Keamanan Soal
-- Jalankan di Supabase SQL Editor (SETELAH schema.sql utama)
-- ============================================================

-- ── 1. Tabel soal ────────────────────────────────────────────
-- Kolom rubrik dan skor_maks TIDAK boleh dibaca klien biasa.
-- Hanya service_role (backend) yang boleh membaca seluruh baris.
create table if not exists public.soal (
  id          text    primary key,
  pertanyaan  text    not null,
  rubrik      text    not null,  -- RAHASIA – tidak boleh dibaca klien
  skor_maks   numeric not null
);

-- Aktifkan RLS
alter table public.soal enable row level security;

-- Policy: siswa login HANYA boleh membaca kolom pertanyaan (bukan rubrik/skor_maks).
-- Teknik: gunakan security-definer view yang hanya mengekspos kolom aman.
create policy "Tidak ada akses langsung ke soal untuk klien"
  on public.soal
  for select
  using (false);  -- Blokir semua akses langsung via anon/authenticated role

-- View aman: hanya pertanyaan yang terekspos ke klien
create or replace view public.soal_publik
  with (security_invoker = true)
as
  select id, pertanyaan
  from public.soal;

-- Grant read pada view publik ke authenticated users
grant select on public.soal_publik to authenticated;

-- ── 2. Rate-limit: tabel request_log ─────────────────────────
-- Dipakai server-side untuk deteksi flooding per user
create table if not exists public.request_log (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users,
  endpoint   text        not null default '/api/nilai',
  created_at timestamptz not null default now()
);

alter table public.request_log enable row level security;

-- Klien tidak boleh baca/tulis tabel ini sama sekali (server pakai service_role)
create policy "Tidak ada akses klien ke request_log"
  on public.request_log
  for all
  using (false)
  with check (false);

-- Index untuk query per user per menit
create index if not exists idx_request_log_user_time
  on public.request_log (user_id, created_at);

-- ── 3. Cabut izin INSERT klien pada tabel jawaban ────────────
-- (Hapus policy insert siswa; hanya service_role yg bisa insert)
drop policy if exists "Siswa bisa menyimpan jawaban miliknya" on public.jawaban;

-- Policy: satu-submit-per-soal (siswa tidak bisa duplikat via SELECT)
-- Cek duplikat dilakukan di server, tidak butuh policy tambahan.

-- ── 4. Indeks tambahan pada jawaban ──────────────────────────
create index if not exists idx_jawaban_user_soal
  on public.jawaban (user_id, soal_id);
