# 🚀 Phala Cloud 部署指南

## 📋 部署前准备

### 1. 文件准备
确保您有以下文件：
- `compose.yml` - Docker Compose 配置文件
- `Dockerfile` - 容器构建文件
- `.env.phala` - 环境变量配置

### 2. 环境变量配置
复制 `.env.phala` 为 `.env` 并修改以下关键配置：

```bash
# 必须修改的配置
PAYLOAD_SECRET=your-unique-secret-key-here
JWT_SECRET=your-jwt-secret-here
MONGODB_URI=mongodb://admin:your-password@mongo:27017/headless-cms?authSource=admin
```

## 🐳 Phala Cloud 部署步骤

### 方法一：使用 compose.yml 文件

1. **上传文件**
   - 在 Phala Cloud 控制台选择"上传 compose.yml"
   - 上传项目根目录的 `compose.yml` 文件

2. **配置环境变量**
   - 在部署界面设置环境变量
   - 或者上传 `.env` 文件

3. **启动服务**
   - 点击部署按钮
   - 等待容器构建和启动

### 方法二：单容器部署

如果 compose.yml 不工作，可以尝试单容器部署：

1. **构建镜像**
   ```bash
   docker build -t headless-cms .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     --name headless-cms \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e PAYLOAD_SECRET=your-secret \
     -e MONGODB_URI=your-mongodb-uri \
     headless-cms
   ```

## 🔧 常见问题解决

### 问题1：容器无法启动
**可能原因：**
- 环境变量配置错误
- 依赖安装失败
- 端口冲突

**解决方案：**
1. 检查环境变量配置
2. 查看容器日志
3. 确保端口 3000 可用

### 问题2：数据库连接失败
**解决方案：**
1. 确保 MongoDB 服务正常运行
2. 检查数据库连接字符串
3. 验证数据库用户权限

### 问题3：构建失败
**解决方案：**
1. 检查 Dockerfile 语法
2. 确保所有依赖文件存在
3. 查看构建日志错误信息

## 📊 部署后验证

### 1. 健康检查
访问：`http://your-domain:3000/admin`

### 2. API 测试
```bash
curl http://your-domain:3000/api/health
```

### 3. 日志查看
```bash
docker logs headless-cms
```

## 🚀 优化建议

### 1. 资源配置
- CPU: 最少 1 核
- 内存: 最少 1GB
- 存储: 最少 10GB

### 2. 网络配置
- 确保端口 3000 对外开放
- 配置适当的防火墙规则

### 3. 监控设置
- 启用容器健康检查
- 配置日志收集
- 设置告警通知

## 📞 技术支持

如果遇到部署问题，请：

1. **查看日志**
   ```bash
   docker logs headless-cms --tail 100
   ```

2. **检查服务状态**
   ```bash
   docker ps -a
   ```

3. **联系支持**
   - GitHub Issues: https://github.com/ququdu18cm/lao-bang-wo/issues
   - LinuxDo 论坛求助

## 🎯 下一步

部署成功后，您可以：
- 访问管理面板创建内容
- 配置 API 接口
- 集成前端应用
- 设置监控和备份

---

💡 **提示**: 首次部署可能需要 5-10 分钟，请耐心等待容器构建完成。
