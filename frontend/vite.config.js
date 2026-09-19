import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://task-pulse-backend-848q.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
