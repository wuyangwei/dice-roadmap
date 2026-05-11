# 斐讯 N1 部署说明

将 dice-roadmap 部署到斐讯 N1 盒子，实现：

- 后端服务开机自启（PM2 守护）
- N1 开 WiFi 热点，手机无需路由器直接连接操作
- 电视通过 HDMI 全屏展示大屏页面（Kiosk 模式）

---

## 硬件准备

- 斐讯 N1（已刷 Armbian，内置 WiFi 可用）
- HDMI 线 + 电视/显示器
- 网线（首次配置时使用，配置完成后可拔掉）

---

## 一键部署

在 N1 上克隆项目后，直接运行部署脚本：

```bash
git clone https://github.com/wuyangwei/dice-roadmap.git
cd dice-roadmap
sudo bash deploy.sh
```

脚本会自动完成以下所有步骤：

1. 安装系统依赖（hostapd、dnsmasq、Chromium 等）
2. 安装 Node.js 20（nvm）、pnpm、PM2
3. 安装项目依赖并构建前后端
4. 生成 `.env` 配置（JWT Secret 随机生成）
5. 用 PM2 启动后端服务并设置开机自启
6. 配置 WiFi 热点（SSID: `DiceRoadmap`，密码: `12345678`）
7. 配置电视大屏 Kiosk 自启（重启后自动全屏展示）

部署完成后**重启一次 N1** 使所有配置生效：

```bash
reboot
```

---

## 自定义参数

```bash
sudo bash deploy.sh \
  --port 3030 \          # 后端端口（默认 3030）
  --operator 123456 \    # 操作员 PIN（默认 123456）
  --admin 888888 \       # 管理员 PIN（默认 888888）
  --hotspot yes \        # 是否配置 WiFi 热点（默认 yes）
  --kiosk yes \          # 是否配置电视大屏自启（默认 yes）
  --skip-deps            # 跳过系统依赖安装（重复部署时加速）
```

---

## 访问地址

重启后手机搜索 WiFi 热点 `DiceRoadmap`，密码 `12345678`，连接后访问：

| 页面 | 地址 |
|------|------|
| 操作员端 | http://192.168.4.1:3030 |
| 管理员端 | http://192.168.4.1:3030/admin |
| 大屏展示 | http://192.168.4.1:3030/display |

电视通过 HDMI 连接 N1，开机约 60 秒后自动全屏显示大屏页面。

---

## 日常运维

```bash
pm2 status                  # 查看服务状态
pm2 logs roadmap-server     # 查看日志
pm2 restart roadmap-server  # 重启服务
```

数据备份：SQLite 数据库文件在 `data/` 目录，备份此目录即可保留所有历史数据。

---

## 常见问题

**热点发不出来**

检查 wlan0 是否识别：`ip link show wlan0`。若无，可插一个 RTL8188 芯片的 USB WiFi 网卡（约 ¥15，Linux 驱动支持好），修改脚本中 `WIFI_IFACE` 为对应接口名后重新运行。

**电视黑屏 / 白屏**

确认后端服务已启动：`pm2 status`；手动测试接口：`curl http://localhost:3030/api/health`。

**重新部署（更新代码）**

```bash
git pull
sudo bash deploy.sh --skip-deps
```
