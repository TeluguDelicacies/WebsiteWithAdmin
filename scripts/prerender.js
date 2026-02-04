/**
 * Prerender Script for Static Site Generation (SSG)
 * 
 * This script generates static HTML pages for each product to enable
 * proper SEO indexing. Run this after `vite build` during deployment.
 * 
 * Usage: node scripts/prerender.js
 * 
 * Required Environment Variables:
 *   - SUPABASE_URL: Your Supabase project URL
 *   - SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 *   - SITE_URL: (Optional) Your production site URL
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// CONFIGURATION & VALIDATION
// =============================================================================

// Validate required environment variables (supports standard or VITE_ prefix)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ FATAL ERROR: Missing required environment variables!');
    console.error('');
    console.error('   Please ensure these are set in your .env file or Netlify dashboard:');
    console.error('   - SUPABASE_URL (or VITE_SUPABASE_URL)');
    console.error('   - SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY)');
    console.error('');
    process.exit(1);
}

const SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://telugudelicacies.com';
const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_FILE = path.resolve(__dirname, '../dist/sales.html');

// Debug: Show what we're connecting to (mask the key for security)
console.log('🔧 Configuration:');
console.log(`   SUPABASE_URL: ${SUPABASE_URL}`);
console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
console.log(`   SITE_URL: ${SITE_URL}`);
console.log('');

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection with retry logic for Netlify build environment
async function validateSupabaseConnection() {
    console.log('🔌 Testing Supabase connection...');

    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`   Attempt ${attempt}/${maxRetries}...`);
            const { data, error } = await supabase.from('products').select('id').limit(1);

            if (error) {
                throw new Error(error.message);
            }

            console.log('   ✅ Supabase connection successful\n');
            return; // Success!

        } catch (err) {
            lastError = err;
            console.error(`   ⚠️ Attempt ${attempt} failed: ${err.message}`);

            // Log more details about the error
            if (err.cause) {
                console.error(`   Cause: ${err.cause.message || err.cause}`);
            }

            if (attempt < maxRetries) {
                console.log(`   Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    // All retries failed
    console.error('');
    console.error('❌ FATAL ERROR: Supabase connection failed after all retries!');
    console.error(`   Error: ${lastError.message}`);
    console.error('');
    console.error('   Debug Info:');
    console.error(`   - URL hostname: ${new URL(SUPABASE_URL).hostname}`);
    console.error(`   - Key prefix: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);
    console.error('');
    console.error('   Possible causes:');
    console.error('   1. Supabase project may be paused (check dashboard)');
    console.error('   2. Network issue from Netlify to Supabase');
    console.error('   3. Invalid API credentials');
    console.error('');

    // Exit with error to fail the build
    process.exit(1);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Ensures a directory exists, creating it recursively if needed
 */
async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

/**
 * Generates a clean, SEO-friendly meta description
 * Uses the actual product description from the products table
 */
function generateMetaDescription(product) {
    // Use the actual product_description from products table
    // Limit to 160 characters for SEO best practices
    if (product.product_description) {
        return product.product_description.replace(/<[^>]*>/g, '').substring(0, 160).trim();
    }

    // Fallback if description is missing
    return `Order ${product.product_name} from Telugu Delicacies. Authentic South Indian flavors delivered to your doorstep.`;
}

/**
 * Generates SEO-friendly title
 * Format: Product Name - Product Tagline
 */
function generateMetaTitle(product) {
    // Always use product_name and product_tagline from products table
    const tagline = product.product_tagline ? ` - ${product.product_tagline}` : '';
    return `${product.product_name}${tagline}`;
}

/**
 * Generates SEO-friendly title for combos
 */
function generateComboMetaTitle(combo) {
    const tagline = combo.tagline ? ` - ${combo.tagline}` : '';
    return `${combo.name}${tagline} | Combo Bundle`;
}

/**
 * Generates SEO-friendly meta description for combos
 */
function generateComboMetaDescription(combo) {
    if (combo.description) {
        return combo.description.substring(0, 160).trim();
    }
    return `Save more with the ${combo.name} bundle from Telugu Delicacies. Authentic traditional flavors at the best price.`;
}

/**
 * Gets the best image URL for a product
 */
