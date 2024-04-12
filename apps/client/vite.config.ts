import {defineConfig} from 'vite';
import legacy from '@vitejs/plugin-legacy';
import packageJson from './package.json';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    modules: true
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  plugins: [
    legacy(),
    react(),
    viteTsConfigPaths(),
    {name: "markdown-loader",
     transform(code, id) {
       if (id.slice(-3) === ".md") {
         // For .md files, get the raw content
         return `export default ${JSON.stringify(code)};`;
       }
     }
    }
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
