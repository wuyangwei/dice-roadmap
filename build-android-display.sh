#!/bin/bash

cd "$(dirname "$0")/apps/web"

# 备份原来的配置
if [ -f capacitor.config.json ]; then
  mv capacitor.config.json capacitor.config.json.backup
fi

# 使用 display 配置
cat > capacitor.config.json << 'EOF'
{
  "appId": "com.dice.roadmap.display",
  "appName": "骰子路单-大屏",
  "webDir": "dist-display",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  }
}
EOF

# 构建 display 版本
VITE_APP_MODE=display pnpm build
mv dist dist-display

# 如果没有 Android 项目，添加
if [ ! -d android-display ]; then
  npx cap add android
  mv android android-display
fi

# 同步并打开
npx cap sync --config capacitor.config.json
npx cap open android --config capacitor.config.json

# 恢复原来的配置
mv capacitor.config.json.backup capacitor.config.json

echo "✅ 已打开 Android Studio！请在 Android Studio 里构建 APK"
echo "🖥️ APK 位置：android-display/app/build/outputs/apk/debug/app-debug.apk"
