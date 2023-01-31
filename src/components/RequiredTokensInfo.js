import React from 'react'

import { GU, IconInfo, Info } from '@aragon/ui'

function RequiredTokensInfo({ ...props }) {
  return (
    <Info
      mode="error"
      title={
        <div
          css={`
            display: flex;
            justify-content: center;
            align-items: center;
            gap: ${0.5 * GU}px;
          `}
        >
          <IconInfo />
          <div>Required tokens</div>
        </div>
      }
      {...props}
    >
      You need to have <strong>ANT</strong> in order to perform this action.
    </Info>
  )
}

export default RequiredTokensInfo
