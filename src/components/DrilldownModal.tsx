import { useState } from 'react';
import { X, Search, FileText, CheckCircle2, AlertCircle, Clock, Download } from 'lucide-react';
import { formatCurrency } from '../types';

import * as XLSX from 'xlsx';

interface DrilldownModalProps {
  title: string;
  subtitle?: string;
  claims: Record<string, any>[];
  isOpen: boolean;
  onClose: () => void;
}

export default function DrilldownModal({
  title,
  subtitle,
  claims,
  isOpen,
  onClose,
}: DrilldownModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'coded' | 'pending' | 'issues'>('all');

  if (!isOpen) return null;

  const filteredClaims = claims.filter((row) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      String(row['Nama Pasien'] || '').toLowerCase().includes(searchLower) ||
      String(row['No RM'] || '').toLowerCase().includes(searchLower) ||
      String(row['No SEP'] || '').toLowerCase().includes(searchLower) ||
      String(row['Coding ICD'] || '').toLowerCase().includes(searchLower) ||
      String(row['Dokter'] || '').toLowerCase().includes(searchLower) ||
      String(row['Poli/Ruangan'] || '').toLowerCase().includes(searchLower) ||
      String(row['Catatan Casemix'] || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (statusFilter === 'coded') return row._isCoded;
    if (statusFilter === 'pending') return !row._isCoded;
    if (statusFilter === 'issues') return row._hasIssue;

    return true;
  });

  const totalFilteredCost = filteredClaims.reduce((acc, r) => acc + (r._cost || 0), 0);

  const formatDelay = (days: number) => {
    if (days === undefined || days === null) return '-';
    return `${days} Hari`;
  };

  const handleExportExcel = () => {
    if (filteredClaims.length === 0) return;
    
    // Create clean data table
    const exportData = filteredClaims.map((r, idx) => ({
      'No': idx + 1,
      'No SEP': r['No SEP'] || '-',
      'No RM': r['No RM'] || '-',
      'Nama Pasien': r['Nama Pasien'] || '-',
      'Ruangan': r['Poli/Ruangan'] || r._room || '-',
      'SMF': r._smf || '-',
      'Dokter DPJP': r['Dokter'] || '-',
      'Nama Koder': r['Nama Coder'] || r._coder || '-',
      'Dr. Case Manager': r._cm || '-',
      'Tanggal Masuk': r['Tanggal Masuk'] || '-',
      'Tanggal Keluar': r['Tanggal Keluar'] || '-',
      'Tanggal Input Coding': r['Tanggal input Coding'] || '-',
      'Status Coding': r._isCoded ? 'Selesai' : 'Pending',
      'Coding ICD': r['Coding ICD'] || '-',
      'Tarif / Realcost (Rp)': r._cost || 0,
      'Waktu Penyelesaian (Hari)': r._delayDays || 0,
      'Catatan Casemix': r['Catatan Casemix'] || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto column widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 22 }, // No SEP
      { wch: 12 }, // No RM
      { wch: 28 }, // Nama Pasien
      { wch: 22 }, // Ruangan
      { wch: 18 }, // SMF
      { wch: 25 }, // Dokter
      { wch: 15 }, // Koder
      { wch: 18 }, // CM
      { wch: 14 }, // Tgl Masuk
      { wch: 14 }, // Tgl Keluar
      { wch: 18 }, // Tgl Input
      { wch: 14 }, // Status
      { wch: 14 }, // ICD
      { wch: 20 }, // Realcost
      { wch: 12 }, // Delay
      { wch: 40 }, // Catatan
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Pasien');
    
    const fileName = `Drilldown_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                Drilldown Detail
              </span>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 border border-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-700 text-white shadow-sm transition-colors"
              title="Download Data Excel (.xlsx)"
            >
              <Download size={14} />
              Export Excel (.xlsx)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari Pasien, No RM, No SEP, ICD, Catatan..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semua ({claims.length})
            </button>
            <button
              onClick={() => setStatusFilter('coded')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'coded' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              Selesai ({claims.filter((c) => c._isCoded).length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600 hover:text-amber-700'
              }`}
            >
              Pending ({claims.filter((c) => !c._isCoded).length})
            </button>
            <button
              onClick={() => setStatusFilter('issues')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'issues' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-600 hover:text-red-700'
              }`}
            >
              Catatan ({claims.filter((c) => c._hasIssue).length})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5 font-semibold">No</th>
                <th className="px-3 py-2.5 font-semibold">No RM / Pasien</th>
                <th className="px-3 py-2.5 font-semibold">Ruangan / SMF</th>
                <th className="px-3 py-2.5 font-semibold">Koder & CM</th>
                <th className="px-3 py-2.5 font-semibold">Coding ICD</th>
                <th className="px-3 py-2.5 font-semibold text-right">Realcost</th>
                <th className="px-3 py-2.5 font-semibold text-center">Delay</th>
                <th className="px-3 py-2.5 font-semibold">Catatan Casemix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClaims.map((row, idx) => (
                <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-bold text-gray-800">{row['Nama Pasien'] || '-'}</p>
                    <p className="text-[11px] text-gray-400 font-mono">RM: {row['No RM'] || '-'}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-gray-800">{row['Poli/Ruangan'] || row._room || '-'}</p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium">
                      {row._smf || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-gray-800 font-medium">K: {row['Nama Coder'] || row._coder || '-'}</p>
                    <p className="text-[11px] text-teal-700">CM: {row._cm || '-'}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    {row['Coding ICD'] ? (
                      <span className="font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {row['Coding ICD']}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium text-[11px] italic">Belum Coding</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-medium text-gray-800">
                    {formatCurrency(row._cost || 0)}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-gray-600">
                    {formatDelay(row._delayDays)}
                  </td>
                  <td className="px-3 py-2.5 max-w-[200px]">
                    {row['Catatan Casemix'] ? (
                      <div className="flex items-start gap-1 text-red-600 text-[11px] bg-red-50 p-1.5 rounded">
                        <AlertCircle size={12} className="shrink-0 mt-0.5" />
                        <span className="truncate" title={row['Catatan Casemix']}>
                          {row['Catatan Casemix']}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Tidak ada klaim yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div>
            Menampilkan <strong>{filteredClaims.length}</strong> dari <strong>{claims.length}</strong> data klaim
          </div>
          <div className="font-semibold text-gray-800">
            Total Realcost: <span className="text-teal-700 font-bold font-mono">{formatCurrency(totalFilteredCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
