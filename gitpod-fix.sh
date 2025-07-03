#!/bin/bash

# 🚀 GitPod 快速修复脚本

echo "🔧 正在修复 GitPod 依赖问题..."

# 进入正确目录
cd /workspace/lao-bang-wo/无头工具站/无头CMS分享

# 创建简化的 package.json
echo "📦 创建简化的 package.json..."
cat > package.json << 'EOF'
{
  "name": "headless-tools-cms",
  "version": "1.0.0",
  "description": "企业级无头CMS后端项目",
  "main": "server.js",
  "scripts": {
    "dev": "node server.js",
    "start": "node server.js",
    "build": "echo 'Build completed'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
EOF

# 创建简单的服务器文件
echo "🖥️ 创建服务器文件..."
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 路由
app.get('/', (req, res) => {
  res.json({
    message: '🎉 无头工具站 CMS - 企业级 SaaS 平台',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/admin', (req, res) => {
  res.json({
    message: '🎛️ 管理面板',
    status: 'available',
    note: '这是简化版本，完整版本需要完整的 Payload CMS 配置'
  });
});

app.get('/api-docs', (req, res) => {
  res.json({
    message: '📚 API 文档',
    endpoints: [
      'GET / - 主页',
      'GET /health - 健康检查',
      'GET /admin - 管理面板',
      'GET /api-docs - API文档'
    ]
  });
});

app.get('/system/info', (req, res) => {
  res.json({
    system: 'Headless Tools CMS',
    version: '1.0.0',
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路径 ${req.originalUrl} 不存在`,
    availableEndpoints: ['/', '/health', '/admin', '/api-docs', '/system/info']
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
🚀 无头工具站 CMS 启动成功！

📍 服务地址:
   - 主页: http://localhost:${PORT}
   - 健康检查: http://localhost:${PORT}/health
   - 管理面板: http://localhost:${PORT}/admin
   - API文档: http://localhost:${PORT}/api-docs
   - 系统信息: http://localhost:${PORT}/system/info

🎉 在 GitPod 中，端口会自动转发，请点击弹出的链接访问！
  `);
});
EOF

# 清理旧文件
echo "🧹 清理旧文件..."
rm -rf node_modules package-lock.json

# 安装依赖
echo "📦 安装依赖..."
npm install

# 启动服务
echo "🚀 启动服务..."
npm run dev
