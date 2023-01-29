import { GU, IconWarning, textStyle, useTheme } from '@aragon/ui'
import React from 'react'

import ScreenLayout from './ScreenLayout'

export default function ErrorScreen() {
  const theme = useTheme()

  return (
    <ScreenLayout
      css={`
        padding-top: ${10 * GU}px;
        padding-bottom: ${10 * GU}px;
      `}
    >
      <IconWarning color={theme.error} width="100px" height="100px" />
      <div
        css={`
          margin-top: ${-2 * GU}px;
          color: ${theme.error};
          ${textStyle('title3')};
        `}
      >
        Action Impossible
      </div>
      <div
        css={`
          color: ${theme.content};
          text-align: 'center';
        `}
      >
        The action failed to execute. You may not have the required permissions.
      </div>
    </ScreenLayout>
  )
}
