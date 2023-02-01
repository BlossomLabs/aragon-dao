import React from 'react'
import PropTypes from 'prop-types'
import { AppBadge, GU } from '@aragon/ui'
import { getAppPresentation } from '@/utils/app-utils'
import LoadingSkeleton from '@/components/Loading/LoadingSkeleton'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { shortenAddress } from '@/utils/web3-utils'
import AppBadgeWithSkeleton from '@/components/AppBadgeWithSkeleton'

function TargetAppBadge({ useDefaultBadge, targetApp, loading }) {
  return (
    <>
      {useDefaultBadge ? (
        <DefaultAppBadge />
      ) : (
        <AppBadgeWithSkeleton targetApp={targetApp} loading={loading} />
      )}
    </>
  )
}

/* eslint-disable react/prop-types */
function DefaultAppBadge() {
  const {
    connectedApp: connectedDisputableVotingApp,
    connectedAppStatus,
  } = useConnectedApp()

  if (connectedAppStatus.loading) {
    return (
      <LoadingSkeleton
        css={`
          height: ${3 * GU}px;
          width: ${12 * GU}px;
        `}
      />
    )
  }

  const { humanName, iconSrc } = getAppPresentation(
    connectedDisputableVotingApp
  )

  return (
    <AppBadge
      label={humanName}
      appAddress={shortenAddress(connectedDisputableVotingApp.address)}
      iconSrc={iconSrc}
      badgeOnly
    />
  )
}

/* eslint-disable react/prop-types */

TargetAppBadge.propTypes = {
  useDefaultBadge: PropTypes.bool,
  targetApp: PropTypes.object,
  loading: PropTypes.bool,
}

export default TargetAppBadge
