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

function generateSlug(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

function parseNutritionToJSON(nutritionStr) {
    if (!nutritionStr) return '{}';
    // Handle both comma-separated and pipe-separated
    const parts = nutritionStr.split(/[,|]/).map(s => s.trim()).filter(s => s);
    const result = {};
    parts.forEach(part => {
        // e.g. "Serving Size 5g" or "Calories 20.84kcal"
        // Let's just find the first number to separate key and value, 
        // or just store the whole string as a key-value if not easily parseable.
        // Actually, let's just do a simple split by space for the last word if it's a value, 
        // but easier: just store it in an array or a raw field.
        // But the user might want a clean JSON object. Let's do a regex to extract label and value.
        const match = part.match(/^(.*?)\s+([\d.]+[a-zA-Z]*)$/);
        if (match) {
            result[match[1].trim()] = match[2].trim();
        } else {
            result[part] = true;
        }
    });
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
            product_name_telugu: rowData['product_name_telugu'],
            product_category: rowData['product_category'],
            product_tagline: rowData['product_tagline'],
            product_description: rowData['product_description'],
            ingredients: rowData['ingredients'],
            serving_suggestion: rowData['serving_suggestion'],
            is_trending: rowData['is_trending'].toUpperCase() === 'TRUE',
            is_visible: rowData['is_visible'].toUpperCase() === 'TRUE',
            discriptor: rowData['discriptor'],
            nutrition: rowData['nutrition'],
            shelf_life: rowData['shelf_life'],
            variants: []
        };
    }

    products[pName].variants.push({
        quantity: rowData['variant_qty'],
        mrp: parseFloat(rowData['variant_mrp']) || 0,
        price: parseFloat(rowData['variant_price']) || 0,
        stock: parseInt(rowData['variant_stock']) || 0,
        packaging: rowData['variant_packaging']
    });
}

let sql = `-- Migration: Add discriptor and shelf_life columns, clear old products, insert new products\n\n`;

sql += `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discriptor TEXT;\n`;
sql += `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shelf_life TEXT;\n\n`;

sql += `-- Delete all old products\n`;
sql += `DELETE FROM public.products;\n\n`;

sql += `-- Insert new products\n`;

for (const pName in products) {
    const p = products[pName];
    const slug = generateSlug(pName);
    
    const mrp = p.variants.length > 0 ? p.variants[0].mrp : 0;
    const net_weight = p.variants.length > 0 ? p.variants[0].quantity : '';
    const total_stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
    const variantsJson = JSON.stringify(p.variants).replace(/'/g, "''");
    
    // Process nutrition string into JSON
    let nutritionInfoJson = "{}";
    if (p.nutrition) {
        nutritionInfoJson = parseNutritionToJSON(p.nutrition).replace(/'/g, "''");
    }

    const esc = (str) => {
        if (str === null || str === undefined || str === '') return 'NULL';
        return "'" + String(str).replace(/'/g, "''") + "'";
    };

    sql += `INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        ${esc(p.product_name)}, ${esc(p.product_name_telugu)}, ${esc(slug)}, ${esc(p.product_category)}, ${esc(p.product_tagline)},
        ${esc(p.product_description)}, ${esc(p.ingredients)}, ${esc(p.serving_suggestion)},
        ${p.is_trending}, ${p.is_visible}, ${esc(p.discriptor)}, ${esc(p.shelf_life)},
        ${mrp}, ${esc(net_weight)}, ${total_stock}, '${variantsJson}'::jsonb, '${nutritionInfoJson}'::jsonb
    );\n`;
}

fs.writeFileSync('f:/WebsiteWithAdmin/database/migration_new_products_and_discriptor.sql', sql);
console.log('SQL generated successfully.');
