import { CollectionConfig } from 'payload/types'

const ToolsEnhanced: CollectionConfig = {
  slug: 'tools-enhanced',
  labels: {
    singular: '增强工具',
    plural: '增强工具',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'status', 'usageCount', 'rating', 'createdAt'],
    group: '🛠️ 工具管理',
    listSearchableFields: ['name', 'description', 'tags'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // 基础信息
    {
      name: 'name',
      type: 'text',
      label: '工具名称',
      required: true,
      unique: true,
      maxLength: 100,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL标识',
      required: true,
      unique: true,
      admin: {
        description: '用于URL路径，自动生成',
      },
      hooks: {
        beforeChange: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '简短描述',
      required: true,
      maxLength: 200,
      admin: {
        description: '用于搜索结果和卡片展示',
      },
    },
    {
      name: 'longDescription',
      type: 'richText',
      label: '详细描述',
      admin: {
        description: '支持富文本格式的详细说明',
      },
    },
    
    // 分类和标签
    {
      name: 'category',
      type: 'select',
      label: '主要分类',
      options: [
        { label: '🖼️ 图像处理', value: 'image' },
        { label: '📄 文档转换', value: 'document' },
        { label: '📊 数据分析', value: 'analytics' },
        { label: '💻 开发工具', value: 'development' },
        { label: '⚙️ 系统工具', value: 'system' },
        { label: '🤖 AI工具', value: 'ai' },
        { label: '🌐 网络工具', value: 'network' },
        { label: '🔐 安全工具', value: 'security' },
        { label: '🎨 设计工具', value: 'design' },
        { label: '📱 移动工具', value: 'mobile' },
        { label: '📈 商业工具', value: 'business' },
        { label: '🔧 其他', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'subcategory',
      type: 'text',
      label: '子分类',
      admin: {
        description: '更具体的分类，如"图片压缩"、"格式转换"等',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: '标签',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          maxLength: 30,
        },
      ],
      maxRows: 15,
    },
    
    // 媒体资源
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: '工具图标',
      admin: {
        description: '推荐尺寸: 64x64px，支持PNG、SVG格式',
      },
    },
    {
      name: 'screenshots',
      type: 'array',
      label: '截图展示',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: '图片说明',
          maxLength: 100,
        },
        {
          name: 'order',
          type: 'number',
          label: '显示顺序',
          defaultValue: 0,
        },
      ],
      maxRows: 8,
    },
    
    // 定价信息
    {
      name: 'pricing',
      type: 'group',
      label: '💰 定价信息',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: '定价类型',
          options: [
            { label: '完全免费', value: 'free' },
            { label: '免费试用', value: 'freemium' },
            { label: '按次付费', value: 'pay-per-use' },
            { label: '订阅制', value: 'subscription' },
            { label: '一次性付费', value: 'one-time' },
          ],
          defaultValue: 'free',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          label: '价格 (元)',
          admin: {
            condition: (data, siblingData) => siblingData?.type !== 'free',
          },
        },
        {
          name: 'freeQuota',
          type: 'group',
          label: '免费额度',
          admin: {
            condition: (data, siblingData) => 
              siblingData?.type === 'freemium' || siblingData?.type === 'pay-per-use',
          },
          fields: [
            {
              name: 'dailyLimit',
              type: 'number',
              label: '每日免费次数',
            },
            {
              name: 'monthlyLimit',
              type: 'number',
              label: '每月免费次数',
            },
          ],
        },
      ],
    },
    
    // Docker配置 (简化版)
    {
      name: 'dockerImage',
      type: 'text',
      label: 'Docker镜像',
      required: true,
      admin: {
        description: '例如: nginx:alpine, node:18-alpine',
      },
    },
    {
      name: 'dockerConfig',
      type: 'group',
      label: '🐳 Docker配置',
      fields: [
        {
          name: 'ports',
          type: 'array',
          label: '端口映射',
          fields: [
            {
              name: 'containerPort',
              type: 'number',
              label: '容器端口',
              required: true,
            },
            {
              name: 'hostPort',
              type: 'number',
              label: '主机端口',
            },
          ],
          maxRows: 5,
        },
        {
          name: 'environment',
          type: 'array',
          label: '环境变量',
          fields: [
            {
              name: 'key',
              type: 'text',
              label: '变量名',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: '变量值',
              required: true,
            },
          ],
          maxRows: 10,
        },
        {
          name: 'command',
          type: 'text',
          label: '启动命令',
        },
        {
          name: 'healthCheck',
          type: 'text',
          label: '健康检查URL',
          admin: {
            description: '例如: /health, /api/status',
          },
        },
      ],
    },
    
    // 状态和统计
    {
      name: 'status',
      type: 'select',
      label: '状态',
      options: [
        { label: '✅ 正常运行', value: 'active' },
        { label: '🔧 维护中', value: 'maintenance' },
        { label: '⚠️ 测试版', value: 'beta' },
        { label: '❌ 已停用', value: 'inactive' },
      ],
      defaultValue: 'active',
      required: true,
    },
    {
      name: 'usageCount',
      type: 'number',
      label: '使用次数',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'rating',
      type: 'number',
      label: '评分',
      min: 0,
      max: 5,
      admin: {
        step: 0.1,
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: '推荐工具',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // 新创建时初始化统计数据
        if (operation === 'create') {
          data.usageCount = 0
          data.rating = 0
        }
        return data
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`新工具创建: ${doc.name}`)
        }
      },
    ],
  },
  timestamps: true,
}

export default ToolsEnhanced
