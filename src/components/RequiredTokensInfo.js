import React from 'react'

import { GU, IconInfo, Info } from '@aragon/ui'
import { useFee } from '@/providers/Fee'
import { formatTokenAmount } from '@/utils/token'
import { formatTime } from '@/utils/time-utils'

export default function RequiredTokensError({ ...props }) {
  const { executionDelay, feeAmount, feeToken, hasFeeTokens } = useFee()
  const formattedRequiredFeeAmount = formatTokenAmount(
    feeAmount,
    feeToken.decimals
  )
  const formattedExecutionDelay = formatTime(executionDelay, true)

  return (
    <Info
      mode={hasFeeTokens ? 'warning' : 'error'}
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
      {hasFeeTokens ? (
        <>
          An amount of <strong>{formattedRequiredFeeAmount}</strong> of your{' '}
          <strong>{feeToken.symbol}</strong> tokens will be locked in order to
          perform this action. You'll get them back once the delay period of{' '}
          <strong>{formattedExecutionDelay}</strong> is completed.
        </>
      ) : (
        <>
          You need to have <strong>{formattedRequiredFeeAmount}</strong>{' '}
          <strong>{feeToken.symbol}</strong> in order to perform this action.
          You'll get them back once the delay period of{' '}
          <strong>{formattedExecutionDelay}</strong> is completed.
        </>
      )}
    </Info>
  )
}
