const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────────────

const SIZE = 1080;  // 1:1 aspect ratio
const PADDING = 50;
const BORDER_INSET = 36;

// Color palette — inspired by Akshaya packaging (teal, cream, warm brown/gold)
const COLORS = {
    bg:             '#f5edd6',      // warm cream background
    border:         '#0d7377',      // rich teal border
    cornerFill:     '#0d7377',      // teal corner squares
    title:          '#5a3e1b',      // dark warm brown for title
    productName:    '#0d7377',      // teal for product name
    headerBg:       '#0d7377',      // teal header row background
    headerText:     '#f5edd6',      // cream text on teal header
    rowText:        '#3d2e1a',      // dark brown body text
    boldText:       '#0d7377',      // teal for bold/highlighted rows
    rowLine:        '#d4c9a8',      // warm beige row separator
    altRowBg:       'rgba(13,115,119,0.06)', // very subtle teal tint
    servingText:    '#7a5c2e',      // golden brown
    footerText:     '#6b5d45',      // muted warm gray-brown
    vegGreen:       '#008000',      // standard veg green
    accentGold:     '#c9a84c',      // golden accent line
};

// ─── FSSAI-mandated %RDA baselines (per day, average adult) ─────────────────
// Source: FSSAI (Labelling & Display) Regulations, 2020
// %RDA is ONLY calculated for these 6 values:
//   Energy: 2000 kcal, Total Fat: 67g, Saturated Fat: 22g,
//   Trans Fat: 2g, Added Sugars: 50g, Sodium: 2000mg (2g)
const RDA = {
    energy:        2000,    // kcal
    total_fat:     67,      // g
    saturated_fat: 22,      // g
    trans_fat:     2,       // g
    added_sugars:  50,      // g
    sodium:        2,       // g (= 2000 mg)
};

// ─── Data: Parse from SQL file ──────────────────────────────────────────────

function parseProductsFromCSV(csvPath) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split(/\r?\n/);
    const products = [];

    // Parse a line handling quotes
    function parseCSVLine(text) {
        let ret = [], inQuote = false, val = '';
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (inQuote) {
                if (char === '"') {
                    if (i < text.length - 1 && text[i+1] === '"') {
                        val += '"';
                        i++;
                    } else {
                        inQuote = false;
                    }
                } else {
                    val += char;
                }
            } else {
                if (char === '"') {
                    inQuote = true;
                } else if (char === ',') {
                    ret.push(val);
                    val = '';
                } else {
                    val += char;
                }
            }
        }
        ret.push(val);
        return ret;
    }

    if (lines.length === 0) return products;
    
    // header map
    const headers = parseCSVLine(lines[0]);
    const nameIdx = headers.findIndex(h => h.trim().toLowerCase() === 'product_name');
    const nutritionIdx = headers.findIndex(h => h.trim().toLowerCase() === 'nutrition');
    const shelfLifeIdx = headers.findIndex(h => h.trim().toLowerCase() === 'shelf_life');
    const servingSizeIdx = headers.findIndex(h => h.trim().toLowerCase() === 'serving_size');

    if (nameIdx === -1 || nutritionIdx === -1) {
        console.error("CSV must contain 'product_name' and 'nutrition' columns");
        return products;
    }

    for (let i = 1; i < lines.length; i++) {
        const lineStr = lines[i].trim();
        if (!lineStr) continue;
        const row = parseCSVLine(lineStr);
        if (row.length <= Math.max(nameIdx, nutritionIdx)) continue;
        
        const productName = row[nameIdx].trim();
        const nutritionStr = row[nutritionIdx].trim();
        const shelfLife = shelfLifeIdx !== -1 ? row[shelfLifeIdx].trim() : null;
        let servingSize = servingSizeIdx !== -1 ? row[servingSizeIdx].trim() : null;

        if (!nutritionStr || nutritionStr.toLowerCase() === 'place holder' || !productName) continue;

        const nutritionJson = {};
        
        // If serving size is just a number in the CSV column, append "g" for typical usage, 
        // though we can also just let the script handle it. It's usually "5" or "5g".
        if (servingSize && /^[0-9.]+$/.test(servingSize)) {
            servingSize += "g";
        }
        if (servingSize) {
            nutritionJson.serving_size = servingSize;
        }

        const pairs = nutritionStr.split(',');
        for (let pair of pairs) {
            // e.g. "Total_fat: 1.22g" or "Calories 108.33kcal"
            // Let's replace colons with spaces to normalize, then parse
            pair = pair.replace(/:/g, ' ').trim();
            const match = pair.match(/^([^0-9]+)\s+([0-9].*)$/);
            if (match) {
                let key = match[1].trim().toLowerCase().replace(/_/g, ' ');
                let val = match[2].trim();
                
                if (key.includes('serving size')) key = 'serving_size';
                else if (key.includes('total servings')) key = 'total_servings';
                else if (key.includes('calories')) key = 'calories';
                else if (key.includes('protein')) key = 'protein';
                else if (key.includes('total fat')) key = 'total_fat';
                else if (key.includes('saturated fat')) key = 'saturated_fat';
                else if (key.includes('trans fat')) key = 'trans_fat';
                else if (key.includes('carbs') || key.includes('carbohydrate')) key = 'carbs';
                else if (key.includes('fiber')) key = 'fiber';
                else if (key.includes('sugar')) key = 'sugars';
                else if (key.includes('sodium')) key = 'sodium';

                // Override serving size only if it wasn't already provided by the column
                if (key === 'serving_size' && nutritionJson.serving_size) {
                    continue; 
                }
                nutritionJson[key] = val;
            }
        }

        // Only add if we found some actual nutrition data (e.g. calories or protein)
        if (Object.keys(nutritionJson).length > 0) {
            products.push({
                name: productName,
                shelf_life: shelfLife,
                nutrition: nutritionJson
            });
        }
    }
    return products;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseNum(valStr) {
    if (!valStr) return 0;
    const m = String(valStr).match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : 0;
}

