import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plustv.iptv',
  appName: 'PlusTV',
  webDir: 'dist',
  android: {
    allowMixedContent: true // ← permite HTTP em HTTPS
  },
  server: {
    androidScheme: 'http' // ← evita CORS no Android
  }
};

export default config;
