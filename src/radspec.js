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
  [organizationActions.VOTE_ON_PROPOSAL]: ({ voteId, supports }) => {
    return `Vote ${supports ? 'Yes' : 'No'} on proposal: #${voteId}`
  },
  [organizationActions.VOTE_ON_BEHALF_OF]: ({ voteId, supports }) => {
    return `Vote ${
      supports ? 'Yes' : 'No'
    } on behalf of principals on decision: #${voteId}`
  },
}
