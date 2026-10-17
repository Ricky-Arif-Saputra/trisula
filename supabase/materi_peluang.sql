-- ============================================================
-- Insert 6 Materi Data dan Peluang
-- Jalankan di Supabase SQL Editor
-- ============================================================

INSERT INTO public.materi_posts
  (strand, title, description, attachments, tags, published, created_by, created_at, updated_at)
VALUES

-- ── 1. Penyajian Data ────────────────────────────────────────
(
  'peluang',
  'Penyajian Data',
  E'## Pengertian Data\n\nData adalah **kumpulan fakta atau informasi** yang dikumpulkan untuk keperluan analisis.\n\n| Jenis | Keterangan | Contoh |\n|---|---|---|\n| **Kualitatif** | Berupa kategori/label | Warna, jenis kelamin |\n| **Kuantitatif** | Berupa angka | Tinggi badan, nilai ujian |\n| **Diskrit** | Nilai bilangan bulat | Jumlah siswa |\n| **Kontinu** | Nilai dalam rentang | Berat badan, suhu |\n\n---\n\n## 1. Tabel Distribusi Frekuensi\n\nMengelompokkan data ke dalam **kelas interval**.\n\n**Langkah membuat:**\n1. Tentukan jangkauan: $J = X_{\\max} - X_{\\min}$\n2. Tentukan banyak kelas: $k \\approx 1 + 3{,}3 \\log n$ (Sturges)\n3. Tentukan panjang kelas: $p = \\lceil J / k \\rceil$\n4. Buat tabel dengan kolom: Kelas, Frekuensi, Frekuensi Relatif, Frekuensi Kumulatif\n\n**Frekuensi Relatif:**\n$$f_r = \\frac{f_i}{n} \\times 100\\%$$\n\n**Contoh tabel:**\n\n| Nilai | Frekuensi ($f$) | $f_r$ | $F$ kumulatif |\n|:---:|:---:|:---:|:---:|\n| 60–69 | 5 | 12,5% | 5 |\n| 70–79 | 12 | 30% | 17 |\n| 80–89 | 15 | 37,5% | 32 |\n| 90–99 | 8 | 20% | 40 |\n| **Total** | **40** | **100%** | |\n\n---\n\n## 2. Diagram Batang\n\nMenyajikan data dengan **batang vertikal atau horizontal**. Cocok untuk data **kategorik** atau data diskrit.\n\n- Sumbu $x$: kategori/kelas\n- Sumbu $y$: frekuensi\n- Tiap batang tidak saling menyentuh (kecuali histogram)\n\n---\n\n## 3. Histogram\n\nSeperti diagram batang, tetapi untuk **data kontinu** (kelas interval). Batang-batang **saling berdempetan**.\n\n**Poligon frekuensi:** hubungkan titik tengah atas setiap batang histogram.\n\n---\n\n## 4. Diagram Lingkaran (Pie Chart)\n\nMenyajikan data dalam **persentase** berupa potongan lingkaran.\n\n**Besar sudut tiap sektor:**\n$$\\theta_i = \\frac{f_i}{n} \\times 360°$$\n\n**Contoh:** Dari 40 siswa, 10 suka Matematika → sudut $= \\frac{10}{40} \\times 360° = 90°$\n\n---\n\n## 5. Ogive\n\nGrafik **frekuensi kumulatif** — digunakan untuk menentukan persentil, kuartil, dan median secara grafis.\n\n- **Ogive naik (positif):** frekuensi kumulatif dari bawah\n- **Ogive turun (negatif):** frekuensi kumulatif dari atas\n\n---\n\n## 6. Diagram Garis\n\nCocok untuk menunjukkan **perubahan data dari waktu ke waktu** (data berkala/time series).\n\n---\n\n## 7. Diagram Batang Daun (Stem-and-Leaf)\n\nMenyajikan setiap nilai data secara individual sekaligus memperlihatkan distribusinya.\n\n**Contoh** data: 23, 25, 31, 34, 37, 42, 45\n\n```\nBatang | Daun\n  2    | 3 5\n  3    | 1 4 7\n  4    | 2 5\n```\n\n---\n\n## 8. Box Plot (Diagram Kotak)\n\nMenampilkan **5 ringkasan statistik**: $X_{\\min}$, $Q_1$, $Q_2$ (median), $Q_3$, $X_{\\max}$.\n\n$$\\boxed{X_{\\min} \\quad Q_1 \\quad Q_2 \\quad Q_3 \\quad X_{\\max}}$$\n\nBox plot berguna untuk melihat **sebaran, simetri, dan pencilan (outlier)** data.',
  '[
    {"id":"p1-1","type":"link","url":"https://www.khanacademy.org/math/statistics-probability/displaying-describing-data","label":"🎓 Khan Academy: Penyajian Data"},
    {"id":"p1-2","type":"link","url":"https://id.wikipedia.org/wiki/Statistika_deskriptif","label":"📖 Wikipedia: Statistika Deskriptif"}
  ]'::jsonb,
  ARRAY['Kelas 8', 'Kelas 10', 'Statistika', 'Penyajian Data', 'Histogram'],
  true,
  'admin@trisula.edu',
  NOW(),
  NOW()
),

