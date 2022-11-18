import React from 'react'
import { AppBadge } from '@aragon/ui'
import { useIdentity } from '../../identity-manager'
import LocalLabelPopoverTitle from './LocalLabelPopoverTitle'
import LocalLabelPopoverActionLabel from './LocalLabelPopoverActionLabel'
import { useNetwork } from '../../hooks/shared'

const LocalLabelAppBadge = ({ appAddress, label, ...props }) => {
  const network = useNetwork()
  const [localLabel, showLocalLabelAppModal] = useIdentity(appAddress)
  const handleClick = () => showLocalLabelAppModal(appAddress)
  return (
    <AppBadge
      css={`
        width: 28px;
      `}
      appAddress={appAddress}
      label={localLabel || label}
      networkType={network && network.type}
      popoverAction={{
        label: <LocalLabelPopoverActionLabel hasLabel={Boolean(localLabel)} />,
        onClick: handleClick,
      }}
      popoverTitle={
        localLabel ? <LocalLabelPopoverTitle label={localLabel} /> : undefined
      }
      {...props}
    />
  )
}

LocalLabelAppBadge.propTypes = {
  ...AppBadge.propTypes,
}

export default LocalLabelAppBadge
