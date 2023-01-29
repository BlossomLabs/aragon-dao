import React from 'react'
import { IdentityBadge } from '@aragon/ui'
import { useNetwork } from '../../hooks/shared'

const LocalIdentityBadge = ({ entity, ...props }) => {
  const network = useNetwork()

  return (
    <IdentityBadge
      entity={entity}
      networkType={network && network.type}
      {...props}
    />
  )
}

LocalIdentityBadge.propTypes = {
  ...IdentityBadge.propTypes,
}

export default LocalIdentityBadge
