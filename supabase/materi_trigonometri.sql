-- ============================================================
-- Insert 6 Materi Trigonometri
-- Jalankan di Supabase SQL Editor
-- ============================================================

INSERT INTO public.materi_posts
  (strand, title, description, attachments, tags, published, created_by, created_at, updated_at)
VALUES

-- ── 1. Perbandingan Trigonometri ─────────────────────────────
(
  'trigonometri',
  'Perbandingan Trigonometri',
  E'## Pengertian Perbandingan Trigonometri\n\nPerbandingan trigonometri adalah **perbandingan sisi-sisi pada segitiga siku-siku** terhadap salah satu sudut lancip $\\theta$.\n\nPada segitiga siku-siku dengan sudut $\\theta$:\n- **Sisi depan** (opposite): sisi yang berhadapan dengan $\\theta$\n- **Sisi samping** (adjacent): sisi yang berdekatan dengan $\\theta$ (bukan hipotenusa)\n- **Sisi miring** (hypotenuse): sisi terpanjang, berhadapan dengan sudut siku-siku\n\n---\n\n## Enam Perbandingan Trigonometri\n\n$$\\sin\\theta = \\frac{\\text{depan}}{\\text{miring}} \\qquad \\cos\\theta = \\frac{\\text{samping}}{\\text{miring}} \\qquad \\tan\\theta = \\frac{\\text{depan}}{\\text{samping}}$$\n\n$$\\csc\\theta = \\frac{\\text{miring}}{\\text{depan}} \\qquad \\sec\\theta = \\frac{\\text{miring}}{\\text{samping}} \\qquad \\cot\\theta = \\frac{\\text{samping}}{\\text{depan}}$$\n\n> **Ingat:** SOH-CAH-TOA\n> - **S**in = **O**pposite / **H**ypotenuse\n> - **C**os = **A**djacent / **H**ypotenuse\n> - **T**an = **O**pposite / **A**djacent\n\n---\n\n## Hubungan Antar Perbandingan\n\n$$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} \\qquad \\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}$$\n\n$$\\csc\\theta = \\frac{1}{\\sin\\theta} \\qquad \\sec\\theta = \\frac{1}{\\cos\\theta} \\qquad \\cot\\theta = \\frac{1}{\\tan\\theta}$$\n\n---\n\n## Identitas Pythagoras\n\n$$\\sin^2\\theta + \\cos^2\\theta = 1$$\n\n$$1 + \\tan^2\\theta = \\sec^2\\theta$$\n\n$$1 + \\cot^2\\theta = \\csc^2\\theta$$\n\n---\n\n## Nilai Perbandingan Sudut Istimewa\n\n| $\\theta$ | $\\sin$ | $\\cos$ | $\\tan$ | $\\csc$ | $\\sec$ | $\\cot$ |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n| $0°$ | $0$ | $1$ | $0$ | $\\infty$ | $1$ | $\\infty$ |\n| $30°$ | $\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{\\sqrt{3}}{3}$ | $2$ | $\\frac{2\\sqrt{3}}{3}$ | $\\sqrt{3}$ |\n| $45°$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $1$ | $\\sqrt{2}$ | $\\sqrt{2}$ | $1$ |\n| $60°$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | $\\sqrt{3}$ | $\\frac{2\\sqrt{3}}{3}$ | $2$ | $\\frac{\\sqrt{3}}{3}$ |\n| $90°$ | $1$ | $0$ | $\\infty$ | $1$ | $\\infty$ | $0$ |\n\n---\n\n## Tanda di Tiap Kuadran\n\n| Kuadran | $\\sin$ | $\\cos$ | $\\tan$ |\n|:---:|:---:|:---:|:---:|\n| I ($0°$–$90°$) | $+$ | $+$ | $+$ |\n| II ($90°$–$180°$) | $+$ | $-$ | $-$ |\n| III ($180°$–$270°$) | $-$ | $-$ | $+$ |\n| IV ($270°$–$360°$) | $-$ | $+$ | $-$ |\n\n> **Hafalan:** **A**ll **S**tudents **T**ake **C**alculus → Kuadran I(All), II(Sin), III(Tan), IV(Cos) bernilai positif.\n\n---\n\n## Contoh\n\nSegitiga siku-siku dengan sisi depan $= 3$, sisi samping $= 4$, sisi miring $= 5$. Tentukan 6 perbandingan trigonometri sudut $\\theta$!\n\n$$\\sin\\theta = \\frac{3}{5} \\quad \\cos\\theta = \\frac{4}{5} \\quad \\tan\\theta = \\frac{3}{4}$$\n\n$$\\csc\\theta = \\frac{5}{3} \\quad \\sec\\theta = \\frac{5}{4} \\quad \\cot\\theta = \\frac{4}{3}$$',
  '[
    {"id":"t1-1","type":"link","url":"https://www.khanacademy.org/math/trigonometry/trigonometry-right-triangles","label":"🎓 Khan Academy: Trigonometri Segitiga Siku-siku"},
    {"id":"t1-2","type":"link","url":"https://id.wikipedia.org/wiki/Trigonometri","label":"📖 Wikipedia: Trigonometri"}
  ]'::jsonb,
  ARRAY['Kelas 10', 'Trigonometri', 'Perbandingan', 'SOH-CAH-TOA'],
  true,
  'admin@trisula.edu',
  NOW(),
  NOW()
),

