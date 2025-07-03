import { Plugin } from 'payload/config'
import { Request, Response } from 'express'

interface UmamiConfig {
  websiteId?: string
  apiUrl?: string
  enabled?: boolean
  trackPageViews?: boolean
  trackEvents?: boolean
  realTimeEnabled?: boolean
  dataRetentionDays?: number
}

const umamiEnhancedPlugin = (config: UmamiConfig = {}): Plugin => {
  const {
    enabled = true,
    trackPageViews = true,
    trackEvents = true,
    realTimeEnabled = true,
    dataRetentionDays = 365,
  } = config

  return {
    name: 'umami-analytics-enhanced',
    init: (payload) => {
      if (!enabled) {
        console.log('🎯 Umami Analytics Plugin 已禁用')
        return
      }

      console.log('🎯 Umami Analytics Plugin Enhanced 已初始化')
      
      // 事件追踪 API
      payload.router.post('/analytics/track', async (req: Request, res: Response) => {
        try {
          const { eventName, eventData, userAgent, ip, userId, toolId } = req.body
          
          // 解析用户代理
          const deviceInfo = parseUserAgent(userAgent || req.headers['user-agent'])
          
          // 获取地理位置信息
          const locationInfo = await getLocationFromIP(ip || req.ip)
          
          // 获取页面信息
          const pageInfo = extractPageInfo(req.body)
          
          // 创建分析记录
          const analyticsData = {
            eventName,
            eventType: determineEventType(eventName),
            eventData,
            userId: userId || null,
            toolId: toolId || null,
            sessionId: req.sessionID || generateSessionId(),
            userAgent: deviceInfo,
            location: locationInfo,
            pageInfo,
            performance: extractPerformanceData(req.body),
            metadata: {
              source: 'web',
              version: process.env.APP_VERSION || '1.0.0',
              environment: process.env.NODE_ENV || 'production',
              processed: false,
            },
          }
          
          // 保存到数据库
          const result = await payload.create({
            collection: 'analytics',
            data: analyticsData,
          })
          
          // 实时处理
          if (realTimeEnabled) {
            await processRealTimeEvent(payload, result)
          }
          
          res.json({ 
            success: true, 
            message: '事件追踪成功',
            eventId: result.id,
            timestamp: result.createdAt
          })
        } catch (error) {
          console.error('Analytics tracking error:', error)
          res.status(500).json({ 
            success: false, 
            error: error.message 
          })
        }
      })
      
      // 批量事件追踪
      payload.router.post('/analytics/track/batch', async (req: Request, res: Response) => {
        try {
          const { events } = req.body
          
          if (!Array.isArray(events) || events.length === 0) {
            return res.status(400).json({
              success: false,
              error: '事件数组不能为空'
            })
          }
          
          const results = []
          
          for (const event of events) {
            const deviceInfo = parseUserAgent(event.userAgent || req.headers['user-agent'])
            const locationInfo = await getLocationFromIP(event.ip || req.ip)
            
            const analyticsData = {
              eventName: event.eventName,
              eventType: determineEventType(event.eventName),
              eventData: event.eventData,
              userId: event.userId || null,
              toolId: event.toolId || null,
              sessionId: event.sessionId || req.sessionID || generateSessionId(),
              userAgent: deviceInfo,
              location: locationInfo,
              pageInfo: extractPageInfo(event),
              performance: extractPerformanceData(event),
              metadata: {
                source: 'web',
                version: process.env.APP_VERSION || '1.0.0',
                environment: process.env.NODE_ENV || 'production',
                processed: false,
              },
            }
            
            const result = await payload.create({
              collection: 'analytics',
              data: analyticsData,
            })
            
            results.push(result.id)
          }
          
          res.json({
            success: true,
            message: `成功追踪 ${results.length} 个事件`,
            eventIds: results
          })
        } catch (error) {
          console.error('Batch analytics tracking error:', error)
          res.status(500).json({ 
            success: false, 
            error: error.message 
          })
        }
      })
      
      // 获取统计数据
      payload.router.get('/analytics/stats', async (req: Request, res: Response) => {
        try {
          const { 
            startDate, 
            endDate, 
            eventType, 
            userId, 
            toolId,
            groupBy = 'day',
            metrics = 'all'
          } = req.query
          
          const query: any = {}
          
          if (startDate && endDate) {
            query.createdAt = {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            }
          }
          
          if (eventType) {
            query.eventType = eventType
          }
          
          if (userId) {
            query.userId = userId
          }
          
          if (toolId) {
            query.toolId = toolId
          }
          
          const stats = await payload.find({
            collection: 'analytics',
            where: query,
            limit: 10000,
            sort: '-createdAt',
          })
          
          // 处理统计数据
          const processedStats = processAnalyticsData(stats.docs, {
            groupBy: groupBy as string,
            metrics: metrics as string,
          })
          
          res.json({
            success: true,
            data: processedStats,
            total: stats.totalDocs,
            query: query,
            period: { startDate, endDate },
          })
        } catch (error) {
          console.error('Analytics stats error:', error)
          res.status(500).json({ 
            success: false, 
            error: error.message 
          })
        }
      })
      
      // 实时数据
      payload.router.get('/analytics/realtime', async (req: Request, res: Response) => {
        try {
          if (!realTimeEnabled) {
            return res.json({
              success: false,
              message: '实时分析已禁用'
            })
          }

          const now = new Date()
          const timeRange = parseInt(req.query.minutes as string) || 5
          const pastTime = new Date(now.getTime() - timeRange * 60 * 1000)
          
          const realtimeData = await payload.find({
            collection: 'analytics',
            where: {
              createdAt: {
                $gte: pastTime,
              },
            },
            sort: '-createdAt',
            limit: 500,
          })
          
          const processedData = processRealTimeData(realtimeData.docs)
          
          res.json({
            success: true,
            data: processedData,
            activeUsers: getActiveUsers(realtimeData.docs),
            currentTime: now,
            timeRange: `${timeRange} 分钟`,
            total: realtimeData.totalDocs,
          })
        } catch (error) {
          console.error('Realtime analytics error:', error)
          res.status(500).json({ 
            success: false, 
            error: error.message 
          })
        }
      })

      // 用户行为分析
      payload.router.get('/analytics/user-behavior/:userId', async (req: Request, res: Response) => {
        try {
          const { userId } = req.params
          const { days = 30 } = req.query
          
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - parseInt(days as string))
          
          const userEvents = await payload.find({
            collection: 'analytics',
            where: {
              userId,
              createdAt: {
                $gte: startDate,
              },
            },
            sort: '-createdAt',
            limit: 1000,
          })
          
          const behaviorAnalysis = analyzeUserBehavior(userEvents.docs)
          
          res.json({
            success: true,
            userId,
            period: `${days} 天`,
            data: behaviorAnalysis,
            totalEvents: userEvents.totalDocs,
          })
        } catch (error) {
          console.error('User behavior analysis error:', error)
          res.status(500).json({ 
            success: false, 
            error: error.message 
          })
        }
      })

      // 工具使用统计
      payload.router.get('/analytics/tools/usage', async (req: Request, res: Response) => {
        try {
          const { period = '7d' } = req.query
          
          const startDate = new Date()
          const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 7
          startDate.setDate(startDate.getDate() - days)
          
          const toolUsage = await payload.find({
            collection: 'analytics',
            where: {
              eventType: 'tool_usage',
              createdAt: {
                $gte: startDate,
              },
            },
            limit: 10000,
          })
          
          const usageStats = analyzeToolUsage(toolUsage.docs)
          
          res.json({
            success: true,
            period: `${days} 天`,
            data: usageStats,
            totalUsage: toolUsage.totalDocs,
          })
        } catch (error) {
          console.error('Tool usage analysis error:', error)
          res.status(500).json({ 
            success: false, 
            error: error.message 
          })
        }
      })

      // 数据清理任务
      if (dataRetentionDays > 0) {
        setInterval(async () => {
          try {
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - dataRetentionDays)
            
            const result = await payload.delete({
              collection: 'analytics',
              where: {
                createdAt: {
                  $lt: cutoffDate,
                },
              },
            })
            
            if (result.docs.length > 0) {
              console.log(`🧹 清理了 ${result.docs.length} 条过期分析数据`)
            }
          } catch (error) {
            console.error('数据清理错误:', error)
          }
        }, 24 * 60 * 60 * 1000) // 每24小时执行一次
      }
    },
  }
}

