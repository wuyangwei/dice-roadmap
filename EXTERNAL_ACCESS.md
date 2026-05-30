# 🌐 外网访问指南

## 📋 当前状态

✅ **服务已启动并运行：
- 📱 前端服务：`http://localhost:5173`
- 🔌 后端API：`http://localhost:3001`
- 🔧 构建版本：生产构建已完成

## 🎯 实现外网访问的三种方案

---

## 方案一：使用 ngrok (推荐，最简单)

1. 安装 ngrok：
```bash
# 方式1：使用 npm
npm install -g ngrok

# 方式2：下载安装 (更稳定)
# 访问 https://ngrok.com/download 下载对应版本
```

2. 启动隧道：
```bash
ngrok http 5173
```

3. 访问提供的公网 URL 即可

---

## 方案二：使用 localtunnel (免费，无需注册)

1. 已安装，直接启动：
```bash
cd /workspace
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
npx localtunnel --port 5173
```

2. 会获得一个 `https://*.loca.lt 地址

---

## 方案三：使用 Cloudflare Tunnel (最稳定，长期使用推荐)

1. 安装 cloudflared：
```bash
# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

2. 启动隧道：
```bash
cloudflared tunnel --url http://localhost:5173
```

---

## 方案四：使用 Serveo (SSH隧道)

```bash
ssh -R 80:localhost:5173 serveo.net
```

---

## 📱 项目页面路径

无论使用哪种方案，获得公网 URL 后，可访问：

- **手机操作页**：`[公网URL]/mobile
- **大屏展示页**：`[公网URL]/display  
- **管理后台**：`[公网URL]/admin
- **健康检查**：`[公网URL]/api/health`

默认 PIN：
- 管理员：`888888
- 操作员：`123456

---

## 💡 重要提示

1. 保持开发服务器需要持续运行，否则隧道将失效
2. 免费隧道会在一段时间不活动可能断开
3. 建议不要将公网URL分享给需要访问的人员
4. 生产环境请使用固定域名和SSL证书

---

## 🚀 快速开始 (尝试 ngrok

```bash
# 在 /workspace 目录执行
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
npm install -g ngrok
ngrok http 5173
```
