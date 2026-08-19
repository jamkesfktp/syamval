import { useState } from 'react';
import type { CmMetric } from '../types';
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
} from 'recharts';
import { Users, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import DrilldownModal from './DrilldownModal';

interface CaseManagerSpeedAccuracyProps {
  cmMetrics: CmMetric[];
  rawClaims?: Record<string, any>[];
}

export default function CaseManagerSpeedAccuracy({
  cmMetrics,
  rawClaims,
}: CaseManagerSpeedAccuracyProps) {
  const [selectedCm, setSelectedCm] = useState<string | null>(null);

  const delayData = cmMetrics.map((cm) => ({
    name: cm.name.replace('Dr. ', ''),
    fullName: cm.name,
    'Rata-rata Delay (Hari)': Number((cm.avg_delay_days ?? cm.avg_delay_hours ?? 0).toFixed(1)),
    'Max Delay (Hari)': Number((cm.max_delay_days ?? cm.max_delay_hours ?? 0).toFixed(1)),
  }));

  const completionData = cmMetrics.map((cm) => ({
    name: cm.name.replace('Dr. ', ''),
    fullName: cm.name,
    'Selesai (%)': Number((cm.completion_rate ?? 0).toFixed(1)),
    'Akurasi (%)': Number((cm.accuracy ?? 0).toFixed(1)),
  }));

  const getFilteredClaims = () => {
    if (!selectedCm || !rawClaims) return [];
    return rawClaims.filter(
      (c) =>
        String(c._cm || '').toLowerCase() === selectedCm.toLowerCase() ||
        String(c._cm || '').toLowerCase().includes(selectedCm.toLowerCase())
    );
  };

  const avgCmCompletion = cmMetrics.length > 0
    ? cmMetrics.reduce((acc, c) => acc + (c.completion_rate ?? 0), 0) / cmMetrics.length
    : 0;

  const avgCmDelay = cmMetrics.length > 0
    ? cmMetrics.reduce((acc, c) => acc + (c.avg_delay_days ?? c.avg_delay_hours ?? 0), 0) / cmMetrics.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Dokter Case Manager</p>
            <p className="text-xl font-bold text-gray-900">{cmMetrics.length} Dokter</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Rata-rata Completion Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {avgCmCompletion.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Rata-rata Respon / Delay</p>
            <p className="text-xl font-bold text-amber-600">
              {avgCmDelay.toFixed(1)} Hari
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kecepatan Follow-up CM Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Waktu Tunggu & Keterlambatan per Case Manager (Hari)</h3>
              <p className="text-xs text-gray-400">Durasi rata-rata berkas tertahan di ruangan asuhan hingga selesai koding</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Case Manager
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
                <Bar dataKey="Rata-rata Delay (Hari)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Max Delay (Hari)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion & Akurasi CM Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Tingkat Penyelesaian & Akurasi Klaim (%)</h3>
              <p className="text-xs text-gray-400">Perbandingan persentase berkas selesai vs akurasi tanpa kendala</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Evaluasi
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value}%`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Selesai (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Akurasi (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Table with Drilldown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Tabel Kinerja Case Manager (Klik Baris untuk Drilldown)</h3>
            <p className="text-xs text-gray-400">Klik baris nama dokter untuk meninjau seluruh riwayat pasien & catatan follow-up</p>
          </div>
          <span className="text-xs text-blue-600 bg-blue-50 font-semibold px-2.5 py-1 rounded-lg">
            {cmMetrics.length} Case Manager
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50/80 text-gray-500 uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Case Manager</th>
                <th className="py-3 px-4 font-semibold">Ruangan Asuhan</th>
                <th className="py-3 px-4 font-semibold text-right">Total Klaim</th>
                <th className="py-3 px-4 font-semibold text-right">Selesai</th>
                <th className="py-3 px-4 font-semibold text-right">Pending</th>
                <th className="py-3 px-4 font-semibold text-right">Akurasi</th>
                <th className="py-3 px-4 font-semibold text-right">Rata-rata Delay</th>
                <th className="py-3 px-4 font-semibold text-right">Total Realcost</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cmMetrics.map((cm) => (
                <tr
                  key={cm.name}
                  onClick={() => setSelectedCm(cm.name)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                    {cm.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[220px]">
                    <div className="flex flex-wrap gap-1">
                      {cm.rooms.slice(0, 2).map((r, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600 font-medium">
                          {r}
                        </span>
                      ))}
                      {cm.rooms.length > 2 && (
                        <span className="px-1 py-0.5 rounded bg-gray-200 text-[9px] text-gray-700 font-bold">
                          +{cm.rooms.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-gray-700">
                    {formatNumber(cm.total_all)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">
                    {formatNumber(cm.total_coded)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={cm.total_pending > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}>
                      {formatNumber(cm.total_pending)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${getAccuracyBadge(cm.accuracy ?? 0)}`}>
                      {(cm.accuracy ?? 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-blue-700 font-semibold">
                    {(cm.avg_delay_days ?? cm.avg_delay_hours ?? 0).toFixed(1)} Hari
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-gray-800 whitespace-nowrap">
                    {formatCurrency(cm.total_realcost)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center justify-center gap-1 mx-auto">
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
      {selectedCm && (
        <DrilldownModal
          title={`Klaim Pasien: ${selectedCm}`}
          subtitle="Daftar seluruh pasien asuhan Case Manager ini di berbagai ruangan"
          claims={getFilteredClaims()}
          isOpen={true}
          onClose={() => setSelectedCm(null)}
        />
      )}
    </div>
  );
}
