import type { DashboardData } from '../types';
import { Clock, AlertCircle } from 'lucide-react';

export default function BottleneckAnalysis({ data }: { data: DashboardData }) {
  const topRooms = [...data.room_metrics]
    .sort((a, b) => b.avg_delay_hours - a.avg_delay_hours)
    .slice(0, 5);

  const topCoders = [...data.coder_metrics]
    .sort((a, b) => b.avg_delay_hours - a.avg_delay_hours)
    .slice(0, 5);

  const topCms = [...data.cm_metrics]
    .sort((a, b) => b.avg_delay_hours - a.avg_delay_hours)
    .slice(0, 5);

  const formatDays = (hours: number) => {
    const d = Math.floor(hours / 24);
    const h = Math.round(hours % 24);
    return `${d > 0 ? d + ' hari ' : ''}${h} jam`;
  };

  const renderTable = (title: string, items: any[], nameKey: string) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-w-[300px]">
      <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center gap-2">
        <Clock className="text-orange-600" size={18} />
        <h3 className="font-semibold text-orange-900">{title}</h3>
      </div>
      <div className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium text-right">Rata-rata Delay</th>
              <th className="px-4 py-3 font-medium text-right">Max Delay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    {item[nameKey]}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {formatDays(item.avg_delay_hours)}
                </td>
                <td className="px-4 py-3 text-right text-red-600 font-medium">
                  {formatDays(item.max_delay_hours)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  Data tidak tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-lg text-red-600 mt-1">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Evaluasi Keterlambatan (Lead Time)</h2>
          <p className="text-gray-600 text-sm mt-1">
            Menampilkan 5 penyumbang keterlambatan terbesar (Bottleneck) dari saat pasien pulang hingga data dientri oleh koder.
            Angka dihitung berdasarkan selisih waktu <strong>Tanggal Keluar</strong> dengan <strong>Tanggal Input Coding</strong>.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {renderTable('Top 5 Ruangan Paling Lambat', topRooms, 'name')}
        {renderTable('Top 5 Koder Paling Lambat', topCoders, 'name')}
        {renderTable('Top 5 Case Manager Paling Lambat', topCms, 'name')}
      </div>
    </div>
  );
}
