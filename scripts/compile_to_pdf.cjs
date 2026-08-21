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

    // 3. Compile using python img2pdf for perfect zero-margin A4 mapping
    const { execSync } = require('child_process');
    
    // Create a temporary file with the list of sorted image paths
    const imgPaths = files.map(f => path.join(outputDir, f).replace(/\\/g, '/'));
    const listPath = path.join(__dirname, 'img_list.txt');
    fs.writeFileSync(listPath, imgPaths.join('\n'));

    console.log('Compiling to PDF using python img2pdf for perfect margins...');
    const pyScript = `
import img2pdf
import sys

with open(sys.argv[1], 'r') as f:
    images = [line.strip() for line in f if line.strip()]

a4inpt = (img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297))
layout_fun = img2pdf.get_layout_fun(pagesize=a4inpt)

with open(sys.argv[2], 'wb') as f:
    f.write(img2pdf.convert(images, layout_fun=layout_fun))
`;
    const pyScriptPath = path.join(__dirname, 'compile_helper.py');
    fs.writeFileSync(pyScriptPath, pyScript);

    try {
        execSync(`python "${pyScriptPath}" "${listPath}" "${pdfPath}"`);
        console.log(`Successfully compiled sorted PDF to: ${pdfPath}`);
    } catch (e) {
        console.error("Error during PDF compilation:", e.message);
    } finally {
        if (fs.existsSync(listPath)) fs.unlinkSync(listPath);
        if (fs.existsSync(pyScriptPath)) fs.unlinkSync(pyScriptPath);
    }
}

compilePDF().catch(console.error);
