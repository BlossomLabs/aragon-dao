import React from 'react'
import { DataView, IdentityBadge } from '@aragon/ui'
import { useUserState } from '../providers/User'
import useDelegatorsBalance from '../hooks/useDelegatorsBalance'
import { formatTokenAmount } from '@/utils/token'
import { useAppState } from '../providers/VotingProvider'
import LoadingSection from '@/components/Loading/LoadingSection'

const DelegatedBy = React.memo(function DelegatedBy() {
  const { token } = useAppState()

  const { user } = useUserState()
  const [delegatorsBalances, { loading, error }] = useDelegatorsBalance(
    user?.representativeFor
  )

  return (
    <LoadingSection
      show={loading || !!error}
      title="Loading delegators"
      showSpinner={loading}
    >
      <DataView
        emptyState={{
          default: {
            title: 'No delegators found.',
          },
        }}
        fields={['Delegator', 'Balance']}
        entries={delegatorsBalances ?? []}
        renderEntry={([address, balance]) => {
          return [
            <IdentityBadge entity={address} />,
            <span>
              {formatTokenAmount(balance, token.decimals)} {token.symbol}
            </span>,
          ]
        }}
      />
    </LoadingSection>
  )
})
export default DelegatedBy
