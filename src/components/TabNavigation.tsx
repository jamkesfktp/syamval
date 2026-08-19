import type { TabKey } from '../types';
import {
  LayoutDashboard,
  UserCog,
  Users,
  Building2,
  Gauge,
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onMobileClose?: () => void;
}

const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
  { key: 'kinerja-koder', label: 'Kinerja Koder', icon: UserCog },
  { key: 'kinerja-cm', label: 'Kinerja Case Manager', icon: Users },
  { key: 'distribusi-ruangan', label: 'Distribusi Ruangan', icon: Building2 },
  { key: 'kecepatan-akurasi', label: 'Kecepatan & Akurasi', icon: Gauge },
];

export default function TabNavigation({ activeTab, onTabChange, onMobileClose }: TabNavigationProps) {
  return (
    <nav className="flex flex-col gap-1 px-3">
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
            className={
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left w-full ' +
              (isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white')
            }
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
