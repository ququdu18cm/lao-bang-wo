import { buildConfig } from 'payload/config'
import { mongoAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import path from 'path'

// 导入集合
import Users from './src/collections/Users'
import Tools from './src/collections/Tools'
import Analytics from './src/collections/Analytics'
import BlogPosts from './src/collections/BlogPosts'
import Media from './src/collections/Media'
import Categories from './src/collections/Categories'
import Tags from './src/collections/Tags'

// 导入插件
import { UmamiPlugin } from './src/plugins/umami-plugin'
import { MonitoringPlugin } from './src/plugins/monitoring-plugin'
import { MarketingPlugin } from './src/plugins/marketing-plugin'

// 导入端点
import analyticsEndpoints from './src/endpoints/analytics'
import monitoringEndpoints from './src/endpoints/monitoring'
import marketingEndpoints from './src/endpoints/marketing'
import healthEndpoints from './src/endpoints/health'

export default buildConfig({
  // 管理面板配置
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    meta: {
      titleSuffix: '- 无头工具站 CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
    css: path.resolve(__dirname, 'src/styles/admin.css'),
    components: {
      // 自定义管理面板组件
      views: {
        Dashboard: {
          Component: '@/components/dashboard',
          path: '/dashboard',
        },
        Analytics: {
          Component: '@/components/analytics-dashboard',
          path: '/analytics',
        },
        Monitoring: {
          Component: '@/components/monitoring-panel',
          path: '/monitoring',
        },
        Marketing: {
          Component: '@/components/marketing-panel',
          path: '/marketing',
        },
      },
      graphics: {
        Logo: '@/components/logo',
        Icon: '@/components/icon',
      },
    },
    webpack: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': path.resolve(__dirname, 'src'),
        },
      },
    }),
  },

  // 编辑器配置
  editor: slateEditor({
    admin: {
      elements: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'ul', 'ol', 'li',
        'link', 'textAlign', 'indent',
        'upload', 'relationship',
      ],
      leaves: [
        'bold', 'italic', 'underline', 'strikethrough', 'code',
      ],
    },
  }),

  // 数据集合
  collections: [
    Users,
    Tools,
    Analytics,
    BlogPosts,
    Media,
    Categories,
    Tags,
  ],

  // 全局配置
  globals: [
    {
      slug: 'settings',
      label: '网站设置',
      access: {
        read: () => true,
      },
      fields: [
        {
          name: 'siteName',
          type: 'text',
          label: '网站名称',
          defaultValue: '无头工具站',
        },
        {
          name: 'siteDescription',
          type: 'textarea',
          label: '网站描述',
          defaultValue: '基于开源技术构建的企业级工具平台',
        },
        {
          name: 'siteUrl',
          type: 'text',
          label: '网站URL',
          defaultValue: 'https://your-domain.com',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: '网站Logo',
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          label: '网站图标',
        },
        {
          name: 'socialMedia',
          type: 'group',
          label: '社交媒体',
          fields: [
            {
              name: 'twitter',
              type: 'text',
              label: 'Twitter',
            },
            {
              name: 'github',
              type: 'text',
              label: 'GitHub',
            },
            {
              name: 'linkedin',
              type: 'text',
              label: 'LinkedIn',
            },
          ],
        },
        {
          name: 'analytics',
          type: 'group',
          label: '分析配置',
          fields: [
            {
              name: 'umamiUrl',
              type: 'text',
              label: 'Umami URL',
            },
            {
              name: 'umamiWebsiteId',
              type: 'text',
              label: 'Umami Website ID',
            },
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: 'Google Analytics ID',
            },
          ],
        },
        {
          name: 'monitoring',
          type: 'group',
          label: '监控配置',
          fields: [
            {
              name: 'grafanaUrl',
              type: 'text',
              label: 'Grafana URL',
            },
            {
              name: 'uptimeKumaUrl',
              type: 'text',
              label: 'Uptime Kuma URL',
            },
          ],
        },
        {
          name: 'marketing',
          type: 'group',
          label: '营销配置',
          fields: [
            {
              name: 'listmonkUrl',
              type: 'text',
              label: 'Listmonk URL',
            },
            {
              name: 'smtpSettings',
              type: 'group',
              label: 'SMTP 设置',
              fields: [
                {
                  name: 'host',
                  type: 'text',
                  label: 'SMTP 主机',
                },
                {
                  name: 'port',
                  type: 'number',
                  label: 'SMTP 端口',
                  defaultValue: 587,
                },
                {
                  name: 'username',
                  type: 'text',
                  label: '用户名',
                },
                {
                  name: 'password',
                  type: 'text',
                  label: '密码',
                  admin: {
                    type: 'password',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // API 端点
  endpoints: [
    ...analyticsEndpoints,
    ...monitoringEndpoints,
    ...marketingEndpoints,
    ...healthEndpoints,
  ],

  // 插件配置
  plugins: [
    // SEO 插件
    seoPlugin({
      collections: ['blog-posts', 'tools'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc.title} | 无头工具站`,
      generateDescription: ({ doc }) => doc.excerpt || doc.description,
      generateURL: ({ doc, collection }) => {
        const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://your-domain.com'
        return `${baseUrl}/${collection.slug}/${doc.slug}`
      },
    }),

    // 嵌套文档插件
    nestedDocsPlugin({
      collections: ['blog-posts'],
      generateLabel: (_, doc) => doc.title,
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),

    // 表单构建器插件
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        email: true,
        state: true,
        country: true,
        checkbox: true,
        number: true,
        message: true,
        payment: false,
      },
      formOverrides: {
        fields: [
          {
            name: 'confirmationMessage',
            type: 'richText',
            label: '确认消息',
          },
        ],
      },
    }),

    // 自定义插件
    UmamiPlugin,
    MonitoringPlugin,
    MarketingPlugin,
  ],

  // 数据库配置
  db: mongoAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost:27017/headless-tools',
  }),

  // 服务器配置
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',

  // TypeScript 配置
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  // GraphQL 配置
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },

  // CORS 配置
  cors: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ],

  // CSRF 配置
  csrf: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ],

  // 上传配置
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },

  // 本地化配置
  localization: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    fallback: true,
  },

  // 速率限制
  rateLimit: {
    max: 1000,
    window: 15 * 60 * 1000, // 15 minutes
    skip: (req) => {
      // 跳过管理面板请求的速率限制
      return req.url?.startsWith('/admin')
    },
  },

  // 日志配置
  debug: process.env.NODE_ENV === 'development',
})
