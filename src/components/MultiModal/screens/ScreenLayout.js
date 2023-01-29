import { GU } from '@aragon/ui'
import React from 'react'
import { keyframes } from 'styled-components'

export default function ScreenLayout({ children, ...props }) {
  return (
    <div
      css={`
        display: flex;
        justify-content: center;
        box-sizing: border-box;
      `}
      {...props}
    >
      <div
        css={`
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: ${1 * GU}px;
          box-sizing: border-box;

          animation: ${keyframes`
            from {
              transform: scale(1.3);
            }

            to {
              transform: scale(1);
            }
          `} 0.3s ease;
        `}
      >
        {children}
      </div>
    </div>
  )
}
