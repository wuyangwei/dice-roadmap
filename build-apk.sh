#!/bin/bash

set -e

echo "======================================"
echo "  Dice Roadmap APK 打包脚本"
echo "======================================"

# 检查依赖
check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ 错误：$1 未安装！"
        echo "请先安装 $1"
        exit 1
    fi
}

echo "🔍 检查依赖..."
check_dependency node
check_dependency npm
check_dependency java

echo "✅ 依赖检查通过！"

# 进入项目目录
cd "$(dirname "$0")"

# 安装 Capacitor 依赖
echo "📦 安装 Capacitor 依赖..."
cd apps/web

# 安装 Capacitor
if [ ! -d "node_modules/@capacitor" ]; then
    npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
fi

# 构建前端
echo "🔨 构建前端项目..."
npm run build

# 初始化 Capacitor (如果还没有)
if [ ! -f "capacitor.config.ts" ]; then
    npx cap init "Dice Roadmap" com.dice.roadmap
fi

# 添加 Android 平台
if [ ! -d "android" ]; then
    echo "📱 添加 Android 平台..."
    npx cap add android
fi

# 同步代码
echo "🔄 同步代码到 Android 项目..."
npx cap sync

# 构建 APK
echo "📦 构建 APK..."
cd android

# 构建 debug APK
./gradlew assembleDebug

echo "🎉 APK 构建完成！"
echo "📱 APK 位置: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
