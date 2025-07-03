import React from 'react'

const Logo: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      fontSize: '18px', 
      fontWeight: 'bold',
      color: '#333'
    }}>
      <span style={{ fontSize: '24px', marginRight: '8px' }}>🚀</span>
      <span>无头工具站 Enhanced</span>
    </div>
  )
}

export default Logo
