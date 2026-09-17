import { StudentProfile, CognitiveAspect, StrandProgress, TrisulaBadge } from './types';

export const ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1XxEWMtd8RaP2DDhCekpQXemihYdva8Z5GHGuGuhpY4ADxZHDiqQZN3tK-52LI_8EHeT5a7tvCvOTW3Q2DkTvGO0O1IgNhVMzjiFAuLm1UL9H2PFyp0OLpHHLc6LI7U4mSKzsrjF-zP1E197fSpScKD2Q2FAnOyY2yOvlBSDY4digzqA7lMY3kzDr32Orgm87PwsX7Wjzl3sf9hRdhJcS7yEuRmhjnZNdf0w6AxV9wRefSUpN1dOIHEYj0',
  bridgeHero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG4_L9ggoFEYdhuTFQ4hzHXt2hx-Hh-gcH0OwMRpFLZoogMGrN05T0enMO5uiYgxcyudsvRQUkQ3eoTJKaL5aNHBBD8SxKW-fBf_sBzhFEepf0sfIiXFpY14nkV5sqBYauGi4fWImO_ZZ5hQRXMA-j-u90xoam3djt7sIOyMw3BqIQ4Ne3oljihlZRdXiUd_HI66bGss5518Qgu0CkQHbnsN7hHWWFqLfpu6rW7a5uZ2p6hOeLFYBU',
  bilanganContext: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIrrx77vGwrWnzQJYhU6jixfb7b53NQAEYJ3d_C-Y0AHlNqe_KOwx2C-a4YLSogrj5z-L5rZ1Fi0EqiSU_JOJamNMSdbMVF1XrSIcE5lTp26iT2diFN5_wiods_ueqhqT4ymjvNdP6dFCFb2WwApnEGNV9bT_3cqmZe71h1_SOKTJycRX85SfIarLjVNbpgbdKZ5oKh8qGWQ3pCuBk7W-dueJmv1tczQKc6aLITXFUt_T9FdmqdM3N',
  aljabarContext: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Ch1tZx5_Uumy2nE6qbm3q3wa4kPGF9XwY2nnfgZGA_U9Xa4IpGQhnTerCFjg2duUqYQzC3zb8XS08t6GRsA0Z7XqJithDcFVQbQIY2yk3xIs2zyETTluKvL-PQmcdkZOEKi-wnZt2TZkXNZajAn5BLkXcmJfDsaPePRhiv-BZeCKD3txPWWIukYnr-4-ChIp2BcazHmWqarjq8yR6Or4M3YDK_vPVMUVWNGGoLSI-b_cEsN1x5tm',
  geometriContext: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAM5M70yk3-oEPTU2okFso8Qfo54_PNAGZuDY5AyVHGQ5Q1CrKreprQFOhYiS1x5dcOnGHCZMNlwbAjMBwbK0oAU5CU81CHh0USy4UWAbkyPwNmbNCDlbg2Z8ew0mz12g9TDH53v1sZ_t53MEOug7XcImYN_LPfdTV9oXdYhImpW9-0H-Hy7AGS16Rnwoen1ER8xoipwFHCOKGCS-bJ0QlANaJD32YRUDxF1JaNa9b-ZvwIIn1BgexY',
  trigonometriContext: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ6-QWbI7qtVgdx4l8kTHFBoToZ0hUz0Nx7xu-aQ8gUIm12KphvrFuGbhCThLqb9m-B-WFLpkwj6MIHGyoFd54yxFTb0WTGtW04wrOK9xjqecwrZmCUEl09V4_4G_CdsCabcwSVwZbji7DZCK0aqgOuA6eZV37aC8Y-2ugUrKI2zHTor1CIWlkh_7Lo5MKQBj9znDuhkghe_n06FAtC-DA0XgKy4S-2jX64109jjTgntl-MwXVO37Z',
  peluangContext: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmT1PELoSumswGTOsgsv3Ge6LnKDfPD1j5Z2zSv8IZGhn6vYAwJc5DN3OWPhhmM-XH9SBZ-dSRzWgUl_VDQH-B4hoq35o_vIdOc3eWTN3wl54dEuGj80zeXGBz3LPcxx91SnXILhPL1afrU38XCgPBlMCAbeJtfK3foMNac6GX0RhLRbAJDjxYi3ZNR3Ic4N9F-mitF0EOhG_s8YbnRiK3bDKEVQsm8x-qxkF6GIASkvGW3xqB0fb0',
  ahmadAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWxAg7PEJUH0ozKIBj7N6ECEOp8H7Lz2DHape_DCvbor48uQBSWkKl4j_g7T-E3ZyCDr4n5__ceu2oEVjtF9Vdr2xCfaOPyxmVa7AFwXqlyV_xPmt9RD7c5S2A_dnB1_l567GpANCY30AQLaSf7bxJjLk2bMs8kH0I_9IU9IRAtD2qQi0F9XwqQliYyZDxKqweJQevYWuFDBjgHLaXXvDZxquAYdu5dR2SnwzqxF7kjqCDSoD9BWA',
  tongkonanSketch: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6ThSTnkbGtVM1k-_3eV1fZ5_CzTmtRX0bYsnRnLbo5bM3e51-8PI7z38VHrJX1xVb5lPvKKL2vCc-B_0M3X2dcrSKN6SqVcj1VaeZlb235cJziH-gR3zoHHhPT5jpWCDz3-k3kfERBo83U5At6UdKi5lvMVNCqYRgFgh81YUpiQLnZeH3uMq5aMzPdAiLKcdhn6kCxO9Ong4_2rx76KgJ8NBHDeiqo_SytAE5eMqdIver6ztfWtYD',
};

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Ahmad Fauzan',
  className: 'Kelas XII MIPA 2',
  rank: 3,
  totalStudents: 36,
  totalXp: 4850,
  streakDays: 14,
  rmeIndex: 84.8,
  level: 'Trisula Emas • Lvl 18 Penjelajah Ahli',
  avatarUrl: ASSETS.ahmadAvatar,
};

