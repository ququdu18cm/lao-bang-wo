# 🚀 简单启动指南

## 📋 **前置要求**

### 方法1: 本地启动
- Node.js 18+ 
- MongoDB (可选，Docker会自动启动)
- Git

### 方法2: Docker启动 (推荐)
- Docker
- Docker Compose
- Git

## 🎯 **最简单启动方法 (Docker)**

### 1. **克隆项目**
```bash
git clone https://github.com/ququdu18cm/lao-bang-wo.git
cd lao-bang-wo/无头工具站
```

### 2. **一键启动**
```bash
docker-compose up -d
```

### 3. **访问服务**
- 🏠 **主页**: http://localhost
- 🎛️ **管理面板**: http://localhost:3000/admin
- 📚 **API文档**: http://localhost:3000/api-docs
- 🏥 **健康检查**: http://localhost:3000/health

### 4. **查看状态**
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f headless-cms

# 停止服务
docker-compose down
```

## 🔧 **本地Node.js启动方法**

### 1. **克隆项目**
```bash
git clone https://github.com/ququdu18cm/lao-bang-wo.git
cd lao-bang-wo/无头工具站/无头CMS分享
```

### 2. **安装依赖**
```bash
npm install
```

### 3. **配置环境变量**
创建 `.env` 文件:
```env
# 数据库配置
DATABASE_URI=mongodb://localhost:27017/headless-cms

# Payload配置
PAYLOAD_SECRET=your-secret-key-change-this
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# 服务器配置
PORT=3000
NODE_ENV=development

# 邮件配置 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@headless-tools.com
FROM_NAME=无头工具站
```

### 4. **启动MongoDB (如果本地没有)**
```bash
# 使用Docker启动MongoDB
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:6-alpine
```

### 5. **启动开发服务器**
```bash
# 开发模式 (热重载)
npm run dev

# 或者构建后启动
npm run build
npm run serve
```

### 6. **访问服务**
- 🎛️ **管理面板**: http://localhost:3000/admin
- 📚 **API文档**: http://localhost:3000/api-docs
- 🏥 **健康检查**: http://localhost:3000/health

## 🧪 **验证启动成功**

### ✅ **检查服务状态**
```bash
# 健康检查
curl http://localhost:3000/health

# 系统信息
curl http://localhost:3000/system/info

# API文档
curl http://localhost:3000/api-docs
```

### ✅ **管理面板测试**
1. 访问 http://localhost:3000/admin
2. 首次访问会要求创建管理员账户
3. 创建账户后即可使用所有功能

## 🚨 **常见问题解决**

### 问题1: 端口被占用
```bash
# 查看端口占用
netstat -ano | findstr :3000

# 修改端口 (在.env文件中)
PORT=3001
```

### 问题2: 数据库连接失败
```bash
# 检查MongoDB是否运行
docker ps | grep mongo

# 重启MongoDB
docker restart mongodb
```

### 问题3: 依赖安装失败
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题4: 权限问题 (Linux/Mac)
```bash
# 给予执行权限
chmod +x docker/healthcheck.sh
```

## 📊 **性能监控**

### 查看资源使用
```bash
# Docker资源使用
docker stats

# 服务日志
docker-compose logs -f --tail=100 headless-cms
```

### 数据库管理
```bash
# 连接MongoDB
docker exec -it mongodb mongosh

# 查看数据库
show dbs
use headless-cms-enhanced
show collections
```

## 🎉 **启动成功标志**

### ✅ **服务正常运行**
- [ ] Docker容器状态为 "Up"
- [ ] 健康检查返回 200 状态
- [ ] 管理面板可正常访问
- [ ] API文档正确显示

### ✅ **功能正常**
- [ ] 可以创建管理员账户
- [ ] 可以登录管理面板
- [ ] 可以创建和管理工具
- [ ] 可以上传媒体文件
- [ ] 分析数据正常收集

## 🔄 **重启和更新**

### 重启服务
```bash
# Docker方式
docker-compose restart

# 本地方式
# Ctrl+C 停止，然后重新运行 npm run dev
```

### 更新代码
```bash
# 拉取最新代码
git pull origin main

# 重新构建 (Docker)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 重新安装依赖 (本地)
npm install
npm run build
```

**🎊 按照以上任一方法启动，即可成功运行您的企业级 SaaS 平台！**
