import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss()],
  define: {
    __DEV_MODE__: mode === 'development'
  },
  server: {
    host: true,
    allowedHosts: true,
  },
  build: {
    minify: false,
    target: 'es2015', // ← compatibilidade com Chromium antigo
    rollupOptions: {
      output: {
        format: 'iife', // ← em vez de ES module, gera script normal
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
}));
