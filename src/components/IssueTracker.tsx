import { useState } from 'react';
import type { DashboardData } from '../types';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import DrilldownModal from './DrilldownModal';

export default function IssueTracker({ data }: { data: DashboardData }) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const issues = data.issue_metrics || [];

  const getFilteredClaims = () => {
    if (!selectedIssue || !data.raw_claims) return [];
    return data.raw_claims.filter((c) => {
      const catatan = String(c['Catatan Casemix'] || '').toLowerCase();
      const issueLower = selectedIssue.toLowerCase();
      if (selectedIssue === 'Lain-lain') return c._hasIssue;
      if (selectedIssue === 'Menunggu Hasil PA') return catatan.includes('pa');
      if (selectedIssue === 'Kelengkapan Resume Medis') return catatan.includes('resume');
      if (selectedIssue === 'Tanda Tangan Dokter') return catatan.includes('ttd') || catatan.includes('tanda tangan');
      if (selectedIssue === 'Ketidaksesuaian Billing') return catatan.includes('billing') || catatan.includes('rincian');
      if (selectedIssue === 'Hasil Penunjang Tidak Lengkap') return catatan.includes('penunjang') || catatan.includes('lab') || catatan.includes('ct scan') || catatan.includes('rontgen');
      if (selectedIssue === 'Konfirmasi DPJP / Ruangan') return catatan.includes('konfirmasi');
      if (selectedIssue === 'Laporan Operasi') return catatan.includes('laporan') || catatan.includes('operasi');
      return catatan.includes(issueLower);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-xl text-amber-600 mt-1 shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Issue Tracker (Pemetaan Kendala Casemix)</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">
            Menganalisis kolom <strong>Catatan Casemix</strong> secara otomatis untuk mengidentifikasi penyebab utama klaim pending atau berkas dikembalikan.
            Klik pada jenis kendala untuk melihat <strong>daftar pasien terkait</strong> dan mengekspornya ke Excel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Grafik Frekuensi Kendala Terbanyak</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={issues.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="issue" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} kasus`, 'Frekuensi']}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Jumlah Kasus" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Daftar Kategori Kendala</h3>
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
              {issues.length} Kategori
            </span>
          </div>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 font-semibold">Jenis Kendala</th>
                  <th className="px-5 py-3 font-semibold text-right">Frekuensi</th>
                  <th className="px-3 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {issues.map((issue, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedIssue(issue.issue)}
                    className="hover:bg-amber-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3 text-gray-800 font-medium group-hover:text-amber-700">
                      {issue.issue}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-amber-600 font-mono">
                      {issue.count} kasus
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-teal-600 font-bold text-[11px] group-hover:underline flex items-center justify-center">
                        Detail <ChevronRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
                {issues.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      Tidak ada catatan kendala ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drilldown Modal */}
      {selectedIssue && (
        <DrilldownModal
          title={`Kendala: ${selectedIssue}`}
          subtitle="Daftar berkas pasien yang memiliki catatan kendala ini"
          claims={getFilteredClaims()}
          isOpen={true}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
