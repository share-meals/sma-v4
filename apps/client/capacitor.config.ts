import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.sharemeals.app',
  appName: 'Share Meals',
  webDir: 'dist',
  plugins: {
    EdgeToEdge: {
      backgroundColor: '#106535'
    },
    Keyboard: {
      resizeOnFullScreen: false
    },
    PushNotifications: {
      presentationOptions: ['alert', 'badge', 'sound'],
    },
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
