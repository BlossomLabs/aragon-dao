import { useOrganizationState } from '@/providers/OrganizationProvider'
import { addressesEqual } from '@/utils/web3-utils'
import { useMemo } from 'react'
import usePath from './usePath'

export const useCurrentConnectedApp = () => {
  const [path] = usePath()
  const { connectedApps } = useOrganizationState()

  return useMemo(() => {
    const [, , currentAppAddress] = path.split('/')

    return connectedApps?.find(connectedApp =>
      addressesEqual(connectedApp['_app']?.address, currentAppAddress)
    )
  }, [connectedApps, path])
}
