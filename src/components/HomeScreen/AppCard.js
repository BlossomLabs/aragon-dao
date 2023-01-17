import { Card, GU, textStyle, useViewport } from '@aragon/ui'
import React from 'react'

const AppCard = ({ name, icon, onClick }) => {
  const { below } = useViewport()
  const compactMode = below('large')

  return (
    <Card
      css={`
        cursor: pointer;
      `}
      height="220px"
      width={!compactMode ? '220px' : undefined}
      onClick={onClick}
    >
      <div
        css={`
          display: flex;
          gap: ${4 * GU}px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `}
      >
        {icon}
        <div
          title={name}
          css={`
            ${textStyle('title4')};
            max-width: ${17 * GU}px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          `}
        >
          {name}
        </div>
      </div>
    </Card>
  )
}

export default AppCard
