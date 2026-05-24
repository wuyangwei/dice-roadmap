# 🇨🇳 国内部署方案 - 腾讯云轻量应用服务器

## 方案一：腾讯云轻量应用服务器（推荐！）

最简单、最稳定的方案！前后端都部署在同一台服务器，完美支持 Socket.IO！

---

## 第一步：购买腾讯云轻量应用服务器

### 1. 访问腾讯云
打开浏览器访问：https://cloud.tencent.com/product/lighthouse

### 2. 购买轻量应用服务器
1. 注册/登录腾讯云账号（需要实名认证）
2. 选择「轻量应用服务器」
3. **推荐配置（入门型）**：
   - **套餐：入门型
   - **配置**：1核2GB
   - **系统镜像**：Ubuntu 22.04 LTS
   - **地域**：选择离你近的地方（比如广州/上海/北京）
   - **带宽**：3Mbps 或更高
   - **时长**：先买1个月试试，觉得好用再续费

购买完成后，你会得到一个 **公网 IP 地址。

---

## 第二步：连接服务器

### 1. 下载 SSH 工具
- Windows 可以用 **PuTTY** 或 **Windows Terminal**
- Mac/Linux 直接用终端

### 2. 连接服务器
```bash
# 把下面的命令，替换成你的服务器 IP
ssh root@你的服务器IP
# 输入购买时设置的密码
```

---

## 第三步：安装环境

在服务器终端中执行：

### 1. 更新系统
```bash
apt-get update -y && apt-get upgrade -y
```

### 2. 安装 Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs -y
```

### 3. 安装 pnpm
```bash
npm install -g pnpm@10
```

### 4. 安装 pm2（进程管理工具）
```bash
npm install -g pm2
```

### 5. 安装 nginx（Web 服务器）
```bash
apt-get install -y nginx
```

### 6. 安装 Git
```bash
apt-get install -y git
```

---

## 第四步：部署应用

### 1. 克隆代码
```bash
cd /root
git clone https://github.com/wuyangwei/dice-roadmap.git
cd dice-roadmap
```

### 2. 安装依赖
```bash
pnpm install
pnpm run build
```

### 3. 配置环境变量
```bash
cat > .env << EOF
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
JWT_SECRET=（这里填一个随机字符串，比如自己编一个长一点的密码
OPERATOR_PIN=123456
ADMIN_PIN=888888
DATA_DIR=/var/data
EOF
```

### 4. 创建数据目录
```bash
mkdir -p /var/data
```

### 5. 启动后端服务
```bash
cd apps/server
pm2 start dist/index.js --name dice-roadmap-server
pm2 save
pm2 startup
# 执行这里会提示你复制一条命令，复制执行，那条命令可以让服务开机自启
```

---

## 第五步：配置 Nginx

### 1. 创建 Nginx 配置文件
```bash
cat > /etc/nginx/sites-available/dice-roadmap << 'EOF'
server {
    listen 80;
    server_name 你的服务器IP;

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
EOF
```

### 2. 启用配置
```bash
ln -sf /etc/nginx/sites-available/dice-roadmap /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## 🎉 完成！

现在你可以在浏览器输入你的服务器 IP 就能访问了！

**访问地址**：`http://你的服务器IP`

---

## 备选方案二：Zeabur（国内访问友好）

如果腾讯云太麻烦，可以试试 **Zeabur**，这个平台对国内开发者很友好：

1. 访问 https://zeabur.com
2. 关联 GitHub 仓库
3. 一键部署前后端

---

## 备选方案三：Cloudflare Pages + 本地服务器穿透

如果不想买服务器，可以用 Cloudflare Pages 部署前端，本地电脑运行后端，用内网穿透工具（花生壳、ngrok）

---

## 💡 提示

1. **成本说明：腾讯云轻量应用服务器新用户通常有优惠，大概几十块钱一个月
2. **备份数据：数据在 /var/data 目录，记得定期备份
3. **安全组配置：记得配置防火墙只开放需要的端口
4. **域名绑定（可选）：有域名可以绑定，配 HTTPS

---

## 🤔 需要我帮你配置哪个方案？

按照上面的一步步操作，很快就能用起来了！
