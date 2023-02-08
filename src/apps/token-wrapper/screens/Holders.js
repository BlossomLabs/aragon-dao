import React from 'react'
import PropTypes from 'prop-types'
import { DataView } from '@aragon/ui'
import { useWallet } from '@/providers/Wallet'
import LocalIdentityBadge from '@/components/LocalIdentityBadge/LocalIdentityBadge'
import You from '../components/You'
import { addressesEqual } from '@/utils/web3-utils'
import { formatBalance } from '@/utils/math-utils'

const Holders = React.memo(function Holders({ holders, wrappedToken }) {
  const { account: connectedAccount } = useWallet()
  const holderEntries = holders
    .map(holder => ({
      ...holder,
      isConnectedAccount: addressesEqual(holder.address, connectedAccount),
    }))
    .sort((a, b) => (a.isConnectedAccount ? -1 : b.isConnectedAccount ? 1 : 0))

  return (
    <DataView
      fields={['Holder', 'Wrapped balance']}
      entries={holderEntries}
      renderEntry={({ address, balance, isConnectedAccount }) => {
        return [
          <div>
            <LocalIdentityBadge
              entity={address}
              connectedAccount={isConnectedAccount}
            />
            {isConnectedAccount && <You />}
          </div>,
          <div>
            {formatBalance(balance, wrappedToken.tokenDecimalsBase)}{' '}
            {wrappedToken.symbol}
          </div>,
        ]
      }}
    />
  )
})

Holders.propTypes = {
  holders: PropTypes.array,
}

Holders.defaultProps = {
  holders: [],
}

export default Holders
