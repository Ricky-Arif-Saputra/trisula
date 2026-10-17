-- ============================================================
-- Insert 3 Materi Aljabar
-- Jalankan di Supabase SQL Editor
-- ============================================================

INSERT INTO public.materi_posts
  (strand, title, description, attachments, tags, published, created_by, created_at, updated_at)
VALUES

-- ── 1. Persamaan dan Pertidaksamaan Linear ───────────────────
(
  'aljabar',
  'Persamaan dan Pertidaksamaan Linear',
  E'## Persamaan Linear\n\nPersamaan linear adalah persamaan yang variabelnya berpangkat **satu**.\n\n### Persamaan Linear Satu Variabel (PLSV)\n\nBentuk umum:\n$$ax + b = 0, \\quad a \\neq 0$$\n\nPenyelesaian:\n$$x = -\\frac{b}{a}$$\n\n**Contoh:** Selesaikan $3x - 9 = 0$\n$$3x = 9 \\implies x = 3$$\n\n---\n\n### Persamaan Linear Dua Variabel (PLDV)\n\nBentuk umum:\n$$ax + by = c$$\n\nHimpunan penyelesaiannya berupa **garis lurus** di bidang koordinat.\n\n---\n\n### Sistem Persamaan Linear Dua Variabel (SPLDV)\n\nDua persamaan dengan dua variabel:\n$$\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}$$\n\n**Metode Penyelesaian:**\n\n| Metode | Cara |\n|---|---|\n| **Substitusi** | Nyatakan satu variabel, substitusi ke persamaan lain |\n| **Eliminasi** | Kurangi/tambah dua persamaan untuk menghilangkan satu variabel |\n| **Grafik** | Cari titik potong dua garis |\n\n**Contoh (Eliminasi):**\n$$\\begin{cases} 2x + y = 7 \\\\ x - y = 2 \\end{cases}$$\n\nJumlahkan kedua persamaan:\n$$3x = 9 \\implies x = 3$$\nSubstitusi: $y = 7 - 2(3) = 1$\n\nJadi $x = 3,\\ y = 1$.\n\n---\n\n## Pertidaksamaan Linear\n\nSeperti persamaan, tetapi menggunakan tanda $<,\\ >,\\ \\leq,\\ \\geq$.\n\n### Aturan Penting\n\n> Jika kedua ruas **dikali atau dibagi bilangan negatif**, maka tanda pertidaksamaan **berbalik arah**.\n\n$$-2x > 6 \\implies x < -3$$\n\n**Contoh:** Selesaikan $3x - 4 \\leq 8$\n$$3x \\leq 12 \\implies x \\leq 4$$\n\nHimpunan penyelesaian: $\\{x \\mid x \\leq 4,\\ x \\in \\mathbb{R}\\}$\n\n### Pertidaksamaan Linear Dua Variabel\n\nHimpunan penyelesaian berupa **daerah** (bukan garis) di bidang koordinat.\n\n$$2x + 3y \\leq 12$$\n\nLangkah: gambar garis $2x + 3y = 12$, lalu arsir daerah yang memenuhi.',
  '[
    {"id":"a1-1","type":"link","url":"https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities","label":"🎓 Khan Academy: Persamaan & Pertidaksamaan"},
    {"id":"a1-2","type":"link","url":"https://id.wikipedia.org/wiki/Persamaan_linear","label":"📖 Wikipedia: Persamaan Linear"}
  ]'::jsonb,
  ARRAY['Kelas 8', 'Semester 1', 'Persamaan'],
  true,
  'admin@trisula.edu',
  NOW(),
  NOW()
),

-- ── 2. Fungsi ──────────────────────────────────────────────
(
  'aljabar',
  'Fungsi (Domain, Kodomain, Range, dan Representasi)',
  E'## Pengertian Fungsi\n\nFungsi $f$ dari himpunan $A$ ke himpunan $B$ adalah aturan yang memasangkan **setiap** elemen $A$ dengan **tepat satu** elemen $B$.\n\n$$f: A \\to B$$\n\n---\n\n## Unsur-unsur Fungsi\n\n| Istilah | Definisi | Notasi |\n|---|---|---|\n| **Domain** | Himpunan nilai input (daerah asal) | $D_f = A$ |\n| **Kodomain** | Himpunan semua nilai yang mungkin jadi output | $B$ |\n| **Range** | Himpunan nilai output yang benar-benar terpetakan | $R_f \\subseteq B$ |\n\n> **Perbedaan kodomain vs range:** Kodomain adalah keseluruhan himpunan $B$, sedangkan range hanya elemen $B$ yang benar-benar "dituju".\n\n**Contoh:**\n\nJika $f: \\{1, 2, 3\\} \\to \\{1, 4, 9, 16\\}$ dengan $f(x) = x^2$, maka:\n- Domain $= \\{1, 2, 3\\}$\n- Kodomain $= \\{1, 4, 9, 16\\}$\n- Range $= \\{1, 4, 9\\}$ (karena $f(1)=1,\\ f(2)=4,\\ f(3)=9$)\n\n---\n\n## Representasi Fungsi\n\n### 1. Diagram Panah\nMenunjukkan pemetaan langsung dari elemen domain ke range.\n\n### 2. Himpunan Pasangan Berurutan\n$$f = \\{(1,1),\\ (2,4),\\ (3,9)\\}$$\n\n### 3. Tabel\n\n| $x$ | 1 | 2 | 3 |\n|---|---|---|---|\n| $f(x)$ | 1 | 4 | 9 |\n\n### 4. Rumus/Ekspresi\n$$f(x) = x^2$$\n\n### 5. Grafik\nGrafik fungsi $f(x) = x^2$ adalah parabola terbuka ke atas.\n\n---\n\n## Jenis-jenis Fungsi\n\n| Jenis | Definisi | Contoh |\n|---|---|---|\n| **Injektif (satu-satu)** | Elemen berbeda di domain dipetakan ke elemen berbeda di kodomain | $f(x) = 2x$ |\n| **Surjektif (onto)** | Setiap elemen kodomain punya pasangan di domain | $f: \\mathbb{R} \\to \\mathbb{R},\\ f(x)=x$ |\n| **Bijektif** | Injektif sekaligus surjektif | $f(x) = 3x + 1$ |\n\n---\n\n## Operasi Fungsi\n\nJika $f$ dan $g$ adalah fungsi:\n\n$$\\begin{aligned}\n(f+g)(x) &= f(x) + g(x) \\\\\n(f \\cdot g)(x) &= f(x) \\cdot g(x) \\\\\n(f \\circ g)(x) &= f(g(x)) \\quad \\text{(komposisi)}\n\\end{aligned}$$\n\n**Contoh komposisi:** $f(x) = 2x+1,\\ g(x) = x^2$\n$$(f \\circ g)(x) = f(g(x)) = 2x^2 + 1$$',
  '[
    {"id":"a2-1","type":"link","url":"https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions","label":"🎓 Khan Academy: Fungsi"},
    {"id":"a2-2","type":"link","url":"https://id.wikipedia.org/wiki/Fungsi_(matematika)","label":"📖 Wikipedia: Fungsi Matematika"}
  ]'::jsonb,
  ARRAY['Kelas 10', 'Semester 1', 'Fungsi'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '1 minute',
  NOW() + INTERVAL '1 minute'
),