-- ── 2. Ukuran Pemusatan ──────────────────────────────────────
(
  'peluang',
  'Ukuran Pemusatan Data',
  E'## Pengertian\n\nUkuran pemusatan adalah nilai tunggal yang **mewakili keseluruhan data** — menunjukkan di mana data cenderung berkumpul.\n\nTiga ukuran utama: **Mean (Rata-rata), Median, Modus**.\n\n---\n\n## 1. Mean (Rata-rata)\n\n### Data Tunggal\n$$\\bar{x} = \\frac{\\sum x_i}{n} = \\frac{x_1 + x_2 + \\cdots + x_n}{n}$$\n\n**Contoh:** Data: 7, 8, 6, 9, 5\n$$\\bar{x} = \\frac{7+8+6+9+5}{5} = \\frac{35}{5} = 7$$\n\n### Data Berkelompok\n$$\\bar{x} = \\frac{\\sum f_i \\cdot x_i}{\\sum f_i}$$\n\ndi mana $x_i$ adalah nilai tengah kelas ke-$i$.\n\n### Mean dengan Rataan Sementara\n$$\\bar{x} = x_s + \\frac{\\sum f_i d_i}{\\sum f_i}, \\quad d_i = x_i - x_s$$\n\n---\n\n## 2. Median ($Me$)\n\nNilai **tengah** setelah data diurutkan.\n\n### Data Tunggal\n- $n$ ganjil: $Me = x_{\\frac{n+1}{2}}$\n- $n$ genap: $Me = \\frac{x_{n/2} + x_{n/2+1}}{2}$\n\n**Contoh:** Data: 3, 5, 7, 9, 11 → $Me = 7$\n\n### Data Berkelompok\n$$Me = L + \\frac{\\frac{n}{2} - F}{f} \\times p$$\n\n| Simbol | Arti |\n|---|---|\n| $L$ | Tepi bawah kelas median |\n| $n$ | Jumlah data |\n| $F$ | Frekuensi kumulatif sebelum kelas median |\n| $f$ | Frekuensi kelas median |\n| $p$ | Panjang kelas |\n\n---\n\n## 3. Modus ($Mo$)\n\nNilai yang **paling sering muncul**.\n\n### Data Tunggal\nNilai dengan frekuensi terbesar. Data bisa memiliki satu modus (unimodal), dua (bimodal), atau lebih.\n\n### Data Berkelompok\n$$Mo = L + \\frac{d_1}{d_1 + d_2} \\times p$$\n\n| Simbol | Arti |\n|---|---|\n| $L$ | Tepi bawah kelas modus |\n| $d_1$ | Selisih frekuensi kelas modus dengan kelas sebelumnya |\n| $d_2$ | Selisih frekuensi kelas modus dengan kelas sesudahnya |\n| $p$ | Panjang kelas |\n\n---\n\n## 4. Kuartil\n\nMembagi data (terurut) menjadi **4 bagian sama besar**.\n\n$$Q_1 = \\text{kuartil bawah} \\quad Q_2 = \\text{median} \\quad Q_3 = \\text{kuartil atas}$$\n\n**Untuk data berkelompok:**\n$$Q_i = L + \\frac{\\frac{in}{4} - F}{f} \\times p$$\n\n---\n\n## 5. Persentil\n\nMembagi data menjadi **100 bagian sama besar**.\n$$P_k = L + \\frac{\\frac{kn}{100} - F}{f} \\times p$$\n\n---\n\n## Perbandingan Mean, Median, Modus\n\n| | Mean | Median | Modus |\n|---|---|---|---|\n| **Keunggulan** | Memperhitungkan semua data | Tidak terpengaruh pencilan | Menunjukkan nilai terbanyak |\n| **Kelemahan** | Terpengaruh pencilan | Tidak memakai semua data | Bisa tidak ada/banyak |\n| **Terbaik untuk** | Data simetris | Data miring/ada pencilan | Data kategorik |\n\n> **Hubungan** pada distribusi miring:\n> - Miring kanan: $Mo < Me < \\bar{x}$\n> - Simetris: $Mo = Me = \\bar{x}$\n> - Miring kiri: $\\bar{x} < Me < Mo$',
  '[
    {"id":"p2-1","type":"link","url":"https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data","label":"🎓 Khan Academy: Ukuran Pemusatan"},
    {"id":"p2-2","type":"link","url":"https://id.wikipedia.org/wiki/Rata-rata","label":"📖 Wikipedia: Rata-rata"}
  ]'::jsonb,
  ARRAY['Kelas 8', 'Kelas 11', 'Statistika', 'Mean', 'Median', 'Modus'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '1 minute',
  NOW() + INTERVAL '1 minute'
),

