import { Plugin } from 'payload/config'
import { CollectionConfig } from 'payload/types'

// Umami 分析数据集合
const UmamiAnalytics: CollectionConfig = {
  slug: 'umami-analytics',
  labels: {
    singular: '分析数据',
    plural: '分析数据',
  },
  admin: {
    useAsTitle: 'eventName',
    defaultColumns: ['eventName', 'url', 'userId', 'createdAt'],
    group: '📊 数据分析',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    create: () => true, // 允许匿名创建分析数据
    read: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'eventName',
      type: 'text',
      label: '事件名称',
      required: true,
      index: true,
    },
    {
      name: 'url',
      type: 'text',
      label: '页面URL',
      required: true,
      index: true,
    },
    {
      name: 'referrer',
      type: 'text',
      label: '来源页面',
    },
    {
      name: 'userId',
      type: 'text',
      label: '用户ID',
      index: true,
    },
    {
      name: 'sessionId',
      type: 'text',
      label: '会话ID',
      index: true,
    },
    {
      name: 'userAgent',
      type: 'text',
      label: '用户代理',
    },
    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP地址',
      admin: {
        hidden: true, // 隐私保护
      },
    },
    {
      name: 'country',
      type: 'text',
      label: '国家',
      index: true,
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
      name: 'device',
      type: 'group',
      label: '设备信息',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: '设备类型',
          options: [
            { label: '桌面', value: 'desktop' },
            { label: '移动', value: 'mobile' },
            { label: '平板', value: 'tablet' },
          ],
        },
        {
          name: 'browser',
          type: 'text',
          label: '浏览器',
        },
        {
          name: 'os',
          type: 'text',
          label: '操作系统',
        },
        {
          name: 'screenResolution',
          type: 'text',
          label: '屏幕分辨率',
        },
      ],
    },
    {
      name: 'eventData',
      type: 'json',
      label: '事件数据',
    },
    {
      name: 'duration',
      type: 'number',
      label: '停留时间(秒)',
    },
    {
      name: 'timestamp',
      type: 'date',
      label: '时间戳',
      defaultValue: () => new Date(),
      index: true,
    },
  ],
  timestamps: true,
}

