import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Backend the dev proxy forwards to. Defaults to the local API.
  const apiTarget = env.VITE_API_URL?.trim() || 'http://localhost:5080';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      host: true,
      // Same-origin proxy: the app calls /api and /health on :3000 and Vite
      // forwards them to the backend, so the browser never makes a cross-origin
      // request and CORS is not involved during development.
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/health': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: {
      port: 3000,
    },
  };
});
