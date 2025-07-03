# 🚀 无头工具站 CMS - Phala Cloud 优化版
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
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
RUN npm install && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 设置环境变量
ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=payload.config.js

# 创建必要目录
RUN mkdir -p uploads logs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]


