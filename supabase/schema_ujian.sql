-- ============================================================
-- Schema: Ujian per Materi (Pretest & Posttest)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom nisn ke profiles (jika belum ada)
alter table if exists public.profiles
  add column if not exists nisn text default '';

-- 2. CREATE TABLE profiles jika belum ada sama sekali
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  nama_lengkap  text default '',
  nisn          text default '',
  role          text default 'siswa',
  created_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy if not exists "User bisa baca profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "User bisa update profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

create policy if not exists "Admin bisa baca semua profil"
  on public.profiles for select
  using (true);

-- 3. CREATE TABLE exam_packages jika belum ada
create table if not exists public.exam_packages (
  id               uuid        primary key default gen_random_uuid(),
  title            text        not null,
  strand           text        not null,
  test_type        text        not null default 'postest',
  exam_type        text        default 'rme_posttest',
  duration_minutes integer     not null default 60,
  questions        jsonb       not null default '[]'::jsonb,
  total_max_points integer,
  created_by       text,
  created_at       timestamptz default now()
);

alter table public.exam_packages enable row level security;

create policy if not exists "Semua user bisa baca exam_packages"
  on public.exam_packages for select
  using (auth.uid() is not null);

create policy if not exists "Admin bisa insert exam_packages"
  on public.exam_packages for insert
  with check (auth.uid() is not null);

create policy if not exists "Admin bisa update exam_packages"
  on public.exam_packages for update
  using (auth.uid() is not null);

create policy if not exists "Admin bisa delete exam_packages"
  on public.exam_packages for delete
  using (auth.uid() is not null);

-- 4. CREATE TABLE exam_attempts jika belum ada
create table if not exists public.exam_attempts (
  id                 uuid        primary key default gen_random_uuid(),
  exam_id            uuid        references public.exam_packages on delete cascade,
  user_id            uuid        references auth.users on delete cascade,
  student_name       text        default '',
  student_nisn       text        default '',
  score              numeric     default 0,
  correct_count      integer     default 0,
  wrong_count        integer     default 0,
  essay_answers      jsonb       default '{}'::jsonb,
  ai_scores          jsonb       default '{}'::jsonb,
  total_essay_score  numeric     default 0,
  total_max_points   numeric     default 0,
  created_at         timestamptz default now()
);

create index if not exists idx_exam_attempts_exam
  on public.exam_attempts (exam_id);
create index if not exists idx_exam_attempts_user
  on public.exam_attempts (user_id);

alter table public.exam_attempts enable row level security;

create policy if not exists "User bisa baca attempt miliknya"
  on public.exam_attempts for select
  using (auth.uid() = user_id);

create policy if not exists "Admin bisa baca semua attempt"
  on public.exam_attempts for select
  using (true);

create policy if not exists "User bisa insert attempt"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id);

-- 5. Fungsi trigger otomatis buat profil saat user baru daftar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nama_lengkap, nisn, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama_lengkap', new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'nisn', ''),
    'siswa'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
