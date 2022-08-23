import React, { useCallback, useState } from 'react'
import {
  Button,
  Field,
  GU,
  Info,
  LoadingRing,
  TextInput,
  textStyle,
} from '@aragon/ui'
import { useAppState } from '../../../providers/VotingProvider'
import { useTokenBalances } from '../../../../hooks/shared/useAccountTokenBalance'
import { useMultiModal } from '../../../../components/MultiModal/MultiModalProvider'
import { useWallet } from '../../../../providers/Wallet'
import { formatTokenAmount } from '../../../token-utils'

function DelegateVotingPower({ onCreateTransaction }) {
  const [delegateAccount, setDelegateAccount] = useState()
  const { account } = useWallet()
  const { next } = useMultiModal()
  const { tokenAddress, tokenDecimals, tokenSymbol } = useAppState()

  const [{ balance }, loadingBalance] = useTokenBalances(account, tokenAddress)

  const handleDelegateAccountChange = useCallback(event => {
    const updatedDelegateAccount = event.target.value
    setDelegateAccount(updatedDelegateAccount)
  }, [])

  const handleOnDelegatevotingPower = useCallback(() => {
    onCreateTransaction(delegateAccount, () => {
      next()
    })
  }, [onCreateTransaction, delegateAccount, next])

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        ${textStyle('body2')};
      `}
    >
      Allow another account to vote on your behalf.
      <Field
        css={`
          margin-top: ${3 * GU}px;
        `}
        label="Voting power (with enabled account)"
      >
        {loadingBalance ? (
          <LoadingRing />
        ) : (
          <>{`${formatTokenAmount(balance, tokenDecimals)} ${tokenSymbol} `}</>
        )}
      </Field>
      <Field
        css={`
          margin-top: ${3 * GU}px;
        `}
        label="Delegate account (must be a valid ethereum address)"
        required
      >
        <TextInput
          onChange={handleDelegateAccountChange}
          value={delegateAccount}
          wide
          required
          css={`
            margin-top: ${1 * GU}px;
          `}
        />
      </Field>
      <Info
        css={`
          margin-top: ${2 * GU}px;
        `}
      >
        You will be able to see what your delegate has voted on (or wether they
        have abstained) on your behalf for on-going votes and all past votes
        since the delegation happened. You can cast your vote on a proposal
        before your delegate and can overrule whatever the delegate account has
        voted at any time.
      </Info>
      <Button
        mode="strong"
        wide
        css={`
          margin-top: ${2 * GU}px;
        `}
        onClick={handleOnDelegatevotingPower}
      >
        Delegate your voting power
      </Button>
    </div>
  )
}

export default DelegateVotingPower
