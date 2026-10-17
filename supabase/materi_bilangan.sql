-- ============================================================
-- Insert 3 Materi Bilangan — Konten Lengkap
-- Jalankan di Supabase SQL Editor
-- ============================================================

INSERT INTO public.materi_posts
  (strand, title, description, attachments, tags, published, created_by, created_at, updated_at)
VALUES

-- ── 1. Jenis dan Sifat Bilangan ──────────────────────────────
(
  'bilangan',
  'Jenis dan Sifat Bilangan',
  E'## Pengertian Bilangan\n\nBilangan adalah suatu konsep matematika yang digunakan untuk pencacahan dan pengukuran. Dalam matematika, dikenal beberapa jenis bilangan yang tersusun dalam suatu hierarki.\n\n---\n\n## Jenis-jenis Bilangan\n\n### 1. Bilangan Asli (ℕ)\nBilangan yang digunakan untuk menghitung: **1, 2, 3, 4, 5, ...**\n\n> Bilangan asli dimulai dari 1 dan tidak ada batas atasnya.\n\n### 2. Bilangan Cacah (W)\nBilangan asli ditambah nol: **0, 1, 2, 3, 4, ...**\n\n### 3. Bilangan Bulat (ℤ)\nMencakup bilangan negatif, nol, dan positif:\n**... −3, −2, −1, 0, 1, 2, 3, ...**\n\n| Kelompok | Contoh |\n|---|---|\n| Bulat Positif | 1, 2, 3, ... |\n| Nol | 0 |\n| Bulat Negatif | −1, −2, −3, ... |\n\n### 4. Bilangan Rasional (ℚ)\nBilangan yang dapat dinyatakan sebagai pecahan $\\frac{p}{q}$ di mana $p, q \\in ℤ$ dan $q \\neq 0$.\n\n**Contoh:** $\\frac{1}{2},\\ \\frac{3}{4},\\ 0{,}75,\\ -\\frac{2}{3}$\n\n### 5. Bilangan Irasional\nBilangan yang **tidak dapat** dinyatakan sebagai pecahan $\\frac{p}{q}$.\n\n**Contoh:** $\\sqrt{2},\\ \\pi,\\ e$\n\n> $\\sqrt{2} = 1{,}41421356...$ (desimal tak berulang dan tak berakhir)\n\n### 6. Bilangan Real (ℝ)\nGabungan dari semua bilangan rasional dan irasional.\n\n$$\\mathbb{R} = \\mathbb{Q} \\cup \\mathbb{Q}^c$$\n\n---\n\n## Sifat-sifat Bilangan\n\n### Sifat Urutan\n- Untuk setiap dua bilangan $a$ dan $b$, berlaku tepat satu: $a < b$, $a = b$, atau $a > b$\n- Jika $a < b$ dan $b < c$ maka $a < c$ (**transitif**)\n\n### Sifat Kepadatan\nDi antara dua bilangan rasional selalu ada bilangan rasional lain:\n$$\\text{Jika } a < b \\text{ maka } a < \\frac{a+b}{2} < b$$\n\n---\n\n## Diagram Hierarki Bilangan\n\n```\nBilangan Real (ℝ)\n├── Bilangan Rasional (ℚ)\n│   ├── Bilangan Bulat (ℤ)\n│   │   ├── Bilangan Cacah (W)\n│   │   │   └── Bilangan Asli (ℕ)\n│   │   └── Bilangan Negatif\n│   └── Pecahan / Desimal\n└── Bilangan Irasional\n```',
  '[
    {"id":"b1-1","type":"link","url":"https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-factors-and-multiples","label":"🎓 Khan Academy: Jenis-jenis Bilangan"},
    {"id":"b1-2","type":"link","url":"https://id.wikipedia.org/wiki/Bilangan","label":"📖 Wikipedia: Bilangan"}
  ]'::jsonb,
  ARRAY['Kelas 7', 'Semester 1', 'Dasar'],
  true,
  'admin@trisula.edu',
  NOW(),
  NOW()
),

