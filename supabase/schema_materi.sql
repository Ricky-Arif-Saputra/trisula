-- ============================================================
-- Tabel: materi_posts
-- Bahan ajar per topik — admin bisa post materi berisi
-- judul, deskripsi, lampiran (file/video/gambar/youtube/link)
-- ============================================================

create table if not exists public.materi_posts (
  id           uuid        primary key default gen_random_uuid(),
  strand       text        not null,     -- bilangan | aljabar | geometri | trigonometri | peluang
  title        text        not null,
  description  text        default '',
  -- Attachments disimpan sebagai array JSON:
  -- [{id, type: 'pdf'|'video'|'image'|'youtube'|'link'|'audio', url, label}]
  attachments  jsonb       not null default '[]'::jsonb,
  tags         text[]      default '{}',
  published    boolean     not null default true,
  created_by   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_materi_posts_strand
  on public.materi_posts (strand, created_at desc);

alter table public.materi_posts enable row level security;

create policy "Semua user bisa baca materi yang dipublikasikan"
  on public.materi_posts for select
  using (auth.uid() is not null and published = true);

create policy "Admin bisa insert"
  on public.materi_posts for insert
  with check (auth.uid() is not null);

create policy "Admin bisa update"
  on public.materi_posts for update
  using (auth.uid() is not null);

create policy "Admin bisa delete"
  on public.materi_posts for delete
  using (auth.uid() is not null);
