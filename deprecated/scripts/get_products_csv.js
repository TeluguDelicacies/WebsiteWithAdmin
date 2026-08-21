import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://telugudelicacies.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    try {
        console.log('Fetching products...');
        const { data: products, error: pErr } = await supabase
            .from('products')
            .select('id, product_name, slug, product_category, is_visible')
            .order('product_name', { ascending: true });
        if (pErr) throw pErr;

        console.log('Fetching combos...');
        let combos = [];
        try {
            const { data: cData, error: cErr } = await supabase
                .from('combos')
                .select('id, name, slug, is_active')
                .order('name', { ascending: true });
            if (cErr) {
                console.warn('Could not fetch combos:', cErr.message);
            } else {
                combos = cData || [];
            }
        } catch (e) {
            console.warn('Failed querying combos table:', e.message);
        }
        
        console.log('Fetching categories...');
        let categories = [];
        try {
            const { data: catData, error: catErr } = await supabase
                .from('categories')
                .select('id, title, slug')
                .eq('is_visible', true);
            if (catErr) {
                console.warn('Could not fetch categories:', catErr.message);
            } else {
                categories = catData || [];
            }
        } catch (e) {
            console.warn('Failed querying categories:', e.message);
        }

        const rows = [];
        rows.push(['--- PRODUCTS & COMBOS ---']);
        rows.push(['ID', 'Product Name', 'Type', 'Category', 'Slug', 'Primary Webpage Link (Nested)', 'Alternative Link (Flat)', 'Legacy Link (/sales/)', 'Status']);

        if (products) {
            for (const p of products) {
                let catPart = '';
                if (p.product_category) {
                    catPart = p.product_category.toLowerCase().trim().replace(/\s+/g, '-') + '/';
                }
                const nestedLink = p.slug ? `${SITE_URL}/${catPart}${p.slug}` : '';
                const flatLink = p.slug ? `${SITE_URL}/${p.slug}` : '';
                const legacyLink = p.slug ? `${SITE_URL}/sales/${p.slug}` : '';
                
                rows.push([
                    p.id,
                    p.product_name,
                    'Product',
                    p.product_category || '',
                    p.slug || '',
                    nestedLink,
                    flatLink,
                    legacyLink,
                    p.is_visible ? 'Visible' : 'Hidden'
                ]);
            }
        }

        if (combos) {
            for (const c of combos) {
                const nestedLink = c.slug ? `${SITE_URL}/combo-offers/${c.slug}` : '';
                const flatLink = c.slug ? `${SITE_URL}/${c.slug}` : '';
                const legacyLink = c.slug ? `${SITE_URL}/sales/${c.slug}` : '';
                
                rows.push([
                    c.id,
                    c.name,
                    'Combo',
                    'combo-offers',
                    c.slug || '',
                    nestedLink,
                    flatLink,
                    legacyLink,
                    c.is_active ? 'Active' : 'Inactive'
                ]);
            }
        }
        
        rows.push([]);
        rows.push([]);
        rows.push(['--- SYSTEM & CATEGORY PAGES ---']);
        rows.push(['Page Name', 'Link', 'Description']);
        
        rows.push(['Home Page', `${SITE_URL}/`, 'The main landing page of the website']);
        rows.push(['All Products', `${SITE_URL}/all-products`, 'Shows all products available']);
        rows.push(['Combo Offers', `${SITE_URL}/combo-offers`, 'Shows all combo offers']);
        
        if (categories) {
            for (const cat of categories) {
                rows.push([`Category: ${cat.title}`, `${SITE_URL}/${cat.slug}`, `Shows all products in ${cat.title}`]);
            }
        }
        
        rows.push(['Admin Panel', `${SITE_URL}/admin.html`, 'Store management interface']);
        rows.push(['Thank You Page', `${SITE_URL}/thankyou.html`, 'Order confirmation page']);
        rows.push(['Legal / Policies', `${SITE_URL}/legal.html`, 'Terms, Privacy, and Refund Policies']);

        // Convert to CSV format with proper quoting
        const csvContent = rows.map(row => 
            row.map(val => {
                const str = String(val ?? '').replace(/"/g, '""');
                return `"${str}"`;
            }).join(',')
        ).join('\r\n');

        const csvPath = path.resolve(__dirname, '../products_webpages.csv');
        fs.writeFileSync(csvPath, csvContent, 'utf-8');
        console.log(`\n🎉 CSV generated successfully at: ${csvPath}\n`);
    } catch (err) {
        console.error('Error executing query:', err);
    }
}

main();