-- ── 2. Sinus ─────────────────────────────────────────────────
(
  'trigonometri',
  'Sinus (sin)',
  E'## Definisi Sinus\n\nSinus suatu sudut $\\theta$ adalah **perbandingan sisi depan terhadap sisi miring** pada segitiga siku-siku.\n\n$$\\boxed{\\sin\\theta = \\frac{\\text{sisi depan}}{\\text{sisi miring}}}$$\n\nDalam koordinat lingkaran satuan (jari-jari $r = 1$), titik $P(x, y)$ pada sudut $\\theta$:\n$$\\sin\\theta = y$$\n\n---\n\n## Grafik Fungsi Sinus\n\nFungsi $y = \\sin x$ memiliki sifat:\n\n| Sifat | Nilai |\n|---|---|\n| **Domain** | $\\mathbb{R}$ (semua bilangan real) |\n| **Range** | $[-1, 1]$ |\n| **Periode** | $2\\pi = 360°$ |\n| **Amplitudo** | $1$ |\n| **Titik nol** | $x = n\\pi,\\ n \\in \\mathbb{Z}$ |\n| **Nilai maks** | $1$, saat $x = 90° + 360°n$ |\n| **Nilai min** | $-1$, saat $x = 270° + 360°n$ |\n\n---\n\n## Nilai Sinus Sudut Istimewa\n\n$$\\sin 0° = 0 \\quad \\sin 30° = \\frac{1}{2} \\quad \\sin 45° = \\frac{\\sqrt{2}}{2}$$\n\n$$\\sin 60° = \\frac{\\sqrt{3}}{2} \\quad \\sin 90° = 1$$\n\n**Pola mudah diingat** (nilai $\\sin 0°, 30°, 45°, 60°, 90°$):\n$$\\frac{\\sqrt{0}}{2},\\ \\frac{\\sqrt{1}}{2},\\ \\frac{\\sqrt{2}}{2},\\ \\frac{\\sqrt{3}}{2},\\ \\frac{\\sqrt{4}}{2}$$\n\n---\n\n## Relasi Sudut\n\n$$\\sin(180° - \\theta) = \\sin\\theta$$\n$$\\sin(180° + \\theta) = -\\sin\\theta$$\n$$\\sin(360° - \\theta) = -\\sin\\theta$$\n$$\\sin(-\\theta) = -\\sin\\theta \\quad \\text{(fungsi ganjil)}$$\n$$\\sin(90° - \\theta) = \\cos\\theta$$\n\n---\n\n## Rumus-rumus Sinus\n\n### Penjumlahan dan Pengurangan Sudut\n$$\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B$$\n\n### Sudut Ganda\n$$\\sin 2A = 2\\sin A \\cos A$$\n\n### Sudut Setengah\n$$\\sin\\frac{A}{2} = \\pm\\sqrt{\\frac{1 - \\cos A}{2}}$$\n\n### Rumus Jumlah ke Perkalian\n$$\\sin A + \\sin B = 2\\sin\\frac{A+B}{2}\\cos\\frac{A-B}{2}$$\n$$\\sin A - \\sin B = 2\\cos\\frac{A+B}{2}\\sin\\frac{A-B}{2}$$\n\n---\n\n## Aturan Sinus\n\nPada segitiga $ABC$ dengan sisi $a, b, c$ berhadapan dengan sudut $A, B, C$:\n\n$$\\boxed{\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R}$$\n\ndi mana $R$ adalah jari-jari lingkaran luar segitiga.\n\n**Digunakan saat diketahui:** dua sudut + satu sisi (AAS/ASA), atau dua sisi + satu sudut bukan apit (SSA).\n\n**Contoh:** Segitiga $ABC$ dengan $A = 45°$, $B = 60°$, $a = 6$. Cari $b$!\n$$\\frac{b}{\\sin 60°} = \\frac{6}{\\sin 45°}$$\n$$b = \\frac{6 \\cdot \\sin 60°}{\\sin 45°} = \\frac{6 \\cdot \\frac{\\sqrt{3}}{2}}{\\frac{\\sqrt{2}}{2}} = \\frac{6\\sqrt{3}}{\\sqrt{2}} = 3\\sqrt{6}$$',
  '[
    {"id":"t2-1","type":"link","url":"https://www.khanacademy.org/math/trigonometry/unit-circle-trig-func","label":"🎓 Khan Academy: Fungsi Sinus"},
    {"id":"t2-2","type":"link","url":"https://id.wikipedia.org/wiki/Sinus","label":"📖 Wikipedia: Sinus"}
  ]'::jsonb,
  ARRAY['Kelas 10', 'Kelas 11', 'Trigonometri', 'Sinus', 'Aturan Sinus'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '1 minute',
  NOW() + INTERVAL '1 minute'
),

