const fs = require('fs');
const xlsx = require('xlsx');

const buf = fs.readFileSync('C:/Users/PUSBIKES-KEMKES/Downloads/Pembagian Ruangan Casemix.xlsx');
const wb = xlsx.read(buf, { type: 'buffer' });

wb.SheetNames.forEach(sheetName => {
  console.log('=== SHEET:', sheetName, '===');
  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  rows.forEach((r, i) => {
    if (r.length > 0) {
      console.log(`Row ${i}:`, JSON.stringify(r));
    }
  });
});
