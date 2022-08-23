import { shortenAddress } from '@aragon/ui'
import { ZERO_ADDR } from './constants'
import organizationActions from './actions/organization-action-types'

export default {
  [organizationActions.DELEGATE_VOTING]: ({ representative }) => {
    return `${
      representative !== ZERO_ADDR
        ? `Delegate votes to: ${shortenAddress(representative)}`
        : `Remove delegate`
    }`
  },
}
