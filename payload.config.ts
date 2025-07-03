import { buildConfig } from 'payload/config'
import { mongoAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'
import path from 'path'

// 导入集合
import Users from './src/collections/Users'
import Tools from './src/collections/Tools'
import Analytics from './src/collections/Analytics'
import Media from './src/collections/Media'

// 导入全局配置
import Settings from './src/globals/Settings'

// 导入插件
import { UmamiPlugin } from './src/plugins/umami-plugin'
import umamiEnhancedPlugin from './src/plugins/umami-enhanced'
import apiDocsPlugin from './src/plugins/api-docs'

export default buildConfig({
  // 管理面板配置
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    meta: {
      titleSuffix: '- 无头工具站 CMS Enhanced',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
    css: path.resolve(__dirname, 'src/styles/admin.css'),
    components: {
      // 自定义管理面板组件
      views: {
        Dashboard: {
          Component: './src/components/Dashboard',
          path: '/dashboard',
        },
        Analytics: {
          Component: './src/components/AnalyticsDashboard',
          path: '/analytics',
        },
      },
      graphics: {
        Logo: './src/components/Logo',
        Icon: './src/components/Icon',
      },
    },
    webpack: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': path.resolve(__dirname, 'src'),
          '@/components': path.resolve(__dirname, 'src/components'),
          '@/utils': path.resolve(__dirname, 'src/utils'),
          '@/types': path.resolve(__dirname, 'src/types'),
          '@/plugins': path.resolve(__dirname, 'src/plugins'),
        },
      },
    }),
  },

  // 编辑器配置 - 使用 Lexical
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      // 可以在这里添加自定义 Lexical 功能
    ],
  }),

  // 集合配置
  collections: [
    Users,
    Tools,
    Media,
    Analytics,
  ],

  // 全局配置
  globals: [
    Settings,
  ],

  // TypeScript 配置
  typescript: {
    outputFile: path.resolve(__dirname, 'src/payload-types.ts'),
  },

  // GraphQL 配置
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'src/generated-schema.graphql'),
  },

  // 插件配置
  plugins: [
    // Umami 分析插件
    UmamiPlugin,
    umamiEnhancedPlugin({
      enabled: true,
      trackPageViews: true,
      trackEvents: true,
      realTimeEnabled: true,
      dataRetentionDays: 365,
    }),

    // API 文档插件
    apiDocsPlugin({
      enabled: true,
      path: '/api-docs',
      title: '无头工具站 API Enhanced',
      version: '2.0.0',
      description: '企业级 SaaS 平台增强版 API 文档',
      contact: {
        name: '无头工具站开发团队',
        email: 'dev@headless-tools.com',
        url: 'https://github.com/headless-tools'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    }),

    // SEO 插件
    seoPlugin({
      collections: ['tools'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc.name} - 无头工具站`,
      generateDescription: ({ doc }) => doc.description || doc.longDescription,
      generateImage: ({ doc }) => doc.icon,
      generateURL: ({ doc }) => `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/tools/${doc.slug}`,
    }),

    // 嵌套文档插件
    nestedDocsPlugin({
      collections: ['tools'],
      generateLabel: (_, doc) => doc.name,
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),

    // 表单构建器插件
    formBuilderPlugin({
      fields: {
        payment: false,
        country: true,
        state: true,
        message: true,
        email: true,
        text: true,
        textarea: true,
        number: true,
        checkbox: true,
        select: true,
      },
      formOverrides: {
        fields: [
          {
            name: 'confirmationMessage',
            type: 'richText',
            label: '确认消息',
            admin: {
              description: '表单提交后显示的消息',
            },
          },
          {
            name: 'redirectTo',
            type: 'text',
            label: '重定向URL',
            admin: {
              description: '表单提交后重定向的页面',
            },
          },
        ],
      },
    }),

    // 云存储插件
    cloudStorage({
      collections: {
        media: {
          adapter: s3Adapter({
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || 'us-east-1',
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
            },
            bucket: process.env.S3_BUCKET || '',
          }),
          generateFileURL: ({ filename }) => {
            return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filename}`
          },
        },
      },
      enabled: process.env.ENABLE_CLOUD_STORAGE === 'true',
    }),
  ],

  // 数据库配置
  db: mongoAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost:27017/headless-tools-enhanced',
    connectOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  }),

  // 安全配置
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here-change-in-production',

  // CORS 配置
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3001',
    'http://localhost:3100', // Umami
    'http://localhost:9000', // Listmonk
    'http://localhost:3200', // Grafana
    'http://localhost:3001', // Uptime Kuma
    // 允许所有本地开发端口
    /^http:\/\/localhost:\d+$/,
  ],

  // CSRF 配置
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3001',
  ],

  // 自定义端点
  endpoints: [
    // 健康检查
    {
      path: '/health',
      method: 'get',
      handler: (req, res) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '2.0.0',
          environment: process.env.NODE_ENV || 'development',
          database: 'connected',
          services: {
            umami: 'enabled',
            analytics: 'enabled',
            apiDocs: 'enabled',
            cloudStorage: process.env.ENABLE_CLOUD_STORAGE === 'true' ? 'enabled' : 'disabled',
          }
        })
      },
    },

    // 系统信息
    {
      path: '/system/info',
      method: 'get',
      handler: (req, res) => {
        res.json({
          name: '无头工具站 CMS Enhanced',
          version: '2.0.0',
          description: '企业级 SaaS 平台增强版',
          features: [
            'Lexical 富文本编辑器',
            'Umami 分析增强',
            'API 文档自动生成',
            '云存储支持',
            'SEO 优化',
            '表单构建器',
            '嵌套文档',
          ],
          collections: ['users', 'tools', 'tools-enhanced', 'media', 'analytics'],
          globals: ['settings'],
          plugins: ['umami', 'api-docs', 'seo', 'cloud-storage', 'form-builder'],
        })
      },
    },

    // 统计信息
    {
      path: '/system/stats',
      method: 'get',
      handler: async (req, res) => {
        try {
          const stats = {
            collections: {},
            totalDocuments: 0,
            systemHealth: 'good',
          }

          // 获取各集合的文档数量
          for (const collection of ['users', 'tools', 'tools-enhanced', 'media', 'analytics']) {
            try {
              const result = await req.payload.find({
                collection,
                limit: 0,
              })
              stats.collections[collection] = result.totalDocs
              stats.totalDocuments += result.totalDocs
            } catch (error) {
              stats.collections[collection] = 0
            }
          }

          res.json(stats)
        } catch (error) {
          res.status(500).json({
            error: '获取统计信息失败',
            message: error.message
          })
        }
      },
    },
  ],

  // 速率限制
  rateLimit: {
    max: 5000, // 增加限制
    window: 15 * 60 * 1000, // 15分钟
    skip: (req) => {
      // 跳过健康检查、静态资源和API文档
      return req.url?.includes('/health') ||
             req.url?.includes('/assets') ||
             req.url?.includes('/api-docs') ||
             req.url?.includes('/system/')
    },
  },

  // 文件上传配置
  upload: {
    limits: {
      fileSize: 100000000, // 100MB
    },
  },

  // 本地化配置
  localization: {
    locales: [
      {
        label: '中文',
        code: 'zh',
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'zh',
    fallback: true,
  },

  // 邮件配置
  email: {
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    fromName: process.env.FROM_NAME || '无头工具站',
    fromAddress: process.env.FROM_EMAIL || 'noreply@headless-tools.com',
  },
})
