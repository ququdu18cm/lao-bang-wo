# 🚀 无头工具站 - 开源CMS后端项目

## 📋 项目简介

这是一个基于 **Payload CMS** 构建的企业级无头CMS后端项目，集成了完整的开源高级功能栈。项目采用插件化架构，将数据分析、SEO管理、系统监控、邮件营销等功能完美集成到统一的管理面板中。

## ✨ 核心特性

### 🎯 **完全开源**
- 零许可成本
- 避免供应商锁定
- 社区驱动的持续更新

### 🏢 **企业级功能**
- **📊 数据分析**: 基于 Umami 的隐私友好分析系统
- **🔍 SEO 管理**: 自动化 SEO 优化和站点地图生成
- **📧 邮件营销**: 基于 Listmonk 的高性能邮件营销系统
- **🔧 系统监控**: Grafana + Prometheus + Uptime Kuma 全方位监控
- **📈 实时仪表板**: 专业的数据可视化界面

### 🔌 **插件化架构**
- 模块化设计，易于扩展
- 统一的管理界面
- 嵌入式面板，无需跳转

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Payload CMS 核心                         │
├─────────────────────────────────────────────────────────────┤
│  插件系统        │  管理面板组件    │  API 端点              │
│  - Umami 插件    │  - 分析仪表板    │  - 数据分析 API        │
│  - 监控插件      │  - 监控面板      │  - 监控代理 API        │
│  - 营销插件      │  - 营销控制台    │  - 营销管理 API        │
├─────────────────────────────────────────────────────────────┤
│                    开源服务集群                              │
│  Umami 分析      │  Listmonk 邮件   │  Grafana 监控          │
│  MongoDB 数据库  │  PostgreSQL      │  Uptime Kuma           │
└─────────────────────────────────────────────────────────────┘
```

## 📦 项目结构

```
无头CMS分享/
├── README.md                           # 项目说明
├── package.json                        # 项目依赖
├── payload.config.ts                   # Payload 核心配置
├── server.ts                          # 服务器入口
├── tsconfig.json                      # TypeScript 配置
├── src/
│   ├── collections/                   # 数据集合
│   │   ├── Users.ts                   # 用户管理
│   │   ├── Tools.ts                   # 工具管理
│   │   ├── Analytics.ts               # 分析数据
│   │   ├── BlogPosts.ts               # 博客系统
│   │   └── Media.ts                   # 媒体管理
│   ├── plugins/                       # 🆕 开源插件
│   │   ├── umami-plugin.ts            # Umami 分析插件
│   │   ├── monitoring-plugin.ts       # 监控插件
│   │   └── marketing-plugin.ts        # 营销插件
│   ├── components/                    # 🆕 管理面板组件
│   │   ├── analytics-dashboard.tsx    # 分析仪表板
│   │   ├── monitoring-panel.tsx       # 监控面板
│   │   └── marketing-panel.tsx        # 营销面板
│   ├── endpoints/                     # API 端点
│   │   ├── analytics.ts               # 分析 API
│   │   ├── monitoring.ts              # 监控 API
│   │   └── marketing.ts               # 营销 API
│   └── styles/
│       └── admin.css                  # 管理面板样式
├── docker/
│   ├── docker-compose.yml             # 完整部署配置
│   ├── docker-compose.dev.yml         # 开发环境配置
│   └── Dockerfile                     # 容器构建文件
├── docs/                              # 📚 完整文档
│   ├── 快速开始.md                     # 快速开始指南
│   ├── 插件开发.md                     # 插件开发文档
│   ├── API文档.md                      # API 接口文档
│   ├── 部署指南.md                     # 部署说明
│   └── 开发指南.md                     # 开发文档
└── examples/                          # 示例代码
    ├── basic-setup/                   # 基础设置示例
    ├── custom-plugin/                 # 自定义插件示例
    └── frontend-integration/          # 前端集成示例
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6+
- Docker & Docker Compose (推荐)

### 一键启动

```bash
# 克隆项目
git clone <repository-url>
cd 无头CMS分享

# 使用 Docker 一键启动
docker-compose up -d

# 或手动安装
npm install
npm run dev
```

### 访问地址

- **管理面板**: http://localhost:3000/admin
- **API 文档**: http://localhost:3000/api-docs
- **分析面板**: http://localhost:3000/admin/analytics
- **监控面板**: http://localhost:3000/admin/monitoring
- **营销面板**: http://localhost:3000/admin/marketing

## 🔧 核心功能

### 📊 数据分析系统

基于 **Umami** 的隐私友好分析系统：

