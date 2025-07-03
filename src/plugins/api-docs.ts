import { Plugin } from 'payload/config'
import { Request, Response } from 'express'

interface ApiDocsConfig {
  enabled?: boolean
  path?: string
  title?: string
  version?: string
  description?: string
  contact?: {
    name?: string
    email?: string
    url?: string
  }
  license?: {
    name?: string
    url?: string
  }
}

const apiDocsPlugin = (config: ApiDocsConfig = {}): Plugin => {
  const {
    enabled = true,
    path = '/api-docs',
    title = '无头工具站 API',
    version = '1.0.0',
    description = '企业级 SaaS 平台 API 文档',
    contact = {
      name: '无头工具站开发团队',
      email: 'dev@headless-tools.com',
      url: 'https://github.com/headless-tools'
    },
    license = {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  } = config

  return {
    name: 'api-docs-generator',
    init: (payload) => {
      if (!enabled) {
        console.log('📚 API 文档生成器已禁用')
        return
      }

      console.log('📚 API 文档生成器已初始化')

      // 生成 OpenAPI 规范
      payload.router.get(`${path}/openapi.json`, async (req: Request, res: Response) => {
        try {
          const openApiSpec = await generateOpenApiSpec(payload, {
            title,
            version,
            description,
            contact,
            license,
            serverUrl: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
          })

          res.json(openApiSpec)
        } catch (error) {
          console.error('OpenAPI 生成错误:', error)
          res.status(500).json({
            error: 'OpenAPI 规范生成失败'
          })
        }
      })

      // Swagger UI 页面
      payload.router.get(path, (req: Request, res: Response) => {
        const swaggerHtml = generateSwaggerUI(`${path}/openapi.json`, title)
        res.send(swaggerHtml)
      })

      // API 端点列表
      payload.router.get(`${path}/endpoints`, async (req: Request, res: Response) => {
        try {
          const endpoints = await generateEndpointsList(payload)
          res.json({
            success: true,
            data: endpoints,
            total: endpoints.length
          })
        } catch (error) {
          console.error('端点列表生成错误:', error)
          res.status(500).json({
            error: '端点列表生成失败'
          })
        }
      })

      // 集合文档
      payload.router.get(`${path}/collections`, async (req: Request, res: Response) => {
        try {
          const collections = await generateCollectionsDocs(payload)
          res.json({
            success: true,
            data: collections
          })
        } catch (error) {
          console.error('集合文档生成错误:', error)
          res.status(500).json({
            error: '集合文档生成失败'
          })
        }
      })

      // 全局配置文档
      payload.router.get(`${path}/globals`, async (req: Request, res: Response) => {
        try {
          const globals = await generateGlobalsDocs(payload)
          res.json({
            success: true,
            data: globals
          })
        } catch (error) {
          console.error('全局配置文档生成错误:', error)
          res.status(500).json({
            error: '全局配置文档生成失败'
          })
        }
      })

      // Postman 集合导出
      payload.router.get(`${path}/postman`, async (req: Request, res: Response) => {
        try {
          const postmanCollection = await generatePostmanCollection(payload, {
            name: title,
            description,
            version,
            baseUrl: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
          })

          res.json(postmanCollection)
        } catch (error) {
          console.error('Postman 集合生成错误:', error)
          res.status(500).json({
            error: 'Postman 集合生成失败'
          })
        }
      })
    }
  }
}

// 生成 OpenAPI 规范
async function generateOpenApiSpec(payload: any, config: any) {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: config.title,
      version: config.version,
      description: config.description,
      contact: config.contact,
      license: config.license
    },
    servers: [
      {
        url: config.serverUrl,
        description: '主服务器'
      }
    ],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  }

  // 生成集合路径
  for (const collection of payload.config.collections) {
    const collectionPaths = generateCollectionPaths(collection)
    Object.assign(spec.paths, collectionPaths)
    
    const collectionSchema = generateCollectionSchema(collection)
    spec.components.schemas[collection.slug] = collectionSchema
  }

  // 生成全局配置路径
  for (const global of payload.config.globals || []) {
    const globalPaths = generateGlobalPaths(global)
    Object.assign(spec.paths, globalPaths)
    
    const globalSchema = generateGlobalSchema(global)
    spec.components.schemas[global.slug] = globalSchema
  }

  // 添加自定义端点
  const customPaths = generateCustomPaths()
  Object.assign(spec.paths, customPaths)

  return spec
}