// 辅助函数
function parseUserAgent(userAgent: string) {
  const browser = userAgent?.includes('Chrome') ? 'Chrome' :
                 userAgent?.includes('Firefox') ? 'Firefox' :
                 userAgent?.includes('Safari') ? 'Safari' :
                 userAgent?.includes('Edge') ? 'Edge' : 'Unknown'
  
  const os = userAgent?.includes('Windows') ? 'Windows' :
            userAgent?.includes('Mac') ? 'macOS' :
            userAgent?.includes('Linux') ? 'Linux' :
            userAgent?.includes('Android') ? 'Android' :
            userAgent?.includes('iOS') ? 'iOS' : 'Unknown'
  
  const device = userAgent?.includes('Mobile') ? 'mobile' :
                userAgent?.includes('Tablet') ? 'tablet' : 'desktop'
  
  return { browser, os, device, userAgent }
}

async function getLocationFromIP(ip: string) {
  try {
    return {
      ip: ip?.replace(/\.\d+$/, '.***'),
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
    }
  } catch (error) {
    return {
      ip: 'Unknown',
      country: 'Unknown', 
      region: 'Unknown',
      city: 'Unknown',
    }
  }
}

function determineEventType(eventName: string): string {
  if (eventName.includes('page_view') || eventName.includes('visit')) return 'page_view'
  if (eventName.includes('tool_') || eventName.includes('use_')) return 'tool_usage'
  if (eventName.includes('register') || eventName.includes('signup')) return 'user_register'
  if (eventName.includes('login') || eventName.includes('signin')) return 'user_login'
  if (eventName.includes('upload')) return 'file_upload'
  if (eventName.includes('download')) return 'file_download'
  if (eventName.includes('search')) return 'search_query'
  if (eventName.includes('click')) return 'button_click'
  if (eventName.includes('submit')) return 'form_submit'
  if (eventName.includes('error')) return 'error_occurred'
  return 'custom_event'
}

