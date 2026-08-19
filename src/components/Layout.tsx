import { useState, type ReactNode } from 'react';
import type { TabKey } from '../types';
import TabNavigation from './TabNavigation';
import { Menu, X, Printer, Upload, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useRef } from 'react';
import exportPptx from '../utils/exportPptx';
// import { exportDocx } from '../utils/exportDocx'; // Will implement soon

interface LayoutProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  reportPeriod: string;
  onFileUpload?: (files: File[]) => void;
  children: ReactNode;
}

export default function Layout({ activeTab, onTabChange, reportPeriod, onFileUpload, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => window.print();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(Array.from(files));
    }
  };

  const handleExportPptx = async () => {
    try {
      await exportPptx(activeTab);
    } catch (e) {
      console.error(e);
      alert('Gagal export PPTX');
    }
  };

  return (
    <div className="print-layout flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-[80px] w-[280px]' : 'w-[280px]'}`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center px-4 py-4 border-b border-gray-100 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-1.5 w-full text-center">
              <div className="bg-white p-1 rounded-xl shadow-xs border border-gray-100 flex items-center justify-center">
                <img 
                  src="/logo-rsud.png" 
                  alt="Logo RSUD R. Syamsudin" 
                  className="h-16 w-auto object-contain" 
                  onError={(e) => e.currentTarget.style.display='none'} 
                />
              </div>
              <div className="text-left w-full mt-1">
                <p className="text-xs font-black text-teal-950 uppercase tracking-tight leading-tight">
                  Aplikasi Case Manager Pro
                </p>
                <p className="text-[10px] text-teal-700 font-bold uppercase mt-0.5">
                  UOBK RSUD R. Syamsudin, S.H.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center p-1 border border-teal-200">
              <img 
                src="/logo-rsud.png" 
                alt="Logo RSUD" 
                className="h-8 w-auto object-contain" 
                onError={(e) => e.currentTarget.style.display='none'} 
              />
            </div>
          )}
          
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="px-6 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Menu Utama
            </p>
          )}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={onTabChange}
            onMobileClose={() => setMobileMenuOpen(false)}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Sidebar Footer */}
        <div className={`px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center ${sidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
          {!sidebarCollapsed ? (
            <div>
              <p className="text-xs text-gray-500 font-medium">Periode</p>
              <p className="text-sm font-bold text-gray-800 truncate w-48" title={reportPeriod}>{reportPeriod}</p>
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center font-bold" title={reportPeriod}>
              ...
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 print:hidden z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                Aplikasi Case Manager Pro
              </h2>
              <span className="hidden md:inline-block text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                UOBK RSUD R. Syamsudin, S.H.
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept=".xls,.xlsx" 
              className="hidden" 
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
               <button
                onClick={handleExportPptx}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-white hover:shadow-sm transition-all text-orange-600"
                title="Export ke PowerPoint"
              >
                <Download size={14} />
                PPTX
              </button>
              {/* <button
                onClick={() => {}}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-white hover:shadow-sm transition-all text-blue-600"
                title="Export ke Word"
              >
                <Download size={14} />
                DOCX
              </button> */}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Upload Excel</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div id="exportable-content" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          {children}
        </div>
      </main>
    </div>
  );
}
