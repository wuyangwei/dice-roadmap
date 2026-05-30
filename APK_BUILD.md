# APK打包指南

本项目提供了多种方式将控制页面打包成APK。

---

## 方案一：HBuilderX（推荐，最简单！）

HBuilderX 是国内开发的工具，打包APK非常简单！

### 步骤

1. **下载 HBuilderX**
   - 访问：https://www.dcloud.io/hbuilderx.html
   - 下载 **标准版**

2. **构建项目**
   ```bash
   cd apps/web
   npm run build
   ```

3. **在 HBuilderX 中导入**
   - 打开 HBuilderX
   - 文件 → 导入 → 从本地目录导入
   - 选择 `apps/web/dist` 目录

4. **配置项目**
   - 右键项目 → 发行 → 原生App-云打包
   - 填写应用信息：
     - 应用名称：`Dice Roadmap`
     - 应用ID：`com.dice.roadmap`
     - 应用版本：`1.0.0`

5. **打包**
   - 点击打包
   - 等待云打包完成
   - 下载生成的APK

---

## 方案二：PWABuilder（在线打包）

### 步骤

1. **构建项目**
   ```bash
   cd apps/web
   npm run build
   ```

2. **访问 PWABuilder**
   - 打开：https://www.pwabuilder.com/
   - 输入你的网站地址或上传 `dist` 目录

3. **配置**
   - 填写应用信息
   - 选择 Android 平台

4. **下载 APK**
   - 点击打包
   - 下载生成的APK

---

## 方案三：Capacitor（需要 Android Studio）

### 前提条件

- 安装 Android Studio
- 配置 Java 环境
- 配置 Android SDK

### 步骤

1. **安装依赖**
   ```bash
   cd apps/web
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **初始化 Capacitor**
   ```bash
   npx cap init "Dice Roadmap" com.dice.roadmap
   ```

3. **构建项目**
   ```bash
   npm run build
   ```

4. **添加 Android 平台**
   ```bash
   npx cap add android
   ```

5. **同步代码**
   ```bash
   npx cap sync
   ```

6. **打开 Android Studio**
   ```bash
   npx cap open android
   ```

7. **在 Android Studio 中打包**
   - Build → Generate Signed Bundle/APK
   - 选择 APK
   - 按照向导完成打包

---

## 📱 修改服务器地址

在你的手机浏览器中直接访问：
```
http://119.91.193.22:3001
```

或者打包APK后，在APP中访问！

---

## 🔧 简单替代方案（无需打包）

如果你不想打包，可以：

1. **手机浏览器直接访问**
   - 在手机浏览器中输入：`http://119.91.193.22:3001`
   - 保存到主屏幕（添加快捷方式）

2. **使用 PWA 功能**
   - 如果浏览器支持，可以添加到主屏幕
   - 体验类似APP

---

## ⚠️ 注意事项

1. **确保服务器正在运行**
   - 你的腾讯云服务器必须开启
   - 端口3001必须开放

2. **网络访问**
   - 手机和服务器需要网络连接

3. **HTTPS**
   - 如果需要HTTPS，需要配置SSL证书

---

需要我帮你详细讲某个方案吗？🚀