-- ── 3. Ukuran Penyebaran ─────────────────────────────────────
(
  'peluang',
  'Ukuran Penyebaran Data',
  E'## Pengertian\n\nUkuran penyebaran menggambarkan seberapa **jauh data tersebar** dari nilai pusatnya.\n\n---\n\n## 1. Jangkauan (Range)\n\n$$J = X_{\\max} - X_{\\min}$$\n\n**Kelemahan:** hanya mempertimbangkan dua nilai ekstrem, sangat peka terhadap pencilan.\n\n---\n\n## 2. Jangkauan Antarkuartil (IQR)\n\n$$IQR = Q_3 - Q_1$$\n\nMengukur sebaran **50% data tengah** — tidak terpengaruh pencilan.\n\n**Deteksi pencilan (outlier):**\n$$\\text{Batas bawah} = Q_1 - 1{,}5 \\times IQR$$\n$$\\text{Batas atas} = Q_3 + 1{,}5 \\times IQR$$\n\nData di luar batas tersebut dianggap **pencilan**.\n\n---\n\n## 3. Simpangan Rata-rata (Mean Deviation)\n\n$$\\bar{d} = \\frac{\\sum |x_i - \\bar{x}|}{n}$$\n\n**Contoh:** Data: 4, 6, 8, 10, 12; $\\bar{x} = 8$\n$$\\bar{d} = \\frac{|4-8|+|6-8|+|8-8|+|10-8|+|12-8|}{5} = \\frac{4+2+0+2+4}{5} = \\frac{12}{5} = 2{,}4$$\n\n---\n\n## 4. Ragam / Variansi ($s^2$)\n\n### Data Tunggal\n$$s^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n} \\quad \\text{(populasi)}$$\n$$s^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n-1} \\quad \\text{(sampel)}$$\n\n### Data Berkelompok\n$$s^2 = \\frac{\\sum f_i(x_i - \\bar{x})^2}{\\sum f_i}$$\n\n**Contoh:** Data: 2, 4, 6, 8, 10; $\\bar{x} = 6$\n$$s^2 = \\frac{(2-6)^2+(4-6)^2+(6-6)^2+(8-6)^2+(10-6)^2}{5} = \\frac{16+4+0+4+16}{5} = 8$$\n\n---\n\n## 5. Simpangan Baku (Standar Deviasi)\n\n$$s = \\sqrt{s^2}$$\n\nMerupakan **akar kuadrat variansi** — satuannya sama dengan satuan data asli.\n\nDari contoh di atas: $s = \\sqrt{8} = 2\\sqrt{2} \\approx 2{,}83$\n\n> **Semakin besar** $s$, semakin **beragam** data tersebar dari rata-rata.\n\n---\n\n## 6. Koefisien Variasi (KV)\n\nMembandingkan penyebaran dua data dengan **satuan berbeda**:\n\n$$KV = \\frac{s}{\\bar{x}} \\times 100\\%$$\n\nData dengan $KV$ lebih kecil berarti **lebih homogen/seragam**.\n\n---\n\n## Ringkasan Perbandingan\n\n| Ukuran | Rumus | Kelebihan |\n|---|---|---|\n| Range | $X_{\\max} - X_{\\min}$ | Mudah dihitung |\n| IQR | $Q_3 - Q_1$ | Tahan pencilan |\n| Variansi | $\\frac{\\sum(x_i-\\bar{x})^2}{n}$ | Dasar banyak metode statistik |\n| Simpangan baku | $\\sqrt{\\text{variansi}}$ | Satuan sama dengan data |\n| KV | $\\frac{s}{\\bar{x}} \\times 100\\%$ | Perbandingan antar kelompok |',
  '[
    {"id":"p3-1","type":"link","url":"https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data/variance-standard-deviation-population","label":"🎓 Khan Academy: Variansi & Simpangan Baku"},
    {"id":"p3-2","type":"link","url":"https://id.wikipedia.org/wiki/Simpangan_baku","label":"📖 Wikipedia: Simpangan Baku"}
  ]'::jsonb,
  ARRAY['Kelas 11', 'Statistika', 'Variansi', 'Simpangan Baku', 'IQR'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '2 minutes',
  NOW() + INTERVAL '2 minutes'
),

