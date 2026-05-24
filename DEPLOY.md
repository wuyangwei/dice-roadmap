# 骰子路线图 - 国内部署指南

## 方案一：Sealos（推荐，国内访问快，最简单）

### 前端部署到 Sealos

1. **访问 [Sealos](https://sealos.io/)**，注册账号（免费）
2. **构建前端**：
   ```bash
   cd apps/web
   npm install
   npm run build
   ```
3. **部署前端**：
   - 访问 Sealos 静态托管
   - 将 `apps/web/dist` 文件夹直接拖拽上传
   - 获得访问地址：`https://xxx.sealos.run`

### 后端部署到 Sealos

1. **准备 Dockerfile**（已为你创建）
2. **推送代码到 GitHub**
3. **在 Sealos 部署后端**：
   - 使用容器部署
   - 配置环境变量
   - 挂载数据卷（用于 SQLite 数据库）

---

## 方案二：腾讯云 CloudBase（全栈 Serverless）

### 前置准备
1. 注册 [腾讯云账号](https://cloud.tencent.com/) 并完成实名认证
2. 开通 [云开发 CloudBase](https://console.cloud.tencent.com/tcb)
3. 创建免费体验环境

### 前端部署（静态托管）

1. **安装 CloudBase CLI**：
   ```bash
   npm install -g @cloudbase/cli
   ```

2. **登录**：
   ```bash
   tcb login
   ```

3. **构建前端**：
   ```bash
   cd apps/web
   npm install
   npm run build
   ```

4. **部署前端**：
   ```bash
   # 在项目根目录
   tcb hosting:deploy apps/web/dist -e your-env-id
   ```

### 后端部署（云函数）

注意：你的项目使用了 Socket.IO，云函数对长连接支持有限。建议使用轻量应用服务器部署后端。

---

## 方案三：腾讯云轻量应用服务器（推荐，完整功能）

### 1. 购买轻量应用服务器
- 选择 **入门型** 配置（1核2GB，足够免费额度）
- 选择系统：Ubuntu 22.04
- 选择地域：靠近你的位置

### 2. 连接服务器
```bash
ssh root@your-server-ip
```

### 3. 安装环境
```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 安装 pm2
npm install -g pm2

# 安装 nginx
apt-get install -y nginx
```

### 4. 部署应用
```bash
# 克隆代码
git clone your-repo-url
cd dice-roadmap

# 安装依赖
npm install
npm run build

# 配置环境变量
cat > .env << EOF
PORT=3001
HOST=0.0.0.0
JWT_SECRET=your-secret-key
OPERATOR_PIN=123456
ADMIN_PIN=888888
DATA_DIR=/var/data
EOF

# 创建数据目录
mkdir -p /var/data

# 启动后端服务
cd apps/server
pm2 start dist/index.js --name dice-roadmap-server
pm2 save
pm2 startup
```

### 5. 配置 Nginx
```nginx
# /etc/nginx/sites-available/dice-roadmap
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/apps/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 代理
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

启用配置：
```bash
ln -s /etc/nginx/sites-available/dice-roadmap /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 前端配置更新

部署后，更新 `apps/web/src/config.ts` 中的地址：

```typescript
export const config = {
  apiBase: 'https://your-backend-domain.com', // 你的后端地址
  webSocketUrl: 'wss://your-backend-domain.com'
};
```

---

## 快速开始（最简单方案）

如果你想最快体验，推荐：
1. **前端**：使用 Sealos 静态托管（拖拽上传，3分钟搞定）
2. **后端**：使用 Render（免费额度，支持 Socket.IO）
3. **或者**：直接在本地运行，内网穿透访问（如 ngrok）

需要我帮你配置具体某个方案吗？
