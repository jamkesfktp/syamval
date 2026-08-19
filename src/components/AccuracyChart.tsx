import type { CoderMetric, CmMetric, PicMetric } from '../types';
import { formatNumber } from '../types';
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

interface AccuracyChartProps {
  coderMetrics: CoderMetric[];
  cmMetrics: CmMetric[];
  picMetrics: PicMetric[];
  overallAccuracy: number;
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return '#22c55e';
  if (accuracy >= 70) return '#f59e0b';
  return '#ef4444';
}

function getAccuracyBg(accuracy: number): string {
  if (accuracy >= 90) return 'bg-green-50 border-green-200';
  if (accuracy >= 70) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

export default function AccuracyChart({ coderMetrics, cmMetrics, picMetrics, overallAccuracy }: AccuracyChartProps) {
  // Combined accuracy data for all roles
  const allAccuracy = [
    ...coderMetrics.map((c) => ({ role: 'Koder', name: c.short_name, accuracy: c.accuracy })),
    ...cmMetrics
      .filter((cm) => cm.total_all > 0)
      .map((cm) => ({ role: 'Case Manager', name: cm.name, accuracy: cm.accuracy })),
    ...picMetrics.map((p) => ({ role: 'PIC', name: p.name, accuracy: p.accuracy })),
  ];

  allAccuracy.sort((a, b) => b.accuracy - a.accuracy);

  // PIC chart data
  const picData = picMetrics.map((p) => ({
    name: p.name,
    'Akurasi (%)': p.accuracy,
    'Total Klaim': p.total_coded,
    'Bermasalah': p.with_issues,
  }));

  return (
    <div className="space-y-6">
      {/* Overall Accuracy Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Ringkasan Akurasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Akurasi Keseluruhan</p>
            <p className={`text-3xl font-bold mt-1 ${getAccuracyColor(overallAccuracy)}`}>
              {overallAccuracy.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Rata-rata Akurasi Koder</p>
            <p className="text-3xl font-bold mt-1 text-blue-600">
              {(coderMetrics.reduce((s, c) => s + c.accuracy, 0) / coderMetrics.length).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Rata-rata Akurasi CM</p>
            {(() => {
              const activeCms = cmMetrics.filter((cm) => cm.total_all > 0);
              const avg = activeCms.length > 0
                ? activeCms.reduce((s, cm) => s + cm.accuracy, 0) / activeCms.length
                : 0;
              return <p className="text-3xl font-bold mt-1 text-purple-600">{avg.toFixed(1)}%</p>;
            })()}
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-gray-500">Rata-rata Akurasi PIC</p>
            <p className="text-3xl font-bold mt-1 text-teal-600">
              {(picMetrics.reduce((s, p) => s + p.accuracy, 0) / picMetrics.length).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* PIC Accuracy Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Akurasi per PIC</h3>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={picData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any, name: any) => {
                  if (String(name) === 'Akurasi (%)') return [Number(value).toFixed(1) + '%', String(name)];
                  return [formatNumber(Number(value)), String(name)];
                }}
              />
              <Bar dataKey="Akurasi (%)" radius={[4, 4, 0, 0]}>
                {picData.map((entry, index) => (
                  <Cell key={index} fill={getAccuracyColor(entry['Akurasi (%)'])} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Accuracy Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Peringkat Akurasi Semua Peran</h3>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-600">#</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Peran</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Nama</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Akurasi</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {allAccuracy.map((item, idx) => (
                <tr
                  key={item.role + '-' + item.name}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <td className="py-2.5 px-3 text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={
                        item.role === 'Koder'
                          ? 'bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium'
                          : item.role === 'Case Manager'
                            ? 'bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium'
                            : 'bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-medium'
                      }
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-800 whitespace-nowrap">{item.name}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-bold" style={{ color: getAccuracyColor(item.accuracy) }}>
                      {item.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getAccuracyBg(item.accuracy)}`}>
                      {item.accuracy >= 90 ? 'Baik' : item.accuracy >= 70 ? 'Cukup' : 'Perlu Perbaikan'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
