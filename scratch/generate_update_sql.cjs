const fs = require('fs');

function parseCSVRow(text) {
    const re = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    return text.split(re).map(s => {
        let val = s.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val;
    });
}

const keyMapping = {
    'calories': 'calories',
    'protein': 'protein',
    'total fat': 'total_fat',
    'total_fat': 'total_fat',
    'fat': 'total_fat',
    'saturated fat': 'saturated_fat',
    'saturated_fat': 'saturated_fat',
    'carbs': 'carbs',
    'fiber': 'fiber',
    'sugars': 'sugars',
    'sugar': 'sugars',
    'sodium': 'sodium'
};

function parseNutritionToJSON(nutritionStr) {
    if (!nutritionStr) return '{}';
    const parts = nutritionStr.split(/[,|]/).map(s => s.trim()).filter(s => s);
    const result = {};
    let detailsArr = [];

    parts.forEach(part => {
        // Remove trailing colon from part before processing if it has one
        part = part.replace(/:\s*/, ' ');
        const match = part.match(/^(.*?)\s+([\d.]+[a-zA-Z]*)$/);
        if (match) {
            let key = match[1].trim().toLowerCase().replace(/:$/, '');
            let val = match[2].trim();
            if (keyMapping[key]) {
                result[keyMapping[key]] = val;
            } else if (key.includes('serving')) {
                detailsArr.push(part);
            } else {
                result[key] = val; // fallback
            }
        } else {
            if (part.toLowerCase().includes('serving')) {
                detailsArr.push(part);
            }
        }
    });

    if (detailsArr.length > 0) {
        result['serving_size'] = detailsArr.join(', ');
    }

    return JSON.stringify(result);
}

const csvText = fs.readFileSync('f:/WebsiteWithAdmin/NEW Product List/New Porduct List.csv', 'utf8');
const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== '');
const headers = parseCSVRow(lines[0]).map(h => h.trim().toLowerCase());

const products = {};

for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length < headers.length) continue;

    const rowData = {};
    headers.forEach((h, idx) => rowData[h] = row[idx]);

    const pName = rowData['product_name'];
    if (!pName) continue;

    if (!products[pName]) {
        products[pName] = {
            product_name: pName,
            nutrition: rowData['nutrition'],
            shelf_life: rowData['shelf_life']
        };
    }
}

let sql = `-- Migration: Update nutrition_info and shelf_life for existing products\n\n`;
sql += `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shelf_life TEXT;\n\n`;

for (const pName in products) {
    const p = products[pName];
    
    let nutritionInfoJson = "{}";
    if (p.nutrition) {
        nutritionInfoJson = parseNutritionToJSON(p.nutrition).replace(/'/g, "''");
    }

    const esc = (str) => {
        if (str === null || str === undefined || str === '') return 'NULL';
        return "'" + String(str).replace(/'/g, "''") + "'";
    };

    sql += `UPDATE public.products 
SET 
    shelf_life = ${esc(p.shelf_life)}, 
    nutrition_info = '${nutritionInfoJson}'::jsonb
WHERE product_name = ${esc(p.product_name)};\n\n`;
}

fs.writeFileSync('f:/WebsiteWithAdmin/database/update_nutrition_and_shelflife.sql', sql);
console.log('Update SQL generated successfully.');
