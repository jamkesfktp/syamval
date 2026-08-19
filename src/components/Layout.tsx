import { useState, type ReactNode } from 'react';
import type { TabKey } from '../types';
import TabNavigation from './TabNavigation';
import { Menu, X, Printer, Hospital, Upload } from 'lucide-react';
import { useRef } from 'react';

interface LayoutProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  reportPeriod: string;
  onFileUpload?: (files: File[]) => void;
  children: ReactNode;
}

export default function Layout({ activeTab, onTabChange, reportPeriod, onFileUpload, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(Array.from(files));
    }
  };

  return (
    <div className="print-layout flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          'fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[#0f172a] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hospital size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">RSUD</p>
              <p className="text-sm font-bold text-white leading-tight">Dashboard Casemix</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          <p className="px-6 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </p>
          <TabNavigation
            activeTab={activeTab}
            onTabChange={onTabChange}
            onMobileClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Sidebar Footer */}
        <div className="px-5 py-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">Periode Laporan</p>
          <p className="text-sm font-semibold text-slate-300">{reportPeriod}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 print:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept=".xls,.xlsx" 
              className="hidden" 
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Upload size={16} />
              Upload Excel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Printer size={16} />
              Cetak Laporan
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
