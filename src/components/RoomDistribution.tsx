import type { RoomMetric } from '../types';
import { formatNumber, formatCurrency } from '../types';
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

interface RoomDistributionProps {
  roomMetrics: RoomMetric[];
}

export default function RoomDistribution({ roomMetrics }: RoomDistributionProps) {
  const sortedRooms = [...roomMetrics].sort((a, b) => (b.total_coded + b.total_pending) - (a.total_coded + a.total_pending));
  const top15 = sortedRooms.slice(0, 15);

  const chartData = top15.map((room) => ({
    name: room.name.length > 18 ? room.name.substring(0, 18) + '...' : room.name,
    'Selesai': room.total_coded,
    'Pending': room.total_pending,
  }));

  return (
    <div className="space-y-6">
      {/* Distribusi Klaim per Ruangan Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Distribusi Klaim per Ruangan (Top 15)</h3>
        <div className="h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
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

      {/* Tabel Detail Ruangan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Tabel Detail Ruangan</h3>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Ruangan</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">SMF</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Koder</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Case Manager</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">PIC</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Selesai</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Pending</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Bermasalah</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-600">Total Realcost</th>
              </tr>
            </thead>
            <tbody>
              {sortedRooms.map((room, idx) => (
                <tr
                  key={room.name}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <td className="py-3 px-3 font-medium text-gray-800 whitespace-nowrap">{room.name}</td>
                  <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{room.smf || '-'}</td>
                  <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{room.coder || '-'}</td>
                  <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{room.case_manager || '-'}</td>
                  <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{room.pic || '-'}</td>
                  <td className="py-3 px-3 text-right text-gray-700">{formatNumber(room.total_coded)}</td>
                  <td className="py-3 px-3 text-right text-amber-600 font-medium">{formatNumber(room.total_pending)}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={room.with_issues > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {formatNumber(room.with_issues)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{formatCurrency(room.total_realcost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
