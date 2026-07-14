const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define Cloudinary base URL (if needed) or fetch from Supabase.
// Assuming your Cloudinary format or base URL here:
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/'; 

async function fetchProducts() {
    console.log('Fetching products from Supabase...');
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_visible', true); // or fetch all
    
    if (error) {
        console.error('Error fetching products from Supabase:', error);
        return [];
    }
    return products;
}

// Fallback method to test with local CSV if Supabase isn't fully setup with these exact columns yet
function fetchProductsFromLocalCSV() {
    const csvPath = path.join(__dirname, '../Data for Catalogue/master_product_data_v2.csv');
    if (!fs.existsSync(csvPath)) return [];
    
    const content = fs.readFileSync(csvPath, 'utf8');
    const rows = content.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    
    const products = [];
    let quote = false;
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row.trim()) continue;
        
        let col = 0;
        let p = {};
        let currentVal = '';
        for (let c = 0; c < row.length; c++) {
            let cc = row[c], nc = row[c+1];
            if (cc === '"' && quote && nc === '"') { currentVal += cc; ++c; continue; }
            if (cc === '"') { quote = !quote; continue; }
            if (cc === ',' && !quote) { 
                p[headers[col]] = currentVal;
                col++;
                currentVal = '';
                continue; 
            }
            currentVal += cc;
        }
        p[headers[col]] = currentVal;
        products.push(p);
    }
    return products;
}

async function generateCatalogues() {
    // 1. Fetch data
    let products = await fetchProducts();
    
    // If Supabase products table doesn't have the new catalogue columns yet, fallback to local CSV for demonstration
    if (!products || products.length === 0 || !products[0].catalogue_category) {
        console.log('Falling back to local CSV data for demonstration...');
        products = fetchProductsFromLocalCSV();
    }

    if (!products || products.length === 0) {
        console.log('No products found to generate catalogues for.');
        return;
    }

    // 2. Setup output directory
    const outputDir = path.join(__dirname, '../output_catalogues');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // 3. Launch Puppeteer
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set viewport to A4 size at 96dpi roughly
    await page.setViewport({ width: 864, height: 1183, deviceScaleFactor: 2 });
    
    const templatePath = path.resolve(__dirname, '../Data for Catalogue/premium_catalogue_template.html');
    await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle0' });

    console.log(`Ready to generate ${products.length} catalogues...`);

    const ingredientImagesDir = path.join(__dirname, '../Data for Catalogue/Ingredient Images');
    const availableIngredientImages = fs.existsSync(ingredientImagesDir) ? fs.readdirSync(ingredientImagesDir) : [];

    function findBestImageMatch(ingredientName) {
        if (!ingredientName) return '';
        let target = String(ingredientName).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        if (!target) return '';
        
        // Exact substring
        for (let img of availableIngredientImages) {
            let imgBase = img.replace(/\.png$/i, '').toLowerCase();
            if (imgBase === target) return path.join(ingredientImagesDir, img);
        }
        // Substring
        for (let img of availableIngredientImages) {
            let imgBase = img.replace(/\.png$/i, '').toLowerCase();
            if (imgBase.includes(target) || target.includes(imgBase)) return path.join(ingredientImagesDir, img);
        }
        return '';
    }

    // 4. Iterate and capture
    for (const product of products) {
        const safeName = (product.product_name || 'Unknown').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        const jarFilename = product.photo_glass_jar || `${product.product_name}_Cylindrical_Glass_Jar.png`;
        const pouchFilename = product.photo_standup_pouch || `${product.product_name}_Standup_Pouch.png`;
        
        const localJar = path.join(__dirname, '../Data for Catalogue/All Photos Dump NO BackGround', jarFilename);
        const localPouch = path.join(__dirname, '../Data for Catalogue/All Photos Dump NO BackGround', pouchFilename);
        
        product.jarImgUrl = fs.existsSync(localJar) ? `file://${localJar}` : `https://via.placeholder.com/200x250/fff/999?text=Jar`;
        product.pouchImgUrl = fs.existsSync(localPouch) ? `file://${localPouch}` : `https://via.placeholder.com/250x300/fff/999?text=Pouch`;
        
        const hero1Path = findBestImageMatch(product.hero_ingredient_1);
        if (hero1Path) product.hero1ImgUrl = `file://${hero1Path}`;
        
        const hero2Path = findBestImageMatch(product.hero_ingredient_2);
        if (hero2Path) product.hero2ImgUrl = `file://${hero2Path}`;

        const hero3Path = findBestImageMatch(product.hero_ingredient_3);
        if (hero3Path) product.hero3ImgUrl = `file://${hero3Path}`;

        // Inject data into the page
        await page.evaluate((data) => {
            if (window.injectProductData) {
                window.injectProductData(data);
            }
        }, product);

        // Wait a little bit for fonts/images to render
        await new Promise(r => setTimeout(r, 500));

        // Take screenshot
        const outputPath = path.join(outputDir, `${safeName}_premium_catalogue.png`);
        
        // Capture only the poster container for clean bounds
        const element = await page.$('.poster-container');
        if (element) {
            await element.screenshot({ path: outputPath });
            console.log(`Generated: ${outputPath}`);
        } else {
            console.warn(`Could not find poster-container for ${product.product_name}`);
        }
    }

    await browser.close();
    console.log('Batch generation completed automatically!');
}

generateCatalogues().catch(console.error);
