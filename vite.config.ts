import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    minify: false,
    target: 'es2015', // ← compatibilidade com Chromium antigo
    rollupOptions: {
      output: {
        format: 'iife', // ← em vez de ES module, gera script normal
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
