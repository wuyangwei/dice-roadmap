# 多阶段构建 Dockerfile
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# 安装 pnpm 和依赖
RUN npm install -g pnpm@10
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建所有包
RUN pnpm run build

# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

# 复制必要的文件
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/node_modules ./node_modules

# 创建数据目录
RUN mkdir -p /var/data

# 设置环境变量
ENV PORT=3001
ENV HOST=0.0.0.0
ENV DATA_DIR=/var/data

# 暴露端口
EXPOSE 3001

# 启动应用
WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]