-- ── 3. Kosinus ───────────────────────────────────────────────
(
  'trigonometri',
  'Kosinus (cos)',
  E'## Definisi Kosinus\n\nKosinus suatu sudut $\\theta$ adalah **perbandingan sisi samping terhadap sisi miring** pada segitiga siku-siku.\n\n$$\\boxed{\\cos\\theta = \\frac{\\text{sisi samping}}{\\text{sisi miring}}}$$\n\nDalam lingkaran satuan, titik $P(x, y)$ pada sudut $\\theta$:\n$$\\cos\\theta = x$$\n\n---\n\n## Grafik Fungsi Kosinus\n\n| Sifat | Nilai |\n|---|---|\n| **Domain** | $\\mathbb{R}$ |\n| **Range** | $[-1, 1]$ |\n| **Periode** | $2\\pi = 360°$ |\n| **Amplitudo** | $1$ |\n| **Titik nol** | $x = 90° + 180°n,\\ n \\in \\mathbb{Z}$ |\n| **Nilai maks** | $1$, saat $x = 0° + 360°n$ |\n| **Nilai min** | $-1$, saat $x = 180° + 360°n$ |\n\n> Grafik kosinus **sama dengan grafik sinus yang digeser $90°$ ke kiri**:\n> $\\cos x = \\sin(x + 90°)$\n\n---\n\n## Nilai Kosinus Sudut Istimewa\n\n$$\\cos 0° = 1 \\quad \\cos 30° = \\frac{\\sqrt{3}}{2} \\quad \\cos 45° = \\frac{\\sqrt{2}}{2}$$\n\n$$\\cos 60° = \\frac{1}{2} \\quad \\cos 90° = 0$$\n\n**Pola:** nilai $\\cos$ = nilai $\\sin$ yang **terbalik urutannya**.\n\n---\n\n## Relasi Sudut\n\n$$\\cos(180° - \\theta) = -\\cos\\theta$$\n$$\\cos(180° + \\theta) = -\\cos\\theta$$\n$$\\cos(360° - \\theta) = \\cos\\theta$$\n$$\\cos(-\\theta) = \\cos\\theta \\quad \\text{(fungsi genap)}$$\n$$\\cos(90° - \\theta) = \\sin\\theta$$\n\n---\n\n## Rumus-rumus Kosinus\n\n### Penjumlahan dan Pengurangan Sudut\n$$\\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B$$\n\n### Sudut Ganda\n$$\\cos 2A = \\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$$\n\n### Sudut Setengah\n$$\\cos\\frac{A}{2} = \\pm\\sqrt{\\frac{1 + \\cos A}{2}}$$\n\n### Rumus Jumlah ke Perkalian\n$$\\cos A + \\cos B = 2\\cos\\frac{A+B}{2}\\cos\\frac{A-B}{2}$$\n$$\\cos A - \\cos B = -2\\sin\\frac{A+B}{2}\\sin\\frac{A-B}{2}$$\n\n---\n\n## Aturan Kosinus\n\nPada segitiga $ABC$:\n\n$$\\boxed{a^2 = b^2 + c^2 - 2bc\\cos A}$$\n$$b^2 = a^2 + c^2 - 2ac\\cos B$$\n$$c^2 = a^2 + b^2 - 2ab\\cos C$$\n\n**Digunakan saat diketahui:** dua sisi + sudut apit (SAS), atau ketiga sisi (SSS).\n\n**Contoh:** Segitiga dengan $b = 5$, $c = 7$, $A = 60°$. Cari $a$!\n$$a^2 = 25 + 49 - 2(5)(7)\\cos 60° = 74 - 70 \\cdot \\frac{1}{2} = 74 - 35 = 39$$\n$$a = \\sqrt{39} \\approx 6{,}24$$\n\n---\n\n## Luas Segitiga dengan Kosinus\n\n$$L = \\frac{1}{2}bc\\sin A = \\frac{1}{2}ac\\sin B = \\frac{1}{2}ab\\sin C$$',
  '[
    {"id":"t3-1","type":"link","url":"https://www.khanacademy.org/math/trigonometry/unit-circle-trig-func","label":"🎓 Khan Academy: Fungsi Kosinus"},
    {"id":"t3-2","type":"link","url":"https://id.wikipedia.org/wiki/Kosinus","label":"📖 Wikipedia: Kosinus"}
  ]'::jsonb,
  ARRAY['Kelas 10', 'Kelas 11', 'Trigonometri', 'Kosinus', 'Aturan Kosinus'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '2 minutes',
  NOW() + INTERVAL '2 minutes'
),

