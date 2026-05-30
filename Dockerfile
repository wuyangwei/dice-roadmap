# =============================================================================
# dice-roadmap Dockerfile
# 用于容器化部署到云服务
# =============================================================================

FROM node:20-slim AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@10

# 复制 package 文件
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY package.json .
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY tsconfig.base.json .

# 构建项目
RUN pnpm --filter @roadmap/shared build
RUN pnpm --filter @roadmap/web build
RUN pnpm --filter @roadmap/server build

# 生产阶段
FROM node:20-slim AS production

WORKDIR /app

# 安装系统依赖（curl 用于健康检查）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 pnpm 和 pm2
RUN npm install -g pnpm@10 pm2

# 复制构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/server ./apps/server
COPY --from=builder /app/apps/web ./apps/web
COPY pnpm-workspace.yaml .
COPY package.json .

# 创建数据目录
RUN mkdir -p /app/data

# 环境变量
ENV PORT=3001
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV DATA_DIR=/app/data

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# 启动命令
CMD ["node", "apps/server/dist/index.js"]
