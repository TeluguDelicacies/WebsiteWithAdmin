const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, '../Data for Catalogue/master_product_data_v2.csv');
const ingredientDir = path.join(__dirname, '../Data for Catalogue/Ingredient Images');
const photosDir = path.join(__dirname, '../Data for Catalogue/All Photos Dump NO BackGround');
const outFilePath = path.join(__dirname, '../Data for Catalogue/image_availability_report_final.csv');

// Robust CSV parser state machine
function parseCSVRow(text) {
    let ret = [''];
    let i = 0;
    let p = '';
    let s = true;
    for (let l = text.length; i < l; i++) {
        let c = text[i];
        let n = text[i + 1];
        if (c === '"' && n === '"') {
            ret[ret.length - 1] += '"';
            i++;
        } else if (c === '"') {
            s = !s;
        } else if (c === ',' && s) {
            ret.push('');
        } else {
            ret[ret.length - 1] += c;
        }
    }
    return ret;
}

const escapeCSV = (str) => {
    if (str === null || str === undefined) return '';
    const stringified = String(str);
    if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
};

async function main() {
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length === 0) return;

    const headers = parseCSVRow(lines[0]);
    
    const hero1Idx = headers.indexOf('hero_ingredient_1');
    const hero2Idx = headers.indexOf('hero_ingredient_2');
    const hero3Idx = headers.indexOf('hero_ingredient_3');
    const pouchIdx = headers.indexOf('photo_standup_pouch');
    const jarIdx = headers.indexOf('photo_glass_jar');

    const outHeaders = [
        'product_name',
        'Will Make Product?',
        'All 3 Ingredients Available?',
        'Hero 1 Available?',
        'Hero 2 Available?',
        'Hero 3 Available?',
        'Product Images Available?',
        'Pouch Available?',
        'Jar Available?',
        ...headers
    ];

    const outRows = [outHeaders.map(escapeCSV).join(',')];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVRow(lines[i]);
        if (cols.length < headers.length) {
            while(cols.length < headers.length) cols.push('');
        }
        
        const name = cols[0];
        
        let allIngredientsAvailable = 'Yes';
        let h1Avail = 'N/A';
        let h2Avail = 'N/A';
        let h3Avail = 'N/A';
        
        const checkIngredient = (colIdx) => {
            if (colIdx !== -1 && cols[colIdx]) {
                const ingName = cols[colIdx].trim();
                if (ingName) {
                    const imgPath = path.join(ingredientDir, `${ingName}.png`);
                    if (fs.existsSync(imgPath)) {
                        return 'Yes';
                    } else {
                        allIngredientsAvailable = 'No';
                        return 'No';
                    }
                }
            }
            return 'N/A';
        };

        h1Avail = checkIngredient(hero1Idx);
        h2Avail = checkIngredient(hero2Idx);
        h3Avail = checkIngredient(hero3Idx);

        if (h1Avail === 'N/A' && h2Avail === 'N/A' && h3Avail === 'N/A') {
            allIngredientsAvailable = 'N/A';
        }

        let allProductsAvailable = 'Yes';
        let pouchAvail = 'N/A';
        let jarAvail = 'N/A';

        const checkProductImg = (colIdx) => {
            if (colIdx !== -1 && cols[colIdx]) {
                const fname = cols[colIdx].trim();
                if (fname) {
                    const imgPath = path.join(photosDir, fname);
                    if (fs.existsSync(imgPath)) {
                        return 'Yes';
                    } else {
                        allProductsAvailable = 'No';
                        return 'No';
                    }
                }
            }
            return 'N/A';
        };

        pouchAvail = checkProductImg(pouchIdx);
        jarAvail = checkProductImg(jarIdx);

        if (pouchAvail === 'N/A' && jarAvail === 'N/A') {
            allProductsAvailable = 'N/A';
        }

        let willMake = 'No';
        if (allIngredientsAvailable === 'Yes' && allProductsAvailable === 'Yes') {
            willMake = 'Yes';
        }

        const outRow = [
            name,
            willMake,
            allIngredientsAvailable,
            h1Avail,
            h2Avail,
            h3Avail,
            allProductsAvailable,
            pouchAvail,
            jarAvail,
            ...cols
        ];
        
        outRows.push(outRow.map(escapeCSV).join(','));
    }

    fs.writeFileSync(outFilePath, outRows.join('\r\n'), 'utf-8');
    console.log('Report generated at:', outFilePath);
}

main();