function extractPageInfo(data: any) {
  return {
    url: data.url || '',
    title: data.title || '',
    referrer: data.referrer || '',
    loadTime: data.loadTime || null,
  }
}

function extractPerformanceData(data: any) {
  return {
    responseTime: data.responseTime || null,
    processingTime: data.processingTime || null,
    memoryUsage: data.memoryUsage || null,
    cpuUsage: data.cpuUsage || null,
  }
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

async function processRealTimeEvent(payload: any, event: any) {
  // 实时事件处理逻辑
  console.log(`实时事件: ${event.eventName}`)
}

function processAnalyticsData(data: any[], options: any) {
  const stats = {
    totalEvents: data.length,
    eventTypes: {},
    browsers: {},
    devices: {},
    countries: {},
    dailyStats: {},
    hourlyStats: {},
  }
  
  data.forEach(event => {
    // 事件类型统计
    stats.eventTypes[event.eventType] = (stats.eventTypes[event.eventType] || 0) + 1
    
    // 浏览器统计
    if (event.userAgent?.browser) {
      stats.browsers[event.userAgent.browser] = (stats.browsers[event.userAgent.browser] || 0) + 1
    }
    
    // 设备统计
    if (event.userAgent?.device) {
      stats.devices[event.userAgent.device] = (stats.devices[event.userAgent.device] || 0) + 1
    }
    
    // 国家统计
    if (event.location?.country) {
      stats.countries[event.location.country] = (stats.countries[event.location.country] || 0) + 1
    }
    
    // 时间统计
    const date = new Date(event.createdAt)
    const dateStr = date.toISOString().split('T')[0]
    const hourStr = `${dateStr} ${date.getHours()}:00`
    
    stats.dailyStats[dateStr] = (stats.dailyStats[dateStr] || 0) + 1
    stats.hourlyStats[hourStr] = (stats.hourlyStats[hourStr] || 0) + 1
  })
  
  return stats
}

function processRealTimeData(data: any[]) {
  return {
    recentEvents: data.slice(0, 20),
    eventCounts: data.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
      return acc
    }, {}),
    topPages: getTopPages(data),
    topTools: getTopTools(data),
  }
}

function getActiveUsers(realtimeData: any[]): number {
  const uniqueUsers = new Set()
  realtimeData.forEach(event => {
    if (event.userId) {
      uniqueUsers.add(event.userId)
    } else if (event.sessionId) {
      uniqueUsers.add(event.sessionId)
    }
  })
  return uniqueUsers.size
}

function analyzeUserBehavior(events: any[]) {
  return {
    totalEvents: events.length,
    sessionCount: new Set(events.map(e => e.sessionId)).size,
    mostUsedTools: getTopTools(events),
    activityPattern: getActivityPattern(events),
    averageSessionDuration: calculateAverageSessionDuration(events),
  }
}

function analyzeToolUsage(events: any[]) {
  const toolStats = {}
  events.forEach(event => {
    if (event.toolId) {
      toolStats[event.toolId] = (toolStats[event.toolId] || 0) + 1
    }
  })
  
  return {
    totalUsage: events.length,
    toolStats,
    topTools: Object.entries(toolStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10),
  }
}

function getTopPages(data: any[]) {
  const pageStats = {}
  data.forEach(event => {
    if (event.pageInfo?.url) {
      pageStats[event.pageInfo.url] = (pageStats[event.pageInfo.url] || 0) + 1
    }
  })
  
  return Object.entries(pageStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
}

function getTopTools(data: any[]) {
  const toolStats = {}
  data.forEach(event => {
    if (event.toolId) {
      toolStats[event.toolId] = (toolStats[event.toolId] || 0) + 1
    }
  })
  
  return Object.entries(toolStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
}

function getActivityPattern(events: any[]) {
  const hourlyActivity = {}
  events.forEach(event => {
    const hour = new Date(event.createdAt).getHours()
    hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1
  })
  
  return hourlyActivity
}

function calculateAverageSessionDuration(events: any[]) {
  const sessions = {}
  events.forEach(event => {
    if (!sessions[event.sessionId]) {
      sessions[event.sessionId] = {
        start: new Date(event.createdAt),
        end: new Date(event.createdAt),
      }
    } else {
      const eventTime = new Date(event.createdAt)
      if (eventTime < sessions[event.sessionId].start) {
        sessions[event.sessionId].start = eventTime
      }
      if (eventTime > sessions[event.sessionId].end) {
        sessions[event.sessionId].end = eventTime
      }
    }
  })
  
  const durations = Object.values(sessions).map((session: any) => 
    session.end.getTime() - session.start.getTime()
  )
  
  return durations.length > 0 
    ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length / 1000 / 60 // 分钟
    : 0
}

export default umamiEnhancedPlugin
