# 🇨🇳 国内部署 - Zeabur 方案

## 推荐方案：Zeabur（国内访问友好！）

Zeabur 是对国内开发者很友好的部署平台，可以一键部署！

---

## 第一步：注册 Zeabur

访问：https://zeabur.com

---

## 第二步：部署后端

1. 登录 Zeabur 后，点击「创建新服务」
2. 选择「Git」
3. 关联你的 GitHub 仓库：`wuyangwei/dice-roadmap`
4. 选择分支：`trae/solo-agent-iUGlKT`
5. **构建配置：**
   - **构建命令**：`pnpm install && pnpm run build`
   - **启动命令**：`cd apps/server && node dist/index.js`
   - **工作目录**：留空（默认根目录）
6. **环境变量**：
   点击「添加环境变量」，添加以下内容：
   ```
   PORT=8080
   HOST=0.0.0.0
   NODE_ENV=production
   JWT_SECRET=（填一个随机字符串，比如用密码生成器）
   OPERATOR_PIN=123456
   ADMIN_PIN=888888
   DATA_DIR=/var/data
   ```
7. **存储配置**：
   - 点击「添加存储卷」
   - 卷名称：`data`
   - 挂载路径：`/var/data`
   - 大小：1GB
8. 点击「部署」

等待部署完成，记下后端地址，类似：`https://xxx.zeabur.app`

---

## 第三步：部署前端

1. 在 Zeabur 中再次点击「创建新服务」
2. 还是关联 GitHub 仓库
3. **构建配置：**
   - **构建命令**：`cd apps/web && npm install && npm run build`
   - **输出目录**：`apps/web/dist`
4. 点击「部署」

部署完成后，记下前端地址，类似：`https://yyy.zeabur.app`

---

## 第四步：配置前端连接后端

### 1. 更新配置文件
本地修改 `apps/web/src/config.ts`：
```typescript
export const config = {
  apiBase: 'https://xxx.zeabur.app',  // 替换为你的后端地址
  webSocketUrl: 'wss://xxx.zeabur.app'  // 替换为你的后端地址
};
```

### 2. 重新构建
```bash
pnpm run build
```

### 3. 重新部署前端
提交并推送代码到 GitHub，Zeabur 会自动重新构建和部署。

---

## 🎉 完成！

访问你的前端地址，就可以用了！

---

## 其他备选方案

### 方案二：本地穿透（完全免费）

如果你不想注册任何平台，也可以这样：

1. **前端**：用 Cloudflare Pages（或 GitHub Pages）
2. **后端**：在你自己电脑本地运行
3. **穿透**：用「花生壳」或「ngrok」把本地端口映射出去

#### 步骤：
1. 本地运行后端：`pnpm dev:server`
2. 下载并安装「花生壳」
3. 配置映射，把本地 3001 端口映射到公网地址
4. 配置前端连接到穿透地址
5. 前端部署到 Cloudflare Pages

---

## 💡 提示

1. **试试 Zeabur**：这个对国内用户最友好
2. **腾讯云轻量**：最稳定，需要花钱但不贵
3. **本地穿透**：完全免费，但你的电脑不能关机

---

你想试试哪个方案？我可以继续帮你！
