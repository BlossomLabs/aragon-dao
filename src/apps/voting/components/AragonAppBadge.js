import React from 'react'
import { AppBadge } from '@aragon/ui'
import { getAppPresentation } from '../../utils/app-utils'
import { getNetwork } from '@/utils/web3-utils'

function GardenAppBadge({ app }) {
  const network = getNetwork(100) // TODO: Handle chains
  if (!app) {
    return null
  }

  const appPresentation = getAppPresentation(app)

  return (
    <AppBadge
      iconSrc={appPresentation?.iconSrc}
      label={appPresentation?.humanName}
      appAddress={app.address}
      networkType={network.type}
      explorerProvider={network.explorer}
      compact
    />
  )
}

export default GardenAppBadge
