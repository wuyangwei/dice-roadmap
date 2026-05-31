#!/bin/bash

cd "$(dirname "$0")/apps/web"

# 备份原来的配置
if [ -f capacitor.config.json ]; then
  mv capacitor.config.json capacitor.config.json.backup
fi

# 使用 mobile 配置
cat > capacitor.config.json << 'EOF'
{
  "appId": "com.dice.roadmap",
  "appName": "骰子路单-操作",
  "webDir": "dist-mobile",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  }
}
EOF

# 构建 mobile 版本
VITE_APP_MODE=mobile pnpm build
mv dist dist-mobile

# 如果没有 Android 项目，添加
if [ ! -d android-mobile ]; then
  npx cap add android
  mv android android-mobile
fi

# 同步
cd android-mobile
npx cap sync

# 打开 Android Studio
open -a "Android Studio" .

# 恢复原来的配置
cd ..
mv capacitor.config.json.backup capacitor.config.json

echo "✅ 已打开 Android Studio！请在 Android Studio 里构建 APK"
echo "📱 APK 位置：android-mobile/app/build/outputs/apk/debug/app-debug.apk"
