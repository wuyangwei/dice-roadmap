#!/bin/bash

cd "$(dirname "$0")/apps/web"

# 备份原来的配置
if [ -f capacitor.config.ts ]; then
  mv capacitor.config.ts capacitor.config.ts.backup
fi

# 使用 mobile 配置
cp capacitor.config.mobile.ts capacitor.config.ts

# 构建 mobile 版本
pnpm build:mobile

# 如果没有 Android 项目，添加
if [ ! -d android-mobile ]; then
  npx cap add android
  mv android android-mobile
fi

# 同步并打开
cd ..
cd web
npx cap sync
npx cap open android

# 恢复原来的配置
mv capacitor.config.ts.backup capacitor.config.ts

echo "✅ 已打开 Android Studio！请在 Android Studio 里构建 APK"
echo "📱 APK 位置：android-mobile/app/build/outputs/apk/debug/app-debug.apk"
