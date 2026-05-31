#!/bin/bash

cd "$(dirname "$0")/apps/web"

echo "🔨 开始构建 Display APK..."

# 备份原来的配置
if [ -f capacitor.config.json ]; then
  cp capacitor.config.json capacitor.config.json.backup
fi

# 使用 Display 配置
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

# 构建 Display 版本
pnpm build:display

# 重命名输出目录
mv dist dist-display

# 如果没有 Android 项目，添加
if [ ! -d android-display ]; then
  npx cap add android
  mv android android-display
fi

# 同步
cd android-display
npx cap sync

# 打开 Android Studio
open -a "Android Studio" .

# 恢复原来的配置
cd ..
mv capacitor.config.json.backup capacitor.config.json

echo "✅ Display APK 构建完成！"
echo "🖥️ 位置：android-display/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📱 只能在APK中查看大屏展示页面"