-- ── 4. Tangen ────────────────────────────────────────────────
(
  'trigonometri',
  'Tangen (tan)',
  E'## Definisi Tangen\n\nTangen suatu sudut $\\theta$ adalah **perbandingan sisi depan terhadap sisi samping** pada segitiga siku-siku.\n\n$$\\boxed{\\tan\\theta = \\frac{\\text{sisi depan}}{\\text{sisi samping}} = \\frac{\\sin\\theta}{\\cos\\theta}}$$\n\nDalam lingkaran satuan:\n$$\\tan\\theta = \\frac{y}{x}, \\quad x \\neq 0$$\n\n---\n\n## Grafik Fungsi Tangen\n\n| Sifat | Nilai |\n|---|---|\n| **Domain** | $\\mathbb{R} \\setminus \\{90° + 180°n\\}$ |\n| **Range** | $\\mathbb{R}$ (semua bilangan real) |\n| **Periode** | $\\pi = 180°$ |\n| **Asimtot** | $x = 90° + 180°n$ |\n| **Titik nol** | $x = 180°n,\\ n \\in \\mathbb{Z}$ |\n\n> Periode tangen **setengah periode** sin dan cos.\n\n---\n\n## Nilai Tangen Sudut Istimewa\n\n$$\\tan 0° = 0 \\quad \\tan 30° = \\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}$$\n\n$$\\tan 45° = 1 \\quad \\tan 60° = \\sqrt{3} \\quad \\tan 90° = \\text{tidak terdefinisi}$$\n\n---\n\n## Relasi Sudut\n\n$$\\tan(180° - \\theta) = -\\tan\\theta$$\n$$\\tan(180° + \\theta) = \\tan\\theta$$\n$$\\tan(360° - \\theta) = -\\tan\\theta$$\n$$\\tan(-\\theta) = -\\tan\\theta \\quad \\text{(fungsi ganjil)}$$\n$$\\tan(90° - \\theta) = \\cot\\theta$$\n\n---\n\n## Rumus-rumus Tangen\n\n### Penjumlahan dan Pengurangan Sudut\n$$\\tan(A + B) = \\frac{\\tan A + \\tan B}{1 - \\tan A \\tan B}$$\n$$\\tan(A - B) = \\frac{\\tan A - \\tan B}{1 + \\tan A \\tan B}$$\n\n### Sudut Ganda\n$$\\tan 2A = \\frac{2\\tan A}{1 - \\tan^2 A}$$\n\n### Sudut Setengah\n$$\\tan\\frac{A}{2} = \\frac{\\sin A}{1 + \\cos A} = \\frac{1 - \\cos A}{\\sin A}$$\n\n---\n\n## Aplikasi: Sudut Kemiringan (Gradien)\n\nGradien (kemiringan) garis yang membentuk sudut $\\alpha$ dengan sumbu $x$ positif:\n$$m = \\tan\\alpha$$\n\n**Dua garis saling tegak lurus** jika:\n$$m_1 \\times m_2 = -1 \\implies \\tan\\alpha_1 \\times \\tan\\alpha_2 = -1$$\n\n**Contoh:** Sebuah tangga membentuk sudut $60°$ dengan lantai. Jika panjang tangga $8$ m, tentukan tinggi tangga!\n$$\\sin 60° = \\frac{t}{8} \\implies t = 8 \\times \\frac{\\sqrt{3}}{2} = 4\\sqrt{3} \\approx 6{,}93 \\text{ m}$$\n\n**Alternatif dengan tan:** panjang horizontal $= 8\\cos 60° = 4$ m, tinggi $= 4 \\times \\tan 60° = 4\\sqrt{3}$ m.',
  '[
    {"id":"t4-1","type":"link","url":"https://www.khanacademy.org/math/trigonometry/unit-circle-trig-func","label":"🎓 Khan Academy: Fungsi Tangen"},
    {"id":"t4-2","type":"link","url":"https://id.wikipedia.org/wiki/Tangen_(trigonometri)","label":"📖 Wikipedia: Tangen"}
  ]'::jsonb,
  ARRAY['Kelas 10', 'Trigonometri', 'Tangen', 'Gradien'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '3 minutes',
  NOW() + INTERVAL '3 minutes'
),

