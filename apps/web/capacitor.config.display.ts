import { defineConfig } from '@capacitor/cli';

const config = defineConfig({
  appId: 'com.dice.roadmap.display',
  appName: '骰子路单-大屏',
  webDir: 'dist-display',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    }
  }
});

export default config;
