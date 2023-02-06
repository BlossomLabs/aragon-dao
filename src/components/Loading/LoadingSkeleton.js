import React from 'react'
import { useTheme, GU, RADIUS } from '@aragon/ui'
import { keyframes } from 'styled-components'

const load = keyframes`
  from {
      left: -150px;
  }
  to   {
      left: 100%;
  }
`
function LoadingSkeleton({ ...props }) {
  const theme = useTheme()

  return (
    <div
      css={`
        border-radius: ${RADIUS}px;
        background-color: ${theme.disabled};
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 20px;
        &:not(:last-child) {
          margin-bottom: ${1 * GU}px;
        }
        &::before {
          content: '';
          display: block;
          position: absolute;
          left: -150px;
          top: 0;
          height: 100%;
          width: 150px;
          background: linear-gradient(
            to right,
            transparent 0%,
            #e8e8e812 50%,
            transparent 100%
          );
          animation: ${load} 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}
      {...props}
    />
  )
}

export default LoadingSkeleton
