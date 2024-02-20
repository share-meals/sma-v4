import {defineConfig} from 'vite'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths';
import mdPlugin from 'vite-plugin-markdown';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    viteTsConfigPaths(),
    mdPlugin.plugin({mode: ['react']})
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      'dotenv/config',
      './src/setupTests.ts'
    ],
  }
});
