import type { TabKey } from '../types';
import {
  LayoutDashboard,
  Presentation,
  UserCog,
  Users,
  Building2,
  Hourglass,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onMobileClose?: () => void;
  collapsed?: boolean;
}

const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
  { key: 'presentasi', label: 'Slide Presentasi Manajemen', icon: Presentation },
  { key: 'kinerja-koder', label: 'Kinerja Koder', icon: UserCog },
  { key: 'kinerja-cm', label: 'Kinerja Case Manager', icon: Users },
  { key: 'distribusi-ruangan', label: 'Distribusi Ruangan', icon: Building2 },
  { key: 'kecepatan-koder', label: 'Kecepatan Koder', icon: Zap },
  { key: 'kecepatan-cm', label: 'Kecepatan & Evaluasi CM', icon: Activity },
  { key: 'bottleneck', label: 'Analisis Bottleneck', icon: Hourglass },
  { key: 'kendala', label: 'Issue Tracker', icon: AlertTriangle },
];

export default function TabNavigation({ activeTab, onTabChange, onMobileClose, collapsed }: TabNavigationProps) {
  return (
    <nav className={`flex flex-col gap-1.5 ${collapsed ? 'px-2 items-center' : 'px-3'}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => {
              onTabChange(tab.key);
              onMobileClose?.();
            }}
            title={tab.label}
            className={
              `flex items-center rounded-xl transition-all duration-150 relative group ` +
              (collapsed
                ? 'w-11 h-11 justify-center p-0 '
                : 'gap-3 px-3.5 py-2.5 w-full text-xs font-semibold text-left ') +
              (isActive
                ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-200'
                : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 border border-transparent')
            }
          >
            <Icon
              size={19}
              className={`shrink-0 transition-colors ${
                isActive ? 'text-teal-600' : 'text-gray-500 group-hover:text-gray-700'
              }`}
            />

            {!collapsed ? (
              <span className="truncate">{tab.label}</span>
            ) : (
              /* Floating Tooltip when collapsed */
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
