import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { PWAConfig } from './src/lib/config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    // 1. Build Optimizations
    build: {
      target: 'esnext', // Modern browsers (use 'es2015' if you need older support)
      sourcemap: !isProduction, // Disable sourcemaps in prod for security/size
      cssCodeSplit: true,
      reportCompressedSize: false, // Speeds up build slightly
    },

    // 3. CSS Configuration
    css: {
      devSourcemap: true,
      // If using modules, you can customize generation here
      modules: {
        localsConvention: 'camelCase',
      },
    },

    // 4. Server & Preview Settings (Docker/CI friendly)
    server: {
      port: 3000,
      host: true, // Needed for Docker/Network access
      strictPort: true,
    },
    preview: {
      port: 8080,
      host: true,
    },

    plugins: [
      react(),
      tsconfigPaths(),
      tailwindcss(),
      VitePWA(PWAConfig),

      // 5. Compression (Gzip) - Production only
      // Reduces deployment size significantly
      isProduction &&
        viteCompression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 10240, // Only compress assets > 10kb
          deleteOriginFile: false,
        }),

      // 6. Visualizer - Build Analysis
      // Generates stats.html to see exactly what is in your bundle
      visualizer({
        filename: './dist/stats.html',
        open: false, // Don't auto-open on CI
        gzipSize: true,
        brotliSize: true,
      }),
    ],

    // 7. Test Configuration (Vitest)
    // Enterprise apps need integrated testing
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts', // Make sure to create this
      css: false,
    },
  };
});
