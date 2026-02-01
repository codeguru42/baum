import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    // ESLint runs via npm scripts and IDE integration
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    mockReset: true,
  },
});
