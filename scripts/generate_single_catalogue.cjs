const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function parseCSV(content) {
    let rows = [];
    let currentRow = [];
    let currentVal = '';
    let quote = false;
    for (let i = 0; i < content.length; i++) {
        let cc = content[i], nc = content[i+1];
        if (cc === '"' && quote && nc === '"') {
            currentVal += '"';
            i++;
            continue;
        }
        if (cc === '"') {
            quote = !quote;
            continue;
        }
        if (cc === ',' && !quote) {
            currentRow.push(currentVal.trim());
            currentVal = '';
            continue;
        }
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
    if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
    }
    return rows;
}

// Manually mapping ingredients to available icons based on previous analysis
const ingredientIconMap = {
    'peanuts': 'Peanuts.png',
    'garlic': 'Garlic.png',
    'coriander': 'Coriander.png',
    'coriander seeds': 'Coriander Seeds.png',
    'tamarind': 'Tamarind.png',
    'tamarind leaves': 'Tamarind Leaf.png',
    'curry leaves': 'Curry Leaf.png',
    'mint leaves': 'Mint Leaves.png',
    'urad dal': 'Urad Dal.png',
    'chana dal': 'Chana Dal.png',
    'red chilli': 'Mirchi Dry.png',
    'flax seeds': 'Flax Seed.png',
    'moringa': 'Moringa.png',
    'putna': 'Putna.png',
    'black pepper': 'Black Pepper.png',
    'ghee': 'Ghee.png',
    'jaggery': 'Jaggery.png',
    'oats': 'Oats.png',
    'pumpkin seeds': 'Pumpkin Seeds.png',
    'red gram': 'Red Gram.png'
};

async function generateSingleCatalogue() {
    console.log("Loading products...");
    const csvPath = path.join(__dirname, '../Data for Catalogue/master_product_data_v2.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(content);
    
    if (rows.length === 0) return;
    
    const headers = rows[0];
    let products = [];
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0) continue;
        let p = {};
        for (let j = 0; j < headers.length; j++) {
            p[headers[j]] = row[j] || '';
        }
        if (p.product_name) {
            // Extract photos
            p.photo_standup = p.photo_standup_pouch;
            p.photo_jar = p.photo_cylindrical_glass_jar;
            p.photo_1kg = p.photo_1kg_pouch;
            p.photo_one_unit = p.photo_one_unit_pouch;

            if (p.product_name === 'Karivepaku Podi') {
                p.photo_standup = 'Karivepaku Podi_Standup_Pouch.png';
                p.photo_jar = 'Karivepaku Podi_Cylindrical_Glass_Jar.png';
            }
            if (p.product_name === 'Palli Kaaram') {
                p.photo_standup = 'Palli Kaaram_Standup_Pouch.png';
                p.photo_jar = 'Palli Kaaram_Cylindrical_Glass_Jar.png';
            }

            products.push(p);
        }
    }
    
    // Define category order
    const categoryOrder = [
        'General',
        'Nutty',
        'Leafy',
        'Sprinkling',
        'Healthy',
        'Tasty Pinch',
        'Ready to Cook',
        'Ready To Cook'
    ];
    
    // Group by category
    const grouped = {};
    for (const p of products) {
        let cat = p.catalogue_category || 'Uncategorized';
        if (cat === 'Ready To Cook') cat = 'Ready to Cook'; // normalize
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    }
    
    const categories = [];
    for (const cat of categoryOrder) {
        if (grouped[cat]) {
            categories.push({
                name: cat,
                products: grouped[cat]
            });
            delete grouped[cat];
        }
    }
    // Add any remaining
    for (const cat in grouped) {
        categories.push({ name: cat, products: grouped[cat] });
    }
    
    // Pick background images
    const ingDir = path.join(__dirname, '../Data for Catalogue/Ingredient Images');
    let allIngImages = [];
    if (fs.existsSync(ingDir)) {
        allIngImages = fs.readdirSync(ingDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    }
    
    // Randomize
    allIngImages.sort(() => 0.5 - Math.random());
    const bgImages = allIngImages.slice(0, 40);
    
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set viewport to 1080x1920
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });
    
    const templatePath = path.join(__dirname, '../Data for Catalogue/single_catalogue_template.html');
    await page.goto(`file:///${templatePath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Inject data
    await page.evaluate((cats, bgs) => {
        window.loadCatalogue(cats, bgs);
    }, categories, bgImages);
    
    // Wait a moment for rendering
    await new Promise(r => setTimeout(r, 1000));
    
    const outDir = path.join(__dirname, '../output_catalogues');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    
    const outPath = path.join(outDir, 'TeluguDelicacies_Single_Catalogue.png');
    
    await page.screenshot({
        path: outPath,
        type: 'png',
        clip: { x: 0, y: 0, width: 1080, height: 1920 }
    });
    
    await browser.close();
    console.log(`Successfully generated single table catalogue: ${outPath}`);
}

generateSingleCatalogue().catch(console.error);
