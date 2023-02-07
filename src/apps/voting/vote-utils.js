import { isBefore } from 'date-fns'
import BN from 'bn.js'
import { addressesEqual } from '@/utils/web3-utils'
import {
  VOTE_ABSENT,
  VOTE_YEA,
  VOTE_NAY,
  VOTE_STATUS_ONGOING,
  VOTE_STATUS_REJECTED,
  VOTE_STATUS_ACCEPTED,
  VOTE_STATUS_PENDING_ENACTMENT,
  VOTE_STATUS_ENACTED,
} from './vote-types'
import { isEmptyCallScript } from '@/utils/evmscript'

export function isVoteOpen(vote, date) {
  const { executed, endDate } = vote.data
  // Open if not executed and date is still before end date
  return !executed && isBefore(date, endDate)
}

export const getQuorumProgress = ({ numData: { yea, votingPower } }) =>
  yea / votingPower

export function getVoteStatus(vote, pctBase) {
  if (!vote.data.hasEnded) {
    return VOTE_STATUS_ONGOING
  }
  if (!getVoteSuccess(vote, pctBase)) {
    return VOTE_STATUS_REJECTED
  }

  // Only if the vote has an action do we consider it possible for enactment
  const hasAction = isEmptyCallScript(vote.data?.script)
  return hasAction
    ? vote.data.executed
      ? VOTE_STATUS_ENACTED
      : VOTE_STATUS_PENDING_ENACTMENT
    : VOTE_STATUS_ACCEPTED
}

export function getVoteSuccess(vote, pctBase) {
  const { yea, minAcceptQuorum, nay, supportRequired, votingPower } = vote.data

  const totalVotes = yea.add(nay)
  if (totalVotes.isZero()) {
    return false
  }
  const yeaPct = yea.mul(pctBase).div(totalVotes)
  const yeaOfTotalPowerPct = yea.mul(pctBase).div(votingPower)

  // Mirror on-chain calculation
  // yea / votingPower > supportRequired ||
  //   (yea / totalVotes > supportRequired &&
  //    yea / votingPower > minAcceptQuorum)
  return (
    yeaOfTotalPowerPct.gt(supportRequired) ||
    (yeaPct.gt(supportRequired) && yeaOfTotalPowerPct.gt(minAcceptQuorum))
  )
}

// Enums are not supported by the ABI yet:
// https://solidity.readthedocs.io/en/latest/frequently-asked-questions.html#if-i-return-an-enum-i-only-get-integer-values-in-web3-js-how-to-get-the-named-values
export function voteTypeFromContractEnum(value) {
  if (value === '1') {
    return VOTE_YEA
  }
  if (value === '2') {
    return VOTE_NAY
  }
  return VOTE_ABSENT
}

export async function getCanVote(vote, connectedAccount, api) {
  if (!vote) {
    return false
  }

  // If the account is not present, we assume the account is not connected.
  if (!connectedAccount) {
    return vote.data.open
  }

  return api.call('canVote', vote.voteId, connectedAccount)
}

export async function getCanExecute(vote, api) {
  if (!vote) {
    return false
  }
  return api.call('canExecute', vote.voteId)
}

export function getAccountCastDelegatedStake(vote, account) {
  // Takes into account delegated cast stakes (casts done by account where account === caster !== supporter, supporter being caster´s principal)
  const totalDelegatedStake = vote.casts
    .filter(
      cast =>
        addressesEqual(cast.caster, account) &&
        !addressesEqual(cast.voterAddress, account)
    )
    .reduce((acc, cast) => acc.add(new BN(cast.stake)), new BN(0))

  return totalDelegatedStake
}

export function getAccountCastStake(vote, account) {
  const userCast = vote.casts.find(cast =>
    addressesEqual(cast.voterAddress, account)
  )

  return new BN(userCast?.stake || 0)
}

export async function getCanUserVoteOnBehalfOf(
  votingContract,
  voteId,
  voters,
  representative
) {
  if (!votingContract || !voters.length || !representative) {
    return false
  }

  const canVote = await votingContract.canVoteOnBehalfOf(
    voteId,
    voters,
    representative
  )

  return canVote
}

export function getDelegatedVotingEndDate(vote) {
  const baseDelegatedVotingEndDate =
    parseInt(vote.startDate) + parseInt(vote.setting.delegatedVotingPeriod)
  return baseDelegatedVotingEndDate
}

export function getExecutionDelayEndDate(vote, endDate) {
  return parseInt(endDate) + parseInt(vote.setting.executionDelay)
}

export async function getCanUserVote(votingContract, voteId, account) {
  if (!votingContract || !account) {
    return false
  }

  return votingContract.canVote(voteId, account)
}
export function getConnectedAccountCast(vote, account) {
  const userCast = vote.casts.find(cast =>
    addressesEqual(cast.voterAddress, account)
  )

  if (userCast) {
    return {
      vote: userCast.supports ? VOTE_YEA : VOTE_NAY,
      caster: userCast.caster,
    }
  }
  return { vote: VOTE_ABSENT }
}
