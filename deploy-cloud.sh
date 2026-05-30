#!/usr/bin/env bash
# =============================================================================
# dice-roadmap 云服务部署脚本（适用于阿里云/腾讯云/华为云等 Linux 服务器）
# 用法：bash deploy-cloud.sh [选项]
#   --port      后端端口（默认 3001）
#   --operator  操作员 PIN（默认 123456）
#   --admin     管理员 PIN（默认 888888）
#   --domain    绑定的域名（可选，配置 Nginx 反向代理）
#   --skip-deps 跳过系统依赖安装（已安装过时使用）
# =============================================================================

set -euo pipefail

# ── 颜色输出 ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*"; exit 1; }
step()    { echo -e "\n${GREEN}━━━ $* ━━━${NC}"; }

# ── 默认参数 ──────────────────────────────────────────────────────────────────
PORT=3001
OPERATOR_PIN=123456
ADMIN_PIN=888888
DOMAIN=""
SKIP_DEPS=no

# ── 解析参数 ──────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --port)      PORT="$2";         shift 2 ;;
    --operator)  OPERATOR_PIN="$2"; shift 2 ;;
    --admin)     ADMIN_PIN="$2";    shift 2 ;;
    --domain)    DOMAIN="$2";       shift 2 ;;
    --skip-deps) SKIP_DEPS=yes;     shift   ;;
    *) warn "未知参数: $1"; shift ;;
  esac
done

# ── 基本检查 ──────────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "请用 root 权限运行：sudo bash deploy-cloud.sh"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
info "项目目录：$PROJECT_DIR"
info "后端端口：$PORT"
if [[ -n "$DOMAIN" ]]; then
  info "绑定域名：$DOMAIN"
fi

# =============================================================================
# 第一步：系统依赖
# =============================================================================
if [[ $SKIP_DEPS == no ]]; then
  step "安装系统依赖"
  apt-get update -qq
  apt-get install -y -qq curl git nginx
  success "系统依赖安装完成"
fi

# =============================================================================
# 第二步：安装 Node.js（nvm）
# =============================================================================
step "检查 Node.js 环境"

export NVM_DIR="/root/.nvm"
if [[ ! -d "$NVM_DIR" ]]; then
  info "安装 nvm..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# 加载 nvm
# shellcheck source=/dev/null
source "$NVM_DIR/nvm.sh"

if ! command -v node &>/dev/null || [[ $(node -e "process.exit(parseInt(process.version.slice(1)) < 18 ? 1 : 0)" 2>/dev/null; echo $?) -ne 0 ]]; then
  info "安装 Node.js 20..."
  nvm install 20
  nvm alias default 20
fi

NODE_VERSION=$(node -v)
success "Node.js $NODE_VERSION"

# 安装 pnpm
if ! command -v pnpm &>/dev/null; then
  info "安装 pnpm..."
  npm install -g pnpm@10
fi
success "pnpm $(pnpm -v)"

# 安装 pm2
if ! command -v pm2 &>/dev/null; then
  info "安装 pm2..."
  npm install -g pm2
fi
success "pm2 $(pm2 -v)"

# =============================================================================
# 第三步：安装依赖 & 构建
# =============================================================================
step "安装项目依赖并构建"
cd "$PROJECT_DIR"

info "安装依赖..."
pnpm install --frozen-lockfile

info "构建 shared..."
pnpm --filter @roadmap/shared build

info "构建前端..."
pnpm --filter @roadmap/web build

info "构建后端..."
pnpm --filter @roadmap/server build

success "构建完成"

# =============================================================================
# 第四步：生成 .env 配置
# =============================================================================
step "生成环境配置"

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
DATA_DIR="$PROJECT_DIR/data"
mkdir -p "$DATA_DIR"

ENV_FILE="$PROJECT_DIR/.env"
cat > "$ENV_FILE" << EOF
PORT=$PORT
HOST=127.0.0.1
JWT_SECRET=$JWT_SECRET
OPERATOR_PIN=$OPERATOR_PIN
ADMIN_PIN=$ADMIN_PIN
DATA_DIR=$DATA_DIR
EOF

success ".env 已写入 $ENV_FILE"

# =============================================================================
# 第五步：PM2 守护进程
# =============================================================================
step "配置 PM2 守护进程"

# 停止旧实例（如有）
pm2 delete roadmap-server 2>/dev/null || true

# 写 pm2 ecosystem 配置
cat > "$PROJECT_DIR/ecosystem.config.cjs" << EOF
module.exports = {
  apps: [{
    name: 'roadmap-server',
    script: 'apps/server/dist/index.js',
    cwd: '$PROJECT_DIR',
    env_file: '$ENV_FILE',
    restart_delay: 3000,
    max_restarts: 10,
    watch: false
  }]
};
EOF

pm2 start "$PROJECT_DIR/ecosystem.config.cjs"
pm2 save

# 设置开机自启
PM2_STARTUP=$(pm2 startup systemd -u root --hp /root 2>&1 | grep "sudo env" || true)
if [[ -n "$PM2_STARTUP" ]]; then
  eval "$PM2_STARTUP"
fi
pm2 save

success "PM2 服务已启动并设置开机自启"

# 等待服务就绪
info "等待服务启动..."
for i in {1..15}; do
  if curl -sf "http://localhost:$PORT/api/health" &>/dev/null; then
    success "后端服务已就绪 http://localhost:$PORT"
    break
  fi
  sleep 1
  [[ $i -eq 15 ]] && warn "服务启动超时，请运行 pm2 logs roadmap-server 排查"
done

# =============================================================================
# 第六步：配置 Nginx（如果指定了域名）
# =============================================================================
if [[ -n "$DOMAIN" ]]; then
  step "配置 Nginx 反向代理"

  NGINX_CONF="/etc/nginx/sites-available/roadmap"
  cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

  # 启用站点
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

  # 测试配置
  nginx -t

  # 重启 Nginx
  systemctl restart nginx
  systemctl enable nginx

  success "Nginx 配置完成"
  info "建议配置 HTTPS：使用 certbot 申请免费证书"
fi

# =============================================================================
# 完成
# =============================================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎲  dice-roadmap 云部署完成！              ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════╣${NC}"

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

if [[ -n "$DOMAIN" ]]; then
  echo -e "${GREEN}║${NC}  访问地址：                                           ${GREEN}║${NC}"
  echo -e "${GREEN}║${NC}    操作员端  http://$DOMAIN                         ${GREEN}║${NC}"
  echo -e "${GREEN}║${NC}    管理员端  http://$DOMAIN/admin                   ${GREEN}║${NC}"
  echo -e "${GREEN}║${NC}    大屏展示  http://$DOMAIN/display                 ${GREEN}║${NC}"
else
  echo -e "${GREEN}║${NC}  公网 IP：$PUBLIC_IP                                  ${GREEN}║${NC}"
  echo -e "${GREEN}║${NC}  访问地址：                                           ${GREEN}║${NC}"
  echo -e "${GREEN}║${NC}    操作员端  http://$PUBLIC_IP:$PORT                ${GREEN}║${NC}"
  echo -e "${GREEN}║${NC}    管理员端  http://$PUBLIC_IP:$PORT/admin          ${GREEN}║${NC}"
  echo -e "${GREEN}║${NC}    大屏展示  http://$PUBLIC_IP:$PORT/display        ${GREEN}║${NC}"
fi
echo -e "${GREEN}╠══════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  常用命令：                                           ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}    pm2 status          查看服务状态                   ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}    pm2 logs            查看日志                       ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}    pm2 restart all     重启服务                       ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
