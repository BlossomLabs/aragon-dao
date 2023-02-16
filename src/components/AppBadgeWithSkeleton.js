import { useNetwork } from '@/hooks/shared'
import { shortenAddress } from '@/utils/web3-utils'
import { AppBadge, GU } from '@aragon/ui'
import { constants } from 'ethers'
import React from 'react'
import LoadingSkeleton from './Loading/LoadingSkeleton'

function AppBadgeWithSkeleton({ targetApp, loading, ...props }) {
  const network = useNetwork()
  if (loading) {
    return (
      <LoadingSkeleton
        css={`
          height: ${3 * GU}px;
          width: ${12 * GU}px;
        `}
      />
    )
  }

  if (!targetApp) {
    return <AppBadge appAddress={constants.AddressZero} label="Unknown" />
  }

  const { address, name, icon } = targetApp

  return (
    <AppBadge
      label={name || shortenAddress(address)}
      appAddress={address}
      iconSrc={icon}
      networkType={network?.type}
      {...props}
    />
  )
}

export default AppBadgeWithSkeleton
