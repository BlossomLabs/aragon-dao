import React from 'react'
import { DataView, LoadingRing, IdentityBadge } from '@aragon/ui'
import { useVoterState } from '../providers/VoterProvider'
import useDelegatorsBalance from '../hooks/useDelegatorsBalance'
import { formatTokenAmount } from '../token-utils'
import { useAppState } from '../providers/VotingProvider'

const DelegatedBy = React.memo(function DelegatedBy() {
  const {
    tokenSymbol,
    numData: { tokenDecimals },
  } = useAppState()

  const { voter, voterStatus } = useVoterState()

  const [delegatorsBalances, loading] = useDelegatorsBalance(
    voter?.representativeFor
  )

  return loading ? (
    <div
      css={`
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <LoadingRing />
    </div>
  ) : (
    <DataView
      fields={['Account', 'Balance']}
      entries={delegatorsBalances}
      renderEntry={([address, balance]) => {
        return [
          <IdentityBadge entity={address} />,
          <span>
            {formatTokenAmount(balance, tokenDecimals)} {tokenSymbol}
          </span>,
        ]
      }}
    />
  )
})
export default DelegatedBy
