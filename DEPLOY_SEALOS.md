# Sealos 部署指南

## 🚀 快速开始（推荐方案）

### 方案：Sealos 前端 + Render 后端（免费额度）

这是最推荐的方案，既保证国内访问速度，又能免费使用完整功能。

---

## 第一步：部署前端到 Sealos

### 1. 准备部署文件
前端构建产物已经在 `apps/web/dist` 目录下准备好了！

### 2. 访问 Sealos
打开浏览器访问：https://sealos.io

### 3. 部署静态网站
1. 注册/登录 Sealos 账号
2. 点击「应用管理」→「静态网站」
3. 点击「新建」
4. **方式一：直接上传（推荐新手）**
   - 选择「上传文件夹」
   - 选择本地的 `apps/web/dist` 目录
   - 点击「部署」
5. **方式二：Git 自动部署（推荐开发者）**
   - 关联你的 GitHub 仓库
   - 配置：
     - 构建命令：`cd apps/web && npm install && npm run build`
     - 输出目录：`apps/web/dist`
   - 点击「部署」

### 4. 获取前端地址
部署完成后，你会得到一个类似 `https://xxx.sealos.run` 的访问地址。

---

## 第二步：部署后端到 Render

### 1. 访问 Render
打开浏览器访问：https://render.com

### 2. 一键部署
1. 注册/登录 Render 账号
2. 点击「New +」→「Web Service」
3. 关联你的 GitHub 仓库
4. 配置部署选项：
   - **Name**: `dice-roadmap-backend`
   - **Region**: 选择新加坡或东京（国内访问快）
   - **Branch**: `trae/solo-agent-iUGlKT`
   - **Runtime**: `Node`
   - **Build Command**: `npm install -g pnpm@10 && pnpm install && pnpm run build`
   - **Start Command**: `cd apps/server && node dist/index.js`
   - **Root Directory**: 留空或填 `.`
5. **环境变量**（点击「Advanced」→「Add Environment Variable」）：
   ```
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=（随机生成一串字符，比如用密码生成器）
   OPERATOR_PIN=123456
   ADMIN_PIN=888888
   DATA_DIR=/var/data
   ```
6. **添加数据卷**（点击「Advanced」→「Add Disk」）：
   - **Name**: `data`
   - **Mount Path**: `/var/data`
   - **Size**: `1` GB（足够用了）
7. 点击「Create Web Service」

### 3. 获取后端地址
等待部署完成后，你会得到一个类似 `https://dice-roadmap-backend.onrender.com` 的地址。

---

## 第三步：更新前端配置

### 1. 修改配置文件
打开 `apps/web/src/config.ts`，更新后端地址：

```typescript
export const config = {
  apiBase: 'https://dice-roadmap-backend.onrender.com',  // 替换为你的 Render 地址
  webSocketUrl: 'wss://dice-roadmap-backend.onrender.com'  // 替换为你的 Render 地址
};
```

### 2. 重新构建并部署
```bash
cd apps/web
npm run build
```

然后重新上传 `apps/web/dist` 到 Sealos。

---

## 进阶方案：全栈部署到 Sealos

如果你想把前后端都部署到 Sealos（国内访问更快）：

### 1. 构建后端 Docker 镜像
项目中已经有 [Dockerfile](file:///workspace/Dockerfile) 了。

### 2. 部署后端到 Sealos
1. 在 Sealos 中点击「应用管理」→「容器服务」
2. 点击「新建」
3. 配置：
   - **应用名称**: `dice-roadmap-backend`
   - **镜像**: 可以先推送到 Docker Hub，或者使用 GitHub Actions 自动构建
   - **端口**: `3001`
   - **环境变量**: 和上面 Render 的配置一样
   - **数据卷**: 挂载 `/var/data` 目录
4. 点击「部署」

### 3. 配置前端
同样修改 `config.ts` 中的后端地址为 Sealos 的后端地址。

---

## 📝 注意事项

### Render 免费方案的限制
- 应用 15 分钟没有请求会休眠
- 每月有免费额度限制
- 休眠后首次访问会有几秒钟延迟

### Sealos 的优势
- 国内访问速度快
- 免费额度充足
- 操作简单

---

## 🎉 完成！

现在你应该可以通过 Sealos 的前端地址访问你的应用了！

- **前端地址**: `https://xxx.sealos.run`
- **后端地址**: `https://xxx.onrender.com`（或 Sealos 容器地址）

开始使用吧！
