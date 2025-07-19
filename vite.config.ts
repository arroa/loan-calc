import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        open: false, // No abrir navegador automáticamente
        host: true,  // Permitir acceso desde red local
        hmr: false   // Deshabilitar HMR temporalmente
      },
      preview: {
        port: 4173,
        open: false  // No abrir navegador automáticamente en preview
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
