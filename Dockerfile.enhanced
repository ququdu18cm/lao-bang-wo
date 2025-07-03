# 🚀 无头工具站 CMS Enhanced - Docker 构建文件
# 多阶段构建，优化镜像大小和性能

# ================================
# 📦 构建阶段
# ================================
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    curl

# 复制 package 文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 生成 Payload 类型
RUN npm run generate:types

# 构建应用
RUN npm run build

# ================================
# 🏃 运行阶段
# ================================
FROM node:18-alpine AS runner

# 设置环境变量
ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=payload.config.enhanced.js

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 payload

# 设置工作目录
WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache \
    curl \
    dumb-init

# 从构建阶段复制文件
COPY --from=builder --chown=payload:nodejs /app/dist ./dist
COPY --from=builder --chown=payload:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=payload:nodejs /app/package*.json ./
COPY --from=builder --chown=payload:nodejs /app/payload.config.enhanced.js ./

# 创建必要目录
RUN mkdir -p uploads logs media && \
    chown -R payload:nodejs uploads logs media

# 切换到非 root 用户
USER payload

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

# ================================
# 🏷️ 镜像标签和元数据
# ================================
LABEL maintainer="无头工具站开发团队 <dev@headless-tools.com>"
LABEL version="2.0.0"
LABEL description="企业级无头CMS增强版，集成完整的开源高级功能栈"
LABEL org.opencontainers.image.title="无头工具站 CMS Enhanced"
LABEL org.opencontainers.image.description="基于 Payload CMS 构建的企业级无头CMS增强版"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.authors="无头工具站开发团队"
LABEL org.opencontainers.image.vendor="无头工具站"
LABEL org.opencontainers.image.licenses="MIT"
