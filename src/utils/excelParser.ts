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

  const calculateDelay = (tglKeluar: string, tglInput: number) => {
    // TglInput is excel date format (days since 1900-01-01)
    if (!tglKeluar || !tglInput) return 0;
    // Assuming tglKeluar is dd-mm-yyyy
    const parts = String(tglKeluar).split('-');
    if (parts.length === 3) {
      const keluarDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const inputDate = new Date(Math.round((tglInput - 25569) * 86400 * 1000));
      const diffHrs = (inputDate.getTime() - keluarDate.getTime()) / (1000 * 60 * 60);
      return diffHrs > 0 ? diffHrs : 0;
    }
    return 0;
  };

  rawData.forEach(row => {
    const isCoded = !!row['Coding ICD'];
    const hasIssue = !!row['Catatan Casemix'];
    const cost = parseCost(row['Realcost']);
    const roomName = String(row['Poli/Ruangan'] || 'Unknown').trim();
    const dokterName = String(row['Dokter'] || 'Unknown').trim();
    
    // Base mappings from roomMapping.json
    const rMap = mapping[roomName.toUpperCase()];
    const smf = rMap ? rMap.smf : 'UMUM';
    const cmName = rMap ? rMap.cm : 'Unknown CM';
    const picName = rMap ? rMap.pic : 'Unknown PIC';
    // Let's still use the Coder from Excel if it's there, but if empty, use mapping
    let coderName = String(row['Nama Coder'] || '').trim();
    if (!coderName && rMap) {
      coderName = rMap.coder;
    }
    if (!coderName) coderName = 'Unknown';
    
    let delay = 0;
    if (isCoded && row['Tanggal Keluar'] && row['Tanggal input Coding']) {
      delay = calculateDelay(row['Tanggal Keluar'], row['Tanggal input Coding']);
    }

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
        total_delay: 0, total_realcost: 0
      });
    }
    const c = coderMap.get(coderName);
    if (isCoded) {
      c.total_claims++;
      c.total_realcost += cost;
      c.total_delay += delay;
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
      roomMap.set(roomName, { name: roomName, smf, coder: coderName, case_manager: cmName, pic: picName, total_coded: 0, total_pending: 0, with_issues: 0, total_realcost: 0 });
    }
    const r = roomMap.get(roomName);
    if (isCoded) {
      r.total_coded++;
      r.total_realcost += cost;
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
      cmMap.set(cmName, { name: cmName, rooms: new Set(), total_coded: 0, total_pending: 0, with_issues: 0, total_realcost: 0 });
    }
    const cm = cmMap.get(cmName);
    cm.rooms.add(roomName);
    if (isCoded) {
      cm.total_coded++;
      cm.total_realcost += cost;
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
    total_claims: c.total_claims,
    with_issues: c.with_issues,
    with_cm_notes: c.with_cm_notes,
    accuracy: c.total_claims > 0 ? ((c.total_claims - c.with_issues) / c.total_claims) * 100 : 100,
    avg_delay_hours: c.total_claims > 0 ? (c.total_delay / c.total_claims) : 0,
    total_realcost: c.total_realcost,
    avg_realcost: c.total_claims > 0 ? c.total_realcost / c.total_claims : 0
  })).sort((a, b) => b.total_claims - a.total_claims);

  const pic_metrics: PicMetric[] = Array.from(picMap.values()).map(p => ({
    name: p.name,
    rooms: Array.from(p.rooms),
    total_coded: p.total_coded,
    total_pending: p.total_pending,
    with_issues: p.with_issues,
    accuracy: p.total_coded > 0 ? ((p.total_coded - p.with_issues) / p.total_coded) * 100 : 100
  }));

  const room_metrics: RoomMetric[] = Array.from(roomMap.values());

  const cm_metrics: CmMetric[] = Array.from(cmMap.values()).map(cm => {
    const total_all = cm.total_coded + cm.total_pending;
    return {
      name: cm.name,
      rooms: Array.from(cm.rooms),
      total_coded: cm.total_coded,
      total_pending: cm.total_pending,
      total_all,
      with_issues: cm.with_issues,
      accuracy: cm.total_coded > 0 ? ((cm.total_coded - cm.with_issues) / cm.total_coded) * 100 : 100,
      completion_rate: total_all > 0 ? (cm.total_coded / total_all) * 100 : 0,
      total_realcost: cm.total_realcost
    }
  });

  const smf_distribution: SmfDistribution = Object.fromEntries(smfMap);

  return {
    summary,
    coder_metrics,
    cm_metrics,
    pic_metrics,
    room_metrics,
    smf_distribution,
    claims_coded_sample: rawData.slice(0, 100)
  };
}