- ✅ 实时访问统计
- ✅ 用户行为分析
- ✅ 事件追踪
- ✅ 自定义仪表板
- ✅ 嵌入式分析面板

```typescript
// 使用示例
import { UmamiPlugin } from './src/plugins/umami-plugin'

// 在 payload.config.ts 中启用
plugins: [UmamiPlugin]
```

### 🔧 系统监控

基于 **Grafana + Prometheus + Uptime Kuma** 的专业监控：

- ✅ 系统性能监控
- ✅ 服务可用性监控
- ✅ 实时告警
- ✅ 可视化仪表板
- ✅ 历史数据分析

### 📧 邮件营销

基于 **Listmonk** 的高性能邮件营销系统：

- ✅ 邮件列表管理
- ✅ 营销活动创建
- ✅ 模板系统
- ✅ 统计分析
- ✅ 自动化工作流

### 🔍 SEO 优化

自动化 SEO 管理系统：

- ✅ 页面级 SEO 设置
- ✅ 自动生成 sitemap.xml
- ✅ 结构化数据支持
- ✅ Open Graph 配置
- ✅ SEO 健康度分析

## 🎨 管理界面

### 统一管理面板

所有功能都集成在 Payload CMS 原生管理面板中：

- **分析中心**: 实时数据分析和用户行为统计
- **监控中心**: 系统健康状态和性能监控
- **营销中心**: 邮件营销活动管理和统计
- **内容管理**: 博客、媒体、用户管理

### 专业 UI 组件

基于 **Tremor** 的企业级仪表板组件：

- 📊 专业图表组件
- 🎨 响应式设计
- 🌙 深色模式支持
- 📱 移动端适配

## 🔌 插件系统

### 插件架构

```typescript
// 插件接口
export interface PluginConfig {
  name: string
  version: string
  description: string
  components: ComponentConfig[]
  endpoints: EndpointConfig[]
  collections?: CollectionConfig[]
}

// 使用示例
import { UmamiPlugin, MonitoringPlugin, MarketingPlugin } from './src/plugins'

export default buildConfig({
  plugins: [
    UmamiPlugin,
    MonitoringPlugin, 
    MarketingPlugin
  ]
})
```

### 自定义插件开发

```typescript
// 创建自定义插件
export const CustomPlugin: Plugin = (config) => {
  return {
    ...config,
    admin: {
      ...config.admin,
      components: {
        ...config.admin?.components,
        views: {
          ...config.admin?.components?.views,
          CustomView: {
            Component: '@/components/custom-view',
            path: '/custom'
          }
        }
      }
    }
  }
}
```

## 📚 文档和示例

### 完整文档

- **[快速开始](./docs/快速开始.md)** - 5分钟快速上手
- **[插件开发](./docs/插件开发.md)** - 自定义插件开发指南
- **[API文档](./docs/API文档.md)** - 完整的 API 接口文档
- **[部署指南](./docs/部署指南.md)** - 生产环境部署
- **[开发指南](./docs/开发指南.md)** - 开发环境配置

### 示例代码

- **基础设置**: 最小化配置示例
- **自定义插件**: 插件开发示例
- **前端集成**: Next.js/React 集成示例

## 🐳 Docker 部署

### 开发环境

```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d
```

### 生产环境

```bash
# 启动生产环境
docker-compose up -d
```

### 服务配置

```yaml
services:
  payload:      # Payload CMS 核心
  mongodb:      # 主数据库
  umami:        # 数据分析
  listmonk:     # 邮件营销
  grafana:      # 监控面板
  prometheus:   # 指标收集
  uptime-kuma:  # 可用性监控
```

## 🤝 贡献指南

### 如何贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 编写单元测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌟 致谢

感谢以下开源项目：

- [Payload CMS](https://payloadcms.com/) - 现代化无头CMS
- [Umami](https://umami.is/) - 隐私友好的网站分析
- [Listmonk](https://listmonk.app/) - 高性能邮件营销
- [Grafana](https://grafana.com/) - 监控和可视化平台
- [Uptime Kuma](https://github.com/louislam/uptime-kuma) - 可用性监控
- [Tremor](https://www.tremor.so/) - React 仪表板组件

## 📞 支持

- 📖 **文档**: [完整文档](./docs/)
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **讨论**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📧 **邮件**: support@your-domain.com

## 🎯 路线图

- [ ] 更多开源服务集成
- [ ] 插件市场
- [ ] 可视化配置界面
- [ ] 多租户支持
- [ ] 国际化支持
- [ ] 移动端管理应用

---

**🚀 开始您的无头CMS之旅吧！**

如果这个项目对您有帮助，请给我们一个 ⭐ Star！
