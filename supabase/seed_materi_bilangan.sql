-- ============================================================
-- SEED: Materi Bilangan (3 topik lengkap)
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- Hapus materi bilangan yang ada (optional, comment jika tidak perlu)
-- DELETE FROM public.materi_posts WHERE strand = 'bilangan';

INSERT INTO public.materi_posts (strand, title, description, attachments, tags, published, created_by, created_at, updated_at)
VALUES
(
  'bilangan',
  'Jenis dan Sifat Bilangan',
  '## Jenis-Jenis Bilangan

Matematika mengenal berbagai jenis bilangan yang tersusun dalam hierarki dari yang paling sederhana hingga paling kompleks. Memahami jenis dan sifat bilangan adalah fondasi utama dalam belajar matematika.

---

### 1. Bilangan Asli (N)
Bilangan asli adalah bilangan bulat positif yang dimulai dari 1.

```
N = {1, 2, 3, 4, 5, ...}
```

**Sifat-sifat bilangan asli:**
- **Tertutup** terhadap penjumlahan: a + b ada di N
- **Tertutup** terhadap perkalian: a x b ada di N
- Setiap bilangan asli memiliki tepat satu bilangan asli berikutnya
- **Tidak memiliki unsur nol**

**Contoh konteks nyata:** Jumlah siswa dalam kelas, jumlah buku di rak, nomor urut antrian.

---

### 2. Bilangan Cacah (N0)
Bilangan cacah adalah bilangan asli yang ditambah dengan bilangan nol.

```
N0 = {0, 1, 2, 3, 4, 5, ...}
```

**Perbedaan dengan bilangan asli:** Bilangan cacah mencakup angka 0, sedangkan bilangan asli tidak.

---

### 3. Bilangan Bulat (Z)
Bilangan bulat mencakup bilangan negatif, nol, dan positif.

```
Z = {..., -3, -2, -1, 0, 1, 2, 3, ...}
```

**Bagian-bagian bilangan bulat:**

| Jenis | Contoh |
|-------|--------|
| Bulat Negatif | -1, -2, -3, ... |
| Nol | 0 |
| Bulat Positif | 1, 2, 3, ... |

**Contoh konteks nyata:** Suhu di bawah nol (-10 derajat C), kedalaman laut (-200 m), lantai gedung (B1, B2, lantai 1, 2...).

---

### 4. Bilangan Rasional (Q)
Bilangan rasional adalah bilangan yang dapat dinyatakan dalam bentuk **p/q**, di mana p dan q adalah bilangan bulat dan q tidak sama dengan 0.

**Contoh:** 1/2, 3/4, -5/3, 0,75, 2,333... (2 1/3), 0,125

**Ciri bilangan rasional dalam bentuk desimal:**
- **Desimal terhenti** contoh: 0,25 = 1/4
- **Desimal berulang** contoh: 0,333... = 1/3

---

### 5. Bilangan Irasional
Bilangan irasional **TIDAK dapat** dinyatakan dalam bentuk p/q. Desimalnya tidak terhenti dan tidak berulang.

**Contoh terkenal:**
- akar(2) = 1,41421356...
- akar(3) = 1,73205080...
- pi = 3,14159265...
- e (bilangan Euler) = 2,71828182...

> **Tips:** Akar dari bilangan yang bukan kuadrat sempurna adalah bilangan irasional.

---

### 6. Bilangan Real (R)
Bilangan real adalah gabungan dari bilangan rasional dan irasional. Semua bilangan yang dapat diletakkan pada garis bilangan adalah bilangan real.

---

### 7. Bilangan Kompleks (C)
Bilangan kompleks memiliki bentuk **a + bi**, di mana:
- a = bagian real
- b = bagian imajiner
- i = akar(-1) (satuan imajiner)

**Contoh:** 3 + 4i, 2 - i, 5i

---

## Hierarki Bilangan

```
C (Kompleks)
L-- R (Real)
    |-- Q (Rasional)
    |   |-- Z (Bulat)
    |   |   |-- N0 (Cacah)
    |   |   |   L-- N (Asli)
    |   |   L-- Bulat Negatif
    |   L-- Pecahan / Desimal
    L-- Irasional (akar(2), pi, e, ...)
```

---

## Sifat-Sifat Khusus Bilangan

### Bilangan Prima
Bilangan prima adalah bilangan asli lebih dari 1 yang hanya habis dibagi oleh 1 dan dirinya sendiri.

**Daftar bilangan prima tidak lebih dari 50:**
2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47

> **Catatan:** 2 adalah satu-satunya bilangan prima yang genap!

### Bilangan Komposit
Bilangan komposit adalah bilangan asli lebih dari 1 yang bukan bilangan prima (memiliki lebih dari 2 faktor).
**Contoh:** 4 = 1 x 4 = 2 x 2, faktor: 1, 2, 4

### Bilangan Ganjil dan Genap
- **Genap:** Habis dibagi 2 yaitu {0, 2, 4, 6, 8, ...}
- **Ganjil:** Tidak habis dibagi 2 yaitu {1, 3, 5, 7, 9, ...}

### Nilai Mutlak |x|
Nilai mutlak suatu bilangan adalah jaraknya dari nol (selalu non-negatif).

```
|x| = x,  jika x lebih dari atau sama dengan 0
|x| = -x, jika x kurang dari 0
```

**Contoh:**
- |7| = 7
- |-5| = 5
- |0| = 0

---

## Ringkasan Cepat

| Jenis Bilangan | Simbol | Contoh |
|----------------|--------|--------|
| Asli | N | 1, 2, 3, ... |
| Cacah | N0 | 0, 1, 2, 3, ... |
| Bulat | Z | ..., -2, -1, 0, 1, 2, ... |
| Rasional | Q | 1/2, 0.75, -3 |
| Irasional | - | akar(2), pi, e |
| Real | R | Semua di atas |
| Kompleks | C | 3+4i |

> **Fakta Menarik:** Setiap bilangan asli adalah bilangan cacah, setiap bilangan cacah adalah bilangan bulat, setiap bilangan bulat adalah bilangan rasional, dan setiap bilangan rasional adalah bilangan real. Hubungan ini seperti boneka Matryoshka!',
  '[]'::jsonb,
  ARRAY['Jenis Bilangan', 'Sifat Bilangan', 'Bilangan Prima', 'Hierarki Bilangan', 'Bilangan Real'],
  true,
  'seed-script',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),