-- ── 5. Kotangen ──────────────────────────────────────────────
(
  'trigonometri',
  'Kotangen (cot)',
  E'## Definisi Kotangen\n\nKotangen adalah **kebalikan (resiprokal) dari tangen** — perbandingan sisi samping terhadap sisi depan.\n\n$$\\boxed{\\cot\\theta = \\frac{\\text{sisi samping}}{\\text{sisi depan}} = \\frac{\\cos\\theta}{\\sin\\theta} = \\frac{1}{\\tan\\theta}}$$\n\nDalam lingkaran satuan:\n$$\\cot\\theta = \\frac{x}{y}, \\quad y \\neq 0$$\n\n---\n\n## Grafik Fungsi Kotangen\n\n| Sifat | Nilai |\n|---|---|\n| **Domain** | $\\mathbb{R} \\setminus \\{180°n\\}$ |\n| **Range** | $\\mathbb{R}$ |\n| **Periode** | $\\pi = 180°$ |\n| **Asimtot** | $x = 180°n,\\ n \\in \\mathbb{Z}$ |\n| **Titik nol** | $x = 90° + 180°n$ |\n\n> Grafik cotangen **turun** dari kiri ke kanan (berlawanan dengan tangen yang naik).\n\n---\n\n## Nilai Kotangen Sudut Istimewa\n\n$$\\cot 0° = \\text{tidak terdefinisi} \\quad \\cot 30° = \\sqrt{3}$$\n\n$$\\cot 45° = 1 \\quad \\cot 60° = \\frac{\\sqrt{3}}{3} \\quad \\cot 90° = 0$$\n\n> Pola: nilai $\\cot$ = nilai $\\tan$ yang **terbalik urutannya**.\n\n---\n\n## Relasi Sudut\n\n$$\\cot(180° - \\theta) = -\\cot\\theta$$\n$$\\cot(180° + \\theta) = \\cot\\theta$$\n$$\\cot(360° - \\theta) = -\\cot\\theta$$\n$$\\cot(-\\theta) = -\\cot\\theta \\quad \\text{(fungsi ganjil)}$$\n$$\\cot(90° - \\theta) = \\tan\\theta$$\n\n---\n\n## Identitas dengan Kotangen\n\n$$1 + \\cot^2\\theta = \\csc^2\\theta$$\n\n$$\\cot\\theta \\cdot \\tan\\theta = 1$$\n\n---\n\n## Rumus Penjumlahan Sudut\n\n$$\\cot(A + B) = \\frac{\\cot A \\cot B - 1}{\\cot A + \\cot B}$$\n\n$$\\cot(A - B) = \\frac{\\cot A \\cot B + 1}{\\cot B - \\cot A}$$\n\n---\n\n## Perbandingan Tangen vs Kotangen\n\n| Sifat | $\\tan\\theta$ | $\\cot\\theta$ |\n|---|---|---|\n| Definisi | $\\frac{\\sin}{\\cos}$ | $\\frac{\\cos}{\\sin}$ |\n| Asimtot | $\\theta = 90° + 180°n$ | $\\theta = 180°n$ |\n| Titik nol | $\\theta = 180°n$ | $\\theta = 90° + 180°n$ |\n| Arah grafik | Naik | Turun |\n| Periode | $180°$ | $180°$ |\n\n---\n\n## Contoh\n\nJika $\\tan\\theta = 2$, tentukan nilai $\\cot\\theta$!\n$$\\cot\\theta = \\frac{1}{\\tan\\theta} = \\frac{1}{2}$$\n\nJika $\\sin\\theta = \\frac{3}{5}$ dan $\\cos\\theta = \\frac{4}{5}$, tentukan $\\cot\\theta$!\n$$\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta} = \\frac{4/5}{3/5} = \\frac{4}{3}$$',
  '[
    {"id":"t5-1","type":"link","url":"https://www.khanacademy.org/math/trigonometry","label":"🎓 Khan Academy: Trigonometri"},
    {"id":"t5-2","type":"link","url":"https://id.wikipedia.org/wiki/Kotangen","label":"📖 Wikipedia: Kotangen"}
  ]'::jsonb,
  ARRAY['Kelas 10', 'Trigonometri', 'Kotangen', 'Resiprokal'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '4 minutes',
  NOW() + INTERVAL '4 minutes'
),