// 生成集合路径
function generateCollectionPaths(collection: any) {
  const paths = {}
  const basePath = `/api/${collection.slug}`

  // GET /api/{collection} - 获取列表
  paths[basePath] = {
    get: {
      tags: [collection.slug],
      summary: `获取${collection.labels?.plural || collection.slug}列表`,
      parameters: [
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 10 }
        },
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1 }
        },
        {
          name: 'sort',
          in: 'query',
          schema: { type: 'string' }
        },
        {
          name: 'where',
          in: 'query',
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: '成功',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  docs: {
                    type: 'array',
                    items: { $ref: `#/components/schemas/${collection.slug}` }
                  },
                  totalDocs: { type: 'integer' },
                  limit: { type: 'integer' },
                  page: { type: 'integer' },
                  totalPages: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    }
  }

  // POST /api/{collection} - 创建
  if (collection.access?.create !== false) {
    paths[basePath].post = {
      tags: [collection.slug],
      summary: `创建${collection.labels?.singular || collection.slug}`,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${collection.slug}` }
          }
        }
      },
      responses: {
        201: {
          description: '创建成功',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${collection.slug}` }
            }
          }
        }
      }
    }
  }

  // GET /api/{collection}/{id} - 获取单个
  paths[`${basePath}/{id}`] = {
    get: {
      tags: [collection.slug],
      summary: `获取单个${collection.labels?.singular || collection.slug}`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: '成功',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${collection.slug}` }
            }
          }
        }
      }
    }
  }

  // PUT /api/{collection}/{id} - 更新
  if (collection.access?.update !== false) {
    paths[`${basePath}/{id}`].put = {
      tags: [collection.slug],
      summary: `更新${collection.labels?.singular || collection.slug}`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${collection.slug}` }
          }
        }
      },
      responses: {
        200: {
          description: '更新成功',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${collection.slug}` }
            }
          }
        }
      }
    }
  }

  // DELETE /api/{collection}/{id} - 删除
  if (collection.access?.delete !== false) {
    paths[`${basePath}/{id}`].delete = {
      tags: [collection.slug],
      summary: `删除${collection.labels?.singular || collection.slug}`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: {
          description: '删除成功'
        }
      }
    }
  }

  return paths
}

// 生成集合模式
function generateCollectionSchema(collection: any) {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: []
  }

  // 处理字段
  for (const field of collection.fields) {
    const fieldSchema = generateFieldSchema(field)
    if (fieldSchema) {
      schema.properties[field.name] = fieldSchema
      if (field.required) {
        schema.required.push(field.name)
      }
    }
  }

  return schema
}

// 生成字段模式
function generateFieldSchema(field: any) {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
      return { type: 'string' }
    case 'number':
      return { type: 'number' }
    case 'checkbox':
      return { type: 'boolean' }
    case 'date':
      return { type: 'string', format: 'date-time' }
    case 'select':
      return {
        type: 'string',
        enum: field.options?.map(opt => opt.value) || []
      }
    case 'array':
      return {
        type: 'array',
        items: field.fields ? {
          type: 'object',
          properties: field.fields.reduce((props, subField) => {
            props[subField.name] = generateFieldSchema(subField)
            return props
          }, {})
        } : { type: 'string' }
      }
    case 'group':
      return {
        type: 'object',
        properties: field.fields.reduce((props, subField) => {
          props[subField.name] = generateFieldSchema(subField)
          return props
        }, {})
      }
    case 'relationship':
      return { type: 'string' }
    case 'upload':
      return { type: 'string' }
    case 'richText':
      return { type: 'object' }
    case 'json':
      return { type: 'object' }
    default:
      return { type: 'string' }
  }
}

// 生成全局配置路径
function generateGlobalPaths(global: any) {
  const paths = {}
  const basePath = `/api/globals/${global.slug}`

  paths[basePath] = {
    get: {
      tags: ['globals'],
      summary: `获取${global.label || global.slug}配置`,
      responses: {
        200: {
          description: '成功',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${global.slug}` }
            }
          }
        }
      }
    }
  }

  if (global.access?.update !== false) {
    paths[basePath].post = {
      tags: ['globals'],
      summary: `更新${global.label || global.slug}配置`,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/${global.slug}` }
          }
        }
      },
      responses: {
        200: {
          description: '更新成功',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${global.slug}` }
            }
          }
        }
      }
    }
  }

  return paths
}

// 生成全局配置模式
function generateGlobalSchema(global: any) {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  }

  for (const field of global.fields) {
    const fieldSchema = generateFieldSchema(field)
    if (fieldSchema) {
      schema.properties[field.name] = fieldSchema
    }
  }

  return schema
}

// 生成自定义路径
function generateCustomPaths() {
  return {
    '/analytics/track': {
      post: {
        tags: ['analytics'],
        summary: '追踪分析事件',
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
                  toolId: { type: 'string' }
                },
                required: ['eventName']
              }
            }
          }
        },
        responses: {
          200: {
            description: '追踪成功'
          }
        }
      }
    },
    '/analytics/stats': {
      get: {
        tags: ['analytics'],
        summary: '获取分析统计',
        parameters: [
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' }
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' }
          }
        ],
        responses: {
          200: {
            description: '统计数据'
          }
        }
      }
    }
  }
}