function getProductImage(product, defaultImages) {
    // Check product_images table for default image
    const productImg = defaultImages.find(img => img.product_id === product.id && img.is_default);
    if (productImg) return productImg.image_url;

    // Fallback to any image for this product
    const anyImg = defaultImages.find(img => img.product_id === product.id);
    if (anyImg) return anyImg.image_url;

    // Fallback to showcase_image
    return product.showcase_image || `${SITE_URL}/images/placeholder-product.jpg`;
}

/**
 * Fixes relative asset paths to work from any directory depth
 * Converts ./ and relative paths to absolute paths starting with /
 */
function fixAssetPaths($) {
    // Fix <link href="./..."> and <link href="relative/...">
    $('link[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (href.startsWith('./') || href.startsWith('../'))) {
            // Remove ./ or ../ and make absolute
            const absolutePath = '/' + href.replace(/^\.\.?\//, '');
            $(el).attr('href', absolutePath);
        } else if (href && !href.startsWith('/') && !href.startsWith('http') && !href.startsWith('data:')) {
            // Plain relative path like "styles.css" or "assets/style.css"
            $(el).attr('href', '/' + href);
        }
    });

    // Fix <script src="./..."> and <script src="relative/...">
    $('script[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
            if (src.startsWith('./') || src.startsWith('../')) {
                const absolutePath = '/' + src.replace(/^\.*\/+/, '');
                $(el).attr('src', absolutePath);
            } else if (!src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
                $(el).attr('src', '/' + src);
            }
        }
    });

    // Fix <img src="./..."> for local images
    $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
            if (src.startsWith('./') || src.startsWith('../')) {
                const absolutePath = '/' + src.replace(/^\.*\/+/, '');
                $(el).attr('src', absolutePath);
            } else if (!src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
                $(el).attr('src', '/' + src);
            }
        }
    });

    // Fix <a href="./..."> for internal links
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('./')) {
            const absolutePath = '/' + href.replace(/^\.\//, '');
            $(el).attr('href', absolutePath);
        }
        // Note: We don't convert all relative hrefs because some might be intentional
    });

    return $;
}

/**
 * Injects product meta tags into HTML template using Cheerio
 */
function injectMetaTags($, product, imageUrl) {
    const title = generateMetaTitle(product);
    const description = generateMetaDescription(product);
    const productUrl = `${SITE_URL}/sales/${product.slug}`;
    const imageAlt = product.image_alt_text || `${product.product_name} - Telugu Delicacies`;

    // Update <title>
    $('title').text(title);

    // Update meta description
    $('meta[name="description"]').attr('content', description);

    // Update Open Graph tags
    $('meta[property="og:title"]').attr('content', title);
    $('meta[property="og:description"]').attr('content', description);
    $('meta[property="og:url"]').attr('content', productUrl);
    $('meta[property="og:image"]').attr('content', imageUrl);

    // Add og:image:alt if not present
    if ($('meta[property="og:image:alt"]').length === 0) {
        $('meta[property="og:image"]').after(`<meta property="og:image:alt" content="${imageAlt}" />`);
    } else {
        $('meta[property="og:image:alt"]').attr('content', imageAlt);
    }

    // Add canonical URL
    if ($('link[rel="canonical"]').length === 0) {
        $('head').append(`<link rel="canonical" href="${productUrl}" />`);
    } else {
        $('link[rel="canonical"]').attr('href', productUrl);
    }

    // Add Twitter Card meta tags
    if ($('meta[name="twitter:card"]').length === 0) {
        $('head').append(`
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${title}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${imageUrl}" />
        `);
    }

    // FIX BROKEN ASSET PATHS - Critical for nested directories
    fixAssetPaths($);

    return $;
}

/**
 * Injects combo meta tags into HTML template
 */
function injectComboMetaTags($, combo) {
    const title = generateComboMetaTitle(combo);
    const description = generateComboMetaDescription(combo);
    const productUrl = `${SITE_URL}/sales/${combo.slug}`;
    const imageUrl = combo.image_url || `${SITE_URL}/images/placeholder-combo.jpg`;

    $('title').text(title);
    $('meta[name="description"]').attr('content', description);
    $('meta[property="og:title"]').attr('content', title);
    $('meta[property="og:description"]').attr('content', description);
    $('meta[property="og:url"]').attr('content', productUrl);
    $('meta[property="og:image"]').attr('content', imageUrl);

    if ($('link[rel="canonical"]').length === 0) {
        $('head').append(`<link rel="canonical" href="${productUrl}" />`);
    } else {
        $('link[rel="canonical"]').attr('href', productUrl);
    }

    fixAssetPaths($);
    return $;
}

