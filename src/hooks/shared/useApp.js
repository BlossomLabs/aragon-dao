import { isAddress } from '@aragon/ui'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { addressesEqual } from '@/utils/web3-utils'

export default function useApp(addressOrName) {
  const { apps } = useOrganizationState()

  if (isAddress(addressOrName)) {
    return apps.find(app => addressesEqual(app.address, addressOrName))
  }

  // TODO: for now, return the first found instance.
  // In the future, we should only allow to find apps by addresses
  return apps.find(app => app.name === addressOrName)
}
