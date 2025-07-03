import express from 'express'
import payload from 'payload'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { createLogger, format, transports } from 'winston'
import rateLimit from 'express-rate-limit'
import path from 'path'

// 导入配置
require('dotenv').config()

// 创建 Express 应用
const app = express()

// 创建日志记录器
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'headless-tools-cms' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

// 开发环境下添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }))
}

// 中间件配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'self'", "https:"],
    },
  },
}))

app.use(compression())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ],
  credentials: true,
}))

// 请求日志
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  skip: (req) => {
    // 跳过管理面板和健康检查的速率限制
    return req.url?.startsWith('/admin') || req.url === '/health'
  },
})

app.use(limiter)

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  })
})

// 静态文件服务
app.use('/static', express.static(path.resolve(__dirname, 'public')))

// 启动函数
const start = async (): Promise<void> => {
  try {
    // 初始化 Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
      express: app,
      onInit: async () => {
        logger.info('🎉 Payload CMS 初始化成功!')
        logger.info(`管理面板: ${payload.getAdminURL()}`)
        logger.info(`API URL: ${payload.getAPIURL()}`)
        
        // 创建默认管理员用户（仅在开发环境）
        if (process.env.NODE_ENV === 'development') {
          try {
            const existingUsers = await payload.find({
              collection: 'users',
              limit: 1,
            })

            if (existingUsers.docs.length === 0) {
              await payload.create({
                collection: 'users',
                data: {
                  email: process.env.ADMIN_EMAIL || 'admin@example.com',
                  password: process.env.ADMIN_PASSWORD || 'admin123',
                  role: 'admin',
                  firstName: 'Admin',
                  lastName: 'User',
                },
              })
              logger.info('✅ 默认管理员用户已创建')
            }
          } catch (error) {
            logger.warn('⚠️ 创建默认用户失败:', error)
          }
        }
      },
    })

    // 自定义路由
    app.get('/', (req, res) => {
      res.json({
        message: '🚀 无头工具站 CMS API',
        version: process.env.npm_package_version || '1.0.0',
        admin: payload.getAdminURL(),
        api: payload.getAPIURL(),
        docs: `${payload.getAPIURL()}/docs`,
        health: '/health',
        endpoints: {
          analytics: '/api/analytics',
          monitoring: '/api/monitoring',
          marketing: '/api/marketing',
          tools: '/api/tools',
          blog: '/api/blog-posts',
          media: '/api/media',
        },
      })
    })

    // API 文档路由
    app.get('/api-docs', (req, res) => {
      res.json({
        openapi: '3.0.0',
        info: {
          title: '无头工具站 CMS API',
          version: '1.0.0',
          description: '企业级无头CMS后端API文档',
        },
        servers: [
          {
            url: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
            description: 'API 服务器',
          },
        ],
        paths: {
          '/api/analytics/track': {
            post: {
              summary: '追踪分析事件',
              tags: ['Analytics'],
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        eventName: { type: 'string' },
                        eventData: { type: 'object' },
                        userId: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '/api/monitoring/status': {
            get: {
              summary: '获取系统状态',
              tags: ['Monitoring'],
            },
          },
          '/api/marketing/campaigns': {
            get: {
              summary: '获取营销活动列表',
              tags: ['Marketing'],
            },
          },
        },
      })
    })

    // 错误处理中间件
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', error)
      
      if (res.headersSent) {
        return next(error)
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
      })
    })

    // 404 处理
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
      })
    })

    // 启动服务器
    const port = process.env.PORT || 3000
    const server = app.listen(port, () => {
      logger.info(`🚀 服务器运行在端口 ${port}`)
      logger.info(`🌐 服务器地址: http://localhost:${port}`)
      logger.info(`📊 管理面板: http://localhost:${port}/admin`)
      logger.info(`📚 API 文档: http://localhost:${port}/api-docs`)
    })

    // 优雅关闭
    const gracefulShutdown = (signal: string) => {
      logger.info(`收到 ${signal} 信号，开始优雅关闭...`)
      
      server.close(() => {
        logger.info('HTTP 服务器已关闭')
        
        // 关闭数据库连接
        payload.db.destroy().then(() => {
          logger.info('数据库连接已关闭')
          process.exit(0)
        }).catch((error) => {
          logger.error('关闭数据库连接时出错:', error)
          process.exit(1)
        })
      })

      // 强制关闭超时
      setTimeout(() => {
        logger.error('强制关闭服务器')
        process.exit(1)
      }, 10000)
    }

    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    // 未捕获的异常处理
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    })

  } catch (error) {
    logger.error('启动服务器失败:', error)
    process.exit(1)
  }
}

// 启动应用
start()
