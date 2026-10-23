import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../Auth/AuthProvider';
import { UjianQuestionForm } from './UjianQuestionForm';
import { MathCategory } from '../../types';
import {
  Plus, Trash2, X, Loader2, Edit3, FileArchive,
  Download, Users, Check, AlertCircle, Eye, Play,
} from 'lucide-react';
import JSZip from 'jszip';
import html2pdf from 'html2pdf.js';
import katex from 'katex';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Question {
  id: string;
  title: string;
  test_type: 'pretest' | 'postest';
  strand: string;
  content_blocks: any[];
  rme_keys?: any;
  options?: any[];
}

interface Attempt {
  id: string;
  user_id: string;
  student_name: string;
  student_nisn: string;
  score: number;
  total_essay_score: number;
  total_max_points: number;
  essay_answers: Record<string, { diketahui: string; ditanya: string; pengerjaan: string; kesimpulan: string }>;
  ai_scores: Record<string, any>;
  created_at: string;
  // exam_id hanya ada di exam_attempts — di sini kita pakai question_id
  question_id?: string;
}

interface QuestionAttempt {
  id: string;
  question_id: string;
  score: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const STRANDS = [
  { id: 'bilangan',     label: 'Bilangan',       icon: '123',          gradient: 'from-blue-600 to-cyan-500' },
  { id: 'aljabar',      label: 'Aljabar',         icon: 'functions',    gradient: 'from-violet-600 to-purple-500' },
  { id: 'geometri',     label: 'Geometri',        icon: 'hexagon',      gradient: 'from-emerald-600 to-teal-500' },
  { id: 'trigonometri', label: 'Trigonometri',    icon: 'ssid_chart',   gradient: 'from-amber-500 to-orange-500' },
  { id: 'peluang',      label: 'Data & Peluang',  icon: 'casino',       gradient: 'from-rose-600 to-pink-500' },
] as const;

const STAGE_LABELS = ['Diketahui', 'Ditanya', 'Pengerjaan', 'Kesimpulan'];
const STAGE_KEYS   = ['diketahui', 'ditanya', 'pengerjaan', 'kesimpulan'] as const;

// ─────────────────────────────────────────────
// Helper PDF — escape, render LaTeX, format waktu
// ─────────────────────────────────────────────
function escHtml(s: string): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderInlineMath(text: string): string {
  let r = text.replace(/\$\$([\s\S]+?)\$\$/g, (_m, e) => {
    try { return katex.renderToString(e.trim(), { throwOnError: false, displayMode: true }); }
    catch { return `<code>${escHtml(e)}</code>`; }
  });
  r = r.replace(/\$([^\$\n]+?)\$/g, (_m, e) => {
    try { return katex.renderToString(e.trim(), { throwOnError: false, displayMode: false }); }
    catch { return `<code>${escHtml(e)}</code>`; }
  });
  return r.replace(/\n/g, '<br/>');
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF RENDERER — rapi, profesional, arsip-ready
// ─────────────────────────────────────────────────────────────────────────────

/** Parse blok jawaban dari DB — handle JSON double/single encoded & plain string */
function parseAnswerBlocks(raw: any): { type: string; value: string }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return [];
  let v: any = raw;
  // Coba parse hingga 3 lapis (double-encoded JSON)
  for (let i = 0; i < 3; i++) {
    if (typeof v !== 'string') break;
    try { v = JSON.parse(v); } catch { break; }
  }
  if (Array.isArray(v)) return v;
  // Plain text
  return [{ type: 'text', value: String(v) }];
}

/** Render satu blok ke HTML — teks, LaTeX, atau gambar */
function renderBlock(b: { type: string; value: string }): string {
  const val = (b.value ?? '').trim();
  if (!val) return '';
  if (b.type === 'image') {
    return `<img src="${escHtml(val)}" style="display:block;max-width:100%;max-height:180px;margin:6px 0;border-radius:4px;border:1px solid #e2e8f0;" alt="gambar"/>`;
  }
  if (b.type === 'latex') {
    try {
      return katex.renderToString(val, { throwOnError: false, displayMode: true, trust: true });
    } catch {
      return `<code style="background:#f1f5f9;padding:2px 5px;border-radius:3px;">${escHtml(val)}</code>`;
    }
  }
  // text — render inline math $...$ dan $$...$$
  return renderInlineMath(val);
}

/** Render seluruh array blok jawaban satu tahap */
function renderStageAnswer(raw: any): string {
  const blocks = parseAnswerBlocks(raw);
  if (!blocks.length) return '<span style="color:#94a3b8;font-style:italic;">—</span>';
  const html = blocks.map(renderBlock).filter(Boolean).join('\n');
  return html || '<span style="color:#94a3b8;font-style:italic;">—</span>';
}

/**
 * buildStudentPackagePdf
 * Menghasilkan HTML satu PDF per siswa yang mencakup:
 *  - Cover identitas + rekap nilai
 *  - Semua soal dalam paket
 *  - Semua jawaban per tahap RME (teks/LaTeX/gambar)
 */
function buildStudentPackagePdf(
  questions: Question[],
  student: {
    displayName: string;
    displayNisn: string;
    answers: Record<string, Record<string, any>>;
    rows: Record<string, any>;
    avgSkor: number;
  },
  examTitle: string,
): string {
  // ── Metadata waktu (ambil dari soal pertama yang dijawab) ──
  const firstAns = Object.values(student.answers)[0] || {};
  const tgl      = fmtDate(firstAns.started_at);
  const jamMulai = fmtTime(firstAns.started_at);
  const jamSls   = fmtTime(firstAns.finished_at);
  const durasi   = durasiStr(firstAns.started_at, firstAns.finished_at);

  // ── Hitung benar / salah ──
  let benar = 0;
  questions.forEach(q => { if (student.answers[q.id]?.isCorrect) benar++; });
  const salah = questions.length - benar;
  const nilai = questions.length > 0 ? Math.round((benar / questions.length) * 100) : 0;
  const nilaiColor  = nilai >= 75 ? '#16a34a' : nilai >= 50 ? '#d97706' : '#dc2626';
  const nilaiLabel  = nilai >= 75 ? 'LULUS' : nilai >= 50 ? 'CUKUP' : 'PERLU PERBAIKAN';
  const nilaiLabelBg = nilai >= 75 ? '#f0fdf4' : nilai >= 50 ? '#fffbeb' : '#fef2f2';

  const strand = questions[0]?.strand || '';
  const tipe   = questions[0]?.test_type === 'pretest' ? 'Pre-Test' : 'Post-Test';

  // ════════════════════════════════════════
  // COVER — identitas + rekap
  // ════════════════════════════════════════
  const cover = `
<div class="cover">
  <!-- Header strip warna -->
  <div class="cover-header">
    <div class="cover-logo">TRISULA EduMath</div>
    <div class="cover-subtitle">Laporan Jawaban Ujian &mdash; ${tipe}</div>
  </div>

  <!-- Judul ujian -->
  <div class="cover-title">${escHtml(examTitle)}</div>
  <div class="cover-meta">${escHtml(strand.charAt(0).toUpperCase() + strand.slice(1))} &nbsp;&bull;&nbsp; ${tipe} &nbsp;&bull;&nbsp; ${tgl}</div>

  <hr class="divider"/>

  <!-- Identitas peserta -->
  <table class="id-table">
    <tr>
      <td class="id-label">Nama Peserta</td>
      <td class="id-colon">:</td>
      <td class="id-value"><strong>${escHtml(student.displayName)}</strong></td>
    </tr>
    <tr>
      <td class="id-label">NISN</td>
      <td class="id-colon">:</td>
      <td class="id-value">${escHtml(student.displayNisn)}</td>
    </tr>
    <tr>
      <td class="id-label">Waktu Mulai</td>
      <td class="id-colon">:</td>
      <td class="id-value">${jamMulai}</td>
    </tr>
    <tr>
      <td class="id-label">Waktu Selesai</td>
      <td class="id-colon">:</td>
      <td class="id-value">${jamSls}</td>
    </tr>
    <tr>
      <td class="id-label">Durasi</td>
      <td class="id-colon">:</td>
      <td class="id-value">${durasi}</td>
    </tr>
    <tr>
      <td class="id-label">Jumlah Soal</td>
      <td class="id-colon">:</td>
      <td class="id-value">${questions.length} soal</td>
    </tr>
  </table>

  <hr class="divider"/>

  <!-- Rekap nilai -->
  <div class="score-box">
    <div class="score-item">
      <div class="score-num" style="color:${nilaiColor};">${nilai}</div>
      <div class="score-lbl">Nilai</div>
    </div>
    <div class="score-item score-item-green">
      <div class="score-num" style="color:#16a34a;">${benar}</div>
      <div class="score-lbl">Benar</div>
    </div>
    <div class="score-item score-item-red">
      <div class="score-num" style="color:#dc2626;">${salah}</div>
      <div class="score-lbl">Salah</div>
    </div>
    <div class="score-item" style="background:${nilaiLabelBg};">
      <div class="score-num" style="font-size:14px;color:${nilaiColor};">${nilaiLabel}</div>
      <div class="score-lbl">Predikat</div>
    </div>
  </div>

  <!-- Ringkasan per soal -->
  <div class="summary-title">Ringkasan Jawaban</div>
  <table class="summary-table">
    <thead>
      <tr>
        <th>No</th>
        <th>Jawaban Siswa</th>
        <th>Kunci</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${questions.map((q, qi) => {
        const a = student.answers[q.id] || {};
        const done = !!student.answers[q.id];
        const ok = done && !!a.isCorrect;
        const statusColor = !done ? '#94a3b8' : ok ? '#16a34a' : '#dc2626';
        const statusBg    = !done ? '#f8fafc'  : ok ? '#f0fdf4' : '#fef2f2';
        const statusTxt   = !done ? '—' : ok ? '✓ Benar' : '✗ Salah';
        // Cari kunci dari rme_keys (disimpan di content_blocks meta)
        const jawaban = done ? escHtml(String(a.finalNumber || '—')) : '—';
        return `<tr>
          <td style="text-align:center;font-weight:700;">${qi + 1}</td>
          <td style="text-align:center;font-family:monospace;font-size:11px;">${jawaban}</td>
          <td style="text-align:center;font-size:10px;color:#64748b;">—</td>
          <td style="text-align:center;background:${statusBg};color:${statusColor};font-weight:700;font-size:11px;">${statusTxt}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>
`;

  // ════════════════════════════════════════
  // DETAIL PER SOAL
  // ════════════════════════════════════════
  const STAGE_INFO = [
    { key: 'diketahui',  label: 'Tahap 1 — Diketahui',  color: '#0369a1', bg: '#f0f9ff' },
    { key: 'ditanya',    label: 'Tahap 2 — Ditanya',    color: '#7c3aed', bg: '#f5f3ff' },
    { key: 'pengerjaan', label: 'Tahap 3 — Pengerjaan', color: '#b45309', bg: '#fffbeb' },
    { key: 'kesimpulan', label: 'Tahap 4 — Kesimpulan', color: '#15803d', bg: '#f0fdf4' },
  ];

  const soalPages = questions.map((q, qi) => {
    const ans     = student.answers[q.id] || {};
    const hasAns  = !!student.answers[q.id];
    const ok      = hasAns && !!ans.isCorrect;
    const badgeBg = !hasAns ? '#f1f5f9' : ok ? '#dcfce7' : '#fee2e2';
    const badgeClr= !hasAns ? '#64748b'  : ok ? '#15803d' : '#dc2626';
    const badgeTxt= !hasAns ? 'BELUM DIJAWAB' : ok ? '✓ BENAR' : '✗ SALAH';

    // Narasi soal
    const narasiBloks = (q.content_blocks || []).filter(
      (b: any) => !String(b.value || '').startsWith('__RME_KEYS__')
    );
    const narasiHtml = narasiBloks.length
      ? narasiBloks.map((b: any) => {
          const v = (b.value || '').trim();
          if (!v) return '';
          if (b.type === 'image') return `<img src="${escHtml(v)}" style="display:block;max-width:100%;max-height:160px;margin:6px 0;border-radius:4px;border:1px solid #e2e8f0;" alt=""/>`;
          if (b.type === 'latex') {
            try { return `<div class="latex-block">${katex.renderToString(v, { throwOnError: false, displayMode: true })}</div>`; }
            catch { return `<code>${escHtml(v)}</code>`; }
          }
          return `<p class="narasi-p">${renderInlineMath(v)}</p>`;
        }).join('')
      : '<p style="color:#94a3b8;font-style:italic;">(narasi soal tidak tersedia)</p>';

    // 4 tahap jawaban
    const stageHtml = STAGE_INFO.map(st => {
      const rawAns  = ans[st.key as keyof typeof ans];
      const stageHtmlContent = renderStageAnswer(rawAns);
      return `
<div class="stage-block" style="border-left:3px solid ${st.color};">
  <div class="stage-header" style="background:${st.bg};color:${st.color};">
    ${escHtml(st.label)}
  </div>
  <div class="stage-body">
    ${stageHtmlContent}
  </div>
</div>`;
    }).join('');

    // Jawaban angka akhir
    const finalNum = hasAns ? escHtml(String(ans.finalNumber || '—')) : '—';
    const finalBg  = !hasAns ? '#f8fafc' : ok ? '#dcfce7' : '#fee2e2';
    const finalClr = !hasAns ? '#64748b'  : ok ? '#15803d' : '#dc2626';

    return `
<div class="soal-block">
  <!-- Soal header -->
  <div class="soal-header">
    <div class="soal-num">Soal ${qi + 1}</div>
    <div class="soal-title">${escHtml(q.title || '')}</div>
    <div class="soal-badge" style="background:${badgeBg};color:${badgeClr};">${badgeTxt}</div>
  </div>

  <!-- Narasi soal -->
  <div class="narasi-block">
    <div class="section-label">📋 Soal</div>
    ${narasiHtml}
  </div>

  <!-- Jawaban 4 tahap -->
  <div class="section-label" style="margin-top:10px;">✏️ Jawaban Siswa</div>
  ${stageHtml}

  <!-- Jawaban angka akhir -->
  <div class="final-answer" style="background:${finalBg};border-color:${finalClr};">
    <span class="final-label">Jawaban Akhir (Angka):</span>
    <span class="final-value" style="color:${finalClr};">${finalNum}</span>
    <span class="final-badge" style="background:${finalClr}15;color:${finalClr};border:1px solid ${finalClr}40;">${badgeTxt}</span>
  </div>
</div>`;
  }).join('');

  // ════════════════════════════════════════
  // HTML LENGKAP
  // ════════════════════════════════════════
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.7/dist/katex.min.css"/>
  <style>
    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #1e293b;
      background: #fff;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    img { max-width: 100%; height: auto; display: block; }
    .katex { font-size: 1em; }
    .katex-display { overflow-x: auto; margin: 4px 0; text-align: center; }
    code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 11px; }

    /* ── Page wrapper ── */
    .page { padding: 28px 30px; max-width: 800px; margin: 0 auto; }

    /* ── COVER ── */
    .cover-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #fff;
      padding: 16px 20px;
      border-radius: 8px 8px 0 0;
    }
    .cover-logo { font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
    .cover-subtitle { font-size: 14px; font-weight: 700; color: #e2e8f0; }
    .cover-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 16px 0 4px; letter-spacing: -.3px; }
    .cover-meta { font-size: 11px; color: #64748b; margin-bottom: 16px; }
    .divider { border: none; border-top: 2px solid #e2e8f0; margin: 14px 0; }

    .id-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    .id-table tr td { padding: 4px 6px; font-size: 12px; vertical-align: top; }
    .id-label { color: #64748b; width: 120px; }
    .id-colon { color: #64748b; width: 12px; }
    .id-value { color: #1e293b; font-weight: 600; }

    .score-box { display: flex; gap: 10px; margin-bottom: 16px; }
    .score-item {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 8px;
      text-align: center;
    }
    .score-num { font-size: 28px; font-weight: 900; line-height: 1.1; }
    .score-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; margin-top: 3px; }

    .summary-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; color: #64748b; margin-bottom: 8px; }
    .summary-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .summary-table thead tr { background: #1e293b; }
    .summary-table th { color: #fff; padding: 7px 10px; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .summary-table td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
    .summary-table tbody tr:nth-child(even) { background: #f8fafc; }

    /* ── SOAL BLOCK ── */
    .soal-block {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 20px;
      page-break-inside: avoid;
    }
    .soal-header {
      background: #1e293b;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .soal-num {
      background: rgba(255,255,255,.15);
      color: #fff;
      font-size: 11px;
      font-weight: 900;
      padding: 3px 10px;
      border-radius: 20px;
      white-space: nowrap;
    }
    .soal-title { color: #e2e8f0; font-size: 13px; font-weight: 700; flex: 1; }
    .soal-badge { font-size: 10px; font-weight: 900; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }

    .narasi-block {
      padding: 12px 14px;
      background: #fffbeb;
      border-bottom: 1px solid #e2e8f0;
    }
    .narasi-p { font-size: 12px; line-height: 1.7; color: #1e293b; margin-bottom: 4px; }
    .latex-block { margin: 6px 0; overflow-x: auto; }
    .section-label {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #64748b;
      margin-bottom: 6px;
      padding: 0 14px;
    }

    .stage-block {
      margin: 6px 14px 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .stage-header {
      padding: 5px 10px;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .07em;
    }
    .stage-body {
      padding: 8px 10px;
      font-size: 12px;
      line-height: 1.65;
      background: #fff;
      color: #1e293b;
      min-height: 28px;
    }

    .final-answer {
      margin: 10px 14px 14px;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1.5px solid;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .final-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
    .final-value { font-size: 18px; font-weight: 900; font-family: monospace; flex: 1; }
    .final-badge { font-size: 10px; font-weight: 900; padding: 2px 10px; border-radius: 20px; }

    /* ── Footer ── */
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
<div class="page">
  ${cover}
  ${soalPages}
  <div class="footer">
    TRISULA EduMath &nbsp;&mdash;&nbsp; Dicetak ${new Date().toLocaleDateString('id-ID', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
    &nbsp;&mdash;&nbsp; Dokumen ini bersifat rahasia dan hanya untuk keperluan arsip akademik.
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// DownloadModal — lihat & unduh ZIP jawaban (semua soal paket)
// ─────────────────────────────────────────────
interface AttemptWithUser extends Attempt {
  student_name: string;
  student_nisn: string;
}

// Satu entri per siswa yang berisi jawaban dari semua soal paket
interface StudentPackageAnswers {
  user_id: string;
  displayName: string;
  displayNisn: string;
  // soalId → parsed jawaban JSON
  answers: Record<string, Record<string, any>>;
  // soalId → raw jawaban row
  rows: Record<string, any>;
  latestCreatedAt: string;
  avgSkor: number;
}

const DownloadModal: React.FC<{
  questions: Question[];   // semua soal dalam paket
  examTitle: string;
  onClose: () => void;
}> = ({ questions, examTitle, onClose }) => {
  const [students, setStudents] = useState<StudentPackageAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const questionIds = questions.map(q => q.id);

  const fetchAttempts = async () => {
    setLoading(true);
    setProgress('');
    try {
      // Fetch semua jawaban untuk semua soal dalam paket
      const { data } = await supabase
        .from('jawaban')
        .select('*')
        .in('soal_id', questionIds)
        .order('created_at', { ascending: false });

      // Group by user_id — ambil jawaban terbaru per (user_id, soal_id)
      const byUser: Record<string, StudentPackageAnswers> = {};
      for (const row of (data || [])) {
        const uid = row.user_id;
        let parsed: Record<string, any> = {};
        try { parsed = JSON.parse(row.jawaban || '{}'); } catch {}

        const name = (parsed.student_name || '').trim() || 'Tanpa Nama';
        const nisn = (parsed.student_nisn || '').replace(/\D/g, '') || '—';

        if (!byUser[uid]) {
          byUser[uid] = {
            user_id: uid,
            displayName: name,
            displayNisn: nisn,
            answers: {},
            rows: {},
            latestCreatedAt: row.created_at,
            avgSkor: 0,
          };
        }
        // Simpan hanya yang terbaru per soal (order desc → first = latest)
        if (!byUser[uid].answers[row.soal_id]) {
          byUser[uid].answers[row.soal_id] = parsed;
          byUser[uid].rows[row.soal_id] = row;
          if (name !== 'Tanpa Nama') byUser[uid].displayName = name;
          if (nisn !== '—') byUser[uid].displayNisn = nisn;
        }
      }

      // Hitung rata-rata skor
      const list = Object.values(byUser).map(s => {
        const rows = Object.values(s.rows);
        s.avgSkor = rows.length > 0
          ? Math.round(rows.reduce((sum, r) => sum + (r.skor || 0), 0) / rows.length)
          : 0;
        return s;
      });

      setStudents(list);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAttempts(); }, [questionIds.join(',')]);

  const handleDeleteAll = async () => {
    setDeleting(true);
    setProgress('Menghapus semua jawaban...');
    try {
      // Hapus semua jawaban untuk semua soal dalam paket
      const { error, count } = await supabase
        .from('jawaban')
        .delete()
        .in('soal_id', questionIds);

      if (error) throw error;

      // Konfirmasi dengan re-fetch untuk pastikan benar-benar terhapus
      const { data: remaining } = await supabase
        .from('jawaban')
        .select('id')
        .in('soal_id', questionIds)
        .limit(1);

      if (remaining && remaining.length > 0) {
        throw new Error('Beberapa jawaban tidak terhapus — pastikan policy RLS DELETE sudah aktif di Supabase. Jalankan file supabase/fix_jawaban_rls_delete.sql terlebih dahulu.');
      }

      setStudents([]);
      setProgress('✅ Semua jawaban berhasil dihapus.');
      setConfirmDelete(false);
    } catch (err: any) {
      setProgress(`❌ Gagal hapus: ${err.message}`);
      // Refresh untuk tampilkan data aktual
      await fetchAttempts();
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadZip = async () => {
    if (students.length === 0) return;
    setZipping(true);
    setProgress('Menyiapkan...');
    try {
      const zip = new JSZip();

      for (let si = 0; si < students.length; si++) {
        const student = students[si];
        const safeName = student.displayName.replace(/[^a-zA-Z0-9 _\-]/g, '').trim() || `siswa${si}`;
        const safeNisn = student.displayNisn.replace(/\D/g, '') || `id${si}`;
        const filename = `${safeName}_${safeNisn}.pdf`;
        setProgress(`PDF ${si + 1}/${students.length}: ${student.displayName}...`);

        // Bangun HTML lengkap satu PDF per siswa — mencakup semua soal paket
        const html = buildStudentPackagePdf(
          questions,
          student,
          examTitle,
        );

        try {
          const pdfBlob: Blob = await new Promise((resolve, reject) => {
            (html2pdf as any)()
              .set({
                margin: 15,
                filename,
                image: { type: 'jpeg', quality: 0.97 },
                html2canvas: {
                  scale: 2,
                  useCORS: true,
                  logging: false,
                  letterRendering: true,
                  allowTaint: true,
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
              })
              .from(html, 'string')
              .outputPdf('blob')
              .then(resolve)
              .catch(reject);
          });
          zip.file(filename, pdfBlob);
        } catch (pdfErr: any) {
          console.error(`Gagal PDF ${student.displayName}:`, pdfErr);
        }
      }

      setProgress('Mengemas ZIP...');
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Jawaban_${questions[0]?.test_type || 'ujian'}_${questions[0]?.strand || ''}_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setProgress(`✅ Selesai! ${students.length} PDF dalam ZIP.`);
    } catch (err: any) {
      setProgress(`❌ Gagal: ${err.message}`);
    } finally { setZipping(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jawaban Siswa</div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white truncate max-w-xs mt-0.5">{examTitle}</h3>
            <p className="text-[10px] text-slate-400">{questions.length} soal · {students.length} siswa</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAttempts} disabled={loading}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
              title="Refresh data">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <span className="material-symbols-outlined text-[16px]">refresh</span>}
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center gap-3 justify-center py-10 text-slate-400">
              <Loader2 size={18} className="animate-spin" /> Memuat...
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-bold">Belum ada jawaban</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((s, i) => {
                const soalDikerjakan = Object.keys(s.answers).length;
                return (
                  <div key={s.user_id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300 shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{s.displayName}</p>
                      <p className="text-[10px] text-slate-400">
                        NISN: {s.displayNisn} · {soalDikerjakan}/{questions.length} soal · {new Date(s.latestCreatedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`text-base font-black shrink-0 ${s.avgSkor >= 70 ? 'text-emerald-600' : s.avgSkor >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>
                      {s.avgSkor}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {progress && (
            <div className={`text-xs font-bold rounded-lg px-3 py-2 ${
              progress.startsWith('✅') ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
              : progress.startsWith('❌') ? 'text-rose-700 bg-rose-50 dark:bg-rose-900/20'
              : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800'
            }`}>
              {progress}
            </div>
          )}

          {confirmDelete && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 space-y-2">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                ⚠ Yakin hapus semua jawaban {students.length} siswa untuk paket ini? Tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 text-rose-600 font-bold text-xs cursor-pointer hover:bg-rose-50 transition-colors">
                  Batal
                </button>
                <button onClick={handleDeleteAll} disabled={deleting}
                  className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer disabled:opacity-60 transition-colors flex items-center justify-center gap-1">
                  {deleting ? <><Loader2 size={12} className="animate-spin" /> Menghapus...</> : '🗑 Hapus Semua'}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-colors">
              Tutup
            </button>
            {students.length > 0 && !confirmDelete && (
              <button onClick={() => setConfirmDelete(true)}
                className="py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-sm cursor-pointer hover:bg-rose-100 transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                Hapus Semua
              </button>
            )}
            <button onClick={handleDownloadZip} disabled={zipping || students.length === 0}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
              {zipping ? <><Loader2 size={14} className="animate-spin" /> Memproses...</> : <><FileArchive size={14} /> Unduh ZIP ({students.length})</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// DirectAddButtons
// ─────────────────────────────────────────────
const DirectAddButtons: React.FC<{
  onPretest: () => void;
  onPosttest: () => void;
}> = ({ onPretest, onPosttest }) => (
  <div className="flex gap-3 justify-center flex-wrap">
    <button onClick={onPretest}
      className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-amber-500 text-white text-sm font-bold cursor-pointer hover:bg-amber-600 shadow-md transition-colors">
      <Plus size={15} /> Tambah Pretest
    </button>
    <button onClick={onPosttest}
      className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold cursor-pointer hover:bg-emerald-700 shadow-md transition-colors">
      <Plus size={15} /> Tambah Posttest
    </button>
  </div>
);

// ─────────────────────────────────────────────
// ExamGroupCard — kartu satu PAKET ujian (N soal)
// ─────────────────────────────────────────────
const ExamGroupCard: React.FC<{
  group: {
    key: string; examTitle: string; testType: 'pretest' | 'postest';
    questions: Question[]; examDuration: number; totalPoints: number;
  };
  attempts: Record<string, QuestionAttempt>;
  isAdmin: boolean;
  colorClass: 'amber' | 'emerald';
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
}> = ({ group, attempts, isAdmin, colorClass, onStart, onEdit, onDelete, onDownload }) => {
  const isPretest = group.testType === 'pretest';
  const doneCount = group.questions.filter(q => !!attempts[q.id]).length;
  const isDone = doneCount === group.questions.length && group.questions.length > 0;
  const c = colorClass === 'amber'
    ? { badge: 'bg-amber-100 text-amber-700', btn: 'bg-amber-500 hover:bg-amber-600', strip: 'from-amber-500 to-orange-400', glow: 'shadow-amber-500/10' }
    : { badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', strip: 'from-emerald-500 to-teal-400', glow: 'shadow-emerald-500/10' };

  return (
    <div className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm hover:shadow-lg ${c.glow} hover:-translate-y-0.5 transition-all duration-200 flex flex-col`}>
      <div className={`h-1 bg-gradient-to-r ${c.strip}`} />
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Badge + status */}
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${c.badge}`}>
            {isPretest ? 'Pretest' : 'Posttest'}
          </span>
          {!isPretest && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              <span className="material-symbols-outlined text-[11px]">{isDone ? 'check_circle' : 'pending'}</span>
              {isDone ? 'Selesai' : doneCount > 0 ? `${doneCount}/${group.questions.length}` : 'Belum'}
            </span>
          )}
        </div>

        {/* Judul paket */}
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug">{group.examTitle}</h3>

        {/* Info */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">timer</span> {group.examDuration} mnt
          </span>
          <span>{group.questions.length} soal</span>
          {group.totalPoints > 0 && <span>🏆 {group.totalPoints} poin</span>}
        </div>

        {/* Nomor soal */}
        <div className="flex flex-wrap gap-1.5">
          {group.questions.map((q, qi) => {
            const done = !!attempts[q.id];
            return (
              <div key={q.id} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border-2 transition-all ${
                done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
              }`}>
                {qi + 1}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button onClick={onStart}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              isPretest || !isDone ? `${c.btn} text-white shadow-md` : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}>
            {!isPretest && isDone ? <><Eye size={13} /> Kerjakan Ulang</> : <><Play size={13} /> Kerjakan</>}
          </button>
          {isAdmin && (
            <>
              <button onClick={onDownload}
                className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center cursor-pointer" title="Download">
                <Download size={13} />
              </button>
              <button onClick={onEdit}
                className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center cursor-pointer" title="Edit">
                <Edit3 size={13} />
              </button>
              <button onClick={onDelete}
                className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer" title="Hapus">
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// UjianScreen
// ─────────────────────────────────────────────
interface UjianScreenProps {
  onNavigateToViewer: (
    questionIds: string[],
    meta: { examTitle: string; examDuration: number; testType: 'pretest' | 'postest'; strand: string }
  ) => void;
}

export const UjianScreen: React.FC<UjianScreenProps> = ({ onNavigateToViewer }) => {
  const { user, isAdmin } = useAuth();
  const [selectedStrand, setSelectedStrand] = useState<MathCategory | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Record<string, QuestionAttempt>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<string>('closed');
  const [editingGroup, setEditingGroup] = useState<{ questions: Question[]; examTitle: string; examDuration: number; testType: 'pretest' | 'postest' } | null>(null);
  const [downloadQ, setDownloadQ] = useState<{ questions: Question[]; examTitle: string } | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!selectedStrand) return;
    setLoading(true);
    setError(null);
    try {
      const { data: qs, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .ilike('strand', selectedStrand)
        .in('test_type', ['pretest', 'postest'])
        .order('created_at', { ascending: false });
      if (qErr) throw qErr;

      setQuestions((qs || []) as Question[]);

      // Coba fetch attempt hanya jika user login
      if (user) {
        try {
          const ids = (qs || []).map((q: any) => q.id);
          if (ids.length > 0) {
            const { data: atts } = await supabase
              .from('jawaban')
              .select('id, soal_id, skor')
              .eq('user_id', user.id)
              .in('soal_id', ids);
            const map: Record<string, QuestionAttempt> = {};
            (atts || []).forEach((a: any) => {
              if (!map[a.soal_id]) map[a.soal_id] = { id: a.id, question_id: a.soal_id, score: a.skor || 0 };
            });
            setAttempts(map);
          }
        } catch { /* skip */ }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat soal');
    } finally { setLoading(false); }
  }, [selectedStrand, user]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
  useEffect(() => { setFormMode('closed'); }, [selectedStrand]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus soal ini? Data jawaban siswa ikut terhapus.')) return;
    await supabase.from('questions').delete().eq('id', id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const pretests  = questions.filter(q => q.test_type === 'pretest');
  const posttests = questions.filter(q => q.test_type === 'postest');
  const currentStrand = STRANDS.find(s => s.id === selectedStrand);

  // Kelompokkan soal berdasarkan exam_title (paket ujian)
  type ExamGroup = {
    key: string;
    examTitle: string;
    testType: 'pretest' | 'postest';
    questions: Question[];
    examDuration: number;
    isDone: boolean;
    totalPoints: number;
  };

  const groupQuestions = (qs: Question[]): ExamGroup[] => {
    const map = new Map<string, ExamGroup>();
    qs.forEach(q => {
      // Prioritas: exam_title column → judul tanpa " — Soal N" suffix → judul penuh
      let title = (q as any).exam_title as string || '';
      if (!title.trim()) {
        // Fallback: potong " — Soal N" dari akhir judul
        title = q.title?.replace(/\s*[—–-]\s*soal\s*\d+\s*$/i, '').trim() || 'Ujian';
      }
      const key = `${title}__${q.test_type}__${q.strand}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          examTitle: title,
          testType: q.test_type,
          questions: [],
          examDuration: (q as any).exam_duration || 60,
          isDone: false,
          totalPoints: 0,
        });
      }
      const g = map.get(key)!;
      g.questions.push(q);
      g.totalPoints += (q.rme_keys?.points_diketahui || 0) + (q.rme_keys?.points_ditanya || 0) +
        (q.rme_keys?.points_pengerjaan || 0) + (q.rme_keys?.points_kesimpulan || 0);
      g.isDone = g.questions.every(sq => !!attempts[sq.id]);
    });
    // Urutkan soal dalam setiap grup berdasarkan suffix angka di title
    map.forEach(g => {
      g.questions.sort((a, b) => {
        const na = parseInt(a.title?.match(/\d+$/)?.[0] || '0');
        const nb = parseInt(b.title?.match(/\d+$/)?.[0] || '0');
        return na - nb;
      });
    });
    return Array.from(map.values());
  };

  const pretestGroups  = groupQuestions(pretests);
  const posttestGroups = groupQuestions(posttests);

  const editingQs = formMode === 'edit_group' && editingGroup ? editingGroup.questions : null;
  const formTestType: 'pretest' | 'postest' =
    formMode === 'new_pretest' ? 'pretest'
    : formMode === 'new_postest' ? 'postest'
    : (editingGroup?.testType ?? 'pretest');
  const isFormOpen = formMode !== 'closed';

  return (
    <div className="flex flex-col w-full pb-16 font-sans px-4 sm:px-6 pt-4 animate-in fade-in">

      {/* Download modal */}
      {downloadQ && <DownloadModal questions={downloadQ.questions} examTitle={downloadQ.examTitle} onClose={() => setDownloadQ(null)} />}

      {/* HERO HEADER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-7 text-white shadow-2xl mb-6 border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(251,191,36,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="absolute right-5 bottom-0 opacity-[0.05] select-none text-[100px] font-black leading-none pointer-events-none">∫</div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
            <span className="material-symbols-outlined text-amber-400 text-[14px]">quiz</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Ujian Kompetensi</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight leading-tight mb-2">Pretest & Posttest</h1>
          <p className="text-sm text-slate-400">Ujian berbasis metode RME 4 tahap · Penilaian otomatis oleh AI</p>
        </div>
      </div>

      {/* STRAND SELECTOR */}
      <div className="mb-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pilih Topik</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {STRANDS.map(strand => (
            <button key={strand.id}
              onClick={() => setSelectedStrand(strand.id as MathCategory)}
              className={`p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 transition-all duration-200 cursor-pointer border-2 ${
                selectedStrand === strand.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
              }`}>
              <span className={`material-symbols-outlined text-[26px] ${selectedStrand === strand.id ? 'text-white' : 'text-indigo-500'}`}>
                {strand.icon}
              </span>
              <span className="text-xs font-bold leading-tight">{strand.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── KONTEN STRAND TERPILIH ── */}
      {selectedStrand && (
        <div className="space-y-5">

          {/* Sub-header */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 px-4 py-3 shadow-sm">
            {currentStrand && (
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentStrand.gradient} flex items-center justify-center shadow-md shrink-0`}>
                <span className="material-symbols-outlined text-white text-[20px]">{currentStrand.icon}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white capitalize">{selectedStrand}</h2>
              <p className="text-[10px] text-slate-400">{pretestGroups.length} paket pretest · {posttestGroups.length} paket posttest</p>
            </div>
          </div>

          {/* FORM tambah / edit */}
          {isAdmin && isFormOpen && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <UjianQuestionForm
                strand={selectedStrand as any}
                testType={formTestType}
                existingQuestions={editingQs as any || undefined}
                existingExamTitle={editingGroup?.examTitle}
                existingDuration={editingGroup?.examDuration}
                onCancel={() => { setFormMode('closed'); setEditingGroup(null); }}
                onSaved={() => { setFormMode('closed'); setEditingGroup(null); fetchQuestions(); }}
              />
            </div>
          )}

          {/* DAFTAR SOAL */}
          {!isFormOpen && (
            <>
              {loading ? (
                <div className="flex items-center gap-3 justify-center py-16 text-slate-400">
                  <Loader2 size={20} className="animate-spin text-indigo-400" />
                  <span className="text-sm">Memuat soal...</span>
                </div>
              ) : error ? (
                <div className="p-5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 rounded-2xl text-sm">
                  <p className="font-bold">Gagal memuat</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 block mb-2">inventory_2</span>
                  <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">Belum ada soal ujian</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAdmin ? 'Tambahkan soal pretest atau posttest.' : 'Guru belum membuat soal untuk materi ini.'}
                  </p>
                  {isAdmin && (
                    <div className="mt-5">
                      <DirectAddButtons
                        onPretest={() => setFormMode('new_pretest')}
                        onPosttest={() => setFormMode('new_postest')}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* PRETEST GROUPS */}
                  {pretestGroups.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-amber-600 text-[18px]">assignment</span>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Pretest</h3>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{pretestGroups.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pretestGroups.map(g => (
                          <ExamGroupCard key={g.key} group={g} attempts={attempts} isAdmin={isAdmin}
                            colorClass="amber"
                            onStart={() => onNavigateToViewer(
                              g.questions.map(q => q.id),
                              { examTitle: g.examTitle, examDuration: g.examDuration, testType: g.testType, strand: selectedStrand! }
                            )}
                            onEdit={() => {
                              setEditingGroup({ questions: g.questions, examTitle: g.examTitle, examDuration: g.examDuration, testType: g.testType });
                              setFormMode('edit_group');
                            }}
                            onDelete={() => g.questions.forEach(q => handleDelete(q.id))}
                            onDownload={() => setDownloadQ({ questions: g.questions, examTitle: g.examTitle })}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* POSTTEST GROUPS */}
                  {posttestGroups.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">assignment_turned_in</span>
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Posttest</h3>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{posttestGroups.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {posttestGroups.map(g => (
                          <ExamGroupCard key={g.key} group={g} attempts={attempts} isAdmin={isAdmin}
                            colorClass="emerald"
                            onStart={() => onNavigateToViewer(
                              g.questions.map(q => q.id),
                              { examTitle: g.examTitle, examDuration: g.examDuration, testType: g.testType, strand: selectedStrand! }
                            )}
                            onEdit={() => {
                              setEditingGroup({ questions: g.questions, examTitle: g.examTitle, examDuration: g.examDuration, testType: g.testType });
                              setFormMode('edit_group');
                            }}
                            onDelete={() => g.questions.forEach(q => handleDelete(q.id))}
                            onDownload={() => setDownloadQ({ questions: g.questions, examTitle: g.examTitle })}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {isAdmin && !isFormOpen && (
                    <DirectAddButtons
                      onPretest={() => setFormMode('new_pretest')}
                      onPosttest={() => setFormMode('new_postest')}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
