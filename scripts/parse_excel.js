const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const file = 'C:/Users/HomePC/Downloads/RISTORIS_ITALO_Consolidado_2.xlsx';
const wb = XLSX.readFile(file);
console.log('Sheets:', wb.SheetNames);
const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('consolidado compras')) || wb.SheetNames[0];
console.log('Using sheet:', sheetName);
const ws = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
console.log('Row count:', rows.length);
console.log('Sample row:', JSON.stringify(rows[0], null, 2));
fs.writeFileSync(path.join(__dirname, '../data/excel_raw.json'), JSON.stringify(rows, null, 2), 'utf8');
