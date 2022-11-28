import React from 'react'
import PropTypes from 'prop-types'
import { AppBadge, GU } from '@aragon/ui'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { getAppPresentation, getAppByName } from '@/utils/app-utils'
import LoadingSkeleton from '@/components/Loading/LoadingSkeleton'

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
  const { apps } = useOrganizationState()
  const disputableVotingApp = getAppByName(apps, 'disputable-voting')

  const { humanName, iconSrc } = getAppPresentation(disputableVotingApp)

  return (
    <AppBadge
      label={humanName}
      appAddress={disputableVotingApp.address}
      iconSrc={iconSrc}
      badgeOnly
    />
  )
}

function AppBadgeWithSkeleton({ targetApp, loading }) {
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
    return <></>
  }

  const { address, name, icon } = targetApp

  return (
    <AppBadge
      label={name || address}
      appAddress={address}
      iconSrc={icon}
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
