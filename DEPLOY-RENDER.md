# Render 部署超详细步骤指南

本文档将手把手教你如何在 Render 上免费部署 dice-roadmap！

---

## ⏱️ 预计时间：10-15 分钟

---

## 📋 前置准备清单

在开始之前，请确保你有：

- [ ] 一个 GitHub 账号（免费）
- [ ] 一个 Render 账号（免费注册）
- [ ] 已将 dice-roadmap 项目推送到 GitHub

---

## 第一步：准备 GitHub 仓库

### 1.1 Fork 或克隆项目

如果你还没有项目在 GitHub 上：

```bash
# 1. 在 GitHub 上创建一个新仓库（命名为 dice-roadmap）
# 2. 克隆项目到本地
git clone https://github.com/wuyangwei/dice-roadmap.git
cd dice-roadmap

# 3. 推送到你的 GitHub 仓库
git remote set-url origin https://github.com/你的用户名/dice-roadmap.git
git push -u origin main
```

或者直接在 GitHub 上 Fork 原项目：
https://github.com/wuyangwei/dice-roadmap → 点击右上角 "Fork"

---

## 第二步：注册 Render 账号

1. 访问 https://render.com
2. 点击右上角 "Sign Up"
3. 选择 "Sign up with GitHub"（推荐，方便后续部署）
4. 授权 Render 访问你的 GitHub 账号
5. 完成注册流程

---

## 第三步：创建 Web Service（详细步骤）

### 3.1 开始创建

登录 Render 后，你会看到仪表盘。

1. 点击页面右上角的 **"New +"** 按钮
2. 在下拉菜单中选择 **"Web Service"**

### 3.2 选择 GitHub 仓库

1. 你会看到一个列表，显示你有权限访问的 GitHub 仓库
2. 找到你的 `dice-roadmap` 仓库
3. 点击仓库旁边的 **"Connect"** 按钮

如果没看到你的仓库：
- 点击 "Configure account" 或 "Connect account"
- 授权 Render 访问你的 GitHub 仓库

### 3.3 配置部署参数（关键步骤）

这一步很重要，请仔细配置！

#### 基本信息

| 配置项 | 填写内容 | 说明 |
|--------|---------|------|
| **Name** | `dice-roadmap`（或你喜欢的名字） | 这个名字会成为你的访问地址的一部分 |
| **Region** | `Singapore (Singapore)` | 选择新加坡节点，国内访问更快 |
| **Branch** | `main` 或 `master` | 选择你要部署的分支 |

#### 构建配置

| 配置项 | 填写内容 | 说明 |
|--------|---------|------|
| **Runtime** | `Docker` | 选择 Docker 环境 |
| **Dockerfile Path** | `Dockerfile` | 保持默认 |
| **Docker Context** | `.` | 保持默认 |

#### 计划选择

| 配置项 | 填写内容 | 说明 |
|--------|---------|------|
| **Instance Type** | `Free` | 选择免费计划！ |

#### 环境变量（自动配置）

如果你的项目中有 `render.yaml` 文件，Render 会自动读取配置，无需手动填写！

如果没有，你需要手动添加以下环境变量：

| Key | Value |
|-----|-------|
| `PORT` | `3001` |
| `HOST` | `0.0.0.0` |
| `NODE_ENV` | `production` |
| `DATA_DIR` | `/data` |
| `JWT_SECRET` | 点击 "Generate" 按钮自动生成 |
| `OPERATOR_PIN` | `123456`（或你自定义的） |
| `ADMIN_PIN` | `888888`（或你自定义的） |

#### 磁盘配置（持久化数据）

**重要！** 必须配置磁盘，否则重启后数据会丢失！

1. 向下滚动找到 **"Disk"** 部分
2. 点击 **"Add Disk"** 按钮
3. 填写：
   - **Name**: `data`
   - **Mount Path**: `/data`
   - **Size**: `1` GB（免费额度内）

### 3.4 确认并部署

