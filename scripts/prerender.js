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

const SITE_URL = process.env.SITE_URL || 'https://telugudelicacies.com';
const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_FILE = path.resolve(__dirname, '../dist/sales.html');

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection immediately
async function validateSupabaseConnection() {
    console.log('🔌 Testing Supabase connection...');
    try {
        const { error } = await supabase.from('products').select('id').limit(1);
        if (error) {
            throw new Error(error.message);
        }
        console.log('   ✅ Supabase connection successful\n');
    } catch (err) {
        console.error('❌ FATAL ERROR: Supabase connection failed!');
        console.error(`   ${err.message}`);
        console.error('');
        console.error('   Please check:');
        console.error('   1. Your SUPABASE_URL is correct');
        console.error('   2. Your SUPABASE_ANON_KEY is valid');
        console.error('   3. Your network connection is working');
        console.error('');
        process.exit(1);
    }
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
 */
function generateMetaDescription(product) {
    if (product.meta_description) return product.meta_description;

    // Fallback: Generate from product data
    const parts = [];
    if (product.product_tagline) parts.push(product.product_tagline);
    if (product.product_description) {
        // Take first 150 chars of description
        const desc = product.product_description.replace(/<[^>]*>/g, '').substring(0, 150);
        parts.push(desc);
    }

    return parts.join(' - ') || `Order ${product.product_name} from Telugu Delicacies. Authentic South Indian flavors delivered to your doorstep.`;
}

/**
 * Generates SEO-friendly title
 */
function generateMetaTitle(product) {
    if (product.meta_title) return product.meta_title;

    // Fallback: Generate from product name
    return `${product.product_name} | Buy Online | Telugu Delicacies`;
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
        if (src && (src.startsWith('./') || src.startsWith('../'))) {
            const absolutePath = '/' + src.replace(/^\.\.?\//, '');
            $(el).attr('src', absolutePath);
        } else if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
            $(el).attr('src', '/' + src);
        }
    });

    // Fix <img src="./..."> for local images
    $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src && (src.startsWith('./') || src.startsWith('../'))) {
            const absolutePath = '/' + src.replace(/^\.\.?\//, '');
            $(el).attr('src', absolutePath);
        } else if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
            $(el).attr('src', '/' + src);
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
 * Generates sitemap.xml content
 */
function generateSitemap(products, categories) {
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

        const sitemapContent = generateSitemap(products, categories || []);
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
