const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function compilePDF() {
    const outputDir = path.join(__dirname, '../output_catalogues');
    const pdfPath = path.join(outputDir, 'TeluguDelicacies_Full_Catalogue.pdf');
    const csvPath = path.join(__dirname, '../Data for Catalogue/master_product_data_v2.csv');
    
    // 1. Get all PNGs
    let files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
        console.log("No PNG catalogues found to compile.");
        return;
    }
    
    console.log(`Found ${files.length} catalogue images. Reading CSV to sort...`);

    // 2. Parse CSV and build map of safeName -> category
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    function parseCSV(content) {
        let rows = [];
        let currentRow = [];
        let currentVal = '';
        let quote = false;
        for (let i = 0; i < content.length; i++) {
            let cc = content[i], nc = content[i+1];
            if (cc === '"' && quote && nc === '"') { currentVal += '"'; i++; continue; }
            if (cc === '"') { quote = !quote; continue; }
            if (cc === ',' && !quote) { currentRow.push(currentVal.trim()); currentVal = ''; continue; }
            if ((cc === '\n' || cc === '\r') && !quote) {
                if (cc === '\r' && nc === '\n') i++;
                if (currentVal || currentRow.length > 0) {
                    currentRow.push(currentVal.trim());
                    rows.push(currentRow);
                    currentRow = [];
                    currentVal = '';
                }
                continue;
            }
            currentVal += cc;
        }
        if (currentVal || currentRow.length > 0) { currentRow.push(currentVal.trim()); rows.push(currentRow); }
        return rows;
    }
    
    const rows = parseCSV(csvContent);
    if (rows.length === 0) return;
    
    const headers = rows[0];
    const nameIndex = headers.indexOf('product_name');
    const categoryIndex = headers.indexOf('catalogue_category');
    
    const fileCategoryMap = {};
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0) continue;
        
        if (row[nameIndex]) {
            const safeName = row[nameIndex].replace(/[^a-z0-9]/gi, '_').toLowerCase();
            fileCategoryMap[`${safeName}_premium_catalogue.png`] = row[categoryIndex] ? row[categoryIndex].trim() : 'Uncategorized';
        }
    }
    
    const categoryOrder = [
        'General',
        'Nutty',
        'Leafy',
        'Sprinkling',
        'Healthy',
        'Tasty Pinch',
        'Ready to Cook',
        'Ready To Cook' // just in case
    ];
    
    files.sort((a, b) => {
        const catA = fileCategoryMap[a] || 'Uncategorized';
        const catB = fileCategoryMap[b] || 'Uncategorized';
        let idxA = categoryOrder.findIndex(c => c.toLowerCase() === catA.toLowerCase());
        let idxB = categoryOrder.findIndex(c => c.toLowerCase() === catB.toLowerCase());
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        
        if (idxA !== idxB) return idxA - idxB;
        return a.localeCompare(b);
    });
    
    console.log("Sorted order:", files.map(f => `${f} (${fileCategoryMap[f] || 'Uncategorized'})`));

    // 3. Build temporary HTML
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page { margin: 0; size: A4; }
            body { margin: 0; padding: 0; background: #fff; }
            img { 
                width: 100%; 
                height: 100vh; /* A4 aspect ratio mapped to viewport */
                object-fit: cover; 
                display: block; 
                page-break-after: always;
                break-after: page;
            }
        </style>
    </head>
    <body>
    `;
    
    for (const file of files) {
        const imgPath = path.join(outputDir, file).replace(/\\/g, '/');
        htmlContent += `<img src="file:///${imgPath}" />\n`;
    }
    
    htmlContent += `</body></html>`;
    
    const tempHtmlPath = path.join(__dirname, 'temp_pdf_builder.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);
    
    // 4. Launch Puppeteer to render the PDF
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto(`file:///${tempHtmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 0 });
    
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    await browser.close();
    fs.unlinkSync(tempHtmlPath);
    
    console.log(`Successfully compiled sorted PDF to: ${pdfPath}`);
}

compilePDF().catch(console.error);