-- ── 6. Sekan ─────────────────────────────────────────────────
(
  'trigonometri',
  'Sekan dan Kosekan (sec & csc)',
  E'## Sekan (sec)\n\n### Definisi\n\nSekan adalah **kebalikan (resiprokal) dari kosinus** — perbandingan sisi miring terhadap sisi samping.\n\n$$\\boxed{\\sec\\theta = \\frac{\\text{sisi miring}}{\\text{sisi samping}} = \\frac{1}{\\cos\\theta}}$$\n\nDalam lingkaran satuan:\n$$\\sec\\theta = \\frac{1}{x}, \\quad x \\neq 0$$\n\n### Grafik Fungsi Sekan\n\n| Sifat | Nilai |\n|---|---|\n| **Domain** | $\\mathbb{R} \\setminus \\{90° + 180°n\\}$ |\n| **Range** | $(-\\infty, -1] \\cup [1, +\\infty)$ |\n| **Periode** | $2\\pi = 360°$ |\n| **Asimtot** | $x = 90° + 180°n$ |\n| **Nilai min** | $1$ (saat $\\cos\\theta = 1$) |\n| **Nilai maks** | $-1$ (saat $\\cos\\theta = -1$) |\n\n### Nilai Sekan Sudut Istimewa\n\n$$\\sec 0° = 1 \\quad \\sec 30° = \\frac{2\\sqrt{3}}{3} \\quad \\sec 45° = \\sqrt{2}$$\n\n$$\\sec 60° = 2 \\quad \\sec 90° = \\text{tidak terdefinisi}$$\n\n### Identitas dengan Sekan\n\n$$1 + \\tan^2\\theta = \\sec^2\\theta$$\n\n$$\\sec\\theta \\cdot \\cos\\theta = 1$$\n\n### Relasi Sudut\n\n$$\\sec(180° - \\theta) = -\\sec\\theta$$\n$$\\sec(360° - \\theta) = \\sec\\theta$$\n$$\\sec(-\\theta) = \\sec\\theta \\quad \\text{(fungsi genap)}$$\n\n---\n\n## Kosekan (csc)\n\n### Definisi\n\nKosekan adalah **kebalikan (resiprokal) dari sinus** — perbandingan sisi miring terhadap sisi depan.\n\n$$\\boxed{\\csc\\theta = \\frac{\\text{sisi miring}}{\\text{sisi depan}} = \\frac{1}{\\sin\\theta}}$$\n\n### Grafik Fungsi Kosekan\n\n| Sifat | Nilai |\n|---|---|\n| **Domain** | $\\mathbb{R} \\setminus \\{180°n\\}$ |\n| **Range** | $(-\\infty, -1] \\cup [1, +\\infty)$ |\n| **Periode** | $2\\pi = 360°$ |\n| **Asimtot** | $x = 180°n$ |\n\n### Nilai Kosekan Sudut Istimewa\n\n$$\\csc 0° = \\text{tidak terdefinisi} \\quad \\csc 30° = 2$$\n\n$$\\csc 45° = \\sqrt{2} \\quad \\csc 60° = \\frac{2\\sqrt{3}}{3} \\quad \\csc 90° = 1$$\n\n### Identitas dengan Kosekan\n\n$$1 + \\cot^2\\theta = \\csc^2\\theta$$\n\n$$\\csc\\theta \\cdot \\sin\\theta = 1$$\n\n---\n\n## Ringkasan 6 Fungsi Trigonometri\n\n| Fungsi | Resiprokal dari | Domain (tidak terdefinisi di) | Range |\n|---|---|---|---|\n| $\\sin\\theta$ | — | — | $[-1, 1]$ |\n| $\\cos\\theta$ | — | — | $[-1, 1]$ |\n| $\\tan\\theta$ | — | $90° + 180°n$ | $\\mathbb{R}$ |\n| $\\csc\\theta$ | $\\sin$ | $180°n$ | $\\leq{-1}$ atau $\\geq 1$ |\n| $\\sec\\theta$ | $\\cos$ | $90° + 180°n$ | $\\leq{-1}$ atau $\\geq 1$ |\n| $\\cot\\theta$ | $\\tan$ | $180°n$ | $\\mathbb{R}$ |\n\n---\n\n## Contoh Terpadu\n\nJika $\\sin\\theta = \\frac{5}{13}$ (sudut di kuadran II), tentukan semua nilai 6 fungsi trigonometri!\n\nDari $\\sin^2\\theta + \\cos^2\\theta = 1$:\n$$\\cos\\theta = -\\sqrt{1 - \\frac{25}{169}} = -\\frac{12}{13} \\quad (\\text{negatif di kuadran II})$$\n\n$$\\tan\\theta = \\frac{5/13}{-12/13} = -\\frac{5}{12}$$\n\n$$\\csc\\theta = \\frac{13}{5} \\quad \\sec\\theta = -\\frac{13}{12} \\quad \\cot\\theta = -\\frac{12}{5}$$',
  '[
    {"id":"t6-1","type":"link","url":"https://www.khanacademy.org/math/trigonometry","label":"🎓 Khan Academy: Fungsi Trigonometri"},
    {"id":"t6-2","type":"link","url":"https://id.wikipedia.org/wiki/Sekan_(trigonometri)","label":"📖 Wikipedia: Sekan"}
  ]'::jsonb,
  ARRAY['Kelas 10', 'Trigonometri', 'Sekan', 'Kosekan', 'Resiprokal'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '5 minutes',
  NOW() + INTERVAL '5 minutes'
)

ON CONFLICT DO NOTHING;
