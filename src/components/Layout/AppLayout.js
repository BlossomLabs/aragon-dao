import { GU, useViewport } from '@aragon/ui'
import React from 'react'

function AppLayout({ children }) {
  const { below } = useViewport()
  const compactMode = below('medium')

  return (
    <div
      css={`
        padding-bottom: ${compactMode ? 14 * GU : 0}px;
      `}
    >
      {children}
    </div>
  )
}

export default AppLayout
