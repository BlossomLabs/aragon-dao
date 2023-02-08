import { shortenAddress } from '@aragon/ui'
import { constants } from 'ethers'
import organizationActions from './actions/organization-action-types'
import { formatTime } from './utils/time-utils'

export default {
  [organizationActions.EXECUTE]: ({ id }) => `Execute the script with ID ${id}`,
  [organizationActions.DELAY_EXECUTION]: ({ id, executionDelay }) =>
    `Delay the script with ID ${id} execution for ${formatTime(
      executionDelay
    )} seconds `,
  [organizationActions.PAUSE_EXECUTION]: ({ id }) =>
    `Pause the script execution with ID ${id}`,
  [organizationActions.RESUME_EXECUTION]: ({ id }) =>
    `Resume a paused script execution with ID ${id}`,
  [organizationActions.CANCEL_EXECUTION]: ({ id }) =>
    `Cancel script execution with ID ${id}`,
  [organizationActions.DELEGATE_VOTING]: ({ representative }) => {
    return `${
      representative !== constants.AddressZero
        ? `Delegate votes to: ${shortenAddress(representative)}`
        : `Remove delegate`
    }`
  },
  [organizationActions.ENACT_VOTE]: ({ voteId }) => {
    return `Enact vote: #${voteId}`
  },
  [organizationActions.VOTE_ON_PROPOSAL]: ({ voteId, supports }) => {
    return `Vote ${supports ? 'Yes' : 'No'} on proposal: #${voteId}`
  },
  [organizationActions.VOTE_ON_BEHALF_OF]: ({ voteId, supports }) => {
    return `Vote ${
      supports ? 'Yes' : 'No'
    } on behalf of delegators on decision: #${voteId}`
  },
  [organizationActions.NEW_VOTE]: () => {
    return `New signaling proposal`
  },
  [organizationActions.WRAP]: () => {
    return `Wrap token`
  },
  [organizationActions.UNWRAP]: () => {
    return `Unwrap token`
  },
  [organizationActions.APPROVE_TOKEN]: ({ tokenSymbol }) => {
    return `Approve ${tokenSymbol}`
  },
  [organizationActions.DEPOSIT]: () => {
    return `Deposit into finance`
  },
  [organizationActions.WITHDRAW]: () => {
    return `New withdrawal`
  },
}
