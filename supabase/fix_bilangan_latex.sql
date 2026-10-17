-- ============================================================
-- FIX: Update materi bilangan ke format LaTeX yang benar
-- Jalankan di Supabase SQL Editor
-- Hapus semua materi bilangan lama, insert ulang dengan LaTeX proper
-- ============================================================

-- Langkah 1: Hapus semua materi bilangan yang ada
DELETE FROM public.materi_posts WHERE strand = 'bilangan';

-- Langkah 2: Insert ulang dengan LaTeX proper
INSERT INTO public.materi_posts
  (strand, title, description, attachments, tags, published, created_by, created_at, updated_at)
VALUES

-- ── 1. Jenis dan Sifat Bilangan ─────────────────────────────
(
  'bilangan',
  'Jenis dan Sifat Bilangan',
  E'## Pengertian Bilangan\n\nBilangan adalah konsep matematika untuk pencacahan dan pengukuran. Bilangan-bilangan tersusun dalam hierarki dari yang paling sederhana hingga paling kompleks.\n\n---\n\n## Jenis-jenis Bilangan\n\n### 1. Bilangan Asli ($\\mathbb{N}$)\nBilangan untuk menghitung, dimulai dari 1:\n$$\\mathbb{N} = \\{1, 2, 3, 4, 5, \\ldots\\}$$\n\n> Bilangan asli **tidak memiliki nol** dan tidak ada batas atasnya.\n\n**Sifat:**\n- Tertutup terhadap penjumlahan: $a + b \\in \\mathbb{N}$\n- Tertutup terhadap perkalian: $a \\times b \\in \\mathbb{N}$\n\n### 2. Bilangan Cacah ($\\mathbb{W}$)\nBilangan asli ditambah nol:\n$$\\mathbb{W} = \\{0, 1, 2, 3, 4, \\ldots\\}$$\n\n### 3. Bilangan Bulat ($\\mathbb{Z}$)\nMencakup bilangan negatif, nol, dan positif:\n$$\\mathbb{Z} = \\{\\ldots, -3, -2, -1, 0, 1, 2, 3, \\ldots\\}$$\n\n| Kelompok | Contoh |\n|---|---|\n| Bulat Positif | $1, 2, 3, \\ldots$ |\n| Nol | $0$ |\n| Bulat Negatif | $-1, -2, -3, \\ldots$ |\n\n### 4. Bilangan Rasional ($\\mathbb{Q}$)\nBilangan yang dapat dinyatakan sebagai $\\dfrac{p}{q}$ dengan $p, q \\in \\mathbb{Z}$ dan $q \\neq 0$.\n\n**Contoh:** $\\dfrac{1}{2},\\ \\dfrac{3}{4},\\ 0{,}75,\\ -\\dfrac{2}{3}$\n\n### 5. Bilangan Irasional\nBilangan yang **tidak dapat** dinyatakan sebagai pecahan $\\dfrac{p}{q}$.\n\n**Contoh:** $\\sqrt{2} \\approx 1{,}41421\\ldots,\\ \\pi \\approx 3{,}14159\\ldots,\\ e \\approx 2{,}71828\\ldots$\n\n### 6. Bilangan Real ($\\mathbb{R}$)\nGabungan bilangan rasional dan irasional:\n$$\\mathbb{R} = \\mathbb{Q} \\cup \\mathbb{Q}^c$$\n\n---\n\n## Sifat-sifat Operasi\n\n| Sifat | Penjumlahan | Perkalian |\n|---|---|---|\n| **Komutatif** | $a + b = b + a$ | $a \\times b = b \\times a$ |\n| **Asosiatif** | $(a+b)+c = a+(b+c)$ | $(a\\times b)\\times c = a\\times(b\\times c)$ |\n| **Distributif** | \\multicolumn{2}{c|}{$a\\times(b+c) = a\\times b + a\\times c$} |\n| **Identitas** | $a + 0 = a$ | $a \\times 1 = a$ |\n| **Invers** | $a + (-a) = 0$ | $a \\times \\dfrac{1}{a} = 1$ |\n\n---\n\n## Sifat Kepadatan Bilangan Rasional\n\nDi antara dua bilangan rasional selalu ada bilangan rasional lain:\n$$\\text{Jika } a < b \\text{ maka } a < \\frac{a+b}{2} < b$$\n\n**Contoh:** Di antara $\\dfrac{1}{3}$ dan $\\dfrac{1}{2}$, terdapat $\\dfrac{5}{12}$.',
  '[
    {"id":"b1-1","type":"link","url":"https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-factors-and-multiples","label":"🎓 Khan Academy: Jenis-jenis Bilangan"},
    {"id":"b1-2","type":"link","url":"https://id.wikipedia.org/wiki/Bilangan","label":"📖 Wikipedia: Bilangan"}
  ]'::jsonb,
  ARRAY['Kelas 7', 'Semester 1', 'Dasar'],
  true, 'admin@trisula.edu', NOW(), NOW()
),