function fmt(val, unit) {
    if (unit === 'kcal') return `${val.toFixed(2)} kcal`;
    if (unit === 'mg')   return `${val.toFixed(0)} mg`;
    return `${val.toFixed(2)} g`;
}

function rdaPct(perServVal, rdaVal) {
    const pct = (perServVal / rdaVal) * 100;
    return `${pct.toFixed(1)}%`;
}

// ─── Build nutrition rows per FSSAI format ──────────────────────────────────

function buildNutritionRows(nutrition) {
    const servingSizeG = parseNum(nutrition.serving_size);
    const factor = servingSizeG > 0 ? (100 / servingSizeG) : 1;

    const perServ = {
        energy:        parseNum(nutrition.calories),
        protein:       parseNum(nutrition.protein),
        carbs:         parseNum(nutrition.carbs),
        sugars:        parseNum(nutrition.sugars),
        added_sugars:  0,
        total_fat:     parseNum(nutrition.total_fat),
        saturated_fat: parseNum(nutrition.saturated_fat),
        trans_fat:     parseNum(nutrition.trans_fat || '0'),
        sodium:        parseNum(nutrition.sodium),
        fiber:         parseNum(nutrition.fiber)
    };

    // Per-100g total fat to determine if sat/trans fat rows are needed
    // FSSAI: "saturated fat and trans fat to be given only if total fat > 0.5% in final food"
    const totalFatPer100g = perServ.total_fat * factor;
    const showSatTransFat = totalFatPer100g > 0.5;

    const rows = [];

    // (i) Energy value — has %RDA
    rows.push({
        label: 'Energy',
        per100g: fmt(perServ.energy * factor, 'kcal'),
        perServ: fmt(perServ.energy, 'kcal'),
        rda: rdaPct(perServ.energy, RDA.energy),
        bold: true, indent: false
    });

    // (ii)(A) Protein — NO mandated %RDA in FSSAI
    rows.push({
        label: 'Protein',
        per100g: fmt(perServ.protein * factor, 'g'),
        perServ: fmt(perServ.protein, 'g'),
        rda: '–',
        bold: false, indent: false
    });

    // (ii)(B) Carbohydrate — NO mandated %RDA in FSSAI
    rows.push({
        label: 'Carbohydrate',
        per100g: fmt(perServ.carbs * factor, 'g'),
        perServ: fmt(perServ.carbs, 'g'),
        rda: '–',
        bold: false, indent: false
    });

    // Total Sugars (sub-item of Carbs) — NO mandated %RDA
    rows.push({
        label: 'Total Sugars',
        per100g: fmt(perServ.sugars * factor, 'g'),
        perServ: fmt(perServ.sugars, 'g'),
        rda: '–',
        bold: false, indent: true
    });

    // Added Sugars (sub-item of Carbs) — HAS %RDA
    rows.push({
        label: 'Added Sugars',
        per100g: fmt(perServ.added_sugars * factor, 'g'),
        perServ: fmt(perServ.added_sugars, 'g'),
        rda: rdaPct(perServ.added_sugars, RDA.added_sugars),
        bold: true, indent: true
    });

    // (ii)(C) Total Fat — HAS %RDA
    rows.push({
        label: 'Total Fat',
        per100g: fmt(perServ.total_fat * factor, 'g'),
        perServ: fmt(perServ.total_fat, 'g'),
        rda: rdaPct(perServ.total_fat, RDA.total_fat),
        bold: false, indent: false
    });

    // Saturated Fat — only if total fat > 0.5% — HAS %RDA
    if (showSatTransFat) {
        rows.push({
            label: 'Saturated Fat',
            per100g: fmt(perServ.saturated_fat * factor, 'g'),
            perServ: fmt(perServ.saturated_fat, 'g'),
            rda: rdaPct(perServ.saturated_fat, RDA.saturated_fat),
            bold: true, indent: true
        });

        // Trans Fat — only if total fat > 0.5% — HAS %RDA
        rows.push({
            label: 'Trans Fat',
            per100g: fmt(perServ.trans_fat * factor, 'g'),
            perServ: fmt(perServ.trans_fat, 'g'),
            rda: rdaPct(perServ.trans_fat, RDA.trans_fat),
            bold: true, indent: true
        });
    }

    // Dietary Fiber (optional but we have data)
    if (perServ.fiber > 0) {
        rows.push({
            label: 'Dietary Fiber',
            per100g: fmt(perServ.fiber * factor, 'g'),
            perServ: fmt(perServ.fiber, 'g'),
            rda: '–',
            bold: false, indent: false
        });
    }

    // (ii)(D) Sodium — HAS %RDA (using mg display, but RDA calc in grams)
    const sodiumMgServ = perServ.sodium * 1000;
    const sodiumMg100  = sodiumMgServ * factor;
    rows.push({
        label: 'Sodium',
        per100g: fmt(sodiumMg100, 'mg'),
        perServ: fmt(sodiumMgServ, 'mg'),
        rda: rdaPct(perServ.sodium, RDA.sodium),
        bold: true, indent: false
    });

    return rows;
}

