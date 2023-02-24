import { GU, IconCross, textStyle, useTheme } from '@aragon/ui'
import React from 'react'

export const ValidationError = ({ message }) => {
  const theme = useTheme()
  return (
    <div>
      <div
        css={`
          height: ${2 * GU}px;
        `}
      />
      <div
        css={`
          display: flex;
          align-items: center;
        `}
      >
        <IconCross
          size="tiny"
          css={`
            color: ${theme.negative};
            margin-right: ${1 * GU}px;
          `}
        />
        <span
          css={`
            ${textStyle('body3')}
          `}
        >
          {message}
        </span>
      </div>
    </div>
  )
}
