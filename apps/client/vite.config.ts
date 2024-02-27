import {defineConfig} from 'vite';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    modules: true
  },
  plugins: [
    legacy(),
    react(),
    viteTsConfigPaths(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      'dotenv/config',
      './src/setupTests.ts',
    ]
  }
})