-- ── 4. Aturan Pencacahan ─────────────────────────────────────
(
  'peluang',
  'Aturan Pencacahan',
  E'## Pengertian\n\nAturan pencacahan adalah cara **menghitung banyaknya kemungkinan** susunan atau pilihan yang dapat terjadi.\n\n---\n\n## 1. Aturan Perkalian (Filling Slots)\n\nJika suatu kejadian terdiri atas $k$ langkah, dengan:\n- Langkah 1 dapat dilakukan dengan $n_1$ cara\n- Langkah 2 dapat dilakukan dengan $n_2$ cara\n- dst.\n\nMaka total cara:\n$$N = n_1 \\times n_2 \\times \\cdots \\times n_k$$\n\n**Contoh:** Kode PIN 4 digit (0–9), tiap digit bebas:\n$$N = 10 \\times 10 \\times 10 \\times 10 = 10.000 \\text{ cara}$$\n\n---\n\n## 2. Faktorial\n\n$$n! = n \\times (n-1) \\times (n-2) \\times \\cdots \\times 2 \\times 1$$\n\n$$0! = 1 \\qquad 1! = 1 \\qquad 5! = 120 \\qquad 7! = 5040$$\n\n---\n\n## 3. Permutasi\n\nMenyusun $r$ objek dari $n$ objek tersedia, di mana **urutan diperhatikan**.\n\n$$P(n, r) = {}^nP_r = \\frac{n!}{(n-r)!}$$\n\n**Contoh:** Berapa banyak susunan 3 huruf dari A, B, C, D, E?\n$$P(5,3) = \\frac{5!}{(5-3)!} = \\frac{120}{2} = 60 \\text{ cara}$$\n\n### Permutasi Dengan Pengulangan\nMemilih $r$ dari $n$ objek, **boleh diulang**:\n$$P = n^r$$\n\n### Permutasi Siklis\nMenyusun $n$ objek secara **melingkar**:\n$$P_{\\text{siklis}} = (n-1)!$$\n\n**Contoh:** 5 orang duduk melingkar:\n$$P = (5-1)! = 4! = 24 \\text{ cara}$$\n\n### Permutasi dengan Unsur Sama\n$n$ objek, di mana ada $p$ objek sama jenis 1, $q$ objek sama jenis 2, dst.:\n$$P = \\frac{n!}{p! \\cdot q! \\cdots}$$\n\n**Contoh:** Berapa susunan huruf dari kata "MATEMATIKA"?\n$$P = \\frac{10!}{2! \\cdot 3! \\cdot 2!} = \\frac{3.628.800}{2 \\cdot 6 \\cdot 2} = 151.200$$\n\n---\n\n## 4. Kombinasi\n\nMemilih $r$ objek dari $n$ objek tersedia, di mana **urutan tidak diperhatikan**.\n\n$$C(n, r) = {}^nC_r = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$\n\n**Contoh:** Berapa cara memilih 3 anggota dari 7 orang?\n$$C(7,3) = \\frac{7!}{3! \\cdot 4!} = \\frac{5040}{6 \\times 24} = 35 \\text{ cara}$$\n\n### Sifat-sifat Kombinasi\n$$\\binom{n}{0} = \\binom{n}{n} = 1 \\qquad \\binom{n}{1} = n$$\n$$\\binom{n}{r} = \\binom{n}{n-r}$$\n$$\\binom{n}{r} + \\binom{n}{r+1} = \\binom{n+1}{r+1} \\quad \\text{(Segitiga Pascal)}$$\n\n---\n\n## Permutasi vs Kombinasi\n\n| | Permutasi | Kombinasi |\n|---|---|---|\n| Urutan | **Diperhatikan** | **Tidak diperhatikan** |\n| Rumus | $\\frac{n!}{(n-r)!}$ | $\\frac{n!}{r!(n-r)!}$ |\n| Contoh | Kode PIN, juara 1-2-3 | Memilih tim, panitia |\n| Nilai | Lebih besar | Lebih kecil |\n\n$$P(n,r) = r! \\times C(n,r)$$',
  '[
    {"id":"p4-1","type":"link","url":"https://www.khanacademy.org/math/statistics-probability/counting-permutations-and-combinations","label":"🎓 Khan Academy: Permutasi & Kombinasi"},
    {"id":"p4-2","type":"link","url":"https://id.wikipedia.org/wiki/Permutasi","label":"📖 Wikipedia: Permutasi"}
  ]'::jsonb,
  ARRAY['Kelas 11', 'Peluang', 'Permutasi', 'Kombinasi', 'Faktorial'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '3 minutes',
  NOW() + INTERVAL '3 minutes'
),

