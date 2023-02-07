import React, { useCallback, useMemo, useState } from 'react'
import BN from 'bn.js'
import {
  Button,
  Field,
  GU,
  IconCross,
  Info,
  textStyle,
  TokenBadge,
  useTheme,
} from '@aragon/ui'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'

import { formatTokenAmount } from '@/utils/token'
import { toDecimals } from '@/utils/math-utils'
import { useAppState } from '../../../providers/TokenWrapperProvider'
import { useTokenBalanceOf } from '@/hooks/shared/useAccountTokenBalance'
import { useWallet } from '@/providers/Wallet'
import LoadingSkeleton from '@/components/Loading/LoadingSkeleton'
import { useNetwork } from '@/hooks/shared'
import { ParticipationDisclaimer } from '@/components/Disclaimers'
import AmountInput from '@/components/AmountInput'

const Convert = React.memo(function({ mode, getTransactions }) {
  const { chainId } = useNetwork()
  const { account } = useWallet()
  const theme = useTheme()
  const [amount, setAmount] = useState({
    value: '0',
    valueBN: new BN('0'),
  })
  const { wrappedToken, depositedToken } = useAppState()
  const { next } = useMultiModal()
  const isWrapMode = mode === 'wrap'
  const token = isWrapMode ? depositedToken : wrappedToken
  const [
    accountBalance,
    { loading: accountTokenBalanceLoading, error: accountTokenBalanceError },
  ] = useTokenBalanceOf(token?.id, account, chainId)
  const errorMessage = useMemo(() => {
    if (!accountBalance) {
      return null
    }

    if (amount.valueBN.eq(new BN(-1))) {
      return 'Invalid amount'
    }

    if (amount.valueBN.gt(accountBalance)) {
      return 'Insufficient balance'
    }

    return null
  }, [amount, accountBalance])
  const isButtonDisabled = amount.valueBN.eq(new BN(0)) || Boolean(errorMessage)
  const isMaxButtonVisible = !!accountBalance

  const handleEditMode = useCallback(
    editMode => {
      setAmount(amount => {
        const newValue = amount.valueBN.gte(0)
          ? formatTokenAmount(amount.valueBN, token.numDecimals, false, false, {
              commas: !editMode,
              replaceZeroBy: editMode ? '' : '0',
              rounding: token.numDecimals,
            })
          : ''

        return {
          ...amount,
          value: newValue,
        }
      })
    },
    [token.numDecimals]
  )

  // Amount change handler
  const handleAmountChange = useCallback(
    event => {
      const newAmount = event.target.value.replace(/,/g, '.').replace(/-/g, '')

      const newAmountBN = new BN(
        isNaN(event.target.value)
          ? -1
          : toDecimals(newAmount, token.numDecimals)
      )

      setAmount({
        value: newAmount,
        valueBN: newAmountBN,
      })
    },
    [token.numDecimals]
  )

  const handleMaxSelected = useCallback(() => {
    setAmount({
      valueBN: accountBalance,
      value: formatTokenAmount(
        accountBalance,
        token.numDecimals,
        false,
        false,
        { commas: false, rounding: token.numDecimals }
      ),
    })
  }, [accountBalance, token.numDecimals])

  // Form submit handler
  const handleSubmit = useCallback(
    event => {
      event.preventDefault()

      next()
      getTransactions(
        mode,
        () => {
          next()
        },
        amount.valueBN.toString(10)
      )
    },
    [mode, amount, getTransactions, next]
  )

  return (
    <form onSubmit={handleSubmit}>
      <Field
        label="amount"
        css={`
          margin-top: ${2 * GU}px;
        `}
      >
        <AmountInput
          css={`
            margin-bottom: ${1 * GU}px;
          `}
          value={amount.value}
          onChange={handleAmountChange}
          onMaxClick={handleMaxSelected}
          showMax={isMaxButtonVisible}
          onFocus={() => handleEditMode(true)}
          onBlur={() => handleEditMode(false)}
          wide
        />

        {accountTokenBalanceLoading ? (
          <LoadingSkeleton
            css={`
              width: 30%;
            `}
          />
        ) : accountTokenBalanceError ? (
          <div
            css={`
              ${textStyle('body3')};
              color: ${theme.negative};
              display: flex;
              gap: ${0.5 * GU}px;
              align-items: center;
            `}
          >
            <IconCross size="tiny" /> Your {token.symbol} balance could not be
            found.
          </div>
        ) : (
          <span
            css={`
              ${textStyle('body3')};
              color: ${theme.contentSecondary};
            `}
          >
            {'Your have '}
            <span
              css={`
                font-weight: 600;
              `}
            >
              {formatTokenAmount(accountBalance, token.numDecimals)}{' '}
              <TokenBadge address={token.address} symbol={token.symbol} />
            </span>
          </span>
        )}
      </Field>
      {isWrapMode ? (
        <React.Fragment>
          <Info
            css={`
              margin-top: ${1 * GU}px;
            `}
          >
            The amount you wrap will be available to stake and vote on
            proposals.
          </Info>
          <Info
            css={`
              margin-top: ${1 * GU}px;
            `}
          >
            You can unwrap your tokens at any time but you will lose your voting
            power. Any stake on suggestions or funding proposals will be removed
            when unwrapping.
          </Info>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Info>
            If you unwrap your tokens you will lose your voting power. Any stake
            on suggestions or funding proposals will be removed when unwrapping.
          </Info>
        </React.Fragment>
      )}
      <ParticipationDisclaimer
        css={`
          margin: ${2 * GU}px 0;
        `}
      >
        <Button
          label={isWrapMode ? 'Wrap' : 'Unwrap'}
          wide
          type="submit"
          mode="strong"
          disabled={isButtonDisabled}
        />
      </ParticipationDisclaimer>
      {errorMessage && (
        <Info
          mode="warning"
          css={`
            margin-top: ${2 * GU}px;
          `}
        >
          {errorMessage}
        </Info>
      )}
    </form>
  )
})

export default Convert
