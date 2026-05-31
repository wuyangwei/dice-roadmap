import { defineConfig } from '@capacitor/cli';

const config = defineConfig({
  appId: 'com.dice.roadmap',
  appName: '骰子路单-操作',
  webDir: 'dist-mobile',
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
