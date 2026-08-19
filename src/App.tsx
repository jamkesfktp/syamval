import { useState } from 'react';
import type { TabKey, DashboardData } from './types';
import defaultDashboardData from './data/dashboardData.json';
import Layout from './components/Layout';
import Login from './components/Login';
import KpiCards from './components/KpiCards';
import SmfDistribution from './components/SmfDistribution';
import CoderPerformance from './components/CoderPerformance';
import CaseManagerPerformance from './components/CaseManagerPerformance';
import RoomDistribution from './components/RoomDistribution';
import SpeedAnalysis from './components/SpeedAnalysis';
import AccuracyChart from './components/AccuracyChart';
import BottleneckAnalysis from './components/BottleneckAnalysis';
import IssueTracker from './components/IssueTracker';
import { parseExcelToDashboardData } from './utils/excelParser';

const tabTitles: Record<TabKey, string> = {
  ringkasan: 'Ringkasan',
  'kinerja-koder': 'Kinerja Koder',
  'kinerja-cm': 'Kinerja Case Manager',
  'distribusi-ruangan': 'Distribusi Ruangan',
  'kecepatan-akurasi': 'Kecepatan & Akurasi',
  bottleneck: 'Analisis Bottleneck',
  kendala: 'Issue Tracker (Kendala)'
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('ringkasan');
  const [data, setData] = useState<DashboardData>(defaultDashboardData as any);
  
  const { summary, coder_metrics, cm_metrics, pic_metrics, room_metrics, smf_distribution } = data;

  const handleFileUpload = async (files: File[]) => {
    try {
      const filePromises = files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        return { buffer, name: file.name };
      });
      const fileData = await Promise.all(filePromises);
      const parsedData = parseExcelToDashboardData(fileData);
      setData(parsedData);
      alert(`${files.length} file berhasil diproses!`);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses file Excel.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ringkasan': {
        // Top 5 coders by claims for overview chart
        const topCoders = [...coder_metrics]
          .sort((a, b) => b.total_claims - a.total_claims)
          .slice(0, 5)
          .map((c) => ({
            name: c.short_name,
            'Selesai': c.total_claims - c.with_issues,
            'Bermasalah': c.with_issues,
          }));

        return (
          <div className="space-y-6">
            <KpiCards summary={summary} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Top 5 Koder (Jumlah Klaim)</h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCoders} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                    <Bar dataKey="Bermasalah" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <SmfDistribution smfData={smf_distribution} />
          </div>
        );
      }

      case 'kinerja-koder':
        return <CoderPerformance coderMetrics={coder_metrics} />;

      case 'kinerja-cm':
        return <CaseManagerPerformance cmMetrics={cm_metrics} />;

      case 'distribusi-ruangan':
        return <RoomDistribution roomMetrics={room_metrics} />;

      case 'kecepatan-akurasi':
        return (
          <div className="space-y-6">
            <SpeedAnalysis coderMetrics={coder_metrics} />
            <AccuracyChart
              coderMetrics={coder_metrics}
              cmMetrics={cm_metrics}
              picMetrics={pic_metrics}
              overallAccuracy={summary.overall_accuracy}
            />
          </div>
        );
      case 'bottleneck':
        return <BottleneckAnalysis data={data} />;
      case 'kendala':
        return <IssueTracker data={data} />;
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      reportPeriod={summary.report_period}
      onFileUpload={handleFileUpload}
    >
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{tabTitles[activeTab]}</h1>
        <p className="text-sm text-gray-500 mt-1">Data per {summary.data_date}</p>
      </div>
      {renderContent()}
    </Layout>
  );
}