-- ── 2. Operasi Bilangan Beserta Sifat-sifatnya ───────────────
(
  'bilangan',
  'Operasi Bilangan Beserta Sifat-sifatnya',
  E'## Operasi Dasar Bilangan\n\nAda empat operasi dasar dalam matematika yang berlaku pada bilangan real.\n\n---\n\n## 1. Penjumlahan (+)\n\n$$a + b = b + a$$\n\n### Sifat Penjumlahan\n\n| Sifat | Rumus | Contoh |\n|---|---|---|\n| **Komutatif** | $a + b = b + a$ | $3 + 5 = 5 + 3 = 8$ |\n| **Asosiatif** | $(a+b)+c = a+(b+c)$ | $(2+3)+4 = 2+(3+4) = 9$ |\n| **Identitas** | $a + 0 = a$ | $7 + 0 = 7$ |\n| **Invers** | $a + (-a) = 0$ | $5 + (-5) = 0$ |\n\n---\n\n## 2. Pengurangan (−)\n\nPengurangan adalah penjumlahan dengan lawan bilangan:\n$$a - b = a + (-b)$$\n\n> Pengurangan **tidak** bersifat komutatif: $a - b \\neq b - a$\n\n---\n\n## 3. Perkalian (×)\n\n### Sifat Perkalian\n\n| Sifat | Rumus | Contoh |\n|---|---|---|\n| **Komutatif** | $a \\times b = b \\times a$ | $4 \\times 6 = 6 \\times 4 = 24$ |\n| **Asosiatif** | $(a \\times b) \\times c = a \\times (b \\times c)$ | $(2 \\times 3) \\times 4 = 24$ |\n| **Identitas** | $a \\times 1 = a$ | $9 \\times 1 = 9$ |\n| **Nol** | $a \\times 0 = 0$ | $7 \\times 0 = 0$ |\n| **Invers** | $a \\times \\frac{1}{a} = 1,\\ a\\neq 0$ | $5 \\times \\frac{1}{5} = 1$ |\n\n---\n\n## 4. Pembagian (÷)\n\nPembagian adalah perkalian dengan invers:\n$$a \\div b = a \\times \\frac{1}{b}, \\quad b \\neq 0$$\n\n> Pembagian **tidak** bersifat komutatif: $a \\div b \\neq b \\div a$\n\n---\n\n## Sifat Distributif\n\nMenghubungkan perkalian dan penjumlahan:\n\n$$a \\times (b + c) = (a \\times b) + (a \\times c)$$\n\n**Contoh:**\n$$3 \\times (4 + 5) = (3 \\times 4) + (3 \\times 5) = 12 + 15 = 27$$\n\n---\n\n## Urutan Operasi (PEMDAS/BODMAS)\n\n1. **Kurung** — selesaikan isi kurung terlebih dahulu\n2. **Pangkat/Akar**\n3. **Perkalian dan Pembagian** — dari kiri ke kanan\n4. **Penjumlahan dan Pengurangan** — dari kiri ke kanan\n\n**Contoh:**\n$$2 + 3 \\times 4^2 \\div 8 - 1 = 2 + 3 \\times 16 \\div 8 - 1 = 2 + 6 - 1 = 7$$',
  '[
    {"id":"b2-1","type":"link","url":"https://www.khanacademy.org/math/arithmetic","label":"🎓 Khan Academy: Operasi Aritmatika"},
    {"id":"b2-2","type":"link","url":"https://id.wikipedia.org/wiki/Operasi_aritmetika","label":"📖 Wikipedia: Operasi Aritmetika"}
  ]'::jsonb,
  ARRAY['Kelas 7', 'Semester 1', 'Operasi Hitung'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '1 minute',
  NOW() + INTERVAL '1 minute'
),