-- ── 2. FPB, KPK, dan Operasi Bilangan Bulat ─────────────────
(
  'bilangan',
  'FPB, KPK, dan Operasi Bilangan Bulat',
  E'## Faktor dan Kelipatan\n\n### Faktor Bilangan\nFaktor dari bilangan $n$ adalah bilangan yang **habis membagi** $n$.\n\n**Contoh:** Faktor dari $12$:\n$$12 = 1 \\times 12 = 2 \\times 6 = 3 \\times 4$$\nFaktor $12 = \\{1, 2, 3, 4, 6, 12\\}$\n\n### Kelipatan Bilangan\nKelipatan dari $n$ adalah hasil $n \\times k$ untuk $k = 1, 2, 3, \\ldots$\n\nKelipatan $4 = \\{4, 8, 12, 16, 20, 24, \\ldots\\}$\n\n---\n\n## Bilangan Prima\n\nBilangan prima adalah bilangan asli $> 1$ yang hanya memiliki **dua faktor**: 1 dan dirinya sendiri.\n\n$$\\text{Prima} = \\{2, 3, 5, 7, 11, 13, 17, 19, 23, \\ldots\\}$$\n\n> **2 adalah satu-satunya bilangan prima genap.**\n\n---\n\n## Faktorisasi Prima\n\nSetiap bilangan bulat $> 1$ dapat ditulis sebagai **hasil kali bilangan prima**.\n\n**Contoh:**\n$$60 = 2^2 \\times 3 \\times 5$$\n$$84 = 2^2 \\times 3 \\times 7$$\n\n---\n\n## FPB (Faktor Persekutuan Terbesar)\n\nFPB adalah faktor terbesar yang **sama-sama membagi** dua bilangan atau lebih.\n\n**Cara:** Ambil faktor prima dengan **pangkat terkecil** yang muncul di semua bilangan.\n\n**Contoh:** FPB dari $60$ dan $84$:\n$$60 = 2^2 \\times 3 \\times 5$$\n$$84 = 2^2 \\times 3 \\times 7$$\n$$\\text{FPB}(60, 84) = 2^2 \\times 3 = 12$$\n\n---\n\n## KPK (Kelipatan Persekutuan Terkecil)\n\nKPK adalah kelipatan terkecil yang **sama-sama merupakan kelipatan** dari dua bilangan atau lebih.\n\n**Cara:** Ambil faktor prima dengan **pangkat terbesar** dari semua bilangan.\n\n**Contoh:** KPK dari $60$ dan $84$:\n$$\\text{KPK}(60, 84) = 2^2 \\times 3 \\times 5 \\times 7 = 420$$\n\n> **Hubungan FPB dan KPK:**\n> $$\\text{FPB}(a,b) \\times \\text{KPK}(a,b) = a \\times b$$\n\n---\n\n## Operasi Bilangan Bulat\n\n### Penjumlahan & Pengurangan\n- $(-a) + (-b) = -(a+b)$\n- $a + (-b) = a - b$\n- $(-a) - (-b) = -a + b = b - a$\n\n**Contoh:** $-7 + 4 = -3$ karena $|{-7}| > |4|$, ambil tanda negatif.\n\n### Perkalian & Pembagian\n\n| Tanda | Hasil |\n|:---:|:---:|\n| $(+) \\times (+)$ | $+$ |\n| $(+) \\times (-)$ | $-$ |\n| $(-) \\times (-)$ | $+$ |\n\n$$\\text{Contoh: } (-3) \\times (-5) = +15 \\quad ; \\quad (-12) \\div 4 = -3$$\n\n---\n\n## Operasi Pecahan\n\n### Penjumlahan & Pengurangan (samakan penyebut)\n$$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$$\n\n**Contoh:** $\\dfrac{1}{3} + \\dfrac{1}{4} = \\dfrac{4 + 3}{12} = \\dfrac{7}{12}$\n\n### Perkalian\n$$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$\n\n**Contoh:** $\\dfrac{2}{3} \\times \\dfrac{3}{5} = \\dfrac{6}{15} = \\dfrac{2}{5}$\n\n### Pembagian (kalikan dengan kebalikan)\n$$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c} = \\frac{ad}{bc}$$\n\n**Contoh:** $\\dfrac{2}{3} \\div \\dfrac{4}{9} = \\dfrac{2}{3} \\times \\dfrac{9}{4} = \\dfrac{18}{12} = \\dfrac{3}{2}$',
  '[
    {"id":"b2-1","type":"link","url":"https://www.khanacademy.org/math/pre-algebra/pre-algebra-factors-multiples","label":"🎓 Khan Academy: FPB dan KPK"},
    {"id":"b2-2","type":"link","url":"https://id.wikipedia.org/wiki/Faktor_persekutuan_terbesar","label":"📖 Wikipedia: FPB"}
  ]'::jsonb,
  ARRAY['Kelas 7', 'Kelas 8', 'FPB KPK'],
  true, 'admin@trisula.edu', NOW() + INTERVAL '1 minute', NOW() + INTERVAL '1 minute'
),

