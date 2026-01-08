import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 8000,
    open: false
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
        logochanger: 'logochanger/index.html'
      }
    }
  }
});
