import { useState, useEffect } from 'react';
import type { DashboardData } from '../types';
import { formatCurrency, formatNumber } from '../types';
import {
  Presentation,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Award,
  Building2,
  Stethoscope,
  Sparkles,
  Download,
  Sun,
  Moon
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
  Legend
} from 'recharts';

export default function ManagementPresentation({ data }: { data: DashboardData }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'syamsudin-white' | 'syamsudin-emerald'>('syamsudin-white');
  const totalSlides = 6;

  const { summary, coder_metrics, cm_metrics, room_metrics, issue_metrics } = data;

  const activeCoders = [...coder_metrics]
    .filter((c) => (c.total_claims ?? 0) > 0)
    .sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0));

  const activeRooms = room_metrics.filter((r) => (r.total_coded ?? 0) > 0);

  const activeCms = [...cm_metrics]
    .filter((cm) => (cm.total_coded ?? 0) > 0 || (cm.total_all ?? 0) > 0)
    .sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0));

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
    exportPptx(currentSlide, data);
  };

  const isEmerald = theme === 'syamsudin-emerald';

  return (
    <div className="space-y-4">
      {/* Top Presentation Control Bar */}
      <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-600 text-amber-300 flex items-center justify-center font-bold shadow-md shadow-teal-700/20 border border-amber-400/40">
            <Presentation size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-teal-950">Aplikasi Case Manager Pro (UOBK RSUD R. Syamsudin, S.H.)</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-teal-100 text-teal-900 rounded-full border border-teal-300">
                Resmi
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Slide Eksekutif Manajemen. Navigasi: ◄ ► / Spasi / Tekan 'F' untuk Fullscreen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isEmerald ? 'syamsudin-white' : 'syamsudin-emerald')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            title="Ganti Tema Slide"
          >
            {isEmerald ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-teal-700" />}
            <span>{isEmerald ? 'Tema Putih Bersih' : 'Tema Hijau Gelap'}</span>
          </button>

          {/* Slide Indicator */}
          <div className="flex items-center bg-teal-50 border border-teal-200 rounded-xl p-1 text-xs font-bold text-teal-900">
            <button
              onClick={() => setCurrentSlide((p) => Math.max(p - 1, 1))}
              disabled={currentSlide === 1}
              className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30 transition-all text-teal-900"
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
              className="p-1.5 rounded-lg hover:bg-white disabled:opacity-30 transition-all text-teal-900"
              title="Slide Selanjutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 bg-teal-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black transition-colors shadow-sm"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            {isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (F11)'}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal-700 transition-all shadow-md shadow-teal-700/20"
          >
            <Download size={15} />
            Download PPTX
          </button>
        </div>
      </div>

      {/* Main 16:9 Presentation Canvas Styled with Clean White Identity */}
      <div
        id="presentation-container"
        className={`rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all border ${
          isEmerald
            ? 'bg-gradient-to-br from-[#032e2b] via-[#064e3b] to-[#022c22] text-white border-teal-700 shadow-teal-950/60'
            : 'bg-white text-slate-800 border-slate-200 shadow-slate-200'
        } ${isFullscreen ? 'w-screen h-screen p-8' : 'w-full min-h-[640px] p-6 sm:p-8'}`}
      >
        {/* Slide Header Banner with Logo & Clean Hospital Accents */}
        <div className={`flex items-center justify-between pb-4 mb-4 border-b ${isEmerald ? 'border-teal-700' : 'border-teal-100'}`}>
          <div className="flex items-center gap-4">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-teal-200 flex items-center justify-center shrink-0">
              <img
                src="/logo-rsud.png"
                alt="Logo RSUD R. Syamsudin"
                className="h-16 sm:h-20 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-lg font-black tracking-wide uppercase ${isEmerald ? 'text-white' : 'text-teal-950'}`}>
                  UOBK RSUD R. SYAMSUDIN, S.H.
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase tracking-wider">
                  KOTA SUKABUMI
                </span>
              </div>
              <p className={`text-xs font-semibold ${isEmerald ? 'text-amber-300' : 'text-teal-700'}`}>
                APLIKASI CASE MANAGER PRO • EVALUASI KLAIM BPJS KESEHATAN
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-sm ${
              isEmerald 
                ? 'bg-emerald-900/80 text-amber-300 border-emerald-700' 
                : 'bg-teal-50 text-teal-900 border-teal-200'
            }`}>
              📅 Periode: {summary.report_period}
            </div>
          </div>
        </div>

        {/* Dynamic Slide Content */}
        <div className="flex-1 flex flex-col justify-center py-2" id="exportable-content">
          {/* SLIDE 1: RINGKASAN EKSEKUTIF */}
          {currentSlide === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                  isEmerald ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' : 'bg-teal-50 text-teal-800 border-teal-200'
                }`}>
                  Slide 1: Ringkasan Eksekutif
                </span>
                <h2 className={`text-2xl sm:text-3xl font-black mt-2 ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                  Kinerja & Tata Kelola Klaim Pasien Rawat Inap
                </h2>
                <p className={`text-xs sm:text-sm mt-1 ${isEmerald ? 'text-emerald-100/70' : 'text-slate-500'}`}>
                  Monitoring makro pencapaian koding, berkas pending, akurasi, dan nilai realcost klaim RSUD R. Syamsudin, SH.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border transition-all ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`text-xs font-semibold ${isEmerald ? 'text-emerald-200' : 'text-slate-500'}`}>Total Klaim Terverifikasi</p>
                  <p className={`text-3xl font-black mt-2 font-mono ${isEmerald ? 'text-white' : 'text-teal-950'}`}>
                    {formatNumber(summary.total_coded)}
                  </p>
                  <p className="text-[11px] text-teal-600 mt-1 flex items-center gap-1 font-semibold">
                    <CheckCircle size={13} className="text-teal-600" /> Selesai Coding 100%
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`text-xs font-semibold ${isEmerald ? 'text-emerald-200' : 'text-slate-500'}`}>Tingkat Penyelesaian (Completion)</p>
                  <p className="text-3xl font-black text-amber-500 mt-2 font-mono">
                    {summary.completion_rate.toFixed(1)}%
                  </p>
                  <p className={`text-[11px] mt-1 ${isEmerald ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                    Pending: {formatNumber(summary.total_pending)} berkas
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`text-xs font-semibold ${isEmerald ? 'text-emerald-200' : 'text-slate-500'}`}>Akurasi Berkas Klaim</p>
                  <p className={`text-3xl font-black mt-2 font-mono ${isEmerald ? 'text-teal-300' : 'text-teal-700'}`}>
                    {summary.overall_accuracy.toFixed(1)}%
                  </p>
                  <p className={`text-[11px] mt-1 ${isEmerald ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                    Tanpa catatan dispute Casemix
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`text-xs font-semibold ${isEmerald ? 'text-emerald-200' : 'text-slate-500'}`}>Estimasi Nilai Realcost</p>
                  <p className="text-2xl sm:text-3xl font-black text-teal-700 mt-2 font-mono truncate">
                    {formatCurrency(summary.total_realcost)}
                  </p>
                  <p className={`text-[11px] mt-1 ${isEmerald ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                    Rata-rata: {formatCurrency(summary.avg_realcost)} /klaim
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium ${
                isEmerald ? 'bg-emerald-950/60 border-teal-700 text-emerald-100' : 'bg-teal-50/70 border-teal-200 text-teal-950'
              }`}>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-teal-600" />
                  <span><strong>{summary.room_count}</strong> Ruangan Rawat Inap</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope size={16} className="text-teal-600" />
                  <span><strong>{activeCms.length}</strong> Dokter Case Manager</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-teal-600" />
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
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isEmerald ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}>
                    Slide 2: Evaluasi Koder
                  </span>
                  <h2 className={`text-xl sm:text-2xl font-black mt-1 ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                    Kecepatan & Ketepatan Waktu Koder (Lead Time Hari)
                  </h2>
                </div>
                <p className={`text-xs max-w-sm text-right ${isEmerald ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                  Waktu penyelesaian = Tanggal Input Coding − Tanggal Keluar (dibulatkan ke hari penuh).
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div className={`lg:col-span-2 p-4 rounded-2xl border h-80 ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`text-xs font-bold mb-2 ${isEmerald ? 'text-amber-300' : 'text-slate-800'}`}>
                    Rata-rata & Maksimal Hari Tunggu per Koder
                  </p>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={activeCoders.map((c) => ({
                        name: c.short_name,
                        'Rata-rata (Hari)': Number((c.avg_delay_days ?? 0).toFixed(1)),
                        'Max (Hari)': Number((c.max_delay_days ?? 0).toFixed(1)),
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isEmerald ? '#065f46' : '#e2e8f0'} />
                      <XAxis dataKey="name" tick={{ fill: isEmerald ? '#a7f3d0' : '#475569', fontSize: 11 }} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fill: isEmerald ? '#a7f3d0' : '#475569', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: isEmerald ? '#022c22' : '#ffffff', borderColor: '#0d9488', color: isEmerald ? '#fff' : '#000', borderRadius: '10px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Rata-rata (Hari)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Max (Hari)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border ${
                    isEmerald ? 'bg-emerald-900/60 border-teal-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">⚡ Koder Tercepat</p>
                    <p className={`text-lg font-black mt-1 ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                      {[...activeCoders].sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0))[0]?.name || '-'}
                    </p>
                    <p className={`text-xs font-mono mt-0.5 ${isEmerald ? 'text-emerald-200' : 'text-slate-500'}`}>
                      Rata-rata: {[...activeCoders].sort((a, b) => (a.avg_delay_days ?? 0) - (b.avg_delay_days ?? 0))[0]?.avg_delay_days.toFixed(1)} Hari
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">📊 Rata-rata Tim Koder</p>
                    <p className={`text-2xl font-black mt-1 font-mono ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                      {(activeCoders.reduce((acc, c) => acc + (c.avg_delay_days ?? 0), 0) / (activeCoders.length || 1)).toFixed(1)} Hari
                    </p>
                    <p className={`text-xs mt-0.5 ${isEmerald ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                      Seluruh berkas diproses dalam batas wajar
                    </p>
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
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isEmerald ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}>
                    Slide 3: Evaluasi Case Manager
                  </span>
                  <h2 className={`text-xl sm:text-2xl font-black mt-1 ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                    Kecepatan Respon & Maksimal Hari Tunggu Dokter Case Manager
                  </h2>
                </div>
                <p className={`text-xs max-w-sm text-right ${isEmerald ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                  Rata-rata dan maksimal waktu penyelesaian (Lead Time Hari) per dokter Case Manager.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div className={`lg:col-span-2 p-4 rounded-2xl border h-80 ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`text-xs font-bold mb-2 ${isEmerald ? 'text-amber-300' : 'text-slate-800'}`}>
                    Rata-rata & Maksimal Hari Tunggu per Case Manager (Hari)
                  </p>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={activeCms.map((cm) => ({
                        name: cm.name.replace('Dr. ', '').replace('Dr.', ''),
                        'Rata-rata (Hari)': Number((cm.avg_delay_days ?? 0).toFixed(1)),
                        'Max (Hari)': Number((cm.max_delay_days ?? 0).toFixed(1)),
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isEmerald ? '#065f46' : '#e2e8f0'} />
                      <XAxis dataKey="name" tick={{ fill: isEmerald ? '#a7f3d0' : '#475569', fontSize: 11 }} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fill: isEmerald ? '#a7f3d0' : '#475569', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: isEmerald ? '#022c22' : '#ffffff', borderColor: '#0d9488', color: isEmerald ? '#fff' : '#000', borderRadius: '10px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Rata-rata (Hari)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Max (Hari)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border ${
                    isEmerald ? 'bg-emerald-900/60 border-teal-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">⚡ Case Manager Tercepat</p>
                    <p className={`text-lg font-black mt-1 ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                      {activeCms[0]?.name || '-'}
                    </p>
                    <p className={`text-xs font-mono mt-0.5 ${isEmerald ? 'text-emerald-200' : 'text-slate-500'}`}>
                      Rata-rata: {activeCms[0]?.avg_delay_days?.toFixed(1)} Hari • Max: {activeCms[0]?.max_delay_days} Hari
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">📊 Rata-rata Tim Case Manager</p>
                    <p className={`text-2xl font-black mt-1 font-mono ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                      {(activeCms.reduce((acc, c) => acc + (c.avg_delay_days ?? 0), 0) / (activeCms.length || 1)).toFixed(1)} Hari
                    </p>
                    <p className={`text-xs mt-0.5 ${isEmerald ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                      Seluruh berkas disupervisi dalam batas wajar
                    </p>
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
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isEmerald ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}>
                    Slide 4: Analisis Bottleneck
                  </span>
                  <h2 className={`text-xl sm:text-2xl font-black mt-1 ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                    Top 5 Area Keterlambatan Paling Kritis (Lead Time Tertinggi)
                  </h2>
                </div>
                <span className="text-xs bg-red-50 text-red-700 font-bold px-3 py-1 rounded-full border border-red-200">
                  Prioritas Intervensi Manajemen
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top 5 Ruangan */}
                <div className={`p-4 rounded-2xl border ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">🏢 Top 5 Ruangan Terlama</p>
                  <div className="space-y-2">
                    {slowestRooms.map((r, i) => (
                      <div key={i} className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                        isEmerald ? 'bg-emerald-950/60' : 'bg-white border border-slate-200/60'
                      }`}>
                        <span className={`font-semibold truncate max-w-[130px] ${isEmerald ? 'text-slate-200' : 'text-slate-800'}`}>{i + 1}. {r.name}</span>
                        <span className="font-mono font-bold text-amber-600">{(r.avg_delay_days ?? 0).toFixed(1)} Hari</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Koder */}
                <div className={`p-4 rounded-2xl border ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">⚡ Top 5 Koder Terlama</p>
                  <div className="space-y-2">
                    {slowestCoders.map((c, i) => (
                      <div key={i} className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                        isEmerald ? 'bg-emerald-950/60' : 'bg-white border border-slate-200/60'
                      }`}>
                        <span className={`font-semibold truncate max-w-[130px] ${isEmerald ? 'text-slate-200' : 'text-slate-800'}`}>{i + 1}. {c.short_name}</span>
                        <span className="font-mono font-bold text-teal-700">{(c.avg_delay_days ?? 0).toFixed(1)} Hari</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Case Manager */}
                <div className={`p-4 rounded-2xl border ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">🩺 Top 5 Case Manager Terlama</p>
                  <div className="space-y-2">
                    {slowestCms.map((cm, i) => (
                      <div key={i} className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                        isEmerald ? 'bg-emerald-950/60' : 'bg-white border border-slate-200/60'
                      }`}>
                        <span className={`font-semibold truncate max-w-[130px] ${isEmerald ? 'text-slate-200' : 'text-slate-800'}`}>{i + 1}. {cm.name}</span>
                        <span className="font-mono font-bold text-blue-600">{(cm.avg_delay_days ?? 0).toFixed(1)} Hari</span>
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
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isEmerald ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}>
                    Slide 5: Pemetaan Kendala
                  </span>
                  <h2 className={`text-xl sm:text-2xl font-black mt-1 ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                    Analisis Catatan Casemix & Akar Masalah Klaim Pending
                  </h2>
                </div>
                <p className={`text-xs max-w-sm text-right ${isEmerald ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                  Dikelompokkan otomatis dari deskripsi berkas yang dikembalikan / terhambat.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <div className={`p-4 rounded-2xl border h-72 ${
                  isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={issue_metrics.slice(0, 6)}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isEmerald ? '#065f46' : '#e2e8f0'} />
                      <XAxis type="number" tick={{ fill: isEmerald ? '#a7f3d0' : '#475569', fontSize: 11 }} />
                      <YAxis dataKey="issue" type="category" width={140} tick={{ fill: isEmerald ? '#e2e8f0' : '#1e293b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: isEmerald ? '#022c22' : '#ffffff', borderColor: '#0d9488', color: isEmerald ? '#fff' : '#000', borderRadius: '10px' }} />
                      <Bar dataKey="count" fill="#0d9488" radius={[0, 6, 6, 0]} name="Kasus" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {issue_metrics.slice(0, 5).map((iss, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isEmerald ? 'bg-emerald-900/60 border-emerald-700' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                        <span className={`font-semibold ${isEmerald ? 'text-slate-200' : 'text-slate-800'}`}>{iss.issue}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                  isEmerald ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' : 'bg-teal-50 text-teal-800 border-teal-200'
                }`}>
                  Slide 6: Rekomendasi Manajemen
                </span>
                <h2 className={`text-2xl sm:text-3xl font-black mt-1 ${isEmerald ? 'text-white' : 'text-slate-900'}`}>
                  Rencana Aksi Strategis Percepatan Klaim RSUD R. Syamsudin, SH
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isEmerald ? 'bg-emerald-900/70 border-teal-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black mb-3 shadow">
                      1
                    </div>
                    <h3 className={`font-bold text-sm mb-2 ${isEmerald ? 'text-white' : 'text-teal-950'}`}>
                      Penegakan SLA Resume & TTD DPJP
                    </h3>
                    <p className={`text-xs leading-relaxed ${isEmerald ? 'text-emerald-100/80' : 'text-slate-600'}`}>
                      Menetapkan batas waktu pengisian Resume Medis dan Tanda Tangan DPJP maksimal 1x24 jam pasca pasien pulang untuk memangkas antrian berkas pending.
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                    Target: Penurunan Delay 50%
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isEmerald ? 'bg-emerald-900/70 border-teal-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black mb-3 shadow">
                      2
                    </div>
                    <h3 className={`font-bold text-sm mb-2 ${isEmerald ? 'text-white' : 'text-teal-950'}`}>
                      Integrasi Hasil PA & Penunjang Medis
                    </h3>
                    <p className={`text-xs leading-relaxed ${isEmerald ? 'text-emerald-100/80' : 'text-slate-600'}`}>
                      Mempercepat proses digitalisasi upload hasil Patologi Anatomi (PA), CT Scan, dan Echo ke RME agar koding definitif tidak tertunda berminggu-minggu.
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                    Target: Nol Pending Hasil PA
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isEmerald ? 'bg-emerald-900/70 border-teal-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black mb-3 shadow">
                      3
                    </div>
                    <h3 className={`font-bold text-sm mb-2 ${isEmerald ? 'text-white' : 'text-teal-950'}`}>
                      Optimalisasi Peran Case Manager
                    </h3>
                    <p className={`text-xs leading-relaxed ${isEmerald ? 'text-emerald-100/80' : 'text-slate-600'}`}>
                      Memperkuat supervisi harian Case Manager di ruangan asuhan untuk proaktif menyelesaikan dispute klinis sebelum berkas diserahkan ke tim koder.
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                    Target: Akurasi Klaim &gt;95%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide Footer with Official RSUD Tagline */}
        <div className={`flex items-center justify-between pt-3 text-xs border-t ${
          isEmerald ? 'border-teal-700 text-emerald-200/70' : 'border-teal-100 text-slate-500'
        }`}>
          <p className="flex items-center gap-1 font-medium">
            <Sparkles size={14} className="text-teal-600" />
            Aplikasi Case Manager Pro • UOBK RSUD R. Syamsudin, S.H. Kota Sukabumi
          </p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx + 1)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx + 1 ? 'w-6 bg-teal-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Menuju Slide ${idx + 1}`}
              />
            ))}
          </div>
          <p className="font-mono font-bold text-teal-700">
            {currentSlide} / {totalSlides}
          </p>
        </div>
      </div>
    </div>
  );
}
