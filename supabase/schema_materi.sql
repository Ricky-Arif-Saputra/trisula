-- ============================================================
-- Tabel: materi
-- Menyimpan konten pembelajaran per strand + subtopik
-- Jalankan di Supabase SQL Editor
-- ============================================================

create table if not exists public.materi (
  id           uuid        primary key default gen_random_uuid(),
  strand       text        not null,           -- bilangan | aljabar | geometri | trigonometri | peluang
  subtopic_id  text        not null,           -- slug subtopik, misal: 'linear', 'fpbkpk'
  subtopic_title text      not null,
  blocks       jsonb       not null default '[]'::jsonb,
  -- Blok: [{id, type: 'text'|'latex'|'image'|'callout_definition'|
  --   'callout_theorem'|'callout_example'|'callout_solution'|'heading'|
  --   'divider', value, callout_title}]
  order_index  integer     not null default 0,
  created_by   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Pastikan satu record per strand+subtopik
create unique index if not exists idx_materi_strand_subtopic
  on public.materi (strand, subtopic_id);

-- Index pencarian per strand
create index if not exists idx_materi_strand
  on public.materi (strand, order_index);

-- Row Level Security
alter table public.materi enable row level security;

-- Semua user login bisa membaca
create policy "Semua user bisa membaca materi"
  on public.materi
  for select
  using (auth.uid() is not null);

-- Hanya admin (service role atau via custom claim) bisa insert/update/delete
-- Untuk sementara: hanya service_role (admin menggunakan supabase admin client)
create policy "Admin bisa insert materi"
  on public.materi
  for insert
  with check (auth.uid() is not null);

create policy "Admin bisa update materi"
  on public.materi
  for update
  using (auth.uid() is not null);

create policy "Admin bisa delete materi"
  on public.materi
  for delete
  using (auth.uid() is not null);
