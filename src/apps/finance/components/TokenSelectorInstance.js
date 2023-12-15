import React from 'react'
import styled from 'styled-components'
import { GU } from '@aragon/ui'
import LocalIdentityBadge from '@/components/LocalIdentityBadge/LocalIdentityBadge'
import { ETHER_TOKEN_FAKE_ADDRESS } from '../lib/token-utils'
import { addressesEqual } from '@/utils/web3-utils'

const TokenSelectorInstance = React.memo(function TokenSelectorInstance({
  address,
  name,
  symbol,
  logoUrl,
  showAddress = true,
}) {
  return (
    <div
      css={`
        display: flex;
        align-items: center;
      `}
    >
      {logoUrl ? (
        <Icon src={logoUrl} />
      ) : (
        <div
          css={`
            width: ${showAddress ? 3 * GU : 0}px;
          `}
        />
      )}
      {symbol && (
        <span
          css={`
            margin-right: ${1 * GU}px;
            max-width: ${15 * GU}px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
          `}
        >
          {symbol}
        </span>
      )}
      {name && (
        <span
          css={`
            max-width: 110px;
            margin-right: ${1 * GU}px;
            overflow: hidden;
            text-overflow: ellipsis;
          `}
        >
          ({name})
        </span>
      )}
      {Boolean(
        !addressesEqual(address, ETHER_TOKEN_FAKE_ADDRESS) && showAddress
      ) && <LocalIdentityBadge badgeOnly compact entity={address} />}
    </div>
  )
})

const Icon = styled.img.attrs({ alt: '', width: '16', height: '16' })`
  margin-right: ${1 * GU}px;
`

export default React.memo(TokenSelectorInstance)