-- ── 3. Bilangan Berpangkat dan Akar ─────────────────────────
(
  'bilangan',
  'Bilangan Berpangkat dan Akar',
  E'## Definisi Perpangkatan\n\nPerpangkatan adalah perkalian berulang suatu bilangan dengan dirinya sendiri.\n\n$$\\boxed{a^n = \\underbrace{a \\times a \\times \\cdots \\times a}_{n \\text{ kali}}}$$\n\ndi mana $a$ = **basis** dan $n$ = **eksponen/pangkat**.\n\n---\n\n## Contoh Dasar\n\n| Perpangkatan | Dibaca | Nilai |\n|:---:|:---:|:---:|\n| $2^3$ | "2 pangkat 3" | $2 \\times 2 \\times 2 = 8$ |\n| $5^2$ | "5 pangkat 2 / 5 kuadrat" | $5 \\times 5 = 25$ |\n| $10^4$ | "10 pangkat 4" | $10.000$ |\n| $3^0$ | "3 pangkat 0" | $1$ |\n| $2^{-1}$ | "2 pangkat negatif 1" | $\\dfrac{1}{2} = 0{,}5$ |\n\n---\n\n## Hukum-hukum Eksponen\n\n| Hukum | Rumus | Contoh |\n|---|---|---|\n| **Perkalian** | $a^m \\times a^n = a^{m+n}$ | $2^3 \\times 2^4 = 2^7 = 128$ |\n| **Pembagian** | $a^m \\div a^n = a^{m-n}$ | $3^5 \\div 3^2 = 3^3 = 27$ |\n| **Pangkat dari pangkat** | $(a^m)^n = a^{mn}$ | $(2^3)^4 = 2^{12} = 4096$ |\n| **Pangkat dari perkalian** | $(ab)^n = a^n b^n$ | $(2 \\times 3)^2 = 4 \\times 9 = 36$ |\n| **Pangkat dari pecahan** | $\\left(\\dfrac{a}{b}\\right)^n = \\dfrac{a^n}{b^n}$ | $\\left(\\dfrac{2}{3}\\right)^2 = \\dfrac{4}{9}$ |\n| **Pangkat nol** | $a^0 = 1,\\ a \\neq 0$ | $7^0 = 1$ |\n| **Pangkat negatif** | $a^{-n} = \\dfrac{1}{a^n}$ | $2^{-3} = \\dfrac{1}{8}$ |\n\n---\n\n## Pangkat Pecahan dan Akar\n\nPangkat pecahan berkaitan dengan operasi akar:\n\n$$a^{1/n} = \\sqrt[n]{a} \\qquad a^{m/n} = \\left(\\sqrt[n]{a}\\right)^m = \\sqrt[n]{a^m}$$\n\n**Contoh:**\n$$4^{1/2} = \\sqrt{4} = 2$$\n$$8^{1/3} = \\sqrt[3]{8} = 2$$\n$$27^{2/3} = \\left(\\sqrt[3]{27}\\right)^2 = 3^2 = 9$$\n$$16^{3/4} = \\left(\\sqrt[4]{16}\\right)^3 = 2^3 = 8$$\n\n---\n\n## Akar Kuadrat dan Akar Pangkat $n$\n\n$$\\sqrt{a} = b \\iff b^2 = a, \\quad b \\geq 0$$\n\n$$\\sqrt[n]{a} = b \\iff b^n = a$$\n\n**Sifat akar:**\n$$\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}$$\n$$\\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}$$\n$$\\sqrt{a^2} = |a|$$\n\n**Merasionalkan penyebut:**\n$$\\frac{1}{\\sqrt{a}} = \\frac{\\sqrt{a}}{a}$$\n$$\\frac{1}{\\sqrt{a} + \\sqrt{b}} = \\frac{\\sqrt{a} - \\sqrt{b}}{a - b}$$\n\n---\n\n## Contoh Soal\n\n**Sederhanakan:** $\\dfrac{2^3 \\times 4^2}{8}$\n\n$$\\text{Ubah ke basis 2: } 4^2 = (2^2)^2 = 2^4,\\quad 8 = 2^3$$\n$$\\frac{2^3 \\times 2^4}{2^3} = 2^{3+4-3} = 2^4 = 16$$\n\n**Hitung:** $27^{2/3} + 16^{3/4}$\n$$27^{2/3} = \\left(\\sqrt[3]{27}\\right)^2 = 3^2 = 9$$\n$$16^{3/4} = \\left(\\sqrt[4]{16}\\right)^3 = 2^3 = 8$$\n$$\\text{Hasil: } 9 + 8 = 17$$',
  '[
    {"id":"b3-1","type":"link","url":"https://www.khanacademy.org/math/cc-eighth-grade-math/cc-8th-numbers-operations","label":"🎓 Khan Academy: Eksponen dan Perpangkatan"},
    {"id":"b3-2","type":"link","url":"https://id.wikipedia.org/wiki/Perpangkatan","label":"📖 Wikipedia: Perpangkatan"}
  ]'::jsonb,
  ARRAY['Kelas 9', 'Eksponen', 'Akar'],
  true, 'admin@trisula.edu', NOW() + INTERVAL '2 minutes', NOW() + INTERVAL '2 minutes'
);
