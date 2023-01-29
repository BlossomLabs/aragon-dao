import React from 'react'
import { GU } from '@aragon/ui'

import { MAIN_HEADER_HEIGHT } from '@/constants'
import EmptyAppStateCard from './EmptyAppStateCard'

function LoadingAppScreen({ ...props }) {
  return (
    <div
      css={`
        height: calc(100vh - ${MAIN_HEADER_HEIGHT + 1.5 * GU}px);
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <EmptyAppStateCard {...props} />
    </div>
  )
}

export default LoadingAppScreen
