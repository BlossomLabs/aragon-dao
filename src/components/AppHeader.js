import { GU, Header, useViewport } from '@aragon/ui'
import React from 'react'

export default function AppHeader({ primary, secondary }) {
  const { below } = useViewport()
  const compactMode = below('medium')

  return (
    <div
      css={`
        ${compactMode &&
          `
         padding: 0 ${2 * GU}px;
        `}
      `}
    >
      <Header primary={primary} secondary={secondary} />
    </div>
  )
}
