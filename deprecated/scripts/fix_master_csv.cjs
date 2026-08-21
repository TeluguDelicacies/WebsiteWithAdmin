const fs = require('fs');
const reportLines = fs.readFileSync('Data for Catalogue/image_availability_report.csv', 'utf8').split(/\r?\n/).filter(Boolean);
const masterLines = fs.readFileSync('Data for Catalogue/master_product_data_v2.csv', 'utf8').split(/\r?\n/);

function parseCSVRow(text) {
    let ret = [''];
    let i = 0; let s = true;
    for (let l = text.length; i < l; i++) {
        let c = text[i], n = text[i + 1];
        if (c === '"' && n === '"') { ret[ret.length - 1] += '"'; i++; }
        else if (c === '"') { s = !s; }
        else if (c === ',' && s) { ret.push(''); }
        else { ret[ret.length - 1] += c; }
    }
    return ret;
}

function escapeCSV(str) {
    if (!str) return '';
    const s = String(str);
    return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

const pngMap = {
    'Malabar Parota (10pcs)': 'malabar_parota__10pcs.png',
    'Malabar Parota (5pcs)': 'malabar_parota__5pcs.png',
    'Poori': 'poori.png',
    'Wheat Chapathi': 'wheat_chapathi.png',
    'Whole Wheat Parota': 'whole_wheat_parota.png'
};

const newMasterLines = [...masterLines];
for (let i = 0; i < newMasterLines.length; i++) {
    const row = newMasterLines[i];
    if (row.startsWith('Malabar Parota') || row.startsWith('Poori') || row.startsWith('Wheat Chapathi') || row.startsWith('Whole Wheat Parota')) {
        const name = row.split(',')[0];
        const rRow = reportLines.find(r => r.startsWith(name + ','));
        if (rRow) {
            const cols = parseCSVRow(rRow).slice(9);
            if (pngMap[name]) {
                cols[34] = pngMap[name]; // Insert the specific product image
            }
            newMasterLines[i] = cols.map(escapeCSV).join(',');
        }
    }
}
fs.writeFileSync('Data for Catalogue/master_product_data_v2.csv', newMasterLines.join('\n'), 'utf8');
console.log('Fixed master_product_data_v2.csv');
