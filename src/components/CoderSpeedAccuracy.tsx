import { useState } from 'react';
import type { CoderMetric } from '../types';
import { formatNumber, formatCurrency, getAccuracyBadge } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Zap, Clock, Target, ChevronRight } from 'lucide-react';
import DrilldownModal from './DrilldownModal';

interface CoderSpeedAccuracyProps {
  coderMetrics: CoderMetric[];
  rawClaims?: Record<string, any>[];
}

export default function CoderSpeedAccuracy({ coderMetrics, rawClaims }: CoderSpeedAccuracyProps) {
  const [selectedCoder, setSelectedCoder] = useState<string | null>(null);

  // Urutkan dari yang tercepat (avg_delay_days terendah) sampai terlambat
  const activeCoders = [...coderMetrics]
    .filter((c) => (c.total_claims ?? 0) > 0)
    .sort((a, b) => (a.avg_delay_days ?? a.avg_delay_hours ?? 0) - (b.avg_delay_days ?? b.avg_delay_hours ?? 0));

  const delayData = activeCoders.map((c) => ({
    name: c.short_name,
    fullName: c.name,
    'Rata-rata Delay (Hari)': Number((c.avg_delay_days ?? c.avg_delay_hours ?? 0).toFixed(1)),
    'Max Delay (Hari)': Number((c.max_delay_days ?? c.max_delay_hours ?? 0).toFixed(1)),
  }));

  const accuracyData = activeCoders.map((c) => ({
    name: c.short_name,
    fullName: c.name,
    accuracy: Number((c.accuracy ?? 0).toFixed(1)),
  }));

  const getFilteredClaims = () => {
    if (!selectedCoder || !rawClaims) return [];
    return rawClaims.filter(
      (c) =>
        String(c['Nama Coder'] || c._coder || '').toLowerCase() === selectedCoder.toLowerCase() ||
        String(c._coder || '').toLowerCase().includes(selectedCoder.toLowerCase())
    );
  };

  const avgCoderSpeed = activeCoders.length > 0
    ? activeCoders.reduce((acc, c) => acc + (c.avg_delay_days ?? c.avg_delay_hours ?? 0), 0) / activeCoders.length
    : 0;

  const avgCoderAcc = activeCoders.length > 0
    ? activeCoders.reduce((acc, c) => acc + (c.accuracy ?? 0), 0) / activeCoders.length
    : 0;

  const maxCoderDelay = activeCoders.length > 0
    ? Math.max(...activeCoders.map((c) => c.max_delay_days ?? c.max_delay_hours ?? 0))
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Rata-rata Kecepatan Koder</p>
            <p className="text-xl font-bold text-gray-900">
              {avgCoderSpeed.toFixed(1)} Hari
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Rata-rata Akurasi Koder</p>
            <p className="text-xl font-bold text-gray-900">
              {avgCoderAcc.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Max Delay Terlama</p>
            <p className="text-xl font-bold text-amber-600">
              {maxCoderDelay.toFixed(1)} Hari
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kecepatan Input Coding Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Kecepatan & Waktu Tunggu Koder (Hari)</h3>
              <p className="text-xs text-gray-400">Tanggal Input Coding − Tanggal Keluar (dibulatkan ke hari penuh)</p>
            </div>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
              Koder
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} hari`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Rata-rata Delay (Hari)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Max Delay (Hari)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Akurasi Koder Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Tingkat Akurasi Koder (%)</h3>
              <p className="text-xs text-gray-400">Persentase klaim koding tanpa catatan revisi</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Target &gt;90%
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value}%`, 'Akurasi']}
                />
                <Bar dataKey="accuracy" name="Akurasi (%)" radius={[4, 4, 0, 0]}>
                  {accuracyData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.accuracy >= 90 ? '#10b981' : entry.accuracy >= 70 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Table with Drilldown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Rincian Kinerja Koder (Klik Baris untuk Drilldown)</h3>
            <p className="text-xs text-gray-400">Klik pada nama koder untuk melihat daftar detail klaim pasien terkait</p>
          </div>
          <span className="text-xs text-teal-600 bg-teal-50 font-semibold px-2.5 py-1 rounded-lg">
            {coderMetrics.length} Koder Aktif
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50/80 text-gray-500 uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold text-center w-12">#</th>
                <th className="py-3 px-4 font-semibold">Nama Koder</th>
                <th className="py-3 px-4 font-semibold text-right">Total Klaim</th>
                <th className="py-3 px-4 font-semibold text-right">Bermasalah</th>
                <th className="py-3 px-4 font-semibold text-right">Akurasi</th>
                <th className="py-3 px-4 font-semibold text-right">Rata-rata Delay</th>
                <th className="py-3 px-4 font-semibold text-right">Max Delay</th>
                <th className="py-3 px-4 font-semibold text-right">Total Realcost</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeCoders.map((coder, idx) => (
                <tr
                  key={coder.name}
                  onClick={() => setSelectedCoder(coder.name)}
                  className="hover:bg-teal-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 text-center font-bold text-gray-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500 group-hover:scale-125 transition-transform" />
                    {coder.name}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-gray-700">
                    {formatNumber(coder.total_claims)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={coder.with_issues > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}>
                      {formatNumber(coder.with_issues)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${getAccuracyBadge(coder.accuracy ?? 0)}`}>
                      {(coder.accuracy ?? 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-teal-700 font-semibold">
                    {(coder.avg_delay_days ?? coder.avg_delay_hours ?? 0).toFixed(1)} Hari
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-600 font-semibold">
                    {(coder.max_delay_days ?? coder.max_delay_hours ?? 0).toFixed(1)} Hari
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-gray-800 whitespace-nowrap">
                    {formatCurrency(coder.total_realcost)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-teal-600 hover:text-teal-800 font-semibold text-xs flex items-center justify-center gap-1 mx-auto">
                      Detail <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drilldown Modal */}
      {selectedCoder && (
        <DrilldownModal
          title={`Klaim Pasien: ${selectedCoder}`}
          subtitle="Daftar klaim yang dikerjakan oleh koder ini beserta status dan catatan kendala"
          claims={getFilteredClaims()}
          isOpen={true}
          onClose={() => setSelectedCoder(null)}
        />
      )}
    </div>
  );
}
