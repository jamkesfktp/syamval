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
  Cell,
} from 'recharts';

interface CaseManagerPerformanceProps {
  cmMetrics: CmMetric[];
}

function getAccuracyFillColor(accuracy: number): string {
  if (accuracy >= 90) return '#22c55e';
  if (accuracy >= 70) return '#f59e0b';
  return '#ef4444';
}

export default function CaseManagerPerformance({ cmMetrics }: CaseManagerPerformanceProps) {
  const activeCms = cmMetrics.filter((cm) => cm.total_all > 0);

  const performanceData = activeCms.map((cm) => ({
    name: cm.name,
    'Selesai': cm.total_coded,
    'Pending': cm.total_pending,
  }));

  const accuracyData = activeCms.map((cm) => ({
    name: cm.name,
    accuracy: cm.accuracy,
    'Penyelesaian (%)': cm.completion_rate,
  }));

  return (
    <div className="space-y-6">
      {/* Kinerja Case Manager Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Kinerja Case Manager</h3>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
              <Bar dataKey="Selesai" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Akurasi per Case Manager - Horizontal Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Akurasi per Case Manager (%)</h3>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={accuracyData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={75} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [Number(value).toFixed(1) + '%']}
              />
              <Bar dataKey="accuracy" name="Akurasi (%)" radius={[0, 4, 4, 0]}>
                {accuracyData.map((entry, index) => (
                  <Cell key={index} fill={getAccuracyFillColor(entry.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Detail Case Manager */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Tabel Detail Kinerja Case Manager</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Nama CM</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Ruangan</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Total</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Selesai</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Pending</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Bermasalah</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Akurasi</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Penyelesaian</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Total Realcost</th>
              </tr>
            </thead>
            <tbody>
              {activeCms.map((cm, idx) => (
                <tr
                  key={cm.name}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <td className="py-3 px-3 font-medium text-gray-800 whitespace-nowrap">{cm.name}</td>
                  <td className="py-3 px-3 text-gray-600 text-xs max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {cm.rooms.map((room) => (
                        <span
                          key={room}
                          className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px]"
                        >
                          {room}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700">{formatNumber(cm.total_all)}</td>
                  <td className="py-3 px-3 text-right text-gray-700">{formatNumber(cm.total_coded)}</td>
                  <td className="py-3 px-3 text-right text-amber-600 font-medium">{formatNumber(cm.total_pending)}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={cm.with_issues > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {formatNumber(cm.with_issues)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getAccuracyBadge(cm.accuracy)}`}
                    >
                      {cm.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700">{cm.completion_rate.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{formatCurrency(cm.total_realcost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
