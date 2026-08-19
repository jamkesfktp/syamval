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

interface CoderPerformanceProps {
  coderMetrics: CoderMetric[];
}

function getAccuracyFillColor(accuracy: number): string {
  if (accuracy >= 90) return '#22c55e';
  if (accuracy >= 70) return '#f59e0b';
  return '#ef4444';
}

export default function CoderPerformance({ coderMetrics }: CoderPerformanceProps) {
  const claimsData = coderMetrics.map((c) => ({
    name: c.short_name,
    'Total Klaim': c.total_claims,
    'Bermasalah': c.with_issues,
  }));

  const accuracyData = coderMetrics.map((c) => ({
    name: c.short_name,
    accuracy: c.accuracy,
  }));

  return (
    <div className="space-y-6">
      {/* Klaim per Koder Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Klaim per Koder</h3>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={claimsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => formatNumber(Number(value))}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Total Klaim" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Bermasalah" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Akurasi per Koder Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Akurasi per Koder (%)</h3>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [Number(value).toFixed(1) + '%', 'Akurasi']}
              />
              <Bar dataKey="accuracy" name="Akurasi (%)" radius={[4, 4, 0, 0]}>
                {accuracyData.map((entry, index) => (
                  <Cell key={index} fill={getAccuracyFillColor(entry.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Detail Koder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Tabel Detail Kinerja Koder</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Nama Koder</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Total Klaim</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Bermasalah</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Catatan CM</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Akurasi</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Rata-rata Keterlambatan</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Total Realcost</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Rata-rata Realcost</th>
              </tr>
            </thead>
            <tbody>
              {coderMetrics.map((coder, idx) => (
                <tr
                  key={coder.name}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <td className="py-3 px-3 font-medium text-gray-800 whitespace-nowrap">
                    {coder.short_name}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700">{formatNumber(coder.total_claims)}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={coder.with_issues > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {formatNumber(coder.with_issues)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700">{formatNumber(coder.with_cm_notes)}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getAccuracyBadge(coder.accuracy)}`}
                    >
                      {coder.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700">{coder.avg_delay_hours.toFixed(1)} jam</td>
                  <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{formatCurrency(coder.total_realcost)}</td>
                  <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{formatCurrency(coder.avg_realcost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
