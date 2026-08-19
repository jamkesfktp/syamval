import type { CoderMetric } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface SpeedAnalysisProps {
  coderMetrics: CoderMetric[];
}

function getDelayColor(hours: number): string {
  if (hours <= 48) return '#22c55e';
  if (hours <= 72) return '#3b82f6';
  if (hours <= 96) return '#f59e0b';
  return '#ef4444';
}

export default function SpeedAnalysis({ coderMetrics }: SpeedAnalysisProps) {
  const sortedByDelay = [...coderMetrics].sort((a, b) => a.avg_delay_hours - b.avg_delay_hours);

  const speedData = sortedByDelay.map((c) => ({
    name: c.short_name,
    'Keterlambatan (jam)': c.avg_delay_hours,
  }));

  const avgDelay =
    coderMetrics.reduce((sum, c) => sum + c.avg_delay_hours, 0) / coderMetrics.length;
  const fastest = sortedByDelay[0];
  const slowest = sortedByDelay[sortedByDelay.length - 1];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Rata-rata Keterlambatan</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{avgDelay.toFixed(1)} <span className="text-sm font-medium">jam</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Tercepat</p>
          <p className="text-lg font-bold text-green-600 mt-1">{fastest.short_name}</p>
          <p className="text-sm text-gray-500">{fastest.avg_delay_hours.toFixed(1)} jam</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Terlambat</p>
          <p className="text-lg font-bold text-red-600 mt-1">{slowest.short_name}</p>
          <p className="text-sm text-gray-500">{slowest.avg_delay_hours.toFixed(1)} jam</p>
        </div>
      </div>

      {/* Speed Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Kecepatan Coding per Koder</h3>
        <p className="text-xs text-gray-500 mb-4">Rata-rata keterlambatan dalam jam (semakin rendah semakin baik)</p>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={speedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12 }} unit=" jam" />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [Number(value).toFixed(1) + ' jam', 'Rata-rata Keterlambatan']}
              />
              <Bar dataKey="Keterlambatan (jam)" radius={[4, 4, 0, 0]}>
                {speedData.map((entry, index) => (
                  <Cell key={index} fill={getDelayColor(entry['Keterlambatan (jam)'])} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500" /> ≤ 48 jam</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500" /> 48-72 jam</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> 72-96 jam</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500" /> &gt; 96 jam</span>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Tabel Kecepatan Coding</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Peringkat</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Koder</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Rata-rata Keterlambatan</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Total Klaim</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedByDelay.map((coder, idx) => {
                const color = getDelayColor(coder.avg_delay_hours);
                const statusLabel =
                  coder.avg_delay_hours <= 48
                    ? 'Sangat Baik'
                    : coder.avg_delay_hours <= 72
                      ? 'Baik'
                      : coder.avg_delay_hours <= 96
                        ? 'Perlu Perhatian'
                        : 'Perlu Perbaikan';
                return (
                  <tr
                    key={coder.name}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                  >
                    <td className="py-3 px-3 text-gray-700 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-gray-800 whitespace-nowrap">{coder.short_name}</td>
                    <td className="py-3 px-3 text-right font-semibold" style={{ color }}>{coder.avg_delay_hours.toFixed(1)} jam</td>
                    <td className="py-3 px-3 text-right text-gray-700">{coder.total_claims}</td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: color + '20',
                          color,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
