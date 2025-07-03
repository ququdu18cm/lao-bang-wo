import { GlobalConfig } from 'payload/types'

const Settings: GlobalConfig = {
  slug: 'settings',
  label: '系统设置',
  admin: {
    group: '⚙️ 系统管理',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // 网站基础信息
    {
      name: 'siteInfo',
      type: 'group',
      label: '🌐 网站信息',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          label: '网站名称',
          required: true,
          defaultValue: '无头工具站',
        },
        {
          name: 'siteDescription',
          type: 'textarea',
          label: '网站描述',
          maxLength: 300,
          defaultValue: '基于开源技术构建的企业级 SaaS 平台',
        },
        {
          name: 'siteUrl',
          type: 'text',
          label: '网站URL',
          required: true,
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
          name: 'keywords',
          type: 'array',
          label: 'SEO关键词',
          fields: [
            {
              name: 'keyword',
              type: 'text',
              required: true,
            },
          ],
          maxRows: 20,
        },
      ],
    },
    
    // 联系信息
    {
      name: 'contactInfo',
      type: 'group',
      label: '📞 联系信息',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: '联系邮箱',
        },
        {
          name: 'phone',
          type: 'text',
          label: '联系电话',
        },
        {
          name: 'address',
          type: 'textarea',
          label: '联系地址',
        },
        {
          name: 'socialMedia',
          type: 'array',
          label: '社交媒体',
          fields: [
            {
              name: 'platform',
              type: 'select',
              label: '平台',
              options: [
                { label: 'GitHub', value: 'github' },
                { label: 'Twitter', value: 'twitter' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: '微博', value: 'weibo' },
                { label: '微信公众号', value: 'wechat' },
                { label: 'QQ群', value: 'qq' },
              ],
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL',
              required: true,
            },
            {
              name: 'username',
              type: 'text',
              label: '用户名/ID',
            },
          ],
          maxRows: 10,
        },
      ],
    },
    
    // 分析配置
    {
      name: 'analytics',
      type: 'group',
      label: '📊 分析配置',
      fields: [
        {
          name: 'umamiConfig',
          type: 'group',
          label: 'Umami配置',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: '启用Umami分析',
              defaultValue: true,
            },
            {
              name: 'websiteId',
              type: 'text',
              label: '网站ID',
              admin: {
                condition: (data, siblingData) => siblingData?.enabled,
              },
            },
            {
              name: 'scriptUrl',
              type: 'text',
              label: '脚本URL',
              defaultValue: '/umami.js',
              admin: {
                condition: (data, siblingData) => siblingData?.enabled,
              },
            },
            {
              name: 'trackingDomains',
              type: 'array',
              label: '跟踪域名',
              fields: [
                {
                  name: 'domain',
                  type: 'text',
                  required: true,
                },
              ],
              admin: {
                condition: (data, siblingData) => siblingData?.enabled,
              },
            },
          ],
        },
        {
          name: 'googleAnalytics',
          type: 'group',
          label: 'Google Analytics',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: '启用GA',
              defaultValue: false,
            },
            {
              name: 'trackingId',
              type: 'text',
              label: '跟踪ID',
              admin: {
                condition: (data, siblingData) => siblingData?.enabled,
              },
            },
          ],
        },
      ],
    },
    
    // 邮件配置
    {
      name: 'emailConfig',
      type: 'group',
      label: '📧 邮件配置',
      fields: [
        {
          name: 'smtpConfig',
          type: 'group',
          label: 'SMTP配置',
          fields: [
            {
              name: 'host',
              type: 'text',
              label: 'SMTP主机',
              defaultValue: 'smtp.gmail.com',
            },
            {
              name: 'port',
              type: 'number',
              label: 'SMTP端口',
              defaultValue: 587,
            },
            {
              name: 'secure',
              type: 'checkbox',
              label: '使用SSL',
              defaultValue: false,
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
                description: '建议使用应用专用密码',
              },
            },
          ],
        },
        {
          name: 'fromEmail',
          type: 'email',
          label: '发件人邮箱',
          defaultValue: 'noreply@your-domain.com',
        },
        {
          name: 'fromName',
          type: 'text',
          label: '发件人名称',
          defaultValue: '无头工具站',
        },
        {
          name: 'replyTo',
          type: 'email',
          label: '回复邮箱',
        },
      ],
    },
    
    // 存储配置
    {
      name: 'storageConfig',
      type: 'group',
      label: '💾 存储配置',
      fields: [
        {
          name: 'provider',
          type: 'select',
          label: '存储提供商',
          options: [
            { label: '本地存储', value: 'local' },
            { label: 'AWS S3', value: 's3' },
            { label: '阿里云OSS', value: 'oss' },
            { label: '腾讯云COS', value: 'cos' },
            { label: 'Cloudinary', value: 'cloudinary' },
          ],
          defaultValue: 'local',
        },
        {
          name: 's3Config',
          type: 'group',
          label: 'AWS S3配置',
          admin: {
            condition: (data, siblingData) => siblingData?.provider === 's3',
          },
          fields: [
            {
              name: 'bucket',
              type: 'text',
              label: 'Bucket名称',
            },
            {
              name: 'region',
              type: 'text',
              label: '区域',
              defaultValue: 'us-east-1',
            },
            {
              name: 'accessKeyId',
              type: 'text',
              label: 'Access Key ID',
            },
            {
              name: 'secretAccessKey',
              type: 'text',
              label: 'Secret Access Key',
            },
          ],
        },
        {
          name: 'cloudinaryConfig',
          type: 'group',
          label: 'Cloudinary配置',
          admin: {
            condition: (data, siblingData) => siblingData?.provider === 'cloudinary',
          },
          fields: [
            {
              name: 'cloudName',
              type: 'text',
              label: 'Cloud Name',
            },
            {
              name: 'apiKey',
              type: 'text',
              label: 'API Key',
            },
            {
              name: 'apiSecret',
              type: 'text',
              label: 'API Secret',
            },
          ],
        },
      ],
    },
    
    // 安全配置
    {
      name: 'securityConfig',
      type: 'group',
      label: '🔐 安全配置',
      fields: [
        {
          name: 'rateLimiting',
          type: 'group',
          label: '速率限制',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: '启用速率限制',
              defaultValue: true,
            },
            {
              name: 'windowMs',
              type: 'number',
              label: '时间窗口 (毫秒)',
              defaultValue: 900000, // 15分钟
              admin: {
                condition: (data, siblingData) => siblingData?.enabled,
              },
            },
            {
              name: 'maxRequests',
              type: 'number',
              label: '最大请求数',
              defaultValue: 100,
              admin: {
                condition: (data, siblingData) => siblingData?.enabled,
              },
            },
          ],
        },
        {
          name: 'corsConfig',
          type: 'group',
          label: 'CORS配置',
          fields: [
            {
              name: 'allowedOrigins',
              type: 'array',
              label: '允许的源',
              fields: [
                {
                  name: 'origin',
                  type: 'text',
                  required: true,
                },
              ],
              defaultValue: [{ origin: '*' }],
            },
            {
              name: 'allowCredentials',
              type: 'checkbox',
              label: '允许凭证',
              defaultValue: true,
            },
          ],
        },
      ],
    },
    
    // 功能开关
    {
      name: 'features',
      type: 'group',
      label: '🎛️ 功能开关',
      fields: [
        {
          name: 'userRegistration',
          type: 'checkbox',
          label: '允许用户注册',
          defaultValue: true,
        },
        {
          name: 'guestAccess',
          type: 'checkbox',
          label: '允许访客使用',
          defaultValue: true,
        },
        {
          name: 'fileUpload',
          type: 'checkbox',
          label: '允许文件上传',
          defaultValue: true,
        },
        {
          name: 'apiAccess',
          type: 'checkbox',
          label: '启用API访问',
          defaultValue: true,
        },
        {
          name: 'maintenanceMode',
          type: 'checkbox',
          label: '维护模式',
          defaultValue: false,
        },
        {
          name: 'maintenanceMessage',
          type: 'richText',
          label: '维护提示信息',
          admin: {
            condition: (data, siblingData) => siblingData?.maintenanceMode,
          },
        },
      ],
    },
    
    // 系统信息
    {
      name: 'systemInfo',
      type: 'group',
      label: '📋 系统信息',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'version',
          type: 'text',
          label: '系统版本',
          defaultValue: '1.0.0',
        },
        {
          name: 'lastUpdated',
          type: 'date',
          label: '最后更新',
          defaultValue: () => new Date(),
        },
        {
          name: 'environment',
          type: 'select',
          label: '运行环境',
          options: [
            { label: '开发', value: 'development' },
            { label: '测试', value: 'staging' },
            { label: '生产', value: 'production' },
          ],
          defaultValue: 'production',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // 自动更新最后修改时间
        if (data.systemInfo) {
          data.systemInfo.lastUpdated = new Date()
        }
        return data
      },
    ],
  },
}

export default Settings