// Umami 插件配置
export const UmamiPlugin: Plugin = (config) => {
  return {
    ...config,
    collections: [
      ...(config.collections || []),
      UmamiAnalytics,
    ],
    admin: {
      ...config.admin,
      components: {
        ...config.admin?.components,
        views: {
          ...config.admin?.components?.views,
          // 添加分析仪表板视图
          UmamiDashboard: {
            Component: '@/components/analytics-dashboard',
            path: '/analytics',
            exact: true,
          },
        },
      },
      webpack: (webpackConfig) => {
        const existingWebpackConfig = config.admin?.webpack?.(webpackConfig) || webpackConfig
        
        return {
          ...existingWebpackConfig,
          resolve: {
            ...existingWebpackConfig.resolve,
            alias: {
              ...existingWebpackConfig.resolve?.alias,
              '@/components/analytics-dashboard': require.resolve('../components/analytics-dashboard'),
            },
          },
        }
      },
    },
    endpoints: [
      ...(config.endpoints || []),
      // 分析数据追踪端点
      {
        path: '/analytics/track',
        method: 'post',
        handler: async (req, res) => {
          try {
            const {
              eventName,
              url,
              referrer,
              userId,
              sessionId,
              eventData,
              duration,
            } = req.body

            // 获取用户设备和位置信息
            const userAgent = req.headers['user-agent'] || ''
            const ipAddress = req.ip || req.connection.remoteAddress
            
            // 简单的设备检测
            const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
            const isTablet = /iPad|Tablet/.test(userAgent)
            const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop')
            
            // 浏览器检测
            let browser = 'Unknown'
            if (userAgent.includes('Chrome')) browser = 'Chrome'
            else if (userAgent.includes('Firefox')) browser = 'Firefox'
            else if (userAgent.includes('Safari')) browser = 'Safari'
            else if (userAgent.includes('Edge')) browser = 'Edge'
            
            // 操作系统检测
            let os = 'Unknown'
            if (userAgent.includes('Windows')) os = 'Windows'
            else if (userAgent.includes('Mac')) os = 'macOS'
            else if (userAgent.includes('Linux')) os = 'Linux'
            else if (userAgent.includes('Android')) os = 'Android'
            else if (userAgent.includes('iOS')) os = 'iOS'

            // 创建分析记录
            const analyticsData = await req.payload.create({
              collection: 'umami-analytics',
              data: {
                eventName,
                url,
                referrer,
                userId,
                sessionId,
                userAgent,
                ipAddress,
                device: {
                  type: deviceType,
                  browser,
                  os,
                },
                eventData,
                duration,
                timestamp: new Date(),
              },
            })

            res.json({
              success: true,
              id: analyticsData.id,
            })
          } catch (error) {
            console.error('Analytics tracking error:', error)
            res.status(500).json({
              success: false,
              error: 'Failed to track analytics event',
            })
          }
        },
      },
      // 获取分析统计端点
      {
        path: '/analytics/stats',
        method: 'get',
        handler: async (req, res) => {
          try {
            const { startDate, endDate, eventName, url } = req.query
            
            // 构建查询条件
            const where: any = {}
            
            if (startDate || endDate) {
              where.timestamp = {}
              if (startDate) where.timestamp.greater_than_equal = new Date(startDate as string)
              if (endDate) where.timestamp.less_than_equal = new Date(endDate as string)
            }
            
            if (eventName) where.eventName = { equals: eventName }
            if (url) where.url = { equals: url }

            // 获取总访问量
            const totalViews = await req.payload.count({
              collection: 'umami-analytics',
              where,
            })

            // 获取唯一访客数
            const uniqueVisitors = await req.payload.find({
              collection: 'umami-analytics',
              where,
              limit: 0,
            })

            // 统计设备类型
            const deviceStats = await req.payload.find({
              collection: 'umami-analytics',
              where,
              limit: 0,
            })

            // 统计浏览器
            const browserStats = await req.payload.find({
              collection: 'umami-analytics',
              where,
              limit: 0,
            })

            // 统计热门页面
            const popularPages = await req.payload.find({
              collection: 'umami-analytics',
              where: {
                ...where,
                eventName: { equals: 'pageview' },
              },
              limit: 10,
            })

            res.json({
              success: true,
              data: {
                totalViews: totalViews.totalDocs,
                uniqueVisitors: new Set(uniqueVisitors.docs.map(doc => doc.userId || doc.sessionId)).size,
                deviceTypes: deviceStats.docs.reduce((acc, doc) => {
                  const type = doc.device?.type || 'unknown'
                  acc[type] = (acc[type] || 0) + 1
                  return acc
                }, {}),
                browsers: browserStats.docs.reduce((acc, doc) => {
                  const browser = doc.device?.browser || 'unknown'
                  acc[browser] = (acc[browser] || 0) + 1
                  return acc
                }, {}),
                popularPages: popularPages.docs.reduce((acc, doc) => {
                  const url = doc.url
                  acc[url] = (acc[url] || 0) + 1
                  return acc
                }, {}),
              },
            })
          } catch (error) {
            console.error('Analytics stats error:', error)
            res.status(500).json({
              success: false,
              error: 'Failed to get analytics stats',
            })
          }
        },
      },
      // 实时分析数据端点
      {
        path: '/analytics/realtime',
        method: 'get',
        handler: async (req, res) => {
          try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            
            const realtimeData = await req.payload.find({
              collection: 'umami-analytics',
              where: {
                timestamp: {
                  greater_than_equal: fiveMinutesAgo,
                },
              },
              sort: '-timestamp',
              limit: 100,
            })

            const activeUsers = new Set(
              realtimeData.docs.map(doc => doc.userId || doc.sessionId)
            ).size

            const currentPages = realtimeData.docs.reduce((acc, doc) => {
              if (doc.eventName === 'pageview') {
                acc[doc.url] = (acc[doc.url] || 0) + 1
              }
              return acc
            }, {})

            res.json({
              success: true,
              data: {
                activeUsers,
                currentPages,
                recentEvents: realtimeData.docs.slice(0, 20),
              },
            })
          } catch (error) {
            console.error('Realtime analytics error:', error)
            res.status(500).json({
              success: false,
              error: 'Failed to get realtime analytics',
            })
          }
        },
      },
    ],
  }
}
