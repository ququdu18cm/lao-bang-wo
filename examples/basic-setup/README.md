# 🚀 基础设置示例

这个示例展示了如何快速设置一个最小化的无头工具站CMS实例。

## 📋 最小化配置

### 1. 环境变量配置

```bash
# .env.minimal
NODE_ENV=development
DATABASE_URI=mongodb://localhost:27017/headless-tools
PAYLOAD_SECRET=your-secret-key-here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

### 2. 简化的 payload.config.ts

```typescript
import { buildConfig } from 'payload/config'
import { mongoAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'

// 导入基础集合
import Users from './collections/Users'
import Tools from './collections/Tools'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    meta: {
      titleSuffix: '- 无头工具站',
    },
  },
  editor: slateEditor({}),
  collections: [Users, Tools],
  db: mongoAdapter({
    url: process.env.DATABASE_URI,
  }),
  secret: process.env.PAYLOAD_SECRET,
})
```

### 3. 简化的 Docker Compose

```yaml
version: '3.8'

services:
  # 只包含核心服务
  mongodb:
    image: mongo:6-alpine
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db

  payload:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URI: mongodb://admin:password123@mongodb:27017/headless-tools?authSource=admin
      PAYLOAD_SECRET: your-secret-key-here
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

## 🚀 快速启动

```bash
# 1. 克隆基础示例
cp -r examples/basic-setup my-cms
cd my-cms

# 2. 安装依赖
npm install

# 3. 启动 MongoDB
docker-compose up -d mongodb

# 4. 启动开发服务器
npm run dev
```

## 📊 逐步添加功能

### 添加 Umami 分析

```typescript
// 在 payload.config.ts 中添加
import { UmamiPlugin } from '../src/plugins/umami-plugin'

export default buildConfig({
  // ... 其他配置
  plugins: [UmamiPlugin],
})
```

### 添加监控功能

```typescript
// 添加监控插件
import { MonitoringPlugin } from '../src/plugins/monitoring-plugin'

export default buildConfig({
  // ... 其他配置
  plugins: [UmamiPlugin, MonitoringPlugin],
})
```

### 添加邮件营销

```typescript
// 添加营销插件
import { MarketingPlugin } from '../src/plugins/marketing-plugin'

export default buildConfig({
  // ... 其他配置
  plugins: [UmamiPlugin, MonitoringPlugin, MarketingPlugin],
})
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URI` | MongoDB 连接字符串 | - |
| `PAYLOAD_SECRET` | Payload 密钥 | - |
| `PAYLOAD_PUBLIC_SERVER_URL` | 服务器公开URL | http://localhost:3000 |

### 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| Payload CMS | 3000 | 主应用 |
| MongoDB | 27017 | 数据库 |

## 📚 下一步

1. **添加更多集合**: 根据需要添加自定义数据模型
2. **集成分析**: 添加 Umami 分析功能
3. **添加监控**: 集成 Grafana 监控
4. **邮件功能**: 添加 Listmonk 邮件营销
5. **自定义插件**: 开发自己的插件

## 🐛 常见问题

### Q: 数据库连接失败？
A: 检查 MongoDB 是否正常启动，确认连接字符串正确。

### Q: 端口冲突？
A: 修改 docker-compose.yml 中的端口映射。

### Q: 如何重置数据？
A: 删除 MongoDB 数据卷：`docker-compose down -v`
