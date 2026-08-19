import pptxgen from 'pptxgenjs';
import type { DashboardData } from '../types';
import defaultDashboardData from '../data/dashboardData.json';

export default async function exportPptx(_slideOrTab?: string | number, customData?: DashboardData) {
  const data: DashboardData = customData || (defaultDashboardData as any);
  const { summary, coder_metrics, cm_metrics, room_metrics, issue_metrics } = data;

  const activeCoders = [...coder_metrics]
    .filter((c) => (c.total_claims ?? 0) > 0)
    .sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0));

  const activeRooms = [...room_metrics]
    .filter((r) => (r.total_coded ?? 0) > 0)
    .sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0));

  const activeCms = [...cm_metrics]
    .filter((cm) => (cm.total_coded ?? 0) > 0 || (cm.total_all ?? 0) > 0)
    .sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0));

  const slowestRooms = [...activeRooms].slice(-5).reverse();
  const slowestCoders = [...activeCoders].slice(-5).reverse();
  const slowestCms = [...activeCms].slice(-5).reverse();

  try {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches
    pptx.author = 'UOBK RSUD R. Syamsudin, S.H.';
    pptx.company = 'Aplikasi Case Manager Pro';
    pptx.title = 'Laporan Eksekutif Evaluasi Casemix';

    // Helper: Add Official Header to any slide
    const addHeader = (slide: any, slideTitle: string, slideSubtitle: string) => {
      // Background Clean White
      slide.background = { color: 'FFFFFF' };

      // Top Header Bar Emerald
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 0.9,
        fill: { color: '064E3B' },
      });

      // Header Accent Line Gold
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0.88,
        w: '100%',
        h: 0.04,
        fill: { color: 'F59E0B' },
      });

      // Header Texts
      slide.addText('UOBK RSUD R. SYAMSUDIN, S.H. - KOTA SUKABUMI', {
        x: 0.6,
        y: 0.12,
        w: 8.5,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Segoe UI',
        color: 'FFFFFF',
        bold: true,
      });

      slide.addText('APLIKASI CASE MANAGER PRO • EVALUASI KLAIM BPJS KESEHATAN', {
        x: 0.6,
        y: 0.45,
        w: 8.5,
        h: 0.25,
        fontSize: 9,
        fontFace: 'Segoe UI',
        color: 'FDE68A',
        bold: true,
      });

      slide.addText(`Periode: ${summary.report_period || 'Juli - Agustus 2026'}`, {
        x: 8.8,
        y: 0.25,
        w: 4.0,
        h: 0.35,
        fontSize: 10,
        fontFace: 'Segoe UI',
        color: 'FFFFFF',
        align: 'right' as const,
        bold: true,
      });

      // Slide Title Section
      slide.addText(slideTitle, {
        x: 0.6,
        y: 1.1,
        w: 12.0,
        h: 0.4,
        fontSize: 16,
        fontFace: 'Segoe UI',
        color: '0F172A',
        bold: true,
      });

      slide.addText(slideSubtitle, {
        x: 0.6,
        y: 1.45,
        w: 12.0,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Segoe UI',
        color: '64748B',
      });

      // Footer
      slide.addShape(pptx.ShapeType.line, {
        x: 0.6,
        y: 7.0,
        w: 12.13,
        h: 0,
        line: { color: 'E2E8F0', width: 1 },
      });

      slide.addText('Aplikasi Case Manager Pro • UOBK RSUD R. Syamsudin, S.H.', {
        x: 0.6,
        y: 7.05,
        w: 8.0,
        h: 0.3,
        fontSize: 9,
        fontFace: 'Segoe UI',
        color: '94A3B8',
      });
    };

    // ==========================================
    // SLIDE 1: RINGKASAN EKSEKUTIF (EDITABLE)
    // ==========================================
    const slide1 = pptx.addSlide();
    addHeader(slide1, 'Slide 1: Ringkasan Eksekutif & Makro KPI Klaim', 'Monitoring pencapaian volume coding, berkas pending, akurasi, dan nilai realcost klaim BPJS.');

    const kpiCards = [
      { label: 'Total Klaim Terverifikasi', value: `${summary.total_coded} Berkas`, sub: '100% Telah Selesai Coding', fill: 'F0FDF4', line: '86EFAC', text: '166534' },
      { label: 'Completion Rate', value: `${summary.completion_rate.toFixed(1)}%`, sub: `Pending: ${summary.total_pending} berkas`, fill: 'FEFCE8', line: 'FDE047', text: '854D0E' },
      { label: 'Akurasi Berkas Klaim', value: `${summary.overall_accuracy.toFixed(1)}%`, sub: 'Lolos Verifikasi Casemix', fill: 'F0FDFA', line: '99F6E4', text: '115E59' },
      { label: 'Total Nilai Realcost', value: `Rp ${(summary.total_realcost / 1e9).toFixed(2)} M`, sub: `Rata-rata: Rp ${(summary.avg_realcost / 1e6).toFixed(2)} Jt/klaim`, fill: 'EFF6FF', line: 'BFDBFE', text: '1E40AF' },
    ];

    kpiCards.forEach((kpi, idx) => {
      const x = 0.6 + idx * 3.1;
      slide1.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 2.0,
        w: 2.9,
        h: 2.2,
        rectRadius: 0.15,
        fill: { color: kpi.fill },
        line: { color: kpi.line, width: 1.5 },
      });

      slide1.addText(kpi.label, {
        x: x + 0.2,
        y: 2.2,
        w: 2.5,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Segoe UI',
        color: '475569',
        bold: true,
      });

      slide1.addText(kpi.value, {
        x: x + 0.2,
        y: 2.6,
        w: 2.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Segoe UI',
        color: kpi.text,
        bold: true,
      });

      slide1.addText(kpi.sub, {
        x: x + 0.2,
        y: 3.4,
        w: 2.5,
        h: 0.5,
        fontSize: 9,
        fontFace: 'Segoe UI',
        color: '64748B',
      });
    });

    // Summary Scope Box
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 4.6,
      w: 12.13,
      h: 2.0,
      rectRadius: 0.15,
      fill: { color: 'F8FAFC' },
      line: { color: 'CBD5E1', width: 1 },
    });

    slide1.addText('Cakupan Tata Kelola Klaim Rumah Sakit:', {
      x: 0.9,
      y: 4.8,
      w: 11.0,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Segoe UI',
      color: '0F172A',
      bold: true,
    });

    slide1.addText(`• Ruangan Rawat Inap Terlayani: ${summary.room_count} Ruangan (Bedah, Penyakit Dalam, Anak, Obgyn, VIP, Intensif)\n• Tenaga Koder Aktif: ${activeCoders.length} Orang Koder\n• Dokter Case Manager: ${activeCms.length} Orang Dokter Penanggung Jawab Supervisi Klinis\n• Status Berkas: Seluruh berkas pasien pulang Juli - Agustus terproses dengan rata-rata turnaround time di bawah batas toleransi SLA.`, {
      x: 0.9,
      y: 5.2,
      w: 11.5,
      h: 1.2,
      fontSize: 10,
      fontFace: 'Segoe UI',
      color: '334155',
      lineSpacingMultiple: 1.2,
    });

    // ==========================================
    // SLIDE 2: EVALUASI KODER (EDITABLE TABLE)
    // ==========================================
    const slide2 = pptx.addSlide();
    addHeader(slide2, 'Slide 2: Evaluasi Kecepatan & Ketepatan Koder', 'Peringkat koder diurutkan dari yang tercepat (rata-rata hari terendah) hingga paling lambat.');

    const coderTableRows: any[][] = [
      [
        { text: 'Rank', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF' } },
        { text: 'Nama Koder', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF' } },
        { text: 'Total Klaim', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
        { text: 'Akurasi (%)', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
        { text: 'Rata-rata Delay (Hari)', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
        { text: 'Max Delay (Hari)', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
        { text: 'Status', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'center' as const } },
      ],
      ...activeCoders.map((c, idx) => [
        { text: `#${idx + 1}`, options: { align: 'center' as const, bold: true } },
        { text: c.name, options: { bold: true } },
        { text: String(c.total_claims), options: { align: 'right' as const } },
        { text: `${(c.accuracy ?? 0).toFixed(1)}%`, options: { align: 'right' as const, bold: true, color: (c.accuracy ?? 0) >= 90 ? '166534' : '854D0E' } },
        { text: `${(c.avg_delay_days ?? 0).toFixed(1)} Hari`, options: { align: 'right' as const, bold: true, color: '0F766E' } },
        { text: `${c.max_delay_days ?? 0} Hari`, options: { align: 'right' as const, color: 'D97706' } },
        { text: (c.avg_delay_days ?? 0) <= 1.0 ? 'Sangat Cepat' : 'Cepat', options: { align: 'center' as const, color: '166534', bold: true } },
      ]),
    ];

    slide2.addTable(coderTableRows as any, {
      x: 0.6,
      y: 2.0,
      w: 12.13,
      fontSize: 9.5,
      fontFace: 'Segoe UI',
      rowH: 0.35,
      border: { pt: 0.5, color: 'CBD5E1' },
    });

    // ==========================================
    // SLIDE 3: EVALUASI CASE MANAGER (EDITABLE TABLE)
    // ==========================================
    const slide3 = pptx.addSlide();
    addHeader(slide3, 'Slide 3: Evaluasi Supervisi Dokter Case Manager', 'Evaluasi respon dan keterlambatan penyelesaian berkas per dokter Case Manager (Lead Time Hari).');

    const cmTableRows: any[][] = [
      [
        { text: 'Rank', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF' } },
        { text: 'Nama Dokter Case Manager', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF' } },
        { text: 'Ruangan Asuhan Supervisi', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF' } },
        { text: 'Total Pasien', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
        { text: 'Completion (%)', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
        { text: 'Rata-rata Delay (Hari)', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
        { text: 'Max Delay (Hari)', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
      ],
      ...activeCms.map((cm, idx) => [
        { text: `#${idx + 1}`, options: { align: 'center' as const, bold: true } },
        { text: cm.name, options: { bold: true } },
        { text: cm.rooms.slice(0, 3).join(', ') + (cm.rooms.length > 3 ? ` (+${cm.rooms.length - 3})` : ''), options: { fontSize: 8.5 } },
        { text: String(cm.total_all), options: { align: 'right' as const } },
        { text: `${(cm.completion_rate ?? 0).toFixed(1)}%`, options: { align: 'right' as const, bold: true, color: '166534' } },
        { text: `${(cm.avg_delay_days ?? 0).toFixed(1)} Hari`, options: { align: 'right' as const, bold: true, color: '0F766E' } },
        { text: `${cm.max_delay_days ?? 0} Hari`, options: { align: 'right' as const, color: 'D97706' } },
      ]),
    ];

    slide3.addTable(cmTableRows as any, {
      x: 0.6,
      y: 2.0,
      w: 12.13,
      fontSize: 9.5,
      fontFace: 'Segoe UI',
      rowH: 0.4,
      border: { pt: 0.5, color: 'CBD5E1' },
    });

    // ==========================================
    // SLIDE 4: TOP 5 BOTTLENECK (EDITABLE)
    // ==========================================
    const slide4 = pptx.addSlide();
    addHeader(slide4, 'Slide 4: Analisis Bottleneck Kritis (Top 5)', 'Area keterlambatan dan antrian berkas tertinggi sebagai sasaran intervensi manajemen.');

    const renderBottleneckBox = (slide: any, x: number, title: string, items: any[], nameKey: string) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 2.0,
        w: 3.8,
        h: 4.6,
        rectRadius: 0.15,
        fill: { color: 'F8FAFC' },
        line: { color: 'E2E8F0', width: 1.5 },
      });

      slide.addText(title, {
        x: x + 0.2,
        y: 2.2,
        w: 3.4,
        h: 0.35,
        fontSize: 11,
        fontFace: 'Segoe UI',
        color: '0F172A',
        bold: true,
      });

      items.forEach((item, i) => {
        const yPos = 2.7 + i * 0.75;
        slide.addShape(pptx.ShapeType.roundRect, {
          x: x + 0.2,
          y: yPos,
          w: 3.4,
          h: 0.65,
          rectRadius: 0.1,
          fill: { color: 'FFFFFF' },
          line: { color: 'CBD5E1', width: 1 },
        });

        slide.addText(`${i + 1}. ${item[nameKey] || item.name}`, {
          x: x + 0.3,
          y: yPos + 0.12,
          w: 2.3,
          h: 0.4,
          fontSize: 9.5,
          fontFace: 'Segoe UI',
          color: '1E293B',
          bold: true,
        });

        slide.addText(`${(item.avg_delay_days ?? 0).toFixed(1)} Hari`, {
          x: x + 2.5,
          y: yPos + 0.12,
          w: 1.0,
          h: 0.4,
          fontSize: 10,
          fontFace: 'Segoe UI',
          color: 'D97706',
          align: 'right' as const,
          bold: true,
        });
      });
    };

    renderBottleneckBox(slide4, 0.6, '🏢 Top 5 Ruangan Terlama', slowestRooms, 'name');
    renderBottleneckBox(slide4, 4.76, '⚡ Top 5 Koder Terlama', slowestCoders, 'short_name');
    renderBottleneckBox(slide4, 8.93, '🩺 Top 5 Case Manager Terlama', slowestCms, 'name');

    // ==========================================
    // SLIDE 5: PEMETAAN KENDALA (EDITABLE)
    // ==========================================
    const slide5 = pptx.addSlide();
    addHeader(slide5, 'Slide 5: Pemetaan Kendala & Catatan Casemix', 'Identifikasi akar penyebab pengembalian dan hambatan berkas klaim di ruangan.');

    const issueTableRows: any[][] = [
      [
        { text: 'No', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'center' as const } },
        { text: 'Kategori Kendala Casemix', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF' } },
        { text: 'Jumlah Kasus', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
        { text: 'Persentase (%)', options: { bold: true, fill: { color: '064E3B' }, color: 'FFFFFF', align: 'right' as const } },
      ],
      ...issue_metrics.slice(0, 8).map((iss, idx) => {
        const totalIss = issue_metrics.reduce((a, b) => a + b.count, 0) || 1;
        return [
          { text: String(idx + 1), options: { align: 'center' as const, bold: true } },
          { text: iss.issue, options: { bold: true } },
          { text: `${iss.count} Berkas`, options: { align: 'right' as const, bold: true, color: 'D97706' } },
          { text: `${((iss.count / totalIss) * 100).toFixed(1)}%`, options: { align: 'right' as const } },
        ];
      }),
    ];

    slide5.addTable(issueTableRows as any, {
      x: 0.6,
      y: 2.0,
      w: 12.13,
      fontSize: 10,
      fontFace: 'Segoe UI',
      rowH: 0.45,
      border: { pt: 0.5, color: 'CBD5E1' },
    });

    // ==========================================
    // SLIDE 6: REKOMENDASI STRATEGIS (EDITABLE)
    // ==========================================
    const slide6 = pptx.addSlide();
    addHeader(slide6, 'Slide 6: Rekomendasi Strategis & Rencana Aksi', '3 Usulan kebijakan konkret percepatan penyelesaian klaim dan kepatuhan administrasi.');

    const recommendations = [
      {
        num: '1',
        title: 'Penegakan SLA Resume & TTD DPJP',
        desc: 'Menetapkan kebijakan waktu pengisian Resume Medis dan Tanda Tangan DPJP maksimal 1x24 jam pasca pasien keluar ruangan untuk memangkas antrian berkas pending.',
        target: 'Target: Penurunan Delay 50%',
        fill: 'F0FDF4',
        border: '86EFAC',
        numColor: '166534',
      },
      {
        num: '2',
        title: 'Integrasi Digital Hasil Penunjang (PA/Echo)',
        desc: 'Mempercepat digitalisasi upload hasil Patologi Anatomi (PA), CT Scan, dan Echo ke RME agar koding definitif tidak tertunda berminggu-minggu.',
        target: 'Target: Nol Pending Hasil PA',
        fill: 'FEFCE8',
        border: 'FDE047',
        numColor: '854D0E',
      },
      {
        num: '3',
        title: 'Optimalisasi Supervisi Case Manager',
        desc: 'Memperkuat peran supervisi klinis harian Case Manager di ruangan rawat inap untuk proaktif menyelesaikan dispute klinis sebelum berkas diserahkan ke koder.',
        target: 'Target: Akurasi Klaim >95%',
        fill: 'F0FDFA',
        border: '99F6E4',
        numColor: '115E59',
      },
    ];

    recommendations.forEach((rec, idx) => {
      const x = 0.6 + idx * 4.15;
      slide6.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 2.0,
        w: 3.9,
        h: 4.6,
        rectRadius: 0.15,
        fill: { color: rec.fill },
        line: { color: rec.border, width: 1.5 },
      });

      slide6.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.3,
        y: 2.3,
        w: 0.6,
        h: 0.6,
        rectRadius: 0.1,
        fill: { color: '064E3B' },
      });

      slide6.addText(rec.num, {
        x: x + 0.3,
        y: 2.35,
        w: 0.6,
        h: 0.5,
        fontSize: 16,
        fontFace: 'Segoe UI',
        color: 'FFFFFF',
        align: 'center' as const,
        bold: true,
      });

      slide6.addText(rec.title, {
        x: x + 0.3,
        y: 3.1,
        w: 3.3,
        h: 0.6,
        fontSize: 13,
        fontFace: 'Segoe UI',
        color: '0F172A',
        bold: true,
      });

      slide6.addText(rec.desc, {
        x: x + 0.3,
        y: 3.8,
        w: 3.3,
        h: 1.8,
        fontSize: 10,
        fontFace: 'Segoe UI',
        color: '334155',
        lineSpacingMultiple: 1.2,
      });

      slide6.addText(rec.target, {
        x: x + 0.3,
        y: 5.8,
        w: 3.3,
        h: 0.4,
        fontSize: 10,
        fontFace: 'Segoe UI',
        color: rec.numColor,
        bold: true,
      });
    });

    // Save PPTX File
    const fileName = `Slide_Presentasi_Manajemen_RSUD_Syamsudin_${new Date().toISOString().slice(0,10)}.pptx`;
    await pptx.writeFile({ fileName });
    alert(`File PowerPoint Berhasil Dibuat!\n${fileName}\n\nSeluruh teks, tabel, dan angka 100% DAPAT DIEDIT di Microsoft PowerPoint.`);
  } catch (err) {
    console.error('Failed to export editable PPTX', err);
    alert('Gagal mengekspor PowerPoint: ' + (err instanceof Error ? err.message : String(err)));
  }
}
