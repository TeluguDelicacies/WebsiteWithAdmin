const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../Data for Catalogue/Ingredient Images');
const csvPath = path.join(__dirname, '../Data for Catalogue/master_product_data_v2.csv');

function cleanFilename(name) {
    if (!name) return name;
    let ext = path.extname(name);
    let base = path.basename(name, ext);
    
    // 1. Lowercase
    base = base.toLowerCase();
    
    // 2. Remove " - copy" or similar
    base = base.replace(/\s*-\s*copy\s*(?:\(\d+\))?/g, '');
    
    // 3. Remove timestamp like _1771656463037
    base = base.replace(/_\d{13}/g, '');
    
    // 4. Remove parenthetical numbers like (1), (2)
    base = base.replace(/\s*\(\d+\)/g, '');
    
    // 5. Replace spaces and non-alphanumeric with underscores
    base = base.replace(/[^a-z0-9]+/g, '_');
    
    // 6. Remove trailing/leading underscores
    base = base.replace(/^_+|_+$/g, '');
    
    return base + ext.toLowerCase();
}

// Rename all files in directory
const files = fs.readdirSync(imgDir);
const renameMap = {}; // oldName -> newName

for (const file of files) {
    const oldPath = path.join(imgDir, file);
    if (!fs.statSync(oldPath).isFile()) continue;
    
    let newFile = cleanFilename(file);
    
    // Handle collisions
    let counter = 1;
    let finalNewFile = newFile;
    while (finalNewFile !== file && fs.existsSync(path.join(imgDir, finalNewFile))) {
        // If the contents are exactly the same or we just want to avoid overwrite
        // Actually, if it exists, let's just use it and maybe delete the duplicate?
        // Let's just append a number to avoid deleting files.
        const ext = path.extname(newFile);
        const base = path.basename(newFile, ext);
        counter++;
        finalNewFile = `${base}_${counter}${ext}`;
    }
    
    if (finalNewFile !== file) {
        fs.renameSync(oldPath, path.join(imgDir, finalNewFile));
        console.log(`Renamed: "${file}" -> "${finalNewFile}"`);
    }
    
    renameMap[file] = finalNewFile;
}

// Now update CSV
let csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');
if (lines.length > 0) {
    const headers = lines[0].split(',');
    const i1 = headers.indexOf('ingredient_image_1');
    const i2 = headers.indexOf('ingredient_image_2');
    
    if (i1 !== -1 && i2 !== -1) {
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            if (!line.trim()) continue;
            
            // simple CSV parsing
            let cols = [];
            let quote = false;
            let currentVal = '';
            for (let c = 0; c < line.length; c++) {
                if (line[c] === '"') { quote = !quote; currentVal += '"'; continue; }
                if (line[c] === ',' && !quote) { cols.push(currentVal); currentVal = ''; continue; }
                currentVal += line[c];
            }
            cols.push(currentVal);
            
            if (cols[i1] && cols[i1].trim() !== '') {
                // look up in renameMap, or try cleaning it
                const oldName = cols[i1].replace(/"/g, '').trim();
                let newName = renameMap[oldName] || cleanFilename(oldName);
                if (newName) cols[i1] = cols[i1].includes('"') ? `"${newName}"` : newName;
            }
            if (cols[i2] && cols[i2].trim() !== '') {
                const oldName = cols[i2].replace(/"/g, '').trim();
                let newName = renameMap[oldName] || cleanFilename(oldName);
                if (newName) cols[i2] = cols[i2].includes('"') ? `"${newName}"` : newName;
            }
            
            lines[i] = cols.join(',');
        }
        
        fs.writeFileSync(csvPath, lines.join('\n'), 'utf8');
        console.log('CSV updated successfully.');
    }
}

console.log('Streamlining completed.');
