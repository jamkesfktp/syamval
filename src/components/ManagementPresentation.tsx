import { useState, useEffect } from 'react';
import type { DashboardData } from '../types';
import { formatCurrency, formatNumber } from '../types';
import {
  Presentation,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Award,
  Building2,
  Stethoscope,
  Sparkles,
  Download
} from 'lucide-react';
import exportPptx from '../utils/exportPptx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function ManagementPresentation({ data }: { data: DashboardData }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalSlides = 6;

  const { summary, coder_metrics, cm_metrics, room_metrics, issue_metrics } = data;

  const activeCoders = coder_metrics.filter((c) => (c.total_claims ?? 0) > 0);
  const activeRooms = room_metrics.filter((r) => (r.total_coded ?? 0) > 0);
  const activeCms = cm_metrics.filter((cm) => (cm.total_coded ?? 0) > 0);

  // Top 5 Bottlenecks
  const slowestRooms = [...activeRooms]
    .sort((a, b) => (b.avg_delay_days ?? 0) - (a.avg_delay_days ?? 0))
    .slice(0, 5);

  const slowestCoders = [...activeCoders]
    .sort((a, b) => (b.avg_delay_days ?? 0) - (a.avg_delay_days ?? 0))
    .slice(0, 5);

  const slowestCms = [...activeCms]
    .sort((a, b) => (b.avg_delay_days ?? 0) - (a.avg_delay_days ?? 0))
    .slice(0, 5);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 1));
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    const elem = document.getElementById('presentation-container');
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch((err) => console.error(err));
    }
  };

  const handleExport = () => {
    exportPptx(`Slide_${currentSlide}_Presentasi_Manajemen`);
  };

  const COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-4">
      {/* Presentation Control Bar */}
      <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Presentation size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Mode Presentasi Eksekutif (Slide Deck)</h2>
            <p className="text-xs text-gray-500">
              Gunakan tombol panah ◄ ► atau Spasi untuk berpindah slide. Tekan 'F' untuk Fullscreen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Slide Indicator */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 text-xs font-bold text-gray-700">
            <button
              onClick={() => setCurrentSlide((p) => Math.max(p - 1, 1))}
              disabled={currentSlide === 1}
              className="p-2 rounded-lg hover:bg-white disabled:opacity-30 transition-all text-gray-700"
              title="Slide Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 font-mono">
              Slide {currentSlide} / {totalSlides}
            </span>
            <button
              onClick={() => setCurrentSlide((p) => Math.min(p + 1, totalSlides))}
              disabled={currentSlide === totalSlides}
              className="p-2 rounded-lg hover:bg-white disabled:opacity-30 transition-all text-gray-700"
              title="Slide Selanjutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black transition-colors"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (F11)'}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Download size={16} />
            Ekspor Slide Ini (.pptx)
          </button>
        </div>
      </div>

      {/* Main 16:9 Presentation Canvas */}
      <div
        id="presentation-container"
        className={`bg-slate-900 text-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800 transition-all ${
          isFullscreen ? 'w-screen h-screen p-8' : 'w-full min-h-[640px] p-6 sm:p-8'
        }`}
      >
        {/* Slide Header Banner */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-rsud.png"
              alt="RSUD R. Syamsudin, SH"
              className="h-10 w-auto bg-white/95 p-1 rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-sm font-extrabold tracking-wider text-teal-400 uppercase">
                RSUD R. SYAMSUDIN, SH - CASEMIX BUSINESS INTELLIGENCE
              </h1>
              <p className="text-xs text-slate-400">Laporan Evaluasi & Rekomendasi Manajemen Klaim JKN</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
              Periode: {summary.report_period}
            </span>
          </div>
        </div>

        {/* Dynamic Slide Content */}
        <div className="flex-1 flex flex-col justify-center py-2" id="exportable-content">
          {/* SLIDE 1: RINGKASAN EKSEKUTIF */}
          {currentSlide === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
                  Slide 1: Ringkasan Eksekutif
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  Kinerja & Tata Kelola Klaim Pasien Rawat Inap
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Monitoring menyeluruh volume klaim yang telah dikoding, berkas pending, tingkat akurasi, dan nilai realcost klaim.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold">Total Klaim Terverifikasi</p>
                  <p className="text-3xl font-black text-white mt-2 font-mono">
                    {formatNumber(summary.total_coded)}
                  </p>
                  <p className="text-[11px] text-teal-400 mt-1 flex items-center gap-1 font-semibold">
                    <CheckCircle size={13} /> Selesai Coding 100%
                  </p>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold">Tingkat Penyelesaian (Completion)</p>
                  <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">
                    {summary.completion_rate.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pending: {formatNumber(summary.total_pending)} berkas
                  </p>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold">Akurasi Berkas Klaim</p>
                  <p className="text-3xl font-black text-teal-400 mt-2 font-mono">
                    {summary.overall_accuracy.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tanpa catatan dispute Casemix
                  </p>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold">Estimasi Total Realcost</p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono truncate">
                    {formatCurrency(summary.total_realcost)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Rata-rata: {formatCurrency(summary.avg_realcost)} /klaim
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 size={16} className="text-teal-400" />
                  <span><strong>{summary.room_count}</strong> Ruangan Rawat Inap Terpetakan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Stethoscope size={16} className="text-teal-400" />
                  <span><strong>{activeCms.length}</strong> Dokter Case Manager Aktif</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Award size={16} className="text-teal-400" />
                  <span><strong>{activeCoders.length}</strong> Tenaga Koder Aktif</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: EVALUASI KECEPATAN KODER */}
          {currentSlide === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
                    Slide 2: Evaluasi Koder
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Kecepatan & Ketepatan Waktu Koder (Lead Time Hari)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-sm text-right">
                  Waktu penyelesaian = Tanggal Input Coding − Tanggal Keluar (dibulatkan ke hari penuh).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div className="lg:col-span-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 h-80">
                  <p className="text-xs font-bold text-slate-300 mb-2">Rata-rata & Maksimal Hari Tunggu per Koder</p>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={activeCoders.map((c) => ({
                        name: c.short_name,
                        'Rata-rata (Hari)': Number((c.avg_delay_days ?? 0).toFixed(1)),
                        'Max (Hari)': Number((c.max_delay_days ?? 0).toFixed(1)),
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', borderRadius: '10px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Rata-rata (Hari)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Max (Hari)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-xs text-teal-400 font-bold uppercase tracking-wider">⚡ Koder Tercepat</p>
                    <p className="text-lg font-black text-white mt-1">
                      {[...activeCoders].sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0))[0]?.name || '-'}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Rata-rata: {[...activeCoders].sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0))[0]?.avg_delay_days.toFixed(1)} Hari
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">📊 Rata-rata Tim Koder</p>
                    <p className="text-2xl font-black text-white mt-1 font-mono">
                      {(activeCoders.reduce((acc, c) => acc + (c.avg_delay_days ?? 0), 0) / (activeCoders.length || 1)).toFixed(1)} Hari
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Seluruh berkas terlayani dalam batas SLA</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: EVALUASI DOKTER CASE MANAGER */}
          {currentSlide === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
                    Slide 3: Evaluasi Case Manager
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Kinerja Pengawasan & Respon Dokter Case Manager
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-sm text-right">
                  Monitoring efektivitas follow-up berkas kendala asuhan klinis di ruangan.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <p className="text-xs font-bold text-slate-300 mb-3">Tingkat Penyelesaian Klaim per Dokter CM (%)</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activeCms.map((cm) => ({
                          name: cm.name.replace('Dr. ', ''),
                          'Selesai (%)': Number(cm.completion_rate.toFixed(1)),
                          'Akurasi (%)': Number(cm.accuracy.toFixed(1)),
                        }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', borderRadius: '10px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="Selesai (%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Akurasi (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-300 mb-3">Distribusi Beban Supervisi Ruangan</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {activeCms.map((cm, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                          <div>
                            <p className="font-bold text-white">{cm.name}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                              {cm.rooms.join(', ')}
                            </p>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-emerald-400 font-bold">{cm.total_coded} Coded</span>
                            <p className="text-[10px] text-slate-400">{cm.completion_rate.toFixed(1)}% Rate</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: ANALISIS BOTTLENECK TOP 5 */}
          {currentSlide === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
                    Slide 4: Analisis Bottleneck
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Top 5 Area Keterlambatan Paling Kritis (Lead Time Tertinggi)
                  </h2>
                </div>
                <span className="text-xs bg-red-950/80 text-red-400 font-bold px-3 py-1 rounded-full border border-red-800">
                  Prioritas Intervensi Manajemen
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top 5 Ruangan */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">🏢 Top 5 Ruangan Terlama</p>
                  <div className="space-y-2">
                    {slowestRooms.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl text-xs">
                        <span className="font-semibold text-slate-200 truncate max-w-[130px]">{i + 1}. {r.name}</span>
                        <span className="font-mono font-bold text-orange-400">{(r.avg_delay_days ?? 0).toFixed(1)} Hari</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Koder */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">⚡ Top 5 Koder Terlama</p>
                  <div className="space-y-2">
                    {slowestCoders.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl text-xs">
                        <span className="font-semibold text-slate-200 truncate max-w-[130px]">{i + 1}. {c.short_name}</span>
                        <span className="font-mono font-bold text-amber-400">{(c.avg_delay_days ?? 0).toFixed(1)} Hari</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Case Manager */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">🩺 Top 5 Case Manager Terlama</p>
                  <div className="space-y-2">
                    {slowestCms.map((cm, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl text-xs">
                        <span className="font-semibold text-slate-200 truncate max-w-[130px]">{i + 1}. {cm.name}</span>
                        <span className="font-mono font-bold text-blue-400">{(cm.avg_delay_days ?? 0).toFixed(1)} Hari</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: ISSUE TRACKER (PEMETAAN KENDALA) */}
          {currentSlide === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
                    Slide 5: Pemetaan Kendala
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Analisis Catatan Casemix & Akar Masalah Klaim Pending
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-sm text-right">
                  Dikelompokkan otomatis dari deskripsi berkas yang dikembalikan / terhambat.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={issue_metrics.slice(0, 6)}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis dataKey="issue" type="category" width={140} tick={{ fill: '#e2e8f0', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff', borderRadius: '10px' }} />
                      <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Kasus" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {issue_metrics.slice(0, 5).map((iss, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                        <span className="font-semibold text-slate-200">{iss.issue}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        {iss.count} Berkas
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: POIN REKOMENDASI STRATEGIS & TINDAK LANJUT */}
          {currentSlide === 6 && (
            <div className="space-y-4">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
                  Slide 6: Rekomendasi Manajemen
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Rencana Aksi Strategis Percepatan Klaim RSUD R. Syamsudin, SH
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-teal-800/60 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold mb-3">
                      1
                    </div>
                    <h3 className="font-bold text-white text-sm mb-2">Penegakan SLA Resume & TTD DPJP</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Menetapkan batas waktu pengisian Resume Medis dan Tanda Tangan DPJP maksimal 1x24 jam pasca pasien pulang untuk memangkas antrian berkas pending.
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                    Target: Penurunan Delay 50%
                  </span>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-blue-800/60 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold mb-3">
                      2
                    </div>
                    <h3 className="font-bold text-white text-sm mb-2">Integrasi Hasil PA & Penunjang Medis</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Mempercepat proses digitalisasi upload hasil Patologi Anatomi (PA), CT Scan, dan Echo ke RME agar koding definitif tidak tertunda berminggu-minggu.
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    Target: Nol Pending Hasil PA
                  </span>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-800/60 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold mb-3">
                      3
                    </div>
                    <h3 className="font-bold text-white text-sm mb-2">Optimalisasi Peran Case Manager</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Memperkuat supervisi harian Case Manager di ruangan asuhan untuk proaktif menyelesaikan dispute klinis sebelum berkas diserahkan ke tim koder.
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Target: Akurasi Klaim &gt;95%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
          <p className="flex items-center gap-1">
            <Sparkles size={14} className="text-teal-400" />
            Dashboard Casemix Enterprise • RSUD R. Syamsudin, SH
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx + 1)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx + 1 ? 'w-6 bg-teal-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Menuju Slide ${idx + 1}`}
              />
            ))}
          </div>
          <p className="font-mono">
            {currentSlide} / {totalSlides}
          </p>
        </div>
      </div>
    </div>
  );
}
