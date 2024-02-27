import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sharemeals.org',
  appName: 'Share Meals',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