// 生成 Swagger UI HTML
function generateSwaggerUI(specUrl: string, title: string) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title} - API 文档</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `
}

// 生成端点列表
async function generateEndpointsList(payload: any) {
  const endpoints = []

  // 集合端点
  for (const collection of payload.config.collections) {
    const basePath = `/api/${collection.slug}`
    
    endpoints.push({
      method: 'GET',
      path: basePath,
      description: `获取${collection.labels?.plural || collection.slug}列表`,
      collection: collection.slug
    })

    if (collection.access?.create !== false) {
      endpoints.push({
        method: 'POST',
        path: basePath,
        description: `创建${collection.labels?.singular || collection.slug}`,
        collection: collection.slug
      })
    }

    endpoints.push({
      method: 'GET',
      path: `${basePath}/{id}`,
      description: `获取单个${collection.labels?.singular || collection.slug}`,
      collection: collection.slug
    })

    if (collection.access?.update !== false) {
      endpoints.push({
        method: 'PUT',
        path: `${basePath}/{id}`,
        description: `更新${collection.labels?.singular || collection.slug}`,
        collection: collection.slug
      })
    }

    if (collection.access?.delete !== false) {
      endpoints.push({
        method: 'DELETE',
        path: `${basePath}/{id}`,
        description: `删除${collection.labels?.singular || collection.slug}`,
        collection: collection.slug
      })
    }
  }

  // 全局配置端点
  for (const global of payload.config.globals || []) {
    const basePath = `/api/globals/${global.slug}`
    
    endpoints.push({
      method: 'GET',
      path: basePath,
      description: `获取${global.label || global.slug}配置`,
      type: 'global'
    })

    if (global.access?.update !== false) {
      endpoints.push({
        method: 'POST',
        path: basePath,
        description: `更新${global.label || global.slug}配置`,
        type: 'global'
      })
    }
  }

  // 自定义端点
  endpoints.push(
    {
      method: 'POST',
      path: '/analytics/track',
      description: '追踪分析事件',
      type: 'custom'
    },
    {
      method: 'GET',
      path: '/analytics/stats',
      description: '获取分析统计',
      type: 'custom'
    },
    {
      method: 'GET',
      path: '/analytics/realtime',
      description: '获取实时数据',
      type: 'custom'
    }
  )

  return endpoints
}

// 生成集合文档
async function generateCollectionsDocs(payload: any) {
  return payload.config.collections.map(collection => ({
    slug: collection.slug,
    labels: collection.labels,
    fields: collection.fields.map(field => ({
      name: field.name,
      type: field.type,
      label: field.label,
      required: field.required,
      description: field.admin?.description
    })),
    access: collection.access,
    admin: collection.admin
  }))
}

// 生成全局配置文档
async function generateGlobalsDocs(payload: any) {
  return (payload.config.globals || []).map(global => ({
    slug: global.slug,
    label: global.label,
    fields: global.fields.map(field => ({
      name: field.name,
      type: field.type,
      label: field.label,
      required: field.required,
      description: field.admin?.description
    })),
    access: global.access,
    admin: global.admin
  }))
}

// 生成 Postman 集合
async function generatePostmanCollection(payload: any, config: any) {
  const collection = {
    info: {
      name: config.name,
      description: config.description,
      version: config.version,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{authToken}}',
          type: 'string'
        }
      ]
    },
    variable: [
      {
        key: 'baseUrl',
        value: config.baseUrl,
        type: 'string'
      },
      {
        key: 'authToken',
        value: '',
        type: 'string'
      }
    ],
    item: []
  }

  // 添加集合请求
  for (const coll of payload.config.collections) {
    const folder = {
      name: coll.labels?.plural || coll.slug,
      item: []
    }

    // GET 列表
    folder.item.push({
      name: `获取${coll.labels?.plural || coll.slug}列表`,
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `{{baseUrl}}/api/${coll.slug}`,
          host: ['{{baseUrl}}'],
          path: ['api', coll.slug]
        }
      }
    })

    // POST 创建
    if (coll.access?.create !== false) {
      folder.item.push({
        name: `创建${coll.labels?.singular || coll.slug}`,
        request: {
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({}, null, 2)
          },
          url: {
            raw: `{{baseUrl}}/api/${coll.slug}`,
            host: ['{{baseUrl}}'],
            path: ['api', coll.slug]
          }
        }
      })
    }

    collection.item.push(folder)
  }

  return collection
}

export default apiDocsPlugin
