import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 8000,
    open: false,
    proxy: {
      '/api/supabase': {
        target: 'https://pfffotghmcofyrvqynbl.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/supabase/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
        sales: 'sales.html',
        legal: 'legal.html',
        logochanger: 'logochanger/index.html',
        thankyou: 'thankyou.html'
      }
    }
  }
});
