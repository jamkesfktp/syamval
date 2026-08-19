import type { DashboardData } from '../types';
import { AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function IssueTracker({ data }: { data: DashboardData }) {
  const issues = data.issue_metrics || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-lg text-amber-600 mt-1">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Issue Tracker (Pemetaan Kendala)</h2>
          <p className="text-gray-600 text-sm mt-1">
            Menganalisis kolom <strong>Catatan Casemix</strong> untuk mengidentifikasi penyebab utama klaim berstatus pending atau tidak layak.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Grafik Kendala Terbanyak</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={issues.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="issue" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Jumlah Kasus" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Daftar Kendala</h3>
          </div>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-medium">Jenis Kendala</th>
                  <th className="px-6 py-3 font-medium text-right">Frekuensi (Kasus)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {issues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{issue.issue}</td>
                    <td className="px-6 py-3 text-right font-medium text-amber-600">
                      {issue.count}
                    </td>
                  </tr>
                ))}
                {issues.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data kendala ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
