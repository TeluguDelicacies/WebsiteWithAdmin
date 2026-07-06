const SUPABASE_URL = 'https://pfffotghmcofyrvqynbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZmZvdGdobWNvZnlydnF5bmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTM4OTYsImV4cCI6MjA4MDgyOTg5Nn0.eo9VOZZGX4do91GYnBCJa6a9mqcbVqqolQDQ4-C9YYc';

async function run() {
    try {
        const ids = [
            '2cf104b5-c88f-48a7-9e5e-741a20cc2c20', // Godhuma Kaaram
            '38b67b7f-2441-4024-88f1-f3f0c0a29d00', // Idli Podi
            '1b53eba0-1a68-4e3b-80bf-e585ca8e0cdb'  // Puri
        ];
        
        for (const id of ids) {
            const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=id,product_name,slug`;
            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            const data = await response.json();
            console.log(`Product ID ${id}:`, JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

run();
