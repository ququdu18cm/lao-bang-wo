import { CollectionConfig } from 'payload/types'

const Analytics: CollectionConfig = {
  slug: 'analytics',
  labels: {
    singular: '分析数据',
    plural: '分析数据',
  },
  admin: {
    useAsTitle: 'eventName',
    defaultColumns: ['eventName', 'eventType', 'userId', 'toolId', 'createdAt'],
    group: '📊 数据分析',
    pagination: {
      defaultLimit: 50,
    },
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    create: () => true, // 允许匿名创建分析数据
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // 事件基础信息
    {
      name: 'eventName',
      type: 'text',
      label: '事件名称',
      required: true,
      index: true,
    },
    {
      name: 'eventType',
      type: 'select',
      label: '事件类型',
      options: [
        { label: '页面访问', value: 'page_view' },
        { label: '工具使用', value: 'tool_usage' },
        { label: '用户注册', value: 'user_register' },
        { label: '用户登录', value: 'user_login' },
        { label: '文件上传', value: 'file_upload' },
        { label: '文件下载', value: 'file_download' },
        { label: '搜索查询', value: 'search_query' },
        { label: '按钮点击', value: 'button_click' },
        { label: '表单提交', value: 'form_submit' },
        { label: '错误发生', value: 'error_occurred' },
        { label: '自定义事件', value: 'custom_event' },
      ],
      required: true,
      index: true,
    },
    
    // 关联信息
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      label: '用户',
      admin: {
        description: '如果是匿名用户则为空',
      },
      index: true,
    },
    {
      name: 'toolId',
      type: 'relationship',
      relationTo: 'tools',
      label: '相关工具',
      admin: {
        condition: (data) => data?.eventType === 'tool_usage',
      },
      index: true,
    },
    {
      name: 'sessionId',
      type: 'text',
      label: '会话ID',
      admin: {
        description: '用于跟踪用户会话',
      },
      index: true,
    },
    
    // 事件数据
    {
      name: 'eventData',
      type: 'json',
      label: '事件数据',
      admin: {
        description: '存储事件的详细数据',
      },
    },
    
    // 页面信息
    {
      name: 'pageInfo',
      type: 'group',
      label: '页面信息',
      admin: {
        condition: (data) => data?.eventType === 'page_view',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          label: '页面URL',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: '页面标题',
        },
        {
          name: 'referrer',
          type: 'text',
          label: '来源页面',
        },
        {
          name: 'loadTime',
          type: 'number',
          label: '加载时间 (ms)',
        },
      ],
    },
    
    // 用户环境信息
    {
      name: 'userAgent',
      type: 'group',
      label: '用户环境',
      fields: [
        {
          name: 'browser',
          type: 'text',
          label: '浏览器',
        },
        {
          name: 'browserVersion',
          type: 'text',
          label: '浏览器版本',
        },
        {
          name: 'os',
          type: 'text',
          label: '操作系统',
        },
        {
          name: 'osVersion',
          type: 'text',
          label: '系统版本',
        },
        {
          name: 'device',
          type: 'select',
          label: '设备类型',
          options: [
            { label: '桌面', value: 'desktop' },
            { label: '移动', value: 'mobile' },
            { label: '平板', value: 'tablet' },
            { label: '未知', value: 'unknown' },
          ],
        },
        {
          name: 'screenResolution',
          type: 'text',
          label: '屏幕分辨率',
        },
        {
          name: 'language',
          type: 'text',
          label: '语言',
        },
        {
          name: 'timezone',
          type: 'text',
          label: '时区',
        },
      ],
    },
    
    // 地理位置信息
    {
      name: 'location',
      type: 'group',
      label: '地理位置',
      fields: [
        {
          name: 'ip',
          type: 'text',
          label: 'IP地址',
          admin: {
            description: '已脱敏处理',
          },
        },
        {
          name: 'country',
          type: 'text',
          label: '国家',
        },
        {
          name: 'region',
          type: 'text',
          label: '地区',
        },
        {
          name: 'city',
          type: 'text',
          label: '城市',
        },
        {
          name: 'latitude',
          type: 'number',
          label: '纬度',
        },
        {
          name: 'longitude',
          type: 'number',
          label: '经度',
        },
      ],
    },
    
    // 性能指标
    {
      name: 'performance',
      type: 'group',
      label: '性能指标',
      admin: {
        condition: (data) => data?.eventType === 'page_view' || data?.eventType === 'tool_usage',
      },
      fields: [
        {
          name: 'responseTime',
          type: 'number',
          label: '响应时间 (ms)',
        },
        {
          name: 'processingTime',
          type: 'number',
          label: '处理时间 (ms)',
        },
        {
          name: 'memoryUsage',
          type: 'number',
          label: '内存使用 (MB)',
        },
        {
          name: 'cpuUsage',
          type: 'number',
          label: 'CPU使用率 (%)',
        },
      ],
    },
    
    // 错误信息
    {
      name: 'errorInfo',
      type: 'group',
      label: '错误信息',
      admin: {
        condition: (data) => data?.eventType === 'error_occurred',
      },
      fields: [
        {
          name: 'errorType',
          type: 'text',
          label: '错误类型',
        },
        {
          name: 'errorMessage',
          type: 'textarea',
          label: '错误消息',
        },
        {
          name: 'stackTrace',
          type: 'textarea',
          label: '堆栈跟踪',
        },
        {
          name: 'severity',
          type: 'select',
          label: '严重程度',
          options: [
            { label: '低', value: 'low' },
            { label: '中', value: 'medium' },
            { label: '高', value: 'high' },
            { label: '严重', value: 'critical' },
          ],
          defaultValue: 'medium',
        },
      ],
    },
    
    // 元数据
    {
      name: 'metadata',
      type: 'group',
      label: '元数据',
      fields: [
        {
          name: 'source',
          type: 'select',
          label: '数据来源',
          options: [
            { label: 'Web前端', value: 'web' },
            { label: '移动应用', value: 'mobile' },
            { label: 'API调用', value: 'api' },
            { label: '服务器端', value: 'server' },
            { label: 'Webhook', value: 'webhook' },
          ],
          defaultValue: 'web',
        },
        {
          name: 'version',
          type: 'text',
          label: '应用版本',
        },
        {
          name: 'environment',
          type: 'select',
          label: '环境',
          options: [
            { label: '生产', value: 'production' },
            { label: '测试', value: 'staging' },
            { label: '开发', value: 'development' },
          ],
          defaultValue: 'production',
        },
        {
          name: 'processed',
          type: 'checkbox',
          label: '已处理',
          defaultValue: false,
          admin: {
            description: '标记是否已被分析处理',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // 自动设置IP地址（脱敏）
        if (req.ip && !data.location?.ip) {
          const ip = req.ip.replace(/\.\d+$/, '.***') // 脱敏处理
          data.location = {
            ...data.location,
            ip,
          }
        }
        
        // 自动解析User-Agent
        if (req.headers['user-agent'] && !data.userAgent?.browser) {
          // 这里可以集成user-agent解析库
          data.userAgent = {
            ...data.userAgent,
            // 简单的解析示例
            browser: req.headers['user-agent'].includes('Chrome') ? 'Chrome' : 'Other',
          }
        }
        
        return data
      },
    ],
    afterCreate: [
      ({ doc }) => {
        // 可以在这里触发实时分析或通知
        console.log(`新分析事件: ${doc.eventName}`)
      },
    ],
  },
  timestamps: true,
}

export default Analytics
