import * as xlsx from 'xlsx';
import type { DashboardData, Summary, CoderMetric, CmMetric, PicMetric, RoomMetric, SmfDistribution } from '../types';
import roomMapping from '../data/roomMapping.json';

type RoomMappingType = {
  [key: string]: { smf: string; coder: string; cm: string; pic: string; }
};
const mapping: RoomMappingType = roomMapping as RoomMappingType;

export function parseExcelToDashboardData(files: { buffer: ArrayBuffer; name: string }[]): DashboardData {
  let rawData: any[] = [];
  
  files.forEach(f => {
    const wb = xlsx.read(f.buffer, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const fileData = xlsx.utils.sheet_to_json(sheet);
    rawData = rawData.concat(fileData);
  });

  // Initialize aggregations
  let totalCoded = 0;
  let totalPending = 0;
  let totalIssues = 0;
  let totalRealcost = 0;
  let totalDelayHours = 0;

  const coderMap = new Map<string, any>();
  const cmMap = new Map<string, any>();
  const picMap = new Map<string, any>();
  const roomMap = new Map<string, any>();
  const smfMap = new Map<string, number>();

  const parseCost = (costStr: any) => {
    if (!costStr) return 0;
    if (typeof costStr === 'number') return costStr;
    return parseInt(String(costStr).replace(/\./g, ''), 10) || 0;
  };

  const calculateDelay = (tglKeluar: string | number, tglInput: number) => {
    // TglInput is excel date format (days since 1900-01-01)
    if (!tglKeluar || !tglInput) return 0;
    
    let keluarDate: Date;
    // Check if tglKeluar is also Excel serial date
    if (typeof tglKeluar === 'number') {
      keluarDate = new Date(Math.round((tglKeluar - 25569) * 86400 * 1000));
    } else {
      // Assuming tglKeluar is dd/mm/yyyy or dd-mm-yyyy
      const parts = String(tglKeluar).split(/[-\/]/);
      if (parts.length === 3) {
        keluarDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        return 0; // Invalid format
      }
    }

    const inputDate = new Date(Math.round((tglInput - 25569) * 86400 * 1000));
    const diffHrs = (inputDate.getTime() - keluarDate.getTime()) / (1000 * 60 * 60);
    return diffHrs > 0 ? diffHrs : 0;
  };

  const issueMap = new Map<string, number>();

  const getRoomMapping = (roomName: string) => {
    if (!roomName) return null;
    const upper = roomName.trim().toUpperCase();
    if (mapping[upper]) return mapping[upper];

    // Try finding exact match with cleaned string
    for (const key of Object.keys(mapping)) {
      if (upper === key || upper.includes(key) || key.includes(upper)) {
        return mapping[key];
      }
    }

    return null;
  };

  rawData.forEach(row => {
    const isCoded = !!row['Coding ICD'];
    const hasIssue = !!row['Catatan Casemix'];
    const catatan = String(row['Catatan Casemix'] || '').trim();
    const cost = Math.ceil(parseCost(row['Realcost']));
    const roomName = String(row['Poli/Ruangan'] || 'Unknown').trim();
    const dokterName = String(row['Dokter'] || 'Unknown').trim();
    
    // Track issues
    if (hasIssue && catatan !== 'null' && catatan !== 'undefined') {
      const lowerIssue = catatan.toLowerCase();
      let category = 'Lain-lain';
      if (lowerIssue.includes('pa')) category = 'Menunggu Hasil PA';
      else if (lowerIssue.includes('resume')) category = 'Kelengkapan Resume Medis';
      else if (lowerIssue.includes('ttd') || lowerIssue.includes('tanda tangan')) category = 'Tanda Tangan Dokter';
      else if (lowerIssue.includes('billing') || lowerIssue.includes('rincian')) category = 'Ketidaksesuaian Billing';
      else if (lowerIssue.includes('penunjang') || lowerIssue.includes('lab') || lowerIssue.includes('ct scan') || lowerIssue.includes('rontgen')) category = 'Hasil Penunjang Tidak Lengkap';
      else if (lowerIssue.includes('konfirmasi')) category = 'Konfirmasi DPJP / Ruangan';
      else if (lowerIssue.includes('laporan') || lowerIssue.includes('operasi')) category = 'Laporan Operasi';
      else category = catatan;

      issueMap.set(category, (issueMap.get(category) || 0) + 1);
    }

    // Exact user mapping
    const rMap = getRoomMapping(roomName);
    const smf = rMap ? rMap.smf : 'Umum';
    const cmName = rMap ? rMap.cm : 'Dr. Case Manager';
    const picName = rMap ? rMap.pic : 'PIC Terkait';
    
    // Coder from Excel, fallback to room mapping
    let coderName = String(row['Nama Coder'] || '').trim();
    if (!coderName && rMap) {
      coderName = rMap.coder;
    }
    if (!coderName) coderName = 'Koder';
    
    let delay = 0;
    if (isCoded && row['Tanggal Keluar'] && row['Tanggal input Coding']) {
      delay = calculateDelay(row['Tanggal Keluar'], row['Tanggal input Coding']);
    }

    // Enrich rawData row for instant drilldown
    row._coder = coderName;
    row._cm = cmName;
    row._smf = smf;
    row._pic = picName;
    row._room = roomName;
    row._isCoded = isCoded;
    row._hasIssue = hasIssue;
    row._delayHours = delay;
    row._cost = cost;

    if (isCoded) {
      totalCoded++;
      totalRealcost += cost;
      totalDelayHours += delay;
      if (hasIssue) totalIssues++;
    } else {
      totalPending++;
    }

    // --- CODER ---
    if (!coderMap.has(coderName)) {
      coderMap.set(coderName, {
        name: coderName, short_name: coderName.split(' ').slice(0,2).join(' '),
        total_claims: 0, with_issues: 0, with_cm_notes: 0, 
        total_delay: 0, max_delay: 0, total_realcost: 0
      });
    }
    const c = coderMap.get(coderName);
    if (isCoded) {
      c.total_claims++;
      c.total_realcost += cost;
      c.total_delay += delay;
      if (delay > c.max_delay) c.max_delay = delay;
      if (hasIssue) {
        c.with_issues++;
        c.with_cm_notes++;
      }
    }

    // --- PIC ---
    if (!picMap.has(picName)) {
      picMap.set(picName, { name: picName, rooms: new Set(), total_coded: 0, total_pending: 0, with_issues: 0 });
    }
    const p = picMap.get(picName);
    p.rooms.add(roomName);
    if (isCoded) {
      p.total_coded++;
      if (hasIssue) p.with_issues++;
    } else {
      p.total_pending++;
    }

    // --- ROOM ---
    if (!roomMap.has(roomName)) {
      roomMap.set(roomName, { name: roomName, smf, coder: coderName, case_manager: cmName, pic: picName, total_coded: 0, total_pending: 0, with_issues: 0, total_delay: 0, max_delay: 0, total_realcost: 0 });
    }
    const r = roomMap.get(roomName);
    if (isCoded) {
      r.total_coded++;
      r.total_realcost += cost;
      r.total_delay += delay;
      if (delay > r.max_delay) r.max_delay = delay;
      if (hasIssue) r.with_issues++;
    } else {
      r.total_pending++;
    }

    // --- SMF ---
    if (isCoded) {
      smfMap.set(smf, (smfMap.get(smf) || 0) + 1);
    }
    
    // --- CM ---
    if (!cmMap.has(cmName)) {
      cmMap.set(cmName, { name: cmName, rooms: new Set(), total_coded: 0, total_pending: 0, with_issues: 0, total_delay: 0, max_delay: 0, total_realcost: 0 });
    }
    const cm = cmMap.get(cmName);
    cm.rooms.add(roomName);
    if (isCoded) {
      cm.total_coded++;
      cm.total_realcost += cost;
      cm.total_delay += delay;
      if (delay > cm.max_delay) cm.max_delay = delay;
      if (hasIssue) cm.with_issues++;
    } else {
      cm.total_pending++;
    }
  });

  const summary: Summary = {
    total_coded: totalCoded,
    total_pending: totalPending,
    total_all: totalCoded + totalPending,
    completion_rate: totalCoded + totalPending > 0 ? (totalCoded / (totalCoded + totalPending)) * 100 : 0,
    overall_accuracy: totalCoded > 0 ? ((totalCoded - totalIssues) / totalCoded) * 100 : 0,
    total_realcost: totalRealcost,
    avg_realcost: totalCoded > 0 ? totalRealcost / totalCoded : 0,
    coder_count: coderMap.size,
    room_count: roomMap.size,
    data_date: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    report_period: files.length > 1 ? `Gabungan ${files.length} File Laporan` : (files[0]?.name || "Data Terbaru")
  };

  const coder_metrics: CoderMetric[] = Array.from(coderMap.values()).map(c => ({
    name: c.name,
    short_name: c.short_name,
    total_claims: c.total_claims + c.with_cm_notes, // roughly pending + coded if using logic
    with_issues: c.with_issues,
    with_cm_notes: c.with_cm_notes,
    accuracy: c.total_claims > 0 ? ((c.total_claims - c.with_issues) / c.total_claims) * 100 : 0,
    avg_delay_hours: c.total_claims > 0 ? c.total_delay / c.total_claims : 0,
    max_delay_hours: c.max_delay,
    total_realcost: c.total_realcost,
    avg_realcost: c.total_claims > 0 ? c.total_realcost / c.total_claims : 0
  })).sort((a, b) => b.total_claims - a.total_claims);

  const cm_metrics: CmMetric[] = Array.from(cmMap.values()).map(c => ({
    name: c.name,
    rooms: Array.from(c.rooms),
    total_coded: c.total_coded,
    total_pending: c.total_pending,
    total_all: c.total_coded + c.total_pending,
    with_issues: c.with_issues,
    accuracy: c.total_coded > 0 ? ((c.total_coded - c.with_issues) / c.total_coded) * 100 : 0,
    completion_rate: (c.total_coded + c.total_pending) > 0 ? (c.total_coded / (c.total_coded + c.total_pending)) * 100 : 0,
    avg_delay_hours: c.total_coded > 0 ? c.total_delay / c.total_coded : 0,
    max_delay_hours: c.max_delay,
    total_realcost: c.total_realcost
  })).sort((a, b) => b.total_all - a.total_all);

  const pic_metrics: PicMetric[] = Array.from(picMap.values()).map(p => ({
    name: p.name,
    rooms: Array.from(p.rooms),
    total_coded: p.total_coded,
    total_pending: p.total_pending,
    with_issues: p.with_issues,
    accuracy: p.total_coded > 0 ? ((p.total_coded - p.with_issues) / p.total_coded) * 100 : 0,
  })).sort((a, b) => (b.total_coded + b.total_pending) - (a.total_coded + a.total_pending));

  const room_metrics: RoomMetric[] = Array.from(roomMap.values()).map(r => ({
    name: r.name,
    smf: r.smf,
    coder: r.coder,
    case_manager: r.case_manager,
    pic: r.pic,
    total_coded: r.total_coded,
    total_pending: r.total_pending,
    with_issues: r.with_issues,
    avg_delay_hours: r.total_coded > 0 ? r.total_delay / r.total_coded : 0,
    max_delay_hours: r.max_delay,
    total_realcost: r.total_realcost
  })).sort((a, b) => (b.total_coded + b.total_pending) - (a.total_coded + a.total_pending));

  const issue_metrics = Array.from(issueMap.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count);

  return {
    summary,
    coder_metrics,
    cm_metrics,
    pic_metrics,
    room_metrics,
    smf_distribution: Object.fromEntries(smfMap),
    issue_metrics,
    claims_coded_sample: rawData.slice(0, 10),
    raw_claims: rawData
  };
}
