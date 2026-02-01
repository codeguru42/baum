import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    react(),
    eslint({
      cache: false,
      include: ['src/**/*.js', 'src/**/*.jsx'],
      exclude: ['**/*.test.js', '**/*.test.jsx', '**/*.spec.js', '**/*.spec.jsx', 'src/setupTests.js'],
    }),
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
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    mockReset: true,
  },
});