-- ── 5. Peluang Tunggal ───────────────────────────────────────
(
  'peluang',
  'Peluang Tunggal',
  E'## Pengertian Peluang\n\nPeluang (probabilitas) adalah **ukuran kemungkinan** suatu kejadian terjadi, bernilai antara 0 dan 1.\n\n$$0 \\leq P(A) \\leq 1$$\n\n- $P(A) = 0$: kejadian **mustahil**\n- $P(A) = 1$: kejadian **pasti**\n\n---\n\n## Istilah Penting\n\n| Istilah | Pengertian | Contoh |\n|---|---|---|\n| **Eksperimen** | Kegiatan yang menghasilkan hasil acak | Melempar dadu |\n| **Ruang sampel ($S$)** | Himpunan semua hasil yang mungkin | $\\{1,2,3,4,5,6\\}$ |\n| **Titik sampel** | Satu kemungkinan hasil | Muncul angka 4 |\n| **Kejadian ($A$)** | Himpunan bagian dari $S$ | $A =$ muncul bilangan genap $= \\{2,4,6\\}$ |\n\n$$n(S) = \\text{banyak titik sampel}$$\n\n---\n\n## Rumus Peluang Klasik\n\n$$\\boxed{P(A) = \\frac{n(A)}{n(S)}}$$\n\nAsumsi: semua titik sampel **memiliki peluang sama** (equally likely).\n\n**Contoh:** Peluang muncul bilangan prima saat melempar dadu:\n$$S = \\{1,2,3,4,5,6\\},\\ n(S) = 6$$\n$$A = \\{2,3,5\\},\\ n(A) = 3$$\n$$P(A) = \\frac{3}{6} = \\frac{1}{2}$$\n\n---\n\n## Peluang Komplemen\n\nKejadian $A^c$ (bukan $A$) memiliki peluang:\n\n$$P(A^c) = 1 - P(A)$$\n\n**Contoh:** Peluang **tidak** muncul angka 6 saat melempar dadu:\n$$P(\\text{bukan 6}) = 1 - \\frac{1}{6} = \\frac{5}{6}$$\n\n---\n\n## Frekuensi Relatif\n\nJika eksperimen dilakukan $n$ kali dan kejadian $A$ muncul $f_A$ kali:\n\n$$P(A) \\approx \\frac{f_A}{n}$$\n\nSemakin besar $n$, frekuensi relatif semakin mendekati peluang teoritis.\n\n---\n\n## Contoh Soal Populer\n\n### Melempar Koin\n$S = \\{G, A\\}$, $n(S) = 2$\n$$P(\\text{Gambar}) = \\frac{1}{2}$$\n\n### Mengambil Kartu\nDari 52 kartu, peluang terambil kartu As:\n$$P(\\text{As}) = \\frac{4}{52} = \\frac{1}{13}$$\n\n### Mengambil Bola\nKantong berisi 5 bola merah dan 3 bola putih. Peluang terambil bola merah:\n$$P(\\text{merah}) = \\frac{5}{8}$$\n\n---\n\n## Kisaran Nilai Peluang\n\n$$P(\\emptyset) = 0 \\qquad P(S) = 1 \\qquad \\sum_{i} P(A_i) = 1$$\n\n> Jumlah peluang semua kemungkinan dalam ruang sampel selalu $= 1$.',
  '[
    {"id":"p5-1","type":"link","url":"https://www.khanacademy.org/math/statistics-probability/probability-library","label":"🎓 Khan Academy: Peluang Dasar"},
    {"id":"p5-2","type":"link","url":"https://id.wikipedia.org/wiki/Peluang_(matematika)","label":"📖 Wikipedia: Peluang"}
  ]'::jsonb,
  ARRAY['Kelas 9', 'Kelas 11', 'Peluang', 'Probabilitas', 'Ruang Sampel'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '4 minutes',
  NOW() + INTERVAL '4 minutes'
),

