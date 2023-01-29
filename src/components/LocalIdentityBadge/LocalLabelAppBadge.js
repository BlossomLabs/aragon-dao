import React from 'react'
import { AppBadge } from '@aragon/ui'
import { useNetwork } from '../../hooks/shared'

const LocalLabelAppBadge = ({ appAddress, label, ...props }) => {
  const network = useNetwork()

  return (
    <AppBadge
      css={`
        width: 28px;
      `}
      appAddress={appAddress}
      label={label}
      networkType={network && network.type}
      {...props}
    />
  )
}

LocalLabelAppBadge.propTypes = {
  ...AppBadge.propTypes,
}

export default LocalLabelAppBadge
