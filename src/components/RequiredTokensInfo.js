import React from 'react'

import { GU, IconInfo, Info } from '@aragon/ui'
import { formatTokenAmount } from '@/utils/token'
import { formatTime } from '@/utils/time-utils'
import { ZERO_BN } from '@/utils/math-utils'

export default function({ feeForwarder, tokenBalance, ...props }) {
  const { feeToken, feeAmount, executionDelay } = feeForwarder
  const formattedRequiredFeeAmount =
    feeToken && feeAmount
      ? formatTokenAmount(feeAmount, feeToken.decimals)
      : undefined
  const formattedBalance =
    feeToken && tokenBalance
      ? formatTokenAmount(tokenBalance, feeToken.decimals)
      : undefined
  const formattedExecutionDelay = executionDelay
    ? formatTime(executionDelay, true)
    : undefined

  if (feeAmount.eq(ZERO_BN)) {
    return null
  }

  const hasFeeTokens = !!tokenBalance && tokenBalance.gte(feeAmount)

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
      <>
        A deposit of <strong>{formattedRequiredFeeAmount}</strong>{' '}
        <strong>{feeToken.symbol}</strong> is required in order to perform this
        action. You currently have{' '}
        <strong>
          {formattedBalance} {feeToken.symbol}
        </strong>{' '}
        in your account.
        <br />
        {formattedExecutionDelay && (
          <span>
            You'll get the deposit back once the delay period of{' '}
            <strong>{formattedExecutionDelay}</strong> is completed.{' '}
            <strong>
              If the proposal is to be vetoed, Guardians will temporarily pause
              it to ensure the proper recovery of the funds go to your address.
            </strong>
            <br />
          </span>
        )}
      </>
    </Info>
  )
}