(
  'bilangan',
  'Operasi Bilangan beserta Sifat-Sifatnya',
  '## Operasi Bilangan dan Sifat-Sifatnya

Operasi bilangan adalah tindakan atau proses matematika yang dilakukan terhadap satu atau lebih bilangan untuk menghasilkan bilangan baru. Ada **4 operasi dasar** dan beberapa sifat fundamental yang berlaku.

---

## 1. Penjumlahan (+)

Penjumlahan adalah operasi menggabungkan dua bilangan atau lebih.

**Contoh:** 15 + 23 = 38

### Sifat-sifat Penjumlahan:

#### a) Sifat Komutatif
> Urutan penjumlahan tidak memengaruhi hasil

```
a + b = b + a
```
**Contoh:** 5 + 3 = 3 + 5 = 8

#### b) Sifat Asosiatif
> Pengelompokan penjumlahan tidak memengaruhi hasil

```
(a + b) + c = a + (b + c)
```
**Contoh:** (2 + 3) + 4 = 2 + (3 + 4) = 9

#### c) Unsur Identitas (Elemen Netral)
> Penjumlahan dengan 0 menghasilkan bilangan itu sendiri

```
a + 0 = 0 + a = a
```
**Contoh:** 7 + 0 = 7

#### d) Unsur Invers (Lawan)
> Setiap bilangan memiliki lawan yang bila dijumlahkan menghasilkan 0

```
a + (-a) = 0
```
**Contoh:** 5 + (-5) = 0

---

## 2. Pengurangan (-)

Pengurangan adalah invers dari penjumlahan.

```
a - b = a + (-b)
```

**Contoh:** 10 - 3 = 10 + (-3) = 7

> **Penting:** Pengurangan **TIDAK** bersifat komutatif maupun asosiatif!
> 5 - 3 tidak sama dengan 3 - 5 karena 5-3=2, 3-5=-2

### Aturan Tanda:

| Operasi | Hasil |
|---------|-------|
| (+) + (+) | + |
| (-) + (-) | - |
| (+) - (-) | + |
| (-) - (+) | - |

---

## 3. Perkalian (x)

Perkalian adalah penjumlahan berulang.

```
a x b = a + a + a + ... (sebanyak b kali)
```

**Contoh:** 4 x 3 = 4 + 4 + 4 = 12

### Sifat-sifat Perkalian:

#### a) Sifat Komutatif
```
a x b = b x a
```
**Contoh:** 6 x 4 = 4 x 6 = 24

#### b) Sifat Asosiatif
```
(a x b) x c = a x (b x c)
```
**Contoh:** (2 x 3) x 4 = 2 x (3 x 4) = 24

#### c) Unsur Identitas
> Perkalian dengan 1 menghasilkan bilangan itu sendiri

```
a x 1 = 1 x a = a
```
**Contoh:** 9 x 1 = 9

#### d) Unsur Nol
> Perkalian dengan 0 menghasilkan 0

```
a x 0 = 0 x a = 0
```
**Contoh:** 999 x 0 = 0

#### e) Unsur Invers (Kebalikan)
> Setiap bilangan tidak sama dengan 0 memiliki kebalikan yang bila dikalikan menghasilkan 1

```
a x (1/a) = 1
```
**Contoh:** 5 x (1/5) = 1

#### f) Sifat Distributif terhadap Penjumlahan
```
a x (b + c) = (a x b) + (a x c)
```
**Contoh:** 3 x (4 + 5) = (3 x 4) + (3 x 5) = 12 + 15 = 27

#### g) Sifat Distributif terhadap Pengurangan
```
a x (b - c) = (a x b) - (a x c)
```
**Contoh:** 5 x (8 - 3) = (5 x 8) - (5 x 3) = 40 - 15 = 25

### Aturan Tanda Perkalian:

| Operasi | Hasil |
|---------|-------|
| (+) x (+) | + |
| (-) x (-) | + |
| (+) x (-) | - |
| (-) x (+) | - |

---

## 4. Pembagian (/)

Pembagian adalah invers dari perkalian.

```
a / b = a x (1/b),  b tidak sama dengan 0
```

> **PENTING:** Pembagian dengan **0 tidak terdefinisi** (undefined)!

**Contoh:** 12 / 4 = 3 karena 3 x 4 = 12

> Pembagian **TIDAK** bersifat komutatif maupun asosiatif!

---

## 5. Urutan Operasi (PEMDAS)

Ketika ada beberapa operasi dalam satu ekspresi, gunakan aturan urutan:

| Urutan | Operasi |
|--------|---------|
| 1 | **P**erkalian dalam kurung (Brackets) |
| 2 | **E**ksponen (pangkat) |
| 3 | **M**ultiplication dan **D**ivision (kiri ke kanan) |
| 4 | **A**ddition dan **S**ubtraction (kiri ke kanan) |

**Contoh soal:**
```
2 + 3 x (4 - 1)^2 / 3
= 2 + 3 x (3)^2 / 3    <- selesaikan kurung dulu
= 2 + 3 x 9 / 3        <- selesaikan pangkat
= 2 + 27 / 3           <- kali dari kiri
= 2 + 9                <- bagi dari kiri
= 11                   <- tambah
```

---

## Operasi pada Pecahan

### Penjumlahan dan Pengurangan Pecahan
> Samakan penyebut terlebih dahulu!

```
a/b + c/d = (ad + bc) / bd
```

**Contoh:**
```
1/3 + 1/4 = 4/12 + 3/12 = 7/12
```

### Perkalian Pecahan
```
a/b x c/d = (axc) / (bxd)
```

**Contoh:**
```
2/3 x 3/4 = 6/12 = 1/2
```

### Pembagian Pecahan
> Balik pembagi, lalu kalikan!

```
a/b / c/d = a/b x d/c = (axd) / (bxc)
```

**Contoh:**
```
3/4 / 1/2 = 3/4 x 2/1 = 6/4 = 3/2 = 1 setengah
```

---

## Ringkasan Sifat Operasi

| Sifat | Penjumlahan | Perkalian |
|-------|-------------|-----------|
| Komutatif | a+b = b+a | a x b = b x a |
| Asosiatif | (a+b)+c = a+(b+c) | (a x b) x c = a x (b x c) |
| Identitas | a+0 = a | a x 1 = a |
| Invers | a+(-a) = 0 | a x (1/a) = 1 |
| Distributif | a x (b+c) = ab+ac | - |

> **Tips Belajar:** Sifat distributif sangat berguna untuk perhitungan mental!
> Contoh: 15 x 12 = 15 x (10 + 2) = 150 + 30 = 180, lebih mudah!',
  '[]'::jsonb,
  ARRAY['Operasi Hitung', 'Penjumlahan', 'Perkalian', 'Sifat Komutatif', 'Sifat Asosiatif', 'Sifat Distributif'],
  true,
  'seed-script',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  'bilangan',
  'Bilangan Berpangkat: Pangkat Bulat dan Pecahan',
  '## Bilangan Berpangkat

Bilangan berpangkat (eksponen) adalah cara singkat untuk menyatakan **perkalian berulang** dari bilangan yang sama.

```
a^n = a x a x a x ... x a  (sebanyak n kali)
```

Di mana:
- **a** = **basis** (bilangan pokok)
- **n** = **eksponen** (pangkat)
- a^n dibaca "a pangkat n"

**Contoh:**
- 2^3 = 2 x 2 x 2 = 8
- 5^2 = 5 x 5 = 25
- 10^4 = 10 x 10 x 10 x 10 = 10.000

---

## Bagian 1: Pangkat Bilangan Bulat

### A. Pangkat Bulat Positif (n lebih dari 0)

Ini adalah perkalian berulang standar.

```
a^n = a x a x a x ... x a  (n faktor)
```

| Ekspresi | Nilai |
|----------|-------|
| 2^1 | 2 |
| 2^2 | 4 |
| 2^3 | 8 |
| 2^4 | 16 |
| 2^5 | 32 |
| 10^3 | 1.000 |
| 10^6 | 1.000.000 |

---

### B. Pangkat Nol (n = 0)

> **Setiap bilangan tidak sama dengan 0 yang dipangkatkan 0 hasilnya 1**

```
a^0 = 1,  untuk semua a tidak sama dengan 0
```

**Contoh:**
- 5^0 = 1
- 100^0 = 1
- (-7)^0 = 1
- (3/4)^0 = 1

> **0^0 = tidak terdefinisi** (dalam sebagian besar konteks matematika)

---

### C. Pangkat Bulat Negatif (n kurang dari 0)

> **Pangkat negatif adalah kebalikan (resiprokal) dari pangkat positif**

```
a^(-n) = 1/a^n,  untuk a tidak sama dengan 0
```

**Contoh:**
- 2^(-1) = 1/2 = 0,5
- 2^(-2) = 1/2^2 = 1/4 = 0,25
- 2^(-3) = 1/2^3 = 1/8 = 0,125
- 5^(-2) = 1/25
- 10^(-3) = 1/1000 = 0,001

**Cara mudah mengingat:** Pindahkan basis ke bawah (pecahan), pangkat menjadi positif!

```
3^(-4) = 1/3^4 = 1/81
```

---

### D. Sifat-Sifat Pangkat Bilangan Bulat

Misalkan a, b tidak sama dengan 0 dan m, n bilangan bulat:

#### 1. Perkalian dengan Basis Sama
```
a^m x a^n = a^(m+n)
```
**Contoh:**
- 2^3 x 2^4 = 2^7 = 128
- 5^2 x 5^(-1) = 5^1 = 5
- x^3 x x^5 = x^8

#### 2. Pembagian dengan Basis Sama
```
a^m / a^n = a^(m-n)
```
**Contoh:**
- 3^5 / 3^2 = 3^3 = 27
- 10^4 / 10^6 = 10^(-2) = 0,01
- y^7 / y^3 = y^4

#### 3. Pangkat dari Pangkat
```
(a^m)^n = a^(m x n)
```
**Contoh:**
- (2^3)^4 = 2^12 = 4096
- (x^2)^5 = x^10
- (3^(-2))^3 = 3^(-6) = 1/729

#### 4. Perkalian Basis Berbeda, Pangkat Sama
```
a^n x b^n = (a x b)^n
```
**Contoh:**
- 2^4 x 3^4 = (2 x 3)^4 = 6^4 = 1296
- 5^3 x 4^3 = 20^3 = 8000

#### 5. Pembagian Basis Berbeda, Pangkat Sama
```
a^n / b^n = (a/b)^n
```
**Contoh:**
- 8^2 / 4^2 = (8/4)^2 = 2^2 = 4
- 10^3 / 5^3 = (10/5)^3 = 2^3 = 8

---

## Bagian 2: Pangkat Bilangan Pecahan (Akar)

### A. Definisi Pangkat Pecahan

> Pangkat pecahan berkaitan erat dengan operasi **akar**

```
a^(1/n) = akar_ke-n dari a
```

**Khusus untuk:**
```
a^(1/2) = akar(a)       (akar kuadrat)
a^(1/3) = akar_kubik(a) (akar pangkat tiga)
a^(1/4) = akar_4(a)     (akar pangkat empat)
```

**Contoh:**
- 4^(1/2) = akar(4) = 2  (karena 2^2 = 4)
- 8^(1/3) = akar_kubik(8) = 2  (karena 2^3 = 8)
- 27^(1/3) = akar_kubik(27) = 3  (karena 3^3 = 27)
- 16^(1/4) = akar_4(16) = 2  (karena 2^4 = 16)
- 100^(1/2) = akar(100) = 10

---

### B. Bentuk Umum Pangkat Pecahan

```
a^(m/n) = akar_n(a^m) = (akar_n(a))^m
```

**Contoh:**
- 8^(2/3) = (akar_kubik(8))^2 = 2^2 = 4
- 27^(2/3) = (akar_kubik(27))^2 = 3^2 = 9
- 16^(3/4) = (akar_4(16))^3 = 2^3 = 8
- 32^(3/5) = (akar_5(32))^3 = 2^3 = 8
- 4^(3/2) = (akar(4))^3 = 2^3 = 8

**Tips:** Lebih mudah mengakarkan dulu, lalu pangkatkan!

---

### C. Pangkat Pecahan Negatif

```
a^(-m/n) = 1 / a^(m/n)
```

**Contoh:**
- 4^(-1/2) = 1/akar(4) = 1/2
- 8^(-2/3) = 1/8^(2/3) = 1/4
- 27^(-1/3) = 1/akar_kubik(27) = 1/3

---

### D. Sifat Pangkat Pecahan

Semua sifat pangkat bulat berlaku untuk pangkat pecahan!

**Contoh penerapan:**
```
4^(1/2) x 4^(3/2) = 4^(1/2 + 3/2) = 4^2 = 16

(9^(1/2))^4 = 9^(4/2) = 9^2 = 81

8^(2/3) / 8^(1/3) = 8^(1/3) = 2
```

---

## Contoh Soal Terpadu

### Soal 1
Sederhanakan: **2^3 x 4^2 / 8**

```
Ubah semua basis menjadi 2:
4^2 = (2^2)^2 = 2^4
8 = 2^3

Maka: 2^3 x 2^4 / 2^3 = 2^(3+4-3) = 2^4 = 16
```

### Soal 2
Hitung: **27^(2/3) + 16^(3/4)**

```
27^(2/3) = (akar_kubik(27))^2 = 3^2 = 9
16^(3/4) = (akar_4(16))^3 = 2^3 = 8

Hasil: 9 + 8 = 17
```

### Soal 3
Sederhanakan: **(2x^3)^4 / (4x^2)^2**

```
(2x^3)^4 = 2^4 x x^12 = 16x^12
(4x^2)^2 = 4^2 x x^4 = 16x^4

16x^12 / 16x^4 = x^(12-4) = x^8
```

---

## Tabel Kuadrat Sempurna dan Akarnya

| n | n^2 | akar(n^2) |
|---|-----|-----------|
| 1 | 1 | 1 |
| 2 | 4 | 2 |
| 3 | 9 | 3 |
| 4 | 16 | 4 |
| 5 | 25 | 5 |
| 6 | 36 | 6 |
| 7 | 49 | 7 |
| 8 | 64 | 8 |
| 9 | 81 | 9 |
| 10 | 100 | 10 |
| 12 | 144 | 12 |
| 15 | 225 | 15 |

## Tabel Pangkat Tiga dan Akar Kubiknya

| n | n^3 | akar_kubik(n^3) |
|---|-----|-----------------|
| 1 | 1 | 1 |
| 2 | 8 | 2 |
| 3 | 27 | 3 |
| 4 | 64 | 4 |
| 5 | 125 | 5 |
| 6 | 216 | 6 |
| 7 | 343 | 7 |
| 8 | 512 | 8 |
| 9 | 729 | 9 |
| 10 | 1000 | 10 |

---

## Ringkasan Akhir

| Bentuk | Makna |
|--------|-------|
| a^n (n lebih dari 0) | Perkalian berulang a sebanyak n |
| a^0 | 1 (untuk a tidak sama dengan 0) |
| a^(-n) | 1/a^n |
| a^(1/n) | akar_n(a) |
| a^(m/n) | (akar_n(a))^m |
| a^(-m/n) | 1/(akar_n(a))^m |

> **Strategi UN/SNBT:** Ketika menghadapi soal pangkat pecahan, selalu ubah ke bentuk akar terlebih dahulu. Ini memudahkan perhitungan manual tanpa kalkulator!',
  '[]'::jsonb,
  ARRAY['Pangkat', 'Eksponen', 'Akar', 'Bilangan Berpangkat', 'Pangkat Pecahan', 'Sifat Pangkat'],
  true,
  'seed-script',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);