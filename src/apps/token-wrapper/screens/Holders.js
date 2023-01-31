import React from 'react'
import PropTypes from 'prop-types'
import { DataView } from '@aragon/ui'
import { useWallet } from '@/providers/Wallet'
import LocalIdentityBadge from '@/components/LocalIdentityBadge/LocalIdentityBadge'
import You from '../components/You'
import { addressesEqual } from '@/utils/web3-utils'
import { formatBalance } from '../utils'

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

// TODO: Use after integrating identity system

// function EntryActions({ address, onUnwrapTokens }) {
//   const theme = useTheme()
//   const { account: connectedAccount } = useWallet()
//   const [label, showLocalIdentityModal] = useIdentity(address)

//   const isCurrentUser = addressesEqual(address, connectedAccount)
//   const editLabel = useCallback(() => showLocalIdentityModal(address), [
//     address,
//     showLocalIdentityModal,
//   ])

//   const actions = [
//     ...(isCurrentUser ? [[onUnwrapTokens, IconRemove, 'Unwrap tokens']] : []),
//     [editLabel, IconLabel, `${label ? 'Edit' : 'Add'} custom label`],
//   ]
//   return (
//     <ContextMenu zIndex={1}>
//       {actions.map(([onClick, Icon, label], index) => (
//         <ContextMenuItem onClick={onClick} key={index}>
//           <span
//             css={`
//               position: relative;
//               display: flex;
//               align-items: center;
//               justify-content: center;
//               color: ${theme.surfaceContentSecondary};
//             `}
//           >
//             <Icon />
//           </span>
//           <span
//             css={`
//               margin-left: ${1 * GU}px;
//             `}
//           >
//             {label}
//           </span>
//         </ContextMenuItem>
//       ))}
//     </ContextMenu>
//   )
// }

export default Holders
