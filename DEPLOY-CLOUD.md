# dice-roadmap 云服务部署指南

本指南介绍如何将 dice-roadmap 部署到国内主流云服务（阿里云、腾讯云、华为云等），以及完全免费的国际云服务方案。

---

## 一、云服务选择推荐

### 🎉 首选完全免费方案！

| 服务商 | 免费额度 | 特点 | 国内访问 |
|--------|---------|------|---------|
| **Fly.io** | 1个共享CPU，1GB存储，160GB流量/月 | 香港节点，支持Socket.IO | 较慢但可用 |
| **Render** | 750小时/月，100GB流量/月 | 新加坡节点，一键部署 | 较慢但可用 |

**推荐理由**：完全免费，长期可用！

---

## 二、完全免费部署方案（Fly.io）

### Fly.io 部署（推荐）

Fly.io 是目前最适合部署的免费平台，提供香港节点！

#### 前置准备

1. 注册 Fly.io 账号：https://fly.io
2. 安装 Fly CLI：
   ```bash
   # macOS
   brew install flyctl
   # Linux
   curl -L https://fly.io/install.sh | sh
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

#### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/wuyangwei/dice-roadmap.git
cd dice-roadmap

# 2. 登录 Fly.io
fly auth login

# 3. 初始化应用（按照提示操作）
fly launch

# 4. 创建卷存储（持久化数据）
fly volumes create roadmap_data --size 1

# 5. 部署
fly deploy

# 6. 设置环境变量
fly secrets set JWT_SECRET=$(openssl rand -hex 32)
fly secrets set OPERATOR_PIN=123456
fly secrets set ADMIN_PIN=888888

# 7. 查看应用状态
fly status

# 8. 查看日志
fly logs
```

部署完成后，访问地址为：`https://your-app-name.fly.dev`

#### 访问地址

| 页面 | 地址 |
|------|------|
| 操作员端 | `https://your-app-name.fly.dev` |
| 管理员端 | `https://your-app-name.fly.dev/admin` |
| 大屏展示 | `https://your-app-name.fly.dev/display` |

---

## 三、完全免费部署方案（Render）

### Render 部署

Render 提供一键部署，配置简单！

#### 前置准备

1. 注册 Render 账号：https://render.com
2. 将项目推送到 GitHub/GitLab

#### 部署步骤

1. 登录 Render，点击 "New +" → "Web Service"
2. 选择你的 GitHub 仓库
3. 配置：
   - Name: `dice-roadmap`
   - Region: `Singapore`
   - Environment: `Docker`
   - Plan: `Free`
4. 点击 "Create Web Service"
5. 部署完成后，访问地址为：`https://dice-roadmap.onrender.com`

#### 访问地址

| 页面 | 地址 |
|------|------|
| 操作员端 | `https://dice-roadmap.onrender.com` |
| 管理员端 | `https://dice-roadmap.onrender.com/admin` |
| 大屏展示 | `https://dice-roadmap.onrender.com/display` |

---

## 四、付费国内云服务（性价比高）

### 🎯 首选：阿里云轻量应用服务器（性价比最高）

| 配置 | 首月价格 | 续费价格 | 特点 |
|------|---------|---------|------|
| 2核2G 40G SSD | ¥9.9 | ¥99/月 | 适合个人使用，性能足够 |
| 2核4G 60G SSD | ¥19.9 | ¥199/月 | 推荐配置，更稳定 |

**推荐理由**：
- 首月价格极低，适合测试
- 完整 VPS 环境，灵活性高
- 支持长期运行 Socket.IO 服务
- 国内访问速度快

### 🎯 备选：腾讯云轻量应用服务器

| 配置 | 首月价格 | 续费价格 |
|------|---------|---------|
| 2核2G 40G SSD | ¥10 | ¥99/月 |
| 2核4G 80G SSD | ¥28 | ¥268/月 |

### 🎯 容器化：华为云云容器实例 CCI

- 按需付费，资源闲置时不收费
- 支持 Docker 镜像直接部署
- 适合流量波动较大的场景

