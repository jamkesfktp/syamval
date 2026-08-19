const fs = require('fs');
const xlsx = require('xlsx');

const roomMapping = JSON.parse(fs.readFileSync('src/data/roomMapping.json', 'utf8'));

const buf = fs.readFileSync('C:/Users/PUSBIKES-KEMKES/Downloads/uji coba aplikasi casemnager pro.xlsx');
const wb = xlsx.read(buf, { type: 'buffer' });
const rawData = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

const parseCost = (costStr) => {
  if (!costStr) return 0;
  if (typeof costStr === 'number') return costStr;
  return parseInt(String(costStr).replace(/\./g, ''), 10) || 0;
};

const parseDateToSerialDays = (val) => {
  if (!val && val !== 0) return null;
  if (typeof val === 'number') return Math.floor(val);
  if (val instanceof Date) return Math.floor((Date.UTC(val.getUTCFullYear(), val.getUTCMonth(), val.getUTCDate()) / 86400000) + 25569);
  const str = String(val).trim().split(' ')[0];
  const parts = str.split(/[-\/]/);
  if (parts.length === 3) {
    let year, month, day;
    if (parts[0].length === 4) {
      year = Number(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
    } else {
      day = Number(parts[0]);
      month = Number(parts[1]);
      year = Number(parts[2]);
    }
    const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
    return Math.floor(utcMs / 86400000) + 25569;
  }
  return null;
};

const calculateDelayDays = (tglKeluar, tglCoding) => {
  const serialKeluar = parseDateToSerialDays(tglKeluar);
  const serialCoding = parseDateToSerialDays(tglCoding);
  if (serialKeluar === null || serialCoding === null) return 0;
  const diff = serialCoding - serialKeluar;
  return diff > 0 ? diff : 0;
};

let totalCoded = 0;
let totalPending = 0;
let totalIssues = 0;
let totalRealcost = 0;
let totalDelayDays = 0;

const coderMap = new Map();
const cmMap = new Map();
const picMap = new Map();
const roomMap = new Map();
const smfMap = new Map();
const issueMap = new Map();

const getRoomMapping = (roomName) => {
  if (!roomName) return null;
  const upper = roomName.trim().toUpperCase();
  if (roomMapping[upper]) return roomMapping[upper];
  for (const key of Object.keys(roomMapping)) {
    if (upper === key || upper.includes(key) || key.includes(upper)) {
      return roomMapping[key];
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

  const rMap = getRoomMapping(roomName);
  const smf = rMap ? rMap.smf : 'Umum';
  const cmName = rMap ? rMap.cm : 'Dr. Case Manager';
  const picName = rMap ? rMap.pic : 'PIC Terkait';

  let coderName = String(row['Nama Coder'] || '').trim();
  if (!coderName && rMap) {
    coderName = rMap.coder;
  }
  if (coderName.toUpperCase() === 'AISAH' || coderName.toUpperCase() === 'AISYAH') {
    coderName = 'AISYAH';
  }
  if (!coderName) coderName = 'Koder';

  let delay = 0;
  if (isCoded && row['Tanggal Keluar'] && row['Tanggal input Coding']) {
    delay = calculateDelayDays(row['Tanggal Keluar'], row['Tanggal input Coding']);
  }

  row._coder = coderName;
  row._cm = cmName;
  row._smf = smf;
  row._pic = picName;
  row._room = roomName;
  row._isCoded = isCoded;
  row._hasIssue = hasIssue;
  row._delayDays = delay;
  row._delayHours = delay * 24;
  row._cost = cost;

  if (isCoded) {
    totalCoded++;
    totalRealcost += cost;
    totalDelayDays += delay;
    if (hasIssue) totalIssues++;
  } else {
    totalPending++;
  }

  // Coder
  if (!coderMap.has(coderName)) {
    coderMap.set(coderName, {
      name: coderName, short_name: coderName.split(' ').slice(0,2).join(' '),
      total_claims: 0, with_issues: 0, with_cm_notes: 0, total_delay: 0, max_delay: 0, total_realcost: 0
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

  // CM
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

  // Room
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

  // SMF
  if (isCoded) {
    smfMap.set(smf, (smfMap.get(smf) || 0) + 1);
  }
});

const coder_metrics = Array.from(coderMap.values())
  .map(c => {
    const avgDays = c.total_claims > 0 ? c.total_delay / c.total_claims : 0;
    return {
      name: c.name,
      short_name: c.short_name,
      total_claims: c.total_claims,
      with_issues: c.with_issues,
      with_cm_notes: c.with_cm_notes,
      accuracy: c.total_claims > 0 ? ((c.total_claims - c.with_issues) / c.total_claims) * 100 : 0,
      avg_delay_days: Number(avgDays.toFixed(1)),
      max_delay_days: c.max_delay,
      avg_delay_hours: Number((avgDays * 24).toFixed(1)),
      max_delay_hours: c.max_delay * 24,
      total_realcost: c.total_realcost,
      avg_realcost: c.total_claims > 0 ? Math.ceil(c.total_realcost / c.total_claims) : 0
    };
  })
  .filter(c => c.total_claims > 0)
  .sort((a, b) => b.total_claims - a.total_claims);

const cm_metrics = Array.from(cmMap.values()).map(c => {
  const avgDays = c.total_coded > 0 ? c.total_delay / c.total_coded : 0;
  return {
    name: c.name,
    rooms: Array.from(c.rooms),
    total_coded: c.total_coded,
    total_pending: c.total_pending,
    total_all: c.total_coded + c.total_pending,
    with_issues: c.with_issues,
    accuracy: c.total_coded > 0 ? Number((((c.total_coded - c.with_issues) / c.total_coded) * 100).toFixed(1)) : 0,
    completion_rate: (c.total_coded + c.total_pending) > 0 ? Number(((c.total_coded / (c.total_coded + c.total_pending)) * 100).toFixed(1)) : 0,
    avg_delay_days: Number(avgDays.toFixed(1)),
    max_delay_days: c.max_delay,
    avg_delay_hours: Number((avgDays * 24).toFixed(1)),
    max_delay_hours: c.max_delay * 24,
    total_realcost: c.total_realcost
  };
}).sort((a, b) => b.total_all - a.total_all);

const room_metrics = Array.from(roomMap.values()).map(r => {
  const avgDays = r.total_coded > 0 ? r.total_delay / r.total_coded : 0;
  return {
    name: r.name,
    smf: r.smf,
    coder: r.coder,
    case_manager: r.case_manager,
    pic: r.pic,
    total_coded: r.total_coded,
    total_pending: r.total_pending,
    with_issues: r.with_issues,
    avg_delay_days: Number(avgDays.toFixed(1)),
    max_delay_days: r.max_delay,
    avg_delay_hours: Number((avgDays * 24).toFixed(1)),
    max_delay_hours: r.max_delay * 24,
    total_realcost: r.total_realcost
  };
}).sort((a, b) => (b.total_coded + b.total_pending) - (a.total_coded + a.total_pending));

const summary = {
  total_coded: totalCoded,
  total_pending: totalPending,
  total_all: totalCoded + totalPending,
  completion_rate: totalCoded + totalPending > 0 ? Number(((totalCoded / (totalCoded + totalPending)) * 100).toFixed(1)) : 0,
  overall_accuracy: totalCoded > 0 ? Number((((totalCoded - totalIssues) / totalCoded) * 100).toFixed(1)) : 0,
  total_realcost: totalRealcost,
  avg_realcost: totalCoded > 0 ? Math.ceil(totalRealcost / totalCoded) : 0,
  coder_count: coder_metrics.length,
  room_count: roomMap.size,
  data_date: "Agustus 2026",
  report_period: "Uji Coba Casemanager Pro"
};

const issue_metrics = Array.from(issueMap.entries())
  .map(([issue, count]) => ({ issue, count }))
  .sort((a, b) => b.count - a.count);

const dashboardData = {
  summary,
  coder_metrics,
  cm_metrics,
  room_metrics,
  smf_distribution: Object.fromEntries(smfMap),
  issue_metrics,
  raw_claims: rawData
};

fs.writeFileSync('src/data/dashboardData.json', JSON.stringify(dashboardData, null, 2));
console.log('Unification of AISAH to AISYAH complete!');
console.log('Coders list:', coder_metrics.map(c => c.name));
