// 插件配置文件
import { Plugin } from 'payload/config'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

// Lexical 编辑器配置
export const lexicalPlugin = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    // 可以在这里添加自定义功能
  ],
})

// 云存储配置
export const cloudStoragePlugin = cloudStorage({
  collections: {
    'media': {
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
    },
  },
})

// Better Fields 插件配置
export const betterFieldsConfig = {
  // 这里可以添加 Better Fields 的配置
}

// 认证增强插件配置
export const authEnhancementConfig = {
  // OAuth 配置
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  // 双因素认证
  twoFactor: {
    enabled: true,
    issuer: 'HeadlessTools',
  },
}

// 图片优化配置
export const imageOptimizationConfig = {
  blurhash: {
    enabled: true,
    componentX: 4,
    componentY: 3,
  },
  compression: {
    quality: 85,
    progressive: true,
  },
}

// API 工具配置
export const apiToolsConfig = {
  openapi: {
    enabled: true,
    info: {
      title: '无头工具站 API',
      version: '1.0.0',
      description: '企业级 SaaS 平台 API 文档',
    },
    servers: [
      {
        url: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
        description: '主服务器',
      },
    ],
  },
  swagger: {
    enabled: true,
    path: '/api-docs',
  },
}

export const allPlugins: Plugin[] = [
  // 这里将在 payload.config.ts 中使用
]
