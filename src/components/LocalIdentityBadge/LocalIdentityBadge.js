import React from 'react'
import { IdentityBadge } from '@aragon/ui'
import { useIdentity } from '../../providers/Identity'
import LocalLabelPopoverTitle from './LocalLabelPopoverTitle'
import LocalLabelPopoverActionLabel from './LocalLabelPopoverActionLabel'
import { useNetwork } from '../../hooks/shared'

const LocalIdentityBadge = ({ entity, ...props }) => {
  const network = useNetwork()
  const [label, showLocalIdentityModal] = useIdentity(entity)
  const handleClick = () => showLocalIdentityModal(entity)
  return (
    <IdentityBadge
      label={label || ''}
      entity={entity}
      networkType={network && network.type}
      popoverAction={{
        label: <LocalLabelPopoverActionLabel hasLabel={Boolean(label)} />,
        onClick: handleClick,
      }}
      popoverTitle={
        label ? <LocalLabelPopoverTitle label={label} /> : undefined
      }
      {...props}
    />
  )
}

LocalIdentityBadge.propTypes = {
  ...IdentityBadge.propTypes,
}

export default LocalIdentityBadge
