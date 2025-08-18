import {defineConfig} from 'cypress';
import dotenv from 'dotenv';

// assume cypress only runs on emulator
dotenv.config({ path: '.env.emulator' }); 

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {},
    env: {
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY
    }
  },
  includeShadowDom: true,
  // video: true,
});