export const COGNITIVE_ASPECTS: CognitiveAspect[] = [
  { label: 'Konteks Realistik', score: 88, color: '#006b5c', icon: 'public' },
  { label: 'Pemodelan Matematis', score: 82, color: '#006b5c', icon: 'schema' },
  { label: 'Komputasi & Solusi', score: 91, color: '#006b5c', icon: 'calculate' },
  { label: 'Refleksi & Validasi', score: 78, color: '#c87900', icon: 'fact_check' },
  { label: 'Komunikasi Matematis', score: 85, color: '#006b5c', icon: 'forum' },
];

export const STRANDS_DATA: StrandProgress[] = [
  {
    id: 'bilangan',
    name: 'Bilangan',
    subtext: 'Perhitungan KPR, cicilan modal, dan deposito',
    percentage: 95,
    statusText: 'Kuasai Bunga Majemuk',
  },
  {
    id: 'aljabar',
    name: 'Aljabar',
    subtext: 'Matriks produksi & sistem pertidaksamaan linear',
    percentage: 80,
    statusText: 'Optimasi Linear Selesai',
  },
  {
    id: 'geometri',
    name: 'Geometri',
    subtext: 'Jarak titik ke bidang pada kubah gedung',
    percentage: 72,
    isPriority: true,
    statusText: 'Dimensi Tiga dalam perbaikan',
  },
  {
    id: 'trigonometri',
    name: 'Trigonometri',
    subtext: 'Klinometer digital dan pelacakan gelombang suara',
    percentage: 88,
    statusText: 'Klinometer & Aturan Sin/Cos',
  },
  {
    id: 'peluang',
    name: 'Data dan Peluang',
    subtext: 'Prediksi kurva penularan & uji hipotesis data',
    percentage: 90,
    statusText: 'Distribusi Normal & Z-Score',
  },
];

export const TRISULA_BADGES: TrisulaBadge[] = [
  {
    id: 'konteks',
    name: 'Pakar Konteks Nyata',
    status: 'unlocked',
    subtext: 'Unlocked • 100% RME',
    icon: 'explore',
    color: '#006b5c',
  },
  {
    id: 'pemodelan',
    name: 'Master Pemodelan',
    status: 'unlocked',
    subtext: 'Unlocked • Level 3',
    icon: 'hub',
    color: '#0a2540',
  },
  {
    id: 'arsitek',
    name: 'Arsitek Dimensi Tiga',
    status: 'in_progress',
    subtext: 'Sedang Berlangsung',
    icon: 'view_in_ar',
    progress: 65,
    color: '#ffb86b',
  },
  {
    id: 'probabilitas',
    name: 'Detektif Probabilitas',
    status: 'unlocked',
    subtext: 'Unlocked • Distribusi Z',
    icon: 'casino',
    color: '#c87900',
  },
];
