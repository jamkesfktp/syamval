export type TabKey =
  | 'ringkasan'
  | 'kinerja-koder'
  | 'kinerja-cm'
  | 'distribusi-ruangan'
  | 'kecepatan-koder'
  | 'kecepatan-cm'
  | 'bottleneck'
  | 'kendala';

export interface Summary {
  total_coded: number;
  total_pending: number;
  total_all: number;
  completion_rate: number;
  overall_accuracy: number;
  total_realcost: number;
  avg_realcost: number;
  coder_count: number;
  room_count: number;
  data_date: string;
  report_period: string;
}

export interface CoderMetric {
  name: string;
  short_name: string;
  total_claims: number;
  with_issues: number;
  with_cm_notes: number;
  accuracy: number;
  avg_delay_days: number;
  max_delay_days: number;
  avg_delay_hours?: number;
  max_delay_hours?: number;
  total_realcost: number;
  avg_realcost: number;
}

export interface CmMetric {
  name: string;
  rooms: string[];
  total_coded: number;
  total_pending: number;
  total_all: number;
  with_issues: number;
  accuracy: number;
  completion_rate: number;
  avg_delay_days: number;
  max_delay_days: number;
  avg_delay_hours?: number;
  max_delay_hours?: number;
  total_realcost: number;
}

export interface PicMetric {
  name: string;
  rooms: string[];
  total_coded: number;
  total_pending: number;
  with_issues: number;
  accuracy: number;
}

export interface RoomMetric {
  name: string;
  smf: string;
  coder: string;
  case_manager: string;
  pic: string;
  total_coded: number;
  total_pending: number;
  with_issues: number;
  avg_delay_days: number;
  max_delay_days: number;
  avg_delay_hours?: number;
  max_delay_hours?: number;
  total_realcost: number;
}

export interface SmfDistribution {
  [key: string]: number;
}

export interface IssueMetric {
  issue: string;
  count: number;
}

export interface DashboardData {
  summary: Summary;
  coder_metrics: CoderMetric[];
  cm_metrics: CmMetric[];
  pic_metrics: PicMetric[];
  room_metrics: RoomMetric[];
  smf_distribution: SmfDistribution;
  issue_metrics: IssueMetric[];
  claims_coded_sample: Record<string, string | number>[];
  raw_claims?: Record<string, any>[];
}

export function formatNumber(value: number): string {
  return Math.ceil(value).toLocaleString('id-ID');
}

export function formatCurrency(value: number): string {
  return 'Rp ' + Math.ceil(value).toLocaleString('id-ID');
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-green-600';
  if (accuracy >= 70) return 'text-amber-600';
  return 'text-red-600';
}

export function getAccuracyBadge(accuracy: number): string {
  if (accuracy >= 90) return 'bg-green-100 text-green-700';
  if (accuracy >= 70) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}