-- ── 3. Barisan dan Deret ────────────────────────────────────
(
  'aljabar',
  'Barisan dan Deret',
  E'## Barisan Bilangan\n\nBarisan adalah urutan bilangan yang memiliki pola tertentu, dinotasikan $U_1, U_2, U_3, \\ldots, U_n$.\n\n---\n\n## Barisan Aritmetika\n\nBarisan dengan **beda (selisih) tetap** antara dua suku berurutan.\n\n$$b = U_n - U_{n-1} = \\text{konstanta}$$\n\n### Rumus Suku ke-$n$\n$$U_n = a + (n-1)b$$\n\ndi mana $a = U_1$ (suku pertama) dan $b$ = beda.\n\n**Contoh:** $2, 5, 8, 11, \\ldots$\n- $a = 2,\\ b = 3$\n- $U_{10} = 2 + (10-1)(3) = 2 + 27 = 29$\n\n---\n\n## Deret Aritmetika\n\nJumlah $n$ suku pertama barisan aritmetika:\n\n$$S_n = \\frac{n}{2}(2a + (n-1)b) = \\frac{n}{2}(a + U_n)$$\n\n**Contoh:** Jumlah 10 suku pertama $2 + 5 + 8 + \\ldots$\n$$S_{10} = \\frac{10}{2}(2(2) + 9(3)) = 5(4 + 27) = 5 \\times 31 = 155$$\n\n---\n\n## Barisan Geometri\n\nBarisan dengan **rasio (perbandingan) tetap** antara dua suku berurutan.\n\n$$r = \\frac{U_n}{U_{n-1}} = \\text{konstanta}$$\n\n### Rumus Suku ke-$n$\n$$U_n = a \\cdot r^{n-1}$$\n\n**Contoh:** $3, 6, 12, 24, \\ldots$\n- $a = 3,\\ r = 2$\n- $U_8 = 3 \\cdot 2^{7} = 3 \\times 128 = 384$\n\n---\n\n## Deret Geometri\n\n### Jumlah $n$ Suku Pertama\n$$S_n = \\frac{a(r^n - 1)}{r - 1}, \\quad r \\neq 1$$\n\n**Contoh:** Jumlah 5 suku: $3 + 6 + 12 + 24 + 48$\n$$S_5 = \\frac{3(2^5 - 1)}{2 - 1} = \\frac{3 \\times 31}{1} = 93$$\n\n### Deret Geometri Tak Hingga ($|r| < 1$)\n$$S_\\infty = \\frac{a}{1 - r}$$\n\n**Contoh:** $1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\cdots$\n$$S_\\infty = \\frac{1}{1 - \\frac{1}{2}} = \\frac{1}{\\frac{1}{2}} = 2$$\n\n---\n\n## Ringkasan\n\n| | Aritmetika | Geometri |\n|---|---|---|\n| Ciri | Beda tetap $b$ | Rasio tetap $r$ |\n| Suku ke-$n$ | $a + (n-1)b$ | $a \\cdot r^{n-1}$ |\n| Jumlah $S_n$ | $\\frac{n}{2}(2a+(n-1)b)$ | $\\frac{a(r^n-1)}{r-1}$ |\n| Jumlah $\\infty$ | Divergen | $\\frac{a}{1-r}$ jika $|r|<1$ |',
  '[
    {"id":"a3-1","type":"link","url":"https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:sequences","label":"🎓 Khan Academy: Barisan dan Deret"},
    {"id":"a3-2","type":"link","url":"https://id.wikipedia.org/wiki/Barisan_dan_deret_matematika","label":"📖 Wikipedia: Barisan dan Deret"}
  ]'::jsonb,
  ARRAY['Kelas 11', 'Semester 1', 'Barisan & Deret'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '2 minutes',
  NOW() + INTERVAL '2 minutes'
)

ON CONFLICT DO NOTHING;
