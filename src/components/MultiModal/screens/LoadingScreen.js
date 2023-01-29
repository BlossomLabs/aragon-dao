import { GU, useTheme } from '@aragon/ui'
import React from 'react'
import LoadingSpinner from '../../Loading/LoadingSpinner'

import ScreenLayout from './ScreenLayout'

export default function LoadingScreen() {
  const theme = useTheme()

  return (
    <ScreenLayout
      css={`
        padding-top: ${14 * GU}px;
        padding-bottom: ${14 * GU}px;
      `}
    >
      <LoadingSpinner
        css={`
          color: ${theme.accent};
        `}
      />
      <div
        css={`
          color: ${theme.contentSecondary};
        `}
      >
        Preparing action…
      </div>
    </ScreenLayout>
  )
}
