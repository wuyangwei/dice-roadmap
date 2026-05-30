# 🚀 ngrok 外网访问完整指南

## 📋 当前状态
- ✅ ngrok 已全局安装
- ✅ 本地服务运行在 5173 端口 (前端) + 3001 端口 (后端)
- ✅ 项目已构建完成

---

## 🎯 方式一：直接运行命令（推荐）

在 `/workspace` 目录下执行：

```bash
# 1. 先清除代理设置
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
export NO_PROXY=*
export no_proxy=*

# 2. 启动 ngrok
ngrok http 5173
```

几秒钟后，你会看到：
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:5173
```

用这个 `https://...ngrok-free.app` 地址在任何设备上访问！

---

## 📱 访问页面

获得 ngrok 地址后，可访问：

| 页面 | 路径 |
|------|------|
| 📱 手机操作 | `/mobile` |
| 📺 大屏展示 | `/display` |
| 🔐 管理后台 | `/admin` |

---

## 🔑 默认凭据

- **管理员**：`888888`
- **操作员**：`123456`

---

## 💡 使用提示

1. **保持 ngrok 窗口运行** - 关闭后隧道将失效
2. **免费版限制** - 不活动时会断开，域名每次重启会变化
3. **本地服务必须运行** - 确保前端 (5173) 和后端 (3001) 都在运行

---

## 🔄 如果 ngrok 失败

### 备选方案 1：使用 localtunnel
```bash
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
npx localtunnel --port 5173
```

### 备选方案 2：使用 cloudflared
```bash
# 下载安装
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64

# 启动隧道
./cloudflared-linux-amd64 tunnel --url http://localhost:5173
```

---

## 📂 我为你创建的文件

- `NGROK_GUIDE.md` - 本指南
- `start-ngrok.js` - ngrok 启动脚本
- `test-ngrok.js` - 测试脚本
- `EXTERNAL_ACCESS.md` - 完整外网访问方案

---

## 🚀 现在就开始！

在终端输入：
```bash
cd /workspace
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
ngrok http 5173
```