/**
 * Generates sitemap.xml content
 */
function generateSitemap(products, categories, combos) {
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Homepage -->
    <url>
        <loc>${SITE_URL}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    
    <!-- All Products Page -->
    <url>
        <loc>${SITE_URL}/sales/all-products</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
`;

    // Add category pages
    for (const category of categories) {
        xml += `
    <url>
        <loc>${SITE_URL}/sales/${category.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
    }

    // Add product pages
    for (const product of products) {
        xml += `
    <url>
        <loc>${SITE_URL}/sales/${product.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`;
    }

    // Add combo pages
    for (const combo of combos || []) {
        xml += `
    <url>
        <loc>${SITE_URL}/sales/${combo.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
    }

    xml += `
</urlset>`;

    return xml;
}

/**
 * Generates robots.txt content
 */
function generateRobotsTxt() {
    return `# Robots.txt for Telugu Delicacies
User-agent: *
Allow: /

# Disallow admin and internal pages
Disallow: /admin.html
Disallow: /admin

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// =============================================================================
// MAIN PRERENDER FUNCTION
// =============================================================================

async function prerender() {
    console.log('');
    console.log('═'.repeat(60));
    console.log('🚀 PRERENDER SCRIPT - Static Site Generation');
    console.log('═'.repeat(60));
    console.log('');

    const startTime = Date.now();
    let pagesGenerated = 0;

    try {
        // Validate Supabase connection first
        await validateSupabaseConnection();

        // ---------------------------------------------------------------------
        // Step 1: Fetch all products from Supabase
        // ---------------------------------------------------------------------
        console.log('📦 Fetching products from Supabase...');

        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, slug, product_name, product_tagline, product_description, showcase_image, meta_title, meta_description, image_alt_text')
            .eq('is_visible', true)
            .order('display_order', { ascending: true });

        if (productsError) {
            throw new Error(`Failed to fetch products: ${productsError.message}`);
        }

        if (!products || products.length === 0) {
            console.warn('   ⚠️ No visible products found. Exiting.');
            process.exit(0);
        }

        console.log(`   ✅ Found ${products.length} products\n`);

        // Fetch product images for default images
        const { data: productImages, error: imagesError } = await supabase
            .from('product_images')
            .select('product_id, image_url, is_default');

        if (imagesError) {
            console.warn(`   ⚠️ Warning: Could not fetch product images: ${imagesError.message}`);
        }

        const defaultImages = productImages || [];

        // Fetch categories for sitemap
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('slug, title')
            .eq('is_visible', true)
            .order('display_order', { ascending: true });

        if (categoriesError) {
            console.warn(`   ⚠️ Warning: Could not fetch categories: ${categoriesError.message}`);
        }

        // Fetch combos
        console.log('🎁 Fetching combos from Supabase...');
        const { data: combos, error: combosError } = await supabase
            .from('combos')
            .select('id, slug, name, tagline, description, image_url')
            .eq('is_active', true);

        if (combosError) {
            console.warn(`   ⚠️ Warning: Could not fetch combos: ${combosError.message}`);
        } else {
            console.log(`   ✅ Found ${combos.length} combos\n`);
        }

        // ---------------------------------------------------------------------
        // Step 2: Read the template HTML
        // ---------------------------------------------------------------------
        console.log('📄 Reading template file...');

        let templateHtml;
        try {
            templateHtml = await fs.readFile(TEMPLATE_FILE, 'utf-8');
            console.log(`   ✅ Template loaded: ${TEMPLATE_FILE}\n`);
        } catch (err) {
            console.error(`❌ FATAL ERROR: Failed to read template file`);
            console.error(`   Path: ${TEMPLATE_FILE}`);
            console.error(`   ${err.message}`);
            console.error('');
            console.error('   Make sure to run "vite build" first!');
            process.exit(1);
        }

        // ---------------------------------------------------------------------
        // Step 3: Generate static pages for each product
        // ---------------------------------------------------------------------
        console.log('🔨 Generating static product pages...\n');

        for (const product of products) {
            if (!product.slug) {
                console.warn(`   ⚠️ Skipping product without slug: ${product.product_name}`);
                continue;
            }

            // Parse template with Cheerio
            const $ = cheerio.load(templateHtml);

            // Get product image
            const imageUrl = getProductImage(product, defaultImages);

            // Inject meta tags AND fix asset paths
            injectMetaTags($, product, imageUrl);

            // Inject Body Content for SEO (Google Indexing)
            const productHtml = `
                <div class="prerendered-content" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
                    <nav style="margin-bottom: 20px;">
                        <a href="/">Home</a> &gt; <a href="/sales/all-products">Products</a> &gt; ${product.product_name}
                    </nav>
                    <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: start;">
                        <div style="flex: 1; min-width: 300px;">
                             <img src="${imageUrl}" alt="${product.product_name}" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        </div>
                        <div style="flex: 1.5; min-width: 300px;">
                            <h1 style="font-size: 2.5rem; margin: 0 0 10px; color: #1e293b;">${product.product_name}</h1>
                            ${product.product_tagline ? `<p style="font-size: 1.2rem; color: #64748b; font-style: italic; margin-bottom: 20px;">${product.product_tagline}</p>` : ''}
                            <div style="font-size: 1.1rem; line-height: 1.6; color: #334155; margin-bottom: 30px;">
                                ${product.product_description || ''}
                            </div>
                            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <p style="font-weight: bold; margin: 0;">Order Authentic Telugu Flavors</p>
                                <p style="margin: 5px 0 0; color: #64748b;">Available in various sizes with traditional recipes and modern hygiene.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Replace the loader in #app with the prerendered HTML
            $('#app').html(productHtml);

            // Create output directory
            const outputDir = path.join(DIST_DIR, 'sales', product.slug);
            await ensureDir(outputDir);

            // Write the HTML file
            const outputFile = path.join(outputDir, 'index.html');
            await fs.writeFile(outputFile, $.html(), 'utf-8');

            pagesGenerated++;
            console.log(`   ✅ Generated: /sales/${product.slug}/index.html`);
        }

        console.log(`\n   📊 Generated ${pagesGenerated} product pages\n`);

        // ---------------------------------------------------------------------
        // Step 3b: Generate static pages for each combo
        // ---------------------------------------------------------------------
        console.log('🎁 Generating static combo pages...\n');
        let comboPagesGenerated = 0;

        for (const combo of combos || []) {
            if (!combo.slug) continue;

            const $ = cheerio.load(templateHtml);
            injectComboMetaTags($, combo);

            // Inject Body Content for SEO (Combos)
            const comboHtml = `
                <div class="prerendered-content" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
                    <nav style="margin-bottom: 20px;">
                        <a href="/">Home</a> &gt; <a href="/sales/all-products">Products</a> &gt; ${combo.name}
                    </nav>
                    <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: start;">
                        <div style="flex: 1; min-width: 300px;">
                             <img src="${combo.image_url || '/images/placeholder-combo.jpg'}" alt="${combo.name}" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        </div>
                        <div style="flex: 1.5; min-width: 300px;">
                            <h1 style="font-size: 2.5rem; margin: 0 0 10px; color: #1e293b;">${combo.name}</h1>
                            ${combo.tagline ? `<p style="font-size: 1.2rem; color: #64748b; font-style: italic; margin-bottom: 20px;">${combo.tagline}</p>` : ''}
                            <div style="font-size: 1.1rem; line-height: 1.6; color: #334155; margin-bottom: 30px;">
                                ${combo.description || ''}
                            </div>
                            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border: 1px solid #ffedd5;">
                                <p style="font-weight: bold; margin: 0; color: #9a3412;">Special Combo Offer</p>
                                <p style="margin: 5px 0 0; color: #c2410c;">Save more with our curated traditional bundles.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $('#app').html(comboHtml);

            const outputDir = path.join(DIST_DIR, 'sales', combo.slug);
            await ensureDir(outputDir);

            const outputFile = path.join(outputDir, 'index.html');
            await fs.writeFile(outputFile, $.html(), 'utf-8');

            comboPagesGenerated++;
            console.log(`   ✅ Generated: /sales/${combo.slug}/index.html`);
        }

        console.log(`\n   📊 Generated ${comboPagesGenerated} combo pages\n`);

        // ---------------------------------------------------------------------
        // Step 4: Generate category pages
        // ---------------------------------------------------------------------
        console.log('📁 Generating category pages...\n');

        for (const category of categories || []) {
            const $ = cheerio.load(templateHtml);

            // Update meta tags for category
            $('title').text(`${category.title} | Telugu Delicacies`);
            $('meta[name="description"]').attr('content', `Explore our ${category.title} collection. Authentic Telugu flavors made with traditional recipes.`);
            $('meta[property="og:title"]').attr('content', `${category.title} | Telugu Delicacies`);
            $('meta[property="og:url"]').attr('content', `${SITE_URL}/sales/${category.slug}`);

            // Add canonical
            if ($('link[rel="canonical"]').length === 0) {
                $('head').append(`<link rel="canonical" href="${SITE_URL}/sales/${category.slug}" />`);
            }

            // Fix asset paths for category pages too
            fixAssetPaths($);

            // Inject Body Content for SEO (Categories)
            const categoryHtml = `
                <div class="prerendered-content" style="max-width: 1200px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
                    <nav style="margin-bottom: 20px;">
                        <a href="/">Home</a> &gt; <a href="/sales/all-products">Categories</a> &gt; ${category.title}
                    </nav>
                    <h1 style="font-size: 2.5rem; color: #1e293b; margin-bottom: 10px;">${category.title}</h1>
                    <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 30px;">Explore our authentic ${category.title} collection, made with traditional recipes and love.</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                        <!-- Static list of products is loaded via JavaScript for interactivity -->
                        <div style="padding: 40px; text-align: center; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; grid-column: 1/-1;">
                            <p style="color: #64748b;">Loading authentic Telugu delicacies...</p>
                        </div>
                    </div>
                </div>
            `;
            $('#app').html(categoryHtml);

            const outputDir = path.join(DIST_DIR, 'sales', category.slug);
            await ensureDir(outputDir);

            const outputFile = path.join(outputDir, 'index.html');
            await fs.writeFile(outputFile, $.html(), 'utf-8');

            console.log(`   ✅ Generated: /sales/${category.slug}/index.html`);
        }

        // Generate all-products page
        const $ = cheerio.load(templateHtml);
        $('title').text('All Products | Telugu Delicacies');
        $('meta[name="description"]').attr('content', 'Browse our complete collection of authentic Telugu delicacies. Podis, chapatis, parotas and more.');
        $('meta[property="og:title"]').attr('content', 'All Products | Telugu Delicacies');
        $('meta[property="og:url"]').attr('content', `${SITE_URL}/sales/all-products`);

        // Fix asset paths
        fixAssetPaths($);

        const allProductsDir = path.join(DIST_DIR, 'sales', 'all-products');
        await ensureDir(allProductsDir);
        await fs.writeFile(path.join(allProductsDir, 'index.html'), $.html(), 'utf-8');
        console.log(`   ✅ Generated: /sales/all-products/index.html\n`);

        // ---------------------------------------------------------------------
        // Step 5: Generate sitemap.xml
        // ---------------------------------------------------------------------
        console.log('🗺️  Generating sitemap.xml...');

        const sitemapContent = generateSitemap(products, categories || [], combos || []);
        const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
        await fs.writeFile(sitemapPath, sitemapContent, 'utf-8');

        console.log(`   ✅ Sitemap saved: ${sitemapPath}\n`);

        // ---------------------------------------------------------------------
        // Step 6: Generate robots.txt
        // ---------------------------------------------------------------------
        console.log('🤖 Generating robots.txt...');

        const robotsContent = generateRobotsTxt();
        const robotsPath = path.join(DIST_DIR, 'robots.txt');
        await fs.writeFile(robotsPath, robotsContent, 'utf-8');

        console.log(`   ✅ Robots.txt saved: ${robotsPath}\n`);

        // ---------------------------------------------------------------------
        // Summary
        // ---------------------------------------------------------------------
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('═'.repeat(60));
        console.log('✨ PRERENDER COMPLETE!');
        console.log('═'.repeat(60));
        console.log(`   📄 Product Pages: ${pagesGenerated}`);
        console.log(`   🎁 Combo Pages: ${comboPagesGenerated}`);
        console.log(`   📁 Category Pages: ${(categories || []).length + 1}`);
        console.log(`   🗺️  Sitemap: dist/sitemap.xml`);
        console.log(`   🤖 Robots: dist/robots.txt`);
        console.log(`   ⏱️  Duration: ${duration}s`);
        console.log('═'.repeat(60));
        console.log('');

    } catch (error) {
        console.error('');
        console.error('═'.repeat(60));
        console.error('❌ PRERENDER FAILED');
        console.error('═'.repeat(60));
        console.error(`   Error: ${error.message}`);
        console.error('');
        console.error('   Stack trace:');
        console.error(error.stack);
        console.error('');
        process.exit(1);
    }
}

// Run the prerender
prerender();
