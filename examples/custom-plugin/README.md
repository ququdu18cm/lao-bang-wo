# 🔌 自定义插件开发示例

这个示例展示了如何开发一个自定义插件，集成第三方服务到无头工具站CMS中。

## 📋 示例：GitHub 集成插件

我们将创建一个GitHub集成插件，用于管理GitHub仓库和Issues。

### 1. 插件结构

```
src/plugins/github-plugin/
├── index.ts                 # 插件入口
├── collections/
│   ├── Repositories.ts      # 仓库集合
│   └── Issues.ts           # Issues集合
├── components/
│   ├── github-dashboard.tsx # GitHub仪表板
│   └── repo-stats.tsx      # 仓库统计组件
├── endpoints/
│   └── github-api.ts       # GitHub API端点
└── types.ts                # 类型定义
```

### 2. 插件入口文件

```typescript
// src/plugins/github-plugin/index.ts
import { Plugin } from 'payload/config'
import { CollectionConfig } from 'payload/types'

// 导入集合
import Repositories from './collections/Repositories'
import Issues from './collections/Issues'

// 导入端点
import githubEndpoints from './endpoints/github-api'

export interface GitHubPluginConfig {
  enabled?: boolean
  githubToken?: string
  webhookSecret?: string
}

export const GitHubPlugin = (pluginConfig: GitHubPluginConfig = {}): Plugin => {
  return (config) => {
    const { enabled = true, githubToken, webhookSecret } = pluginConfig

    if (!enabled) return config

    return {
      ...config,
      collections: [
        ...(config.collections || []),
        Repositories,
        Issues,
      ],
      admin: {
        ...config.admin,
        components: {
          ...config.admin?.components,
          views: {
            ...config.admin?.components?.views,
            GitHubDashboard: {
              Component: '@/plugins/github-plugin/components/github-dashboard',
              path: '/github',
              exact: true,
            },
          },
        },
      },
      endpoints: [
        ...(config.endpoints || []),
        ...githubEndpoints,
      ],
      globals: [
        ...(config.globals || []),
        {
          slug: 'github-settings',
          label: 'GitHub 设置',
          fields: [
            {
              name: 'githubToken',
              type: 'text',
              label: 'GitHub Token',
              admin: {
                description: '用于访问GitHub API的Personal Access Token',
              },
            },
            {
              name: 'webhookSecret',
              type: 'text',
              label: 'Webhook Secret',
              admin: {
                description: 'GitHub Webhook的密钥',
              },
            },
            {
              name: 'syncEnabled',
              type: 'checkbox',
              label: '启用自动同步',
              defaultValue: true,
            },
          ],
        },
      ],
    }
  }
}
```

### 3. 数据集合定义

```typescript
// src/plugins/github-plugin/collections/Repositories.ts
import { CollectionConfig } from 'payload/types'

const Repositories: CollectionConfig = {
  slug: 'github-repositories',
  labels: {
    singular: 'GitHub 仓库',
    plural: 'GitHub 仓库',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'owner', 'stars', 'language', 'updatedAt'],
    group: '🐙 GitHub',
  },
  fields: [
    {
      name: 'githubId',
      type: 'number',
      label: 'GitHub ID',
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      label: '仓库名称',
      required: true,
    },
    {
      name: 'fullName',
      type: 'text',
      label: '完整名称',
      required: true,
    },
    {
      name: 'owner',
      type: 'text',
      label: '所有者',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    {
      name: 'url',
      type: 'text',
      label: '仓库URL',
    },
    {
      name: 'language',
      type: 'text',
      label: '主要语言',
    },
    {
      name: 'stars',
      type: 'number',
      label: 'Star数量',
      defaultValue: 0,
    },
    {
      name: 'forks',
      type: 'number',
      label: 'Fork数量',
      defaultValue: 0,
    },
    {
      name: 'openIssues',
      type: 'number',
      label: '开放Issues',
      defaultValue: 0,
    },
    {
      name: 'isPrivate',
      type: 'checkbox',
      label: '私有仓库',
      defaultValue: false,
    },
    {
      name: 'topics',
      type: 'array',
      label: '标签',
      fields: [
        {
          name: 'topic',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'lastSyncAt',
      type: 'date',
      label: '最后同步时间',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'update') {
          data.lastSyncAt = new Date()
        }
        return data
      },
    ],
  },
  timestamps: true,
}

export default Repositories
```

