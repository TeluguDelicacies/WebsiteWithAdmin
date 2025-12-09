import { supabase } from './lib/supabase.js';

const startBtn = document.getElementById('startBtn');
const logs = document.getElementById('logs');
const authStatus = document.getElementById('authStatus');

function log(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = `log-item ${type}`;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
}

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        authStatus.innerHTML = '<span class="status-badge" style="background: #dcfce7; color: #166534;">Authenticated</span>';
        startBtn.disabled = false;
        log('Session found. Ready to migrate.', 'success');
    } else {
        authStatus.innerHTML = '<span class="status-badge" style="background: #fee2e2; color: #dc2626;">Not Authenticated</span> <a href="admin.html">Login here first</a>';
        log('No session found. Please login at admin.html first.', 'error');
    }
}

checkSession();

const IMAGES_TO_MIGRATE = [
    {
        id: 'red',
        url: './images/products/podi_red.png',
        filename: 'podi_red.png',
        keywords: ['kadapa', 'guntur', 'sambar', 'garam', 'tomato']
    },
    {
        id: 'brown',
        url: './images/products/podi_brown.png',
        filename: 'podi_brown.png',
        keywords: ['nalla', 'palli', 'dhaniya', 'idli']
    },
    {
        id: 'green',
        url: './images/products/podi_green.png',
        filename: 'podi_green.png',
        keywords: ['karivepaku', 'tamalapaaku', 'munagaku']
    },
    {
        id: 'yellow',
        url: './images/products/podi_yellow.png',
        filename: 'podi_yellow.png',
        keywords: ['pasupu', 'ghee', 'kandi', 'ginger']
    }
];

startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.innerText = 'Migrating...';

    try {
        log('Starting migration...', 'info');

        // 1. Fetch current products to match IDs
        const { data: products, error: prodError } = await supabase.from('products').select('*');
        if (prodError) throw prodError;
        log(`Fetched ${products.length} products to update.`, 'info');

        for (const imgConfig of IMAGES_TO_MIGRATE) {
            log(`Processing ${imgConfig.filename}...`, 'info');

            // 2. Fetch local blob
            const response = await fetch(imgConfig.url);
            if (!response.ok) throw new Error(`Failed to load local image: ${imgConfig.url}`);
            const blob = await response.blob();

            // 3. Upload to Supabase
            // We use 'upsert: true' to overwrite if exists
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(imgConfig.filename, blob, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                log(`Upload failed for ${imgConfig.filename}: ${uploadError.message}`, 'error');
                continue;
            }

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(imgConfig.filename);

            log(`Uploaded. URL: ${publicUrl}`, 'success');

            // 5. Update matching products
            const matchingProducts = products.filter(p => {
                const pName = p.product_name.toLowerCase();
                return imgConfig.keywords.some(k => pName.includes(k));
            });

            if (matchingProducts.length === 0) {
                log(`No products match keywords for ${imgConfig.filename}`, 'info');
                continue;
            }

            const idsToUpdate = matchingProducts.map(p => p.id);
            log(`Updating ${idsToUpdate.length} products: ${matchingProducts.map(p => p.product_name).join(', ')}`, 'info');

            const { error: updateError } = await supabase
                .from('products')
                .update({ showcase_image: publicUrl })
                .in('id', idsToUpdate);

            if (updateError) {
                log(`Database update failed matched products: ${updateError.message}`, 'error');
            } else {
                log(`Database updated successfully.`, 'success');
            }
        }

        log('Migration complete!', 'success');
        alert('Migration complete! You can now verify the site.');

    } catch (error) {
        log(`Critical Error: ${error.message}`, 'error');
        console.error(error);
    } finally {
        startBtn.disabled = false;
        startBtn.innerText = 'Start Migration';
    }
});
