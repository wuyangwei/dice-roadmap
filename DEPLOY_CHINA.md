# 🇨🇳 国内全栈部署指南 - Sealos

## 推荐方案：Sealos 全栈部署（国内访问最快！）

前后端都部署在 Sealos，保证国内访问速度！

---

## 部署步骤

### 第一步：部署前端到 Sealos 静态托管

前端已经构建好了，就在 `apps/web/dist` 目录！

#### 1. 访问 Sealos
打开浏览器：https://sealos.io

#### 2. 部署静态网站
1. 注册/登录账号
2. 点击「应用管理」→「静态网站」
3. 点击「新建」
4. **选择上传方式：**
   - **方式一（推荐新手）**：直接上传文件夹
     - 点击「上传文件夹」
     - 选择本地的 `apps/web/dist` 目录
   - **方式二（推荐开发者）**：Git 自动部署
     - 关联 GitHub 仓库
     - 配置：
       - 构建命令：`cd apps/web && npm install && npm run build`
       - 输出目录：`apps/web/dist`
5. 点击「部署」
6. 🎉 部署完成！记下你的前端地址，类似：`https://xxx.sealos.run`

---

### 第二步：部署后端到 Sealos 容器服务

#### 1. 准备工作
确保你的代码已经推送到 GitHub：
- 仓库地址：https://github.com/wuyangwei/dice-roadmap
- 分支：`trae/solo-agent-iUGlKT`

#### 2. 在 Sealos 部署后端
1. 点击「应用管理」→「容器服务」→「新建」
2. 填写配置：

**基本信息：**
- **应用名称**：`dice-roadmap-backend`
- **部署源**：选择「Git」

**Git 配置：**
- **代码仓库**：关联你的 GitHub 仓库 `wuyangwei/dice-roadmap`
- **分支**：`trae/solo-agent-iUGlKT`
- **Dockerfile 路径**：`Dockerfile`（项目根目录下的 Dockerfile）

**资源配置：**
- **CPU**：1核
- **内存**：1GB（足够用了）

**端口配置：**
- 点击「暴露端口」
- 端口号：`3001`
- 协议：`TCP`

**环境变量（重要！）：**
点击「环境变量」→「添加」，添加以下变量：
```
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
JWT_SECRET=（这里填一个随机字符串，比如用密码生成器生成）
OPERATOR_PIN=123456
ADMIN_PIN=888888
DATA_DIR=/var/data
```

**数据持久化（重要！）：**
点击「存储卷」→「添加」：
- **卷名称**：`data`
- **挂载路径**：`/var/data`
- **大小**：1GB

**自动配置：**
- 开启「自动重启」（确保服务稳定）

#### 3. 开始部署
点击「部署」，等待几分钟让它构建和启动。

#### 4. 获取后端地址
部署完成后，你会得到一个后端访问地址，类似：`https://dice-roadmap-backend.xxx.sealos.run`

---

### 第三步：配置前端，连接后端

#### 1. 修改配置文件
打开 `apps/web/src/config.ts`，更新为你的实际地址：

```typescript
// 配置文件 - 根据环境自动选择
const isProduction = typeof window !== 'undefined' && 
  window.location.protocol !== 'http:' && 
  !window.location.hostname.includes('localhost') && 
  !window.location.hostname.includes('127.0.0.1');

export const config = {
  // 生产环境使用你的 Sealos 后端地址
  apiBase: isProduction 
    ? 'https://dice-roadmap-backend.xxx.sealos.run'  // 替换为你的实际后端地址！
    : '',
  
  webSocketUrl: isProduction
    ? 'wss://dice-roadmap-backend.xxx.sealos.run'  // 替换为你的实际后端地址！
    : ''
};
```

#### 2. 重新构建前端
```bash
cd /workspace
pnpm run build
```

#### 3. 重新部署前端
回到 Sealos 静态网站管理页面，重新上传更新后的 `apps/web/dist` 文件夹。

---

## 🎉 完成！

现在你可以通过前端地址访问你的应用了！

- **前端地址**：`https://xxx.sealos.run`
- **后端地址**：`https://dice-roadmap-backend.xxx.sealos.run`

---

## 备选方案：腾讯云轻量应用服务器

如果你想更灵活，也可以用腾讯云轻量应用服务器：

### 1. 购买轻量应用服务器
- 访问：https://cloud.tencent.com/product/lighthouse
- 选择配置：1核2GB（入门型足够了）
- 选择镜像：Ubuntu 22.04
- 选择地域：离你近的地方

### 2. 连接服务器
```bash
ssh root@你的服务器IP
```

### 3. 安装环境
```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm@10

# 安装 pm2（进程管理）
npm install -g pm2

# 安装 nginx（Web 服务器）
apt-get install -y nginx
```

### 4. 部署应用
```bash
# 克隆代码
cd /root
git clone https://github.com/wuyangwei/dice-roadmap.git
cd dice-roadmap

# 安装依赖
pnpm install
pnpm run build

# 配置环境变量
cat > .env << EOF
PORT=3001
HOST=0.0.0.0
JWT_SECRET=你的随机密钥
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
编辑 `/etc/nginx/sites-available/dice-roadmap`：
```nginx
server {
    listen 80;
    server_name 你的域名或服务器IP;

    # 前端静态文件
    location / {
        root /root/dice-roadmap/apps/web/dist;
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

### 6. 配置 HTTPS（可选但推荐）
用 Let's Encrypt 免费证书：
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d 你的域名
```

---

## 📝 Sealos 免费额度说明

- **静态托管**：免费流量充足，小项目够用
- **容器服务**：有免费额度，具体看当前政策
- **数据卷**：1GB 免费存储

---

## 💡 提示

1. **JWT_SECRET** 一定要改！用密码生成器生成一个随机字符串
2. **数据持久化**：一定要配置存储卷，否则重启后数据会丢失！
3. **定期备份**：重要数据记得定期备份
4. **监控告警**：可以配置一下服务监控，确保服务稳定运行

---

## 🎊 开始使用吧！

按照上面的步骤一步步操作，很快就能用起来了！有问题随时回来问我~