### 4. API 端点

```typescript
// src/plugins/github-plugin/endpoints/github-api.ts
import { Endpoint } from 'payload/config'

const githubEndpoints: Endpoint[] = [
  // 同步仓库
  {
    path: '/github/sync-repositories',
    method: 'post',
    handler: async (req, res) => {
      try {
        const { githubToken } = req.body

        if (!githubToken) {
          return res.status(400).json({
            error: 'GitHub token is required',
          })
        }

        // 获取用户仓库
        const response = await fetch('https://api.github.com/user/repos', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch repositories')
        }

        const repositories = await response.json()
        const syncedRepos = []

        // 同步每个仓库
        for (const repo of repositories) {
          const existingRepo = await req.payload.find({
            collection: 'github-repositories',
            where: {
              githubId: {
                equals: repo.id,
              },
            },
          })

          const repoData = {
            githubId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            owner: repo.owner.login,
            description: repo.description,
            url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            openIssues: repo.open_issues_count,
            isPrivate: repo.private,
            topics: repo.topics?.map(topic => ({ topic })) || [],
            lastSyncAt: new Date(),
          }

          if (existingRepo.docs.length > 0) {
            // 更新现有仓库
            await req.payload.update({
              collection: 'github-repositories',
              id: existingRepo.docs[0].id,
              data: repoData,
            })
          } else {
            // 创建新仓库
            await req.payload.create({
              collection: 'github-repositories',
              data: repoData,
            })
          }

          syncedRepos.push(repoData)
        }

        res.json({
          success: true,
          message: `Synced ${syncedRepos.length} repositories`,
          repositories: syncedRepos,
        })
      } catch (error) {
        console.error('GitHub sync error:', error)
        res.status(500).json({
          error: 'Failed to sync repositories',
          message: error.message,
        })
      }
    },
  },

  // 获取仓库统计
  {
    path: '/github/stats',
    method: 'get',
    handler: async (req, res) => {
      try {
        const repositories = await req.payload.find({
          collection: 'github-repositories',
          limit: 0,
        })

        const stats = {
          totalRepositories: repositories.totalDocs,
          totalStars: repositories.docs.reduce((sum, repo) => sum + (repo.stars || 0), 0),
          totalForks: repositories.docs.reduce((sum, repo) => sum + (repo.forks || 0), 0),
          languages: repositories.docs.reduce((acc, repo) => {
            if (repo.language) {
              acc[repo.language] = (acc[repo.language] || 0) + 1
            }
            return acc
          }, {}),
          privateRepos: repositories.docs.filter(repo => repo.isPrivate).length,
          publicRepos: repositories.docs.filter(repo => !repo.isPrivate).length,
        }

        res.json({
          success: true,
          stats,
        })
      } catch (error) {
        console.error('GitHub stats error:', error)
        res.status(500).json({
          error: 'Failed to get GitHub stats',
        })
      }
    },
  },

  // GitHub Webhook 处理
  {
    path: '/github/webhook',
    method: 'post',
    handler: async (req, res) => {
      try {
        const event = req.headers['x-github-event']
        const payload = req.body

        console.log(`Received GitHub webhook: ${event}`)

        // 处理不同类型的事件
        switch (event) {
          case 'push':
            // 处理推送事件
            console.log(`Push to ${payload.repository.full_name}`)
            break

          case 'issues':
            // 处理Issues事件
            console.log(`Issue ${payload.action} in ${payload.repository.full_name}`)
            break

          case 'star':
            // 处理Star事件
            console.log(`Repository ${payload.repository.full_name} was starred`)
            break

          default:
            console.log(`Unhandled event: ${event}`)
        }

        res.json({ success: true })
      } catch (error) {
        console.error('Webhook error:', error)
        res.status(500).json({
          error: 'Webhook processing failed',
        })
      }
    },
  },
]

export default githubEndpoints
```

