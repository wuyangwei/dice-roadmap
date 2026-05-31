#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$SCRIPT_DIR/apps/web"

cd "$WEB_DIR"

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

# 如果 Android 项目不存在，创建并同步
if [ ! -d android-mobile ]; then
  echo "📱 创建 Android 项目..."
  npx cap add android
  mv android android-mobile
  npx cap sync
else
  # 项目已存在，手动复制 web 资源
  echo "🔄 同步 web 资源到 Android 项目..."
  # 删除旧的 web 资源
  rm -rf "$WEB_DIR/android-mobile/app/src/main/assets/public"
  # 复制新的 web 资源
  cp -r "$WEB_DIR/dist-mobile" "$WEB_DIR/android-mobile/app/src/main/assets/public"
fi

# 打开 Android Studio 进行构建
echo "🖥️ 打开 Android Studio..."
open -a "Android Studio" "$WEB_DIR/android-mobile"

# 恢复原来的配置
mv capacitor.config.json.backup capacitor.config.json

echo ""
echo "✅ Mobile+Admin APK 构建完成！"
echo "📱 位置：$WEB_DIR/android-mobile/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📋 在 Android Studio 中，点击 'Run' 或 'Build' 来构建 APK"
echo "📋 APK中包含："
echo "   - 操作端 (mobile)"
echo "   - 管理端 (admin)"
echo "   - 两个页面可以相互跳转"
