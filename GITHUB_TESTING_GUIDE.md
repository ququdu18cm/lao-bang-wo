# 🧪 GitHub 测试指南

## 🎯 **如何在GitHub上测试项目可用性**

### 方法1: 使用 GitHub Codespaces (推荐)

#### 1. **启动 Codespace**
```bash
# 1. 访问您的仓库
https://github.com/ququdu18cm/lao-bang-wo

# 2. 点击绿色的 "Code" 按钮
# 3. 选择 "Codespaces" 标签
# 4. 点击 "Create codespace on main"
```

#### 2. **在 Codespace 中测试**
```bash
# 等待 Codespace 启动完成后，在终端中运行：

# 1. 进入项目目录
cd 无头工具站/无头CMS分享

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 查看端口转发
# Codespace 会自动转发端口 3000
# 点击弹出的端口转发通知，或在端口面板中查看
```

#### 3. **测试功能**
```bash
# 访问以下地址（Codespace会提供公网URL）：
- 管理面板: https://your-codespace-url-3000.githubpreview.dev/admin
- API文档: https://your-codespace-url-3000.githubpreview.dev/api-docs
- 健康检查: https://your-codespace-url-3000.githubpreview.dev/health
- 系统信息: https://your-codespace-url-3000.githubpreview.dev/system/info
```

### 方法2: 使用 GitHub Actions (CI/CD测试)

#### 1. **创建测试工作流**
在仓库中创建 `.github/workflows/test.yml`:

```yaml
name: 🧪 项目可用性测试

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6-alpine
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: test123
        ports:
          - 27017:27017
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
    - name: 📥 检出代码
      uses: actions/checkout@v4

    - name: 🟢 设置 Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: '无头工具站/无头CMS分享/package-lock.json'

    - name: 📦 安装依赖
      working-directory: ./无头工具站/无头CMS分享
      run: npm ci

    - name: 🔧 生成类型
      working-directory: ./无头工具站/无头CMS分享
      run: npm run generate:types
      env:
        DATABASE_URI: mongodb://admin:test123@localhost:27017/test?authSource=admin
        PAYLOAD_SECRET: test-secret-key

    - name: 🏗️ 构建项目
      working-directory: ./无头工具站/无头CMS分享
      run: npm run build

    - name: 🧪 启动服务器测试
      working-directory: ./无头工具站/无头CMS分享
      run: |
        npm run serve &
        sleep 30
        curl -f http://localhost:3000/health || exit 1
        curl -f http://localhost:3000/system/info || exit 1
        curl -f http://localhost:3000/api-docs || exit 1
      env:
        DATABASE_URI: mongodb://admin:test123@localhost:27017/test?authSource=admin
        PAYLOAD_SECRET: test-secret-key
        NODE_ENV: production
```

### 方法3: 本地 Docker 测试

#### 1. **克隆仓库**
```bash
git clone https://github.com/ququdu18cm/lao-bang-wo.git
cd lao-bang-wo/无头工具站
```

#### 2. **Docker 测试**
```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 查看服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f headless-cms

# 4. 测试端点
curl http://localhost:3000/health
curl http://localhost:3000/system/info
```

### 方法4: 在线 IDE 测试

#### 1. **GitPod**
```bash
# 访问以下URL自动启动GitPod环境：
https://gitpod.io/#https://github.com/ququdu18cm/lao-bang-wo
```

#### 2. **CodeSandbox**
```bash
# 导入GitHub仓库到CodeSandbox
https://codesandbox.io/s/github/ququdu18cm/lao-bang-wo
```

## 🔍 **测试检查清单**

### ✅ **基础功能测试**
- [ ] 服务器启动成功
- [ ] 数据库连接正常
- [ ] 健康检查端点响应
- [ ] 管理面板可访问
- [ ] API文档可访问

### ✅ **核心功能测试**
- [ ] 用户注册/登录
- [ ] 工具管理CRUD操作
- [ ] 媒体文件上传
- [ ] 分析数据收集
- [ ] 系统设置配置

### ✅ **API端点测试**
```bash
# 健康检查
curl -X GET http://localhost:3000/health

# 系统信息
curl -X GET http://localhost:3000/system/info

# API文档
curl -X GET http://localhost:3000/api-docs

# 分析统计
curl -X GET http://localhost:3000/analytics/stats

# 事件追踪
curl -X POST http://localhost:3000/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"eventName":"test_event","eventData":{"test":true}}'
```

### ✅ **管理面板测试**
- [ ] 访问 `/admin` 显示登录页面
- [ ] 创建管理员账户
- [ ] 导航菜单显示所有集合
- [ ] 仪表板显示系统信息
- [ ] 分析面板显示数据

## 🚨 **常见问题排查**

### 问题1: 服务启动失败
```bash
# 检查日志
docker-compose logs headless-cms

# 常见原因：
# - 数据库连接失败
# - 环境变量缺失
# - 端口冲突
```

### 问题2: 依赖安装失败
```bash
# 清理缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题3: 类型生成失败
```bash
# 确保数据库运行后再生成类型
npm run generate:types
```

## 📊 **性能基准测试**

### 响应时间基准
- 健康检查: < 100ms
- 系统信息: < 200ms
- API文档: < 500ms
- 管理面板: < 1000ms

### 内存使用基准
- 基础运行: < 200MB
- 正常负载: < 500MB
- 高负载: < 1GB

## 🎉 **测试成功标准**

### ✅ **基础成功标准**
1. 所有服务启动无错误
2. 健康检查返回200状态
3. 管理面板可正常访问
4. API文档正确显示

### ✅ **完整成功标准**
1. 所有API端点正常响应
2. 数据库操作正常
3. 文件上传功能正常
4. 分析数据收集正常
5. 系统监控正常

**🎊 通过以上任一方法测试成功，即证明项目完全可用！**
