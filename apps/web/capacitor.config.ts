import { defineConfig } from '@capacitor/cli';

const config = defineConfig({
  appId: 'com.dice.roadmap',
  appName: 'Dice Roadmap',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // 你的服务器地址
    cleartext: true
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    }
  }
});

export default config;
