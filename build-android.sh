#!/bin/bash

cd "$(dirname "$0")/apps/web"

# 备份原来的配置
if [ -f capacitor.config.json ]; then
  mv capacitor.config.json capacitor.config.json.backup
fi

# 使用通用配置
cat > capacitor.config.json << 'EOF'
{
  "appId": "com.dice.roadmap",
  "appName": "骰子路单",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  }
}
EOF

# 构建（不带环境变量，这样所有页面都在里面！）
pnpm build

# 如果没有Android项目，添加
if [ ! -d android ]; then
  npx cap add android
fi

# 同步
npx cap sync

# 打开Android Studio
open -a "Android Studio" android

# 恢复原来的配置
mv capacitor.config.json.backup capacitor.config.json

echo "✅ 已打开Android Studio！请在Android Studio里构建APK"
echo "📱 APK位置：android/app/build/outputs/apk/debug/app-debug.apk"
