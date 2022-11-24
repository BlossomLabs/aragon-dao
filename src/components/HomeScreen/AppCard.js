import { Card, GU, textStyle } from '@aragon/ui'
import React from 'react'

const AppCard = ({ name, icon, onClick }) => {
  return (
    <Card
      css={`
        cursor: pointer;
      `}
      width="180px"
      height="200px"
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
            ${textStyle('body2')};
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
