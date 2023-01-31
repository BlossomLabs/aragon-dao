import React from 'react'
import { DataView, IdentityBadge } from '@aragon/ui'
import { useVoterState } from '../providers/VoterProvider'
import useDelegatorsBalance from '../hooks/useDelegatorsBalance'
import { formatTokenAmount } from '../token-utils'
import { useAppState } from '../providers/VotingProvider'
import LoadingSection from '@/components/Loading/LoadingSection'

const DelegatedBy = React.memo(function DelegatedBy() {
  const {
    tokenSymbol,
    numData: { tokenDecimals },
  } = useAppState()

  const { voter } = useVoterState()
  const [delegatorsBalances, loading] = useDelegatorsBalance(
    voter?.representativeFor
  )

  return (
    <LoadingSection show={loading} title="Loading delegators">
      <DataView
        emptyState={{
          default: {
            title: 'No delegators found.',
          },
        }}
        fields={['Delegator', 'Balance']}
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
    </LoadingSection>
  )
})
export default DelegatedBy