---

## 五、云服务器部署（推荐）

### 前置准备

1. 购买一台云服务器（推荐 Ubuntu 20.04/22.04）
2. 配置安全组/防火墙：开放 `3001` 端口
3. 如果需要域名访问：购买域名并解析到服务器 IP

### 一键部署

使用 `deploy-cloud.sh` 脚本一键部署：

```bash
# SSH 登录到服务器
ssh root@your-server-ip

# 克隆项目
git clone https://github.com/wuyangwei/dice-roadmap.git
cd dice-roadmap

# 运行部署脚本
sudo bash deploy-cloud.sh
```

### 自定义参数部署

```bash
# 完整参数示例
sudo bash deploy-cloud.sh \
  --port 3001 \
  --operator 123456 \
  --admin 888888 \
  --domain roadmap.your-domain.com
```

参数说明：
- `--port`：后端端口（默认 3001）
- `--operator`：操作员 PIN（默认 123456）
- `--admin`：管理员 PIN（默认 888888）
- `--domain`：绑定域名（可选，自动配置 Nginx）
- `--skip-deps`：跳过系统依赖安装（重复部署时使用）

### 访问地址

部署完成后，通过以下地址访问：

| 页面 | 地址 |
|------|------|
| 操作员端 | `http://your-server-ip:3001` |
| 管理员端 | `http://your-server-ip:3001/admin` |
| 大屏展示 | `http://your-server-ip:3001/display` |

如果绑定了域名：
| 页面 | 地址 |
|------|------|
| 操作员端 | `http://your-domain.com` |
| 管理员端 | `http://your-domain.com/admin` |
| 大屏展示 | `http://your-domain.com/display` |

### 日常运维

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs roadmap-server

# 重启服务
pm2 restart roadmap-server

# 停止服务
pm2 stop roadmap-server
```

数据备份：数据库文件位于 `data/` 目录，定期备份此目录即可。

---

## 六、容器化部署（Docker）

### 使用 Docker Compose 本地测试

```bash
# 克隆项目
git clone https://github.com/wuyangwei/dice-roadmap.git
cd dice-roadmap

# 复制环境变量模板
cp .env.example .env
# 编辑 .env 文件，配置 JWT_SECRET 等参数

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 构建并运行 Docker 镜像

```bash
# 构建镜像
docker build -t dice-roadmap .

# 运行容器
docker run -d \
  --name dice-roadmap \
  -p 3001:3001 \
  -v roadmap-data:/app/data \
  -e JWT_SECRET=your-secret-key \
  -e OPERATOR_PIN=123456 \
  -e ADMIN_PIN=888888 \
  --restart unless-stopped \
  dice-roadmap
```

---

## 七、安全建议

1. **修改默认 PIN**：首次部署后立即修改管理员和操作员 PIN
2. **配置 HTTPS**：使用 Certbot 申请免费 SSL 证书
3. **配置防火墙**：只开放必要端口（80, 443）
4. **定期备份数据**：备份 `data/` 目录
5. **更新系统**：定期更新系统和依赖包

### 配置 HTTPS（使用 Certbot）

```bash
# 安装 Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 八、常见问题

### Q: 云函数可以部署吗？
A: 不推荐。云函数（如阿里云 FC、腾讯云 SCF）不适合长期运行 Socket.IO 连接，会频繁冷启动。

### Q: 免费云服务有推荐吗？
A: 推荐以下两个完全免费的国际平台：
- **Fly.io**：香港节点，1个共享CPU，1GB存储，160GB流量/月
- **Render**：新加坡节点，750小时/月，100GB流量/月

这两个平台都支持 Socket.IO，可以长期免费使用！详见文档第二章和第三章。

### Q: 如何更新代码？
A:
```bash
cd /path/to/dice-roadmap
git pull
sudo bash deploy-cloud.sh --skip-deps
```

### Q: 数据如何迁移？
A: 备份 `data/` 目录，在新服务器上恢复即可。
