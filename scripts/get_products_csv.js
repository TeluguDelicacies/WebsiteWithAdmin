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

        const rows = [];
        rows.push(['ID', 'Product Name', 'Type', 'Category', 'Slug', 'Webpage Link', 'Status']);

        if (products) {
            for (const p of products) {
                let catPart = '';
                if (p.product_category) {
                    catPart = p.product_category.toLowerCase().trim().replace(/\s+/g, '-') + '/';
                }
                const link = p.slug ? `${SITE_URL}/${catPart}${p.slug}` : '';
                rows.push([
                    p.id,
                    p.product_name,
                    'Product',
                    p.product_category || '',
                    p.slug || '',
                    link,
                    p.is_visible ? 'Visible' : 'Hidden'
                ]);
            }
        }

        if (combos) {
            for (const c of combos) {
                const link = c.slug ? `${SITE_URL}/combo-offers/${c.slug}` : '';
                rows.push([
                    c.id,
                    c.name,
                    'Combo',
                    'combo',
                    c.slug || '',
                    link,
                    c.is_active ? 'Active' : 'Inactive'
                ]);
            }
        }

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
