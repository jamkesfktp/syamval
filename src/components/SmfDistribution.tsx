import type { SmfDistribution } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SmfDistributionProps {
  smfData: SmfDistribution;
}

const COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#06b6d4', '#d946ef', '#eab308',
];

export default function SmfDistribution({ smfData }: SmfDistributionProps) {
  const chartData = Object.entries(smfData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Distribusi SMF</h3>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2 h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any, name: any) => [
                  `${Number(value)} klaim (${((Number(value) / total) * 100).toFixed(1)}%)`,
                  String(name),
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-1/2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-600">SMF</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-600">Jumlah</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-600">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, idx) => (
                <tr
                  key={item.name}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="py-2 px-2 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-gray-800 whitespace-nowrap">{item.name}</span>
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700">{item.value}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{((item.value / total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-semibold">
                <td className="py-2 px-2 text-gray-800">Total</td>
                <td className="py-2 px-2 text-right text-gray-800">{total}</td>
                <td className="py-2 px-2 text-right text-gray-800">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