-- ── 6. Peluang Majemuk ───────────────────────────────────────
(
  'peluang',
  'Peluang Majemuk',
  E'## Pengertian\n\nPeluang majemuk melibatkan **dua kejadian atau lebih** yang digabungkan menggunakan operasi himpunan (gabungan, irisan).\n\n---\n\n## 1. Kejadian Saling Lepas (Mutually Exclusive)\n\nDua kejadian $A$ dan $B$ saling lepas jika **tidak bisa terjadi bersamaan**:\n$$A \\cap B = \\emptyset \\implies P(A \\cap B) = 0$$\n\n### Aturan Penjumlahan (Saling Lepas)\n$$P(A \\cup B) = P(A) + P(B)$$\n\n**Contoh:** Dadu dilempar sekali. $A =$ muncul angka 2, $B =$ muncul angka 5.\n$$P(A \\cup B) = \\frac{1}{6} + \\frac{1}{6} = \\frac{2}{6} = \\frac{1}{3}$$\n\n---\n\n## 2. Kejadian Tidak Saling Lepas\n\nDua kejadian $A$ dan $B$ **bisa terjadi bersamaan**: $A \\cap B \\neq \\emptyset$\n\n### Aturan Penjumlahan Umum\n$$\\boxed{P(A \\cup B) = P(A) + P(B) - P(A \\cap B)}$$\n\n**Contoh:** Kartu diambil dari 52 kartu. $A =$ kartu merah, $B =$ kartu As.\n$$P(A) = \\frac{26}{52},\\ P(B) = \\frac{4}{52},\\ P(A \\cap B) = \\frac{2}{52}$$\n$$P(A \\cup B) = \\frac{26}{52} + \\frac{4}{52} - \\frac{2}{52} = \\frac{28}{52} = \\frac{7}{13}$$\n\n---\n\n## 3. Kejadian Saling Bebas (Independent)\n\nDua kejadian $A$ dan $B$ saling bebas jika **hasil satu tidak mempengaruhi yang lain**.\n\n### Aturan Perkalian (Saling Bebas)\n$$\\boxed{P(A \\cap B) = P(A) \\times P(B)}$$\n\n**Contoh:** Melempar koin dan dadu. Peluang muncul Gambar **dan** angka 4:\n$$P = \\frac{1}{2} \\times \\frac{1}{6} = \\frac{1}{12}$$\n\n---\n\n## 4. Kejadian Bersyarat (Conditional Probability)\n\nPeluang kejadian $B$ terjadi **dengan syarat** $A$ sudah terjadi:\n\n$$\\boxed{P(B|A) = \\frac{P(A \\cap B)}{P(A)}, \\quad P(A) \\neq 0}$$\n\n**Contoh:** Dua kartu diambil berurutan tanpa pengembalian dari 52 kartu. Peluang kartu kedua As, **jika kartu pertama As**:\n$$P(\\text{As}_2 | \\text{As}_1) = \\frac{3}{51} = \\frac{1}{17}$$\n\n---\n\n## 5. Kejadian Tidak Saling Bebas (Dependent)\n\nJika $A$ dan $B$ **tidak bebas** (saling bergantung):\n$$P(A \\cap B) = P(A) \\times P(B|A)$$\n\n**Contoh:** Kantong berisi 4 merah dan 6 putih. Diambil 2 bola **tanpa pengembalian**. Peluang keduanya merah:\n$$P = P(\\text{merah}_1) \\times P(\\text{merah}_2 | \\text{merah}_1) = \\frac{4}{10} \\times \\frac{3}{9} = \\frac{12}{90} = \\frac{2}{15}$$\n\n---\n\n## 6. Teorema Bayes\n\nMenghitung peluang penyebab $A_i$ setelah mengetahui akibat $B$:\n\n$$P(A_i|B) = \\frac{P(A_i) \\cdot P(B|A_i)}{\\sum_j P(A_j) \\cdot P(B|A_j)}$$\n\n---\n\n## Ringkasan\n\n| Jenis | Syarat | Rumus |\n|---|---|---|\n| **Gabungan (saling lepas)** | $P(A \\cap B) = 0$ | $P(A) + P(B)$ |\n| **Gabungan (umum)** | Semua kasus | $P(A) + P(B) - P(A \\cap B)$ |\n| **Irisan (bebas)** | A dan B bebas | $P(A) \\times P(B)$ |\n| **Irisan (bergantung)** | A dan B tidak bebas | $P(A) \\times P(B|A)$ |\n| **Bersyarat** | $P(A) > 0$ | $\\frac{P(A \\cap B)}{P(A)}$ |\n\n---\n\n## Cek Independensi\n\nDua kejadian **saling bebas** jika dan hanya jika:\n$$P(A \\cap B) = P(A) \\times P(B)$$\n\natau ekuivalen:\n$$P(B|A) = P(B) \\qquad P(A|B) = P(A)$$',
  '[
    {"id":"p6-1","type":"link","url":"https://www.khanacademy.org/math/statistics-probability/probability-library/addition-rule-lib","label":"🎓 Khan Academy: Peluang Majemuk"},
    {"id":"p6-2","type":"link","url":"https://id.wikipedia.org/wiki/Peluang_bersyarat","label":"📖 Wikipedia: Peluang Bersyarat"}
  ]'::jsonb,
  ARRAY['Kelas 11', 'Kelas 12', 'Peluang', 'Probabilitas', 'Peluang Bersyarat', 'Independen'],
  true,
  'admin@trisula.edu',
  NOW() + INTERVAL '5 minutes',
  NOW() + INTERVAL '5 minutes'
)

ON CONFLICT DO NOTHING;
