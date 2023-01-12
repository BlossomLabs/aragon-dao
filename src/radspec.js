import { shortenAddress } from '@aragon/ui'
import { ZERO_ADDR } from './constants'
import organizationActions from './actions/organization-action-types'

export default {
  [organizationActions.EXECUTE]: ({ scriptId }) =>
    `Execute the script with ID ${scriptId}`,
  [organizationActions.DELAY_EXECUTION]: ({ executionDelay }) =>
    `Delays execution for ${executionDelay}`,
  [organizationActions.PAUSE_EXECUTION]: ({ scriptId }) =>
    `Pause the script execution with ID ${scriptId}`,
  [organizationActions.RESUME_EXECUTION]: ({ scriptId }) =>
    `Resume a paused script execution with ID ${scriptId}`,
  [organizationActions.CANCEL_EXECUTION]: ({ scriptId }) =>
    `Cancel script execution with ID ${scriptId}`,
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
  [organizationActions.NEW_VOTE]: () => {
    return `New signaling vote`
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