### 5. React 组件

```typescript
// src/plugins/github-plugin/components/github-dashboard.tsx
import React, { useState, useEffect } from 'react'

interface GitHubStats {
  totalRepositories: number
  totalStars: number
  totalForks: number
  languages: Record<string, number>
  privateRepos: number
  publicRepos: number
}

const GitHubDashboard: React.FC = () => {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/github/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch GitHub stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncRepositories = async () => {
    setSyncing(true)
    try {
      const token = prompt('请输入GitHub Personal Access Token:')
      if (!token) return

      const response = await fetch('/api/github/sync-repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubToken: token }),
      })

      const data = await response.json()
      if (data.success) {
        alert(`成功同步 ${data.repositories.length} 个仓库`)
        fetchStats() // 重新获取统计数据
      } else {
        alert(`同步失败: ${data.error}`)
      }
    } catch (error) {
      alert(`同步失败: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return <div className="loading">加载中...</div>
  }

  return (
    <div className="github-dashboard">
      <div className="dashboard-header">
        <h1>🐙 GitHub 仪表板</h1>
        <button 
          onClick={syncRepositories} 
          disabled={syncing}
          className="sync-button"
        >
          {syncing ? '同步中...' : '同步仓库'}
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>总仓库数</h3>
            <div className="stat-value">{stats.totalRepositories}</div>
          </div>

          <div className="stat-card">
            <h3>总 Star 数</h3>
            <div className="stat-value">{stats.totalStars}</div>
          </div>

          <div className="stat-card">
            <h3>总 Fork 数</h3>
            <div className="stat-value">{stats.totalForks}</div>
          </div>

          <div className="stat-card">
            <h3>公开/私有</h3>
            <div className="stat-value">
              {stats.publicRepos} / {stats.privateRepos}
            </div>
          </div>
        </div>
      )}

      {stats && Object.keys(stats.languages).length > 0 && (
        <div className="languages-section">
          <h3>编程语言分布</h3>
          <div className="languages-list">
            {Object.entries(stats.languages)
              .sort(([,a], [,b]) => b - a)
              .map(([language, count]) => (
                <div key={language} className="language-item">
                  <span className="language-name">{language}</span>
                  <span className="language-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GitHubDashboard
```

## 🔧 使用插件

### 1. 在主配置中启用插件

```typescript
// payload.config.ts
import { GitHubPlugin } from './src/plugins/github-plugin'

export default buildConfig({
  // ... 其他配置
  plugins: [
    GitHubPlugin({
      enabled: true,
      githubToken: process.env.GITHUB_TOKEN,
      webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    }),
  ],
})
```

### 2. 环境变量配置

```bash
# .env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### 3. 访问插件功能

- **GitHub 仪表板**: http://localhost:3000/admin/github
- **仓库管理**: http://localhost:3000/admin/collections/github-repositories
- **同步API**: POST /api/github/sync-repositories

## 📚 插件开发最佳实践

1. **模块化设计**: 将功能拆分为独立的模块
2. **类型安全**: 使用 TypeScript 定义清晰的类型
3. **错误处理**: 完善的错误处理和用户反馈
4. **配置灵活**: 提供丰富的配置选项
5. **文档完善**: 详细的使用说明和示例代码

## 🐛 调试技巧

1. **日志记录**: 使用 console.log 记录关键信息
2. **错误捕获**: 使用 try-catch 捕获和处理错误
3. **API测试**: 使用 Postman 或 curl 测试API端点
4. **React DevTools**: 使用浏览器开发工具调试组件
