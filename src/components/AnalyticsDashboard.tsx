import React, { useState, useEffect } from 'react'

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setStats({
        totalEvents: 1234,
        activeUsers: 56,
        topPages: [
          { url: '/tools/background-remover', views: 234 },
          { url: '/tools/image-upscaler', views: 189 },
          { url: '/dashboard', views: 156 },
        ],
        eventTypes: {
          page_view: 567,
          tool_usage: 234,
          user_login: 123,
          button_click: 89,
        }
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>📊 分析仪表板</h1>
        <p>正在加载数据...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 分析仪表板</h1>
      
      {/* 概览统计 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{ 
          background: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>总事件数</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#1976d2' }}>
            {stats.totalEvents.toLocaleString()}
          </div>
        </div>

        <div style={{ 
          background: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>活跃用户</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#388e3c' }}>
            {stats.activeUsers}
          </div>
        </div>

        <div style={{ 
          background: '#fff3e0', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>页面浏览</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#f57c00' }}>
            {stats.eventTypes.page_view}
          </div>
        </div>

        <div style={{ 
          background: '#fce4ec', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c2185b' }}>工具使用</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#c2185b' }}>
            {stats.eventTypes.tool_usage}
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px',
        marginTop: '30px'
      }}>
        {/* 热门页面 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3>🔥 热门页面</h3>
          <div style={{ marginTop: '15px' }}>
            {stats.topPages.map((page: any, index: number) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: index < stats.topPages.length - 1 ? '1px solid #e9ecef' : 'none'
              }}>
                <span style={{ color: '#495057' }}>{page.url}</span>
                <span style={{ fontWeight: 'bold', color: '#007bff' }}>{page.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 事件类型分布 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3>📈 事件类型分布</h3>
          <div style={{ marginTop: '15px' }}>
            {Object.entries(stats.eventTypes).map(([type, count]: [string, any]) => (
              <div key={type} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #e9ecef'
              }}>
                <span style={{ color: '#495057' }}>
                  {type === 'page_view' ? '📄 页面浏览' :
                   type === 'tool_usage' ? '🛠️ 工具使用' :
                   type === 'user_login' ? '👤 用户登录' :
                   type === 'button_click' ? '🖱️ 按钮点击' : type}
                </span>
                <span style={{ fontWeight: 'bold', color: '#007bff' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 实时数据 */}
      <div style={{ 
        marginTop: '30px',
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3>⚡ 实时数据</h3>
        <div style={{ marginTop: '15px' }}>
          <p><strong>当前时间:</strong> {new Date().toLocaleString()}</p>
          <p><strong>在线用户:</strong> {stats.activeUsers} 人</p>
          <p><strong>最近5分钟事件:</strong> 23 个</p>
          <p><strong>系统状态:</strong> <span style={{ color: '#28a745' }}>✅ 正常运行</span></p>
        </div>
      </div>

      {/* API 端点 */}
      <div style={{ 
        marginTop: '30px',
        background: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3>🔗 分析 API 端点</h3>
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>事件追踪:</strong> 
            <code style={{ marginLeft: '10px', padding: '2px 6px', background: '#f1f3f4', borderRadius: '4px' }}>
              POST /analytics/track
            </code>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>统计数据:</strong> 
            <code style={{ marginLeft: '10px', padding: '2px 6px', background: '#f1f3f4', borderRadius: '4px' }}>
              GET /analytics/stats
            </code>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>实时数据:</strong> 
            <code style={{ marginLeft: '10px', padding: '2px 6px', background: '#f1f3f4', borderRadius: '4px' }}>
              GET /analytics/realtime
            </code>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>用户行为:</strong> 
            <code style={{ marginLeft: '10px', padding: '2px 6px', background: '#f1f3f4', borderRadius: '4px' }}>
              GET /analytics/user-behavior/:userId
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