1. 检查所有配置是否正确
2. 点击页面底部的 **"Create Web Service"** 按钮
3. 等待部署完成（通常需要 3-10 分钟）

---

## 第四步：监控部署过程

部署开始后，你会看到实时日志输出。

### 4.1 查看部署日志

页面会显示类似这样的日志：

```
==> Cloning repository...
==> Building Docker image...
Step 1/15 : FROM node:20-slim AS builder
...
==> Deploying...
==> Your service is live! 🎉
```

### 4.2 等待部署完成

- 状态栏会从 "Building" → "Deploying" → "Live"
- 当看到绿色的 **"Live"** 状态时，部署成功！

---

## 第五步：访问你的应用

部署成功后，Render 会提供一个访问地址，类似：
```
https://dice-roadmap.onrender.com
```

### 5.1 访问不同页面

| 页面 | 地址 |
|------|------|
| 操作员端 | `https://你的应用名.onrender.com` |
| 管理员端 | `https://你的应用名.onrender.com/admin` |
| 大屏展示 | `https://你的应用名.onrender.com/display` |

### 5.2 首次登录

使用默认 PIN 登录：
- **管理员**: `888888`
- **操作员**: `123456`

---

## 第六步：修改默认 PIN（重要！）

部署成功后，**请立即修改默认 PIN**！

### 6.1 修改环境变量

1. 在 Render 仪表盘进入你的应用
2. 点击左侧菜单的 **"Environment"**
3. 找到 `OPERATOR_PIN` 和 `ADMIN_PIN`
4. 点击编辑，修改为你想要的 PIN
5. 点击 **"Save Changes"**
6. Render 会自动重新部署你的应用

---

## 第七步：日常使用和维护

### 7.1 重新部署代码

当你推送代码到 GitHub 时，Render 会自动重新部署！

手动触发部署：
1. 进入 Render 应用页面
2. 点击右上角 **"Manual Deploy"** → **"Latest Commit"**

### 7.2 查看日志

1. 进入 Render 应用页面
2. 点击左侧菜单的 **"Logs"**
3. 可以查看实时日志

### 7.3 查看服务状态

1. 进入 Render 应用页面
2. 查看右上角的状态指示灯
   - 🟢 **Live**: 正常运行
   - 🟡 **Deploying**: 部署中
   - 🔴 **Stopped**: 已停止

---

## 常见问题 FAQ

### Q: 部署卡住了怎么办？
A:
1. 检查日志中的错误信息
2. 尝试点击 "Manual Deploy" 重新部署
3. 如果问题持续，可以删除 Web Service 重新创建

### Q: 数据会丢失吗？
A: 只要你配置了磁盘（Disk），数据就会持久化保存，重启不会丢失。

### Q: 免费额度够用吗？
A: Render 免费计划提供：
- 750 小时/月（等于 31.25 天，刚好够用）
- 100GB 流量/月
- 1GB 磁盘存储
对于个人使用完全足够！

### Q: 国内访问速度慢怎么办？
A:
- Render 的免费节点在新加坡，国内访问速度一般
- 可以考虑使用 Fly.io（香港节点，速度更快）
- 或者使用付费的国内云服务（阿里云/腾讯云）

### Q: 如何绑定自定义域名？
A:
1. 在 Render 应用页面点击 "Settings"
2. 找到 "Custom Domains" 部分
3. 点击 "Add Custom Domain"
4. 按照提示配置 DNS 解析
5. Render 会自动为你申请 SSL 证书

---

## 高级配置

### 使用 render.yaml 自动配置

你的项目中已经有 `render.yaml` 文件了，Render 会自动读取配置，省去手动填写的麻烦！

如果需要修改配置，编辑 [render.yaml](file:///Users/master/work/dice-roadmap/render.yaml) 文件即可。

---

## 🎉 恭喜！

你已经成功在 Render 上部署了 dice-roadmap！

如果遇到问题，欢迎查看：
- Render 官方文档：https://render.com/docs
- 项目 GitHub Issues：https://github.com/wuyangwei/dice-roadmap/issues
