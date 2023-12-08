import React from 'react'

import { GU, IconInfo, Info } from '@aragon/ui'
import { useFee } from '@/providers/Fee'
import { formatTokenAmount } from '@/utils/token'
import { formatTime } from '@/utils/time-utils'
import { ZERO_BN } from '@/utils/math-utils'

export default function RequiredTokensError({ ...props }) {
  const { executionDelay, feeAmount, feeToken, hasFeeTokens } = useFee()
  const formattedRequiredFeeAmount =
    feeToken && feeAmount
      ? formatTokenAmount(feeAmount, feeToken.decimals)
      : undefined
  const formattedExecutionDelay = formatTime(executionDelay, true)

  if (!feeToken || feeAmount.eq(ZERO_BN)) {
    return null
  }

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
          <strong>
            If the proposal is to be vetoed, Guardians will temporarily pause it
            to ensure the proper recovery of the funds go to your address.
          </strong>
        </>
      ) : (
        <>
          You need to have <strong>{formattedRequiredFeeAmount}</strong>{' '}
          <strong>{feeToken.symbol}</strong> in order to perform this action.
          You'll get them back once the delay period of{' '}
          <strong>{formattedExecutionDelay}</strong> is completed.{' '}
          <strong>
            If the proposal is to be vetoed, Guardians will temporarily pause it
            to ensure the proper recovery of the funds go to your address.
          </strong>
        </>
      )}
    </Info>
  )
}