// ─── Draw a single nutrition label ──────────────────────────────────────────

function generateLabel(product, logoImg) {
    const nutrition = product.nutrition;

    if (!nutrition.calories && !nutrition.protein) {
        console.log(`  ⚠ Skipping "${product.name}" — no nutrition data`);
        return null;
    }

    const servingSize = nutrition.serving_size || '–';
    const totalServings = nutrition.total_servings || '–';
    const rows = buildNutritionRows(nutrition);

    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');

    // ── Background ──
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // ── Borders ──
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(BORDER_INSET, BORDER_INSET, SIZE - BORDER_INSET * 2, SIZE - BORDER_INSET * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(BORDER_INSET + 7, BORDER_INSET + 7, SIZE - (BORDER_INSET + 7) * 2, SIZE - (BORDER_INSET + 7) * 2);

    // ── Corners ──
    const cs = 16;
    const corners = [
        [BORDER_INSET - 2, BORDER_INSET - 2],
        [SIZE - BORDER_INSET - cs + 2, BORDER_INSET - 2],
        [BORDER_INSET - 2, SIZE - BORDER_INSET - cs + 2],
        [SIZE - BORDER_INSET - cs + 2, SIZE - BORDER_INSET - cs + 2]
    ];
    ctx.fillStyle = COLORS.cornerFill;
    corners.forEach(([x, y]) => ctx.fillRect(x, y, cs, cs));

    // ── Veg logo (top right) ──
    let y = BORDER_INSET + 25;
    let textStartX = BORDER_INSET + 30;

    const vegSize = 48;
    const vegX = SIZE - BORDER_INSET - 85;
    ctx.strokeStyle = COLORS.vegGreen;
    ctx.lineWidth = 3;
    ctx.strokeRect(vegX, y, vegSize, vegSize);
    ctx.fillStyle = COLORS.vegGreen;
    ctx.beginPath();
    ctx.arc(vegX + vegSize / 2, y + vegSize / 2, vegSize / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VEG', vegX + vegSize / 2, y + vegSize + 14);

    // ── Logo ──
    let logoHeight = 0;
    if (logoImg) {
        const logoWidth = 140;
        logoHeight = logoWidth * (logoImg.height / logoImg.width);
        ctx.drawImage(logoImg, textStartX, y, logoWidth, logoHeight);
        textStartX += logoWidth + 35;
    }

    // ── Header Text Block ──
    let headerY = y + 45; 
    if (logoHeight > 100) {
        headerY = y + (logoHeight / 2) - 28; // Perfect vertical centering with logo
    }

    ctx.fillStyle = COLORS.title;
    ctx.font = 'bold 50px "Georgia", serif';
    ctx.textAlign = 'left';
    ctx.fillText('NUTRITION FACTS', textStartX, headerY);

    headerY += 50; 
    ctx.fillStyle = COLORS.productName;
    ctx.font = 'italic bold 38px "Georgia", serif';
    ctx.fillText(product.name, textStartX, headerY);

    headerY += 20;
    ctx.strokeStyle = COLORS.accentGold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(textStartX, headerY);
    ctx.lineTo(SIZE - BORDER_INSET - 40, headerY);
    ctx.stroke();

    headerY += 35;
    ctx.fillStyle = COLORS.servingText;
    ctx.font = '600 24px Arial, sans-serif';
    ctx.fillText(`Serving Size: ${servingSize}`, textStartX, headerY);

    // ── Table ──
    y = Math.max(headerY + 40, (logoImg ? (y + logoHeight + 40) : y + 40));

    const tableX = PADDING + 16;
    const tableW = SIZE - (PADDING + 16) * 2;
    const col1W = tableW * 0.36;
    const col2W = tableW * 0.22;
    const col3W = tableW * 0.22;
    const col4W = tableW * 0.20;

    const headerH = 46;
    const headerR = 8;
    ctx.fillStyle = COLORS.headerBg;
    ctx.beginPath();
    ctx.moveTo(tableX + headerR, y);
    ctx.lineTo(tableX + tableW - headerR, y);
    ctx.quadraticCurveTo(tableX + tableW, y, tableX + tableW, y + headerR);
    ctx.lineTo(tableX + tableW, y + headerH - headerR);
    ctx.quadraticCurveTo(tableX + tableW, y + headerH, tableX + tableW - headerR, y + headerH);
    ctx.lineTo(tableX + headerR, y + headerH);
    ctx.quadraticCurveTo(tableX, y + headerH, tableX, y + headerH - headerR);
    ctx.lineTo(tableX, y + headerR);
    ctx.quadraticCurveTo(tableX, y, tableX + headerR, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = COLORS.headerText;
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Nutrient', tableX + 15, y + 31);
    ctx.fillText('Per 100g', tableX + col1W + 10, y + 31);
    ctx.fillText('Per Serve', tableX + col1W + col2W + 10, y + 31);
    ctx.fillText('% RDA*', tableX + col1W + col2W + col3W + 10, y + 31);

    y += headerH;

    const FOOTER_ZONE = 80;
    const bottomLimit = SIZE - BORDER_INSET - FOOTER_ZONE;
    const availableForRows = bottomLimit - y;
    const ROW_HEIGHT = Math.floor(availableForRows / rows.length);

    rows.forEach((row, i) => {
        const rowY = y + i * ROW_HEIGHT;
        if (i % 2 === 0) {
            ctx.fillStyle = COLORS.altRowBg;
            ctx.fillRect(tableX, rowY, tableW, ROW_HEIGHT);
        }

        ctx.strokeStyle = COLORS.rowLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tableX, rowY + ROW_HEIGHT);
        ctx.lineTo(tableX + tableW, rowY + ROW_HEIGHT);
        ctx.stroke();

        const textY = rowY + ROW_HEIGHT * 0.65;
        const fontSize = Math.min(28, Math.max(20, ROW_HEIGHT * 0.45));

        const labelX = row.indent ? tableX + 35 : tableX + 15;
        ctx.fillStyle = row.bold ? COLORS.boldText : COLORS.rowText;
        ctx.font = row.bold ? `bold ${fontSize}px Arial, sans-serif` : `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(row.label, labelX, textY);

        ctx.fillStyle = COLORS.rowText;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.fillText(row.per100g, tableX + col1W + 10, textY);
        ctx.fillText(row.perServ, tableX + col1W + col2W + 10, textY);

        ctx.fillStyle = row.rda === '–' ? COLORS.footerText : COLORS.rowText;
        ctx.fillText(row.rda, tableX + col1W + col2W + col3W + 10, textY);
    });

    const footerY = SIZE - BORDER_INSET - 42;
    ctx.fillStyle = COLORS.footerText;
    ctx.font = '13px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('*%RDA based on 2000 kcal, 67g total fat, 22g saturated fat, 2g trans fat, 50g added sugar, 2000mg sodium.', tableX + 5, footerY);
    ctx.fillText('Source: FSSAI (Labelling & Display) Regulations, 2020.', tableX + 5, footerY + 18);

    return canvas;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    const csvPath = path.join(__dirname, '..', 'NEW Product List', 'New Porduct List.csv');
    const outputDir = __dirname;
    const logoPath = path.join(__dirname, '..', 'images', 'preloader-logo.png');

    console.log('Loading logo...');
    let logoImg = null;
    try {
        logoImg = await loadImage(logoPath);
        console.log('Logo loaded successfully.');
    } catch (err) {
        console.error('Failed to load logo, proceeding without it:', err.message);
    }

    console.log('Reading product data from CSV...');
    const products = parseProductsFromCSV(csvPath);
    console.log(`Found ${products.length} products with nutrition data.\n`);

    let generated = 0;

    for (const product of products) {
        const canvas = generateLabel(product, logoImg);
        if (!canvas) continue;

        const safeName = product.name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
        const fileName = `${safeName}_Nutrition.png`;
        const filePath = path.join(outputDir, fileName);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);
        console.log(`  ✓ Generated: ${fileName}`);
        generated++;
    }

    console.log(`\nDone! Generated ${generated} nutrition label images in:\n  ${outputDir}`);
}

main();
