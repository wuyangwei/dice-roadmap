#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$SCRIPT_DIR/apps/web"

cd "$WEB_DIR"

echo "🔨 Display APK 项目已准备好！"
echo "📱 包名：com.dice.roadmap.display"
echo "🌐 加载页面：http://119.91.193.22:3001/display"
echo ""
echo "🖥️ 正在打开 Android Studio..."
open -a "Android Studio" "$WEB_DIR/android-display"
echo ""
echo "✅ 请在 Android Studio 中点击 'Build' -> 'Build Bundle(s) / APK(s)' -> 'Build APK(s)' 来生成 APK 文件"
echo "📱 APK 文件位置：$WEB_DIR/android-display/app/build/outputs/apk/debug/app-debug.apk"
