/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const DEV_SERVER_TARGET = 'http://localhost:8080';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api': {
        target: DEV_SERVER_TARGET,
        changeOrigin: true,
      },
      '/ws': {
        target: DEV_SERVER_TARGET,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    env: {
      VITE_WS_URL: '/ws',
      VITE_ENABLE_MSW: 'false',
    },
  },
});