-- ── 3. Bilangan Berpangkat ────────────────────────────────────
(
  'bilangan',
  'Bilangan Asli Berpangkat Bilangan Bulat dan Pecahan',
  E'## Konsep Perpangkatan\n\nPerpangkatan (eksponen) adalah perkalian berulang suatu bilangan dengan dirinya sendiri.\n\n$$a^n = \\underbrace{a \\times a \\times a \\times \\cdots \\times a}_{n \\text{ kali}}$$\n\ndi mana $a$ disebut **basis** dan $n$ disebut **eksponen/pangkat**.\n\n---\n\n## Pangkat Bilangan Bulat Positif\n\n**Contoh:**\n$$2^5 = 2 \\times 2 \\times 2 \\times 2 \\times 2 = 32$$\n$$3^4 = 81 \\qquad 10^3 = 1000$$\n\n---\n\n## Pangkat Nol dan Negatif\n\n| Definisi | Rumus | Contoh |\n|---|---|---|\n| **Pangkat Nol** | $a^0 = 1,\\; a \\neq 0$ | $5^0 = 1$ |\n| **Pangkat Negatif** | $a^{-n} = \\dfrac{1}{a^n}$ | $2^{-3} = \\dfrac{1}{8}$ |\n\n> **Mengapa $a^0 = 1$?**\n> Karena $a^n \\div a^n = a^{n-n} = a^0$, dan $a^n \\div a^n = 1$\n\n---\n\n## Pangkat Pecahan (Eksponen Rasional)\n\nEksponen pecahan berhubungan dengan akar:\n\n$$a^{1/n} = \\sqrt[n]{a}$$\n\n$$a^{m/n} = \\sqrt[n]{a^m} = \\left(\\sqrt[n]{a}\\right)^m$$\n\n**Contoh:**\n$$8^{1/3} = \\sqrt[3]{8} = 2$$\n$$16^{3/4} = \\left(\\sqrt[4]{16}\\right)^3 = 2^3 = 8$$\n$$27^{2/3} = \\left(\\sqrt[3]{27}\\right)^2 = 3^2 = 9$$\n\n---\n\n## Hukum-hukum Eksponen\n\n| Hukum | Rumus | Contoh |\n|---|---|---|\n| **Perkalian** | $a^m \\times a^n = a^{m+n}$ | $2^3 \\times 2^4 = 2^7 = 128$ |\n| **Pembagian** | $a^m \\div a^n = a^{m-n}$ | $3^5 \\div 3^2 = 3^3 = 27$ |\n| **Pangkat dari Pangkat** | $(a^m)^n = a^{mn}$ | $(2^3)^2 = 2^6 = 64$ |\n| **Perkalian Basis** | $(ab)^n = a^n b^n$ | $(2 \\times 3)^2 = 4 \\times 9 = 36$ |\n| **Pembagian Basis** | $\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{b^n}$ | $\\left(\\dfrac{2}{3}\\right)^2 = \\dfrac{4}{9}$ |\n\n---\n\n## Contoh Soal\n\n**Soal:** Sederhanakan $\\dfrac{6^5 \\times 2^{-3}}{3^5 \\times 2^2}$\n\n**Penyelesaian:**\n$$= \\frac{(2 \\times 3)^5 \\times 2^{-3}}{3^5 \\times 2^2} = \\frac{2^5 \\times 3^5 \\times 2^{-3}}{3^5 \\times 2^2} = \\frac{2^{5-3}}{2^2} = \\frac{2^2}{2^2} = 1$$',
  '[
    {"id":"b3-1","type":"link","url":"https://www.khanacademy.org/math/cc-eighth-grade-math/cc-8th-numbers-operations","label":"🎓 Khan Academy: Eksponen dan Perpangkatan"},
    {"id":"b3-2","type":"link","url":"https://id.wikipedia.org/wiki/Perpangkatan","label":"📖 Wikipedia: Perpangkatan"}
  ]'::jsonb,
  ARRAY['Kelas 9', 'Semester 1', 'Eksponen'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '2 minutes',
  NOW() + INTERVAL '2 minutes'
)

ON CONFLICT DO NOTHING;
