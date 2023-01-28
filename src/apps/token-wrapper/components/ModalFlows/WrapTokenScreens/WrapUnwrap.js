import React, { useCallback, useMemo, useState } from 'react'
import BN from 'bn.js'
import {
  ButtonBase,
  Field,
  GU,
  Info,
  TextInput,
  textStyle,
  useTheme,
} from '@aragon/ui'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'

import { toDecimals } from '../../../utils'
import { formatTokenAmount } from '../../../utils/token-utils'
import { useAppState } from '../../../providers/TokenWrapperProvider'
import LoadingButton from '@/components/LoadingButton'
import { useLoadingButtonInside } from '@/components/LoadingButton/LoadingButtonInside'

const LOADING_BUTTON_ID = 'wrap-unwrap'

const WrapUnwrap = React.memo(function WrapUnwrap({ mode, getTransactions }) {
  const theme = useTheme()
  const { setCurrentLoadingButton } = useLoadingButtonInside()
  const [amount, setAmount] = useState({
    value: '0',
    valueBN: new BN('0'),
  })

  const { wrappedToken, depositedToken } = useAppState()
  const { next } = useMultiModal()

  const wrapMode = mode === 'wrap'

  const formTokenValues = useMemo(() => {
    return wrapMode
      ? {
          token: depositedToken,
          accountBalance: depositedToken.accountBalance,
        }
      : { token: wrappedToken, accountBalance: wrappedToken.accountBalance }
  }, [depositedToken, wrapMode, wrappedToken])

  const handleEditMode = useCallback(
    editMode => {
      setAmount(amount => {
        const newValue = amount.valueBN.gte(0)
          ? formatTokenAmount(
              amount.valueBN,
              formTokenValues.token.numDecimals,
              false,
              false,
              {
                commas: !editMode,
                replaceZeroBy: editMode ? '' : '0',
                rounding: formTokenValues.token.numDecimals,
              }
            )
          : ''

        return {
          ...amount,
          value: newValue,
        }
      })
    },
    [formTokenValues.token]
  )

  // Amount change handler
  const handleAmountChange = useCallback(
    event => {
      const newAmount = event.target.value.replace(/,/g, '.').replace(/-/g, '')

      const newAmountBN = new BN(
        isNaN(event.target.value)
          ? -1
          : toDecimals(newAmount, formTokenValues.token.numDecimals)
      )

      setAmount({
        value: newAmount,
        valueBN: newAmountBN,
      })
    },
    [formTokenValues.token]
  )

  const handleMaxSelected = useCallback(() => {
    setAmount({
      valueBN: formTokenValues.accountBalance,
      value: formatTokenAmount(
        formTokenValues.accountBalance,
        formTokenValues.token.numDecimals,
        false,
        false,
        { commas: false, rounding: formTokenValues.token.numDecimals }
      ),
    })
  }, [formTokenValues])

  // Form submit handler
  const handleSubmit = useCallback(
    event => {
      event.preventDefault()
      setCurrentLoadingButton(LOADING_BUTTON_ID)

      getTransactions(() => {
        next()
      }, amount.valueBN.toString(10))
    },
    [amount, getTransactions, next, setCurrentLoadingButton]
  )

  const errorMessage = useMemo(() => {
    if (amount.valueBN.eq(new BN(-1))) {
      return 'Invalid amount'
    }

    if (amount.valueBN.gt(formTokenValues.accountBalance)) {
      return 'Insufficient balance'
    }

    return null
  }, [amount, formTokenValues])

  return (
    <form onSubmit={handleSubmit}>
      <span
        css={`
          ${textStyle('body2')};
        `}
      >
        {wrapMode
          ? 'The amount you wrap will be available to stake and vote on proposals'
          : 'If you unwrap your tokens you will lose your voting power. Any stake on suggestions or funding proposals will be removed when unwrapping.'}
      </span>
      <Field
        label="amount"
        css={`
          margin-top: ${2 * GU}px;
        `}
      >
        <TextInput
          value={amount.value}
          onChange={handleAmountChange}
          onFocus={() => handleEditMode(true)}
          onBlur={() => handleEditMode(false)}
          wide
          adornment={
            <ButtonBase
              css={`
                margin-right: ${1 * GU}px;
                color: ${theme.accent};
              `}
              onClick={handleMaxSelected}
            >
              MAX
            </ButtonBase>
          }
          adornmentPosition="end"
        />
        <span
          css={`
            ${textStyle('body3')};
            color: ${theme.contentSecondary};
          `}
        >
          {'Your account balance has '}
          <span
            css={`
              font-weight: 600;
            `}
          >
            {formatTokenAmount(
              depositedToken.accountBalance,
              depositedToken.numDecimals
            )}{' '}
            {depositedToken.symbol}
          </span>
          {' and '}
          <span
            css={`
              font-weight: 600;
            `}
          >
            {formatTokenAmount(
              wrappedToken.accountBalance,
              wrappedToken.numDecimals
            )}{' '}
            {wrappedToken.symbol}
          </span>
        </span>
      </Field>

      {wrapMode && (
        <Info
          css={`
            margin-top: ${2 * GU}px;
          `}
        >
          You can unwrap your tokens at any time but you will lose your voting
          power. Any stake on suggestions or funding proposals will be removed
          when unwrapping.
        </Info>
      )}

      <LoadingButton
        id={LOADING_BUTTON_ID}
        label={wrapMode ? 'Wrap' : 'Unwrap'}
        wide
        type="submit"
        mode="strong"
        disabled={amount.valueBN.eq(new BN(0)) || Boolean(errorMessage)}
        css={`
          margin-top: ${2 * GU}px;
        `}
      />
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

export default WrapUnwrap
