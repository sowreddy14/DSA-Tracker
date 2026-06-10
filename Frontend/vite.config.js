import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://dsa-tracker-53yh.onrender.com',
        changeOrigin: true,
      }
    }
  }
});