import { useState } from 'react';
import type { DashboardData } from '../types';
import { Clock, AlertCircle, ChevronRight } from 'lucide-react';
import DrilldownModal from './DrilldownModal';

export default function BottleneckAnalysis({ data }: { data: DashboardData }) {
  const [selectedDrilldown, setSelectedDrilldown] = useState<{ title: string; subtitle: string; claims: any[] } | null>(null);

  const topRooms = [...data.room_metrics]
    .filter(r => (r.total_coded ?? 0) > 0)
    .sort((a, b) => (b.avg_delay_days ?? b.avg_delay_hours ?? 0) - (a.avg_delay_days ?? a.avg_delay_hours ?? 0))
    .slice(0, 5);

  const topCoders = [...data.coder_metrics]
    .filter(c => (c.total_claims ?? 0) > 0)
    .sort((a, b) => (b.avg_delay_days ?? b.avg_delay_hours ?? 0) - (a.avg_delay_days ?? a.avg_delay_hours ?? 0))
    .slice(0, 5);

  const topCms = [...data.cm_metrics]
    .filter(cm => (cm.total_coded ?? 0) > 0)
    .sort((a, b) => (b.avg_delay_days ?? b.avg_delay_hours ?? 0) - (a.avg_delay_days ?? a.avg_delay_hours ?? 0))
    .slice(0, 5);

  const formatDays = (days: number) => {
    if (!days || days <= 0) return '0 Hari';
    if (Number.isInteger(days)) return `${days} Hari`;
    return `${days.toFixed(1)} Hari`;
  };

  const handleRowClick = (type: 'room' | 'coder' | 'cm', name: string) => {
    if (!data.raw_claims) return;
    let filtered: any[] = [];
    let title = '';
    let subtitle = '';

    if (type === 'room') {
      filtered = data.raw_claims.filter(c => (c['Poli/Ruangan'] || c._room || '').toLowerCase() === name.toLowerCase());
      title = `Ruangan: ${name}`;
      subtitle = 'Daftar klaim pasien di ruangan ini untuk evaluasi keterlambatan';
    } else if (type === 'coder') {
      filtered = data.raw_claims.filter(c => (c['Nama Coder'] || c._coder || '').toLowerCase() === name.toLowerCase());
      title = `Koder: ${name}`;
      subtitle = 'Daftar klaim yang ditangani koder ini';
    } else if (type === 'cm') {
      filtered = data.raw_claims.filter(c => (c._cm || '').toLowerCase().includes(name.toLowerCase()));
      title = `Case Manager: ${name}`;
      subtitle = 'Daftar pasien di bawah supervisi Case Manager ini';
    }

    setSelectedDrilldown({ title, subtitle, claims: filtered });
  };

  const renderTable = (title: string, items: any[], nameKey: string, type: 'room' | 'coder' | 'cm') => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-w-[320px]">
      <div className="bg-orange-50/70 px-4 py-3 border-b border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="text-orange-600" size={18} />
          <h3 className="font-bold text-orange-950 text-xs sm:text-sm">{title}</h3>
        </div>
        <span className="text-[10px] bg-orange-200/60 text-orange-900 font-bold px-2 py-0.5 rounded-full">
          Top 5 Delay
        </span>
      </div>
      <div className="p-0">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Nama</th>
              <th className="px-4 py-2.5 font-semibold text-right">Rata-rata</th>
              <th className="px-4 py-2.5 font-semibold text-right">Maksimal</th>
              <th className="px-3 py-2.5 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr 
                key={idx} 
                onClick={() => handleRowClick(type, item[nameKey])}
                className="hover:bg-orange-50/40 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 font-semibold text-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate group-hover:text-teal-700">{item[nameKey]}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium text-gray-600">
                  {formatDays(item.avg_delay_days || 0)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-red-600 font-bold">
                  {formatDays(item.max_delay_days || 0)}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-teal-600 font-bold text-[11px] group-hover:underline flex items-center justify-center">
                    Detail <ChevronRight size={12} />
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-xl text-red-600 mt-1 shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Evaluasi Keterlambatan Pengerjaan (Bottleneck Lead Time)</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">
            Menampilkan <strong>Top 5</strong> kontributor waktu tunggu terlama dari saat pasien pulang sampai klaim dientri koding.
            Klik pada baris mana pun untuk langsung melakukan <strong>Drilldown data pasien</strong> serta mengekspornya ke Excel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {renderTable('Top 5 Ruangan Paling Lambat', topRooms, 'name', 'room')}
        {renderTable('Top 5 Koder Paling Lambat', topCoders, 'name', 'coder')}
        {renderTable('Top 5 Case Manager Paling Lambat', topCms, 'name', 'cm')}
      </div>

      {/* Drilldown Modal */}
      {selectedDrilldown && (
        <DrilldownModal
          title={selectedDrilldown.title}
          subtitle={selectedDrilldown.subtitle}
          claims={selectedDrilldown.claims}
          isOpen={true}
          onClose={() => setSelectedDrilldown(null)}
        />
      )}
    </div>
  );
}
