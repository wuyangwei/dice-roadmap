#!/bin/bash

cd "$(dirname "$0")/apps/web"

echo "🔨 开始构建 Mobile+Admin APK..."

# 备份原来的配置
if [ -f capacitor.config.json ]; then
  cp capacitor.config.json capacitor.config.json.backup
fi

# 使用 Mobile+Admin 配置
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

# 构建 Mobile+Admin 版本
pnpm build:all

# 重命名输出目录
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

echo "✅ Mobile+Admin APK 构建完成！"
echo "📱 位置：android-mobile/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📋 APK中包含："
echo "   - 操作端 (mobile)"
echo "   - 管理端 (admin)"
echo "   - 两个页面可以相互跳转"
