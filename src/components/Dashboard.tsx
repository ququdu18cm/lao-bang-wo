import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🎛️ 无头工具站 Enhanced 仪表板</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {/* 系统概览 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3>📊 系统概览</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>版本:</strong> Enhanced v2.0
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>状态:</strong> <span style={{ color: '#28a745' }}>✅ 运行正常</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>环境:</strong> {process.env.NODE_ENV || 'development'}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3>🚀 快速操作</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <a href="/admin/collections/users" style={{ color: '#007bff', textDecoration: 'none' }}>
                👥 管理用户
              </a>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <a href="/admin/collections/tools-enhanced" style={{ color: '#007bff', textDecoration: 'none' }}>
                🛠️ 管理工具
              </a>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <a href="/admin/collections/media" style={{ color: '#007bff', textDecoration: 'none' }}>
                📁 媒体管理
              </a>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <a href="/admin/globals/settings" style={{ color: '#007bff', textDecoration: 'none' }}>
                ⚙️ 系统设置
              </a>
            </div>
          </div>
        </div>

        {/* 功能特性 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3>✨ 功能特性</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '8px' }}>
              ✅ Lexical 富文本编辑器
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✅ Umami 分析增强
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✅ API 文档自动生成
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✅ 云存储支持
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✅ SEO 优化
            </div>
            <div style={{ marginBottom: '8px' }}>
              ✅ 表单构建器
            </div>
          </div>
        </div>

        {/* 外部链接 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3>🔗 外部服务</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <a href="/api-docs" target="_blank" style={{ color: '#007bff', textDecoration: 'none' }}>
                📚 API 文档
              </a>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <a href="/health" target="_blank" style={{ color: '#007bff', textDecoration: 'none' }}>
                🏥 健康检查
              </a>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <a href="/system/info" target="_blank" style={{ color: '#007bff', textDecoration: 'none' }}>
                ℹ️ 系统信息
              </a>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <a href="/analytics/stats" target="_blank" style={{ color: '#007bff', textDecoration: 'none' }}>
                📊 分析统计
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div style={{ 
        marginTop: '30px',
        background: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3>📖 使用说明</h3>
        <div style={{ marginTop: '15px' }}>
          <p><strong>欢迎使用无头工具站 Enhanced v2.0！</strong></p>
          <p>这是一个功能完整的企业级 SaaS 平台，集成了以下核心功能：</p>
          <ul>
            <li><strong>用户管理:</strong> 完整的用户认证、角色权限系统</li>
            <li><strong>工具管理:</strong> 增强的工具配置、定价、Docker 集成</li>
            <li><strong>媒体管理:</strong> 智能图片处理、分类、SEO 优化</li>
            <li><strong>分析系统:</strong> 实时数据收集、用户行为分析</li>
            <li><strong>系统设置:</strong> 全面的配置管理界面</li>
          </ul>
          <p>通过左侧导航菜单可以访问所有功能模块。</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
