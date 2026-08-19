import type { Summary } from '../types';
import { formatNumber, formatCurrency } from '../types';
import { ClipboardCheck, Clock, TrendingUp, Target, DollarSign } from 'lucide-react';

interface KpiCardsProps {
  summary: Summary;
}

const cards: {
  key: keyof Summary;
  label: string;
  icon: typeof ClipboardCheck;
  format: (v: number) => string;
  color: string;
  bgColor: string;
  suffix?: string;
}[] = [
  {
    key: 'total_all',
    label: 'Total Klaim',
    icon: ClipboardCheck,
    format: formatNumber,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    key: 'total_coded',
    label: 'Klaim Selesai',
    icon: TrendingUp,
    format: formatNumber,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    key: 'total_pending',
    label: 'Klaim Pending',
    icon: Clock,
    format: formatNumber,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    key: 'completion_rate',
    label: 'Tingkat Penyelesaian',
    icon: TrendingUp,
    format: (v) => v.toFixed(1),
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    suffix: '%',
  },
  {
    key: 'overall_accuracy',
    label: 'Akurasi Keseluruhan',
    icon: Target,
    format: (v) => v.toFixed(1),
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    suffix: '%',
  },
  {
    key: 'total_realcost',
    label: 'Total Realcost',
    icon: DollarSign,
    format: formatCurrency,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function KpiCards({ summary }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key] as number;
        return (
          <div
            key={card.key}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${card.color} truncate`}>
                  {card.format(value)}
                  {card.suffix}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-lg ${card.bgColor} flex items-center justify-center flex-shrink-0 ml-3`}>
                <Icon size={22} className={card.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
