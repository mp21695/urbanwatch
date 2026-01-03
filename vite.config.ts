import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Separate keys for Gemini and Google Maps
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
      'process.env.MAPS_API_KEY': JSON.stringify(env.VITE_MAPS_API_KEY || '')
    },
    server: {
      port: 3000,
      open: true,
      strictPort: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        // In local production builds, we bundle these rather than externalizing 
        // to ensure the app works offline/standalone.
        external: [] 
      }
    }
  };
});