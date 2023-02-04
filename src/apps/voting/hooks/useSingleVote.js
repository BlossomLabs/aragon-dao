import { useMemo } from 'react'
import { useSingleVoteSubscription } from '../providers/SingleVoteSubscription'
import { toMs } from '../utils/date-utils'
import { DisputableStatusType } from '../types/disputable-statuses'
import {
  getDelegatedVotingEndDate,
  getExecutionDelayEndDate,
} from '../vote-utils'

export function useSingleVote() {
  const [vote, voteStatus] = useSingleVoteSubscription()

  const processedVote = useMemo(() => {
    return !voteStatus.loading && !voteStatus.error
      ? processVote(vote)
      : undefined
  }, [voteStatus, vote])

  return [processedVote, voteStatus]
}

// Get and format values
function processVote(voteInfo) {
  const { baseVote, settings, votingToken } = voteInfo
  const endDate = baseVote.endDate
  const delegatedVotingEndDate = getDelegatedVotingEndDate(baseVote)
  const executionDelayEndDate = getExecutionDelayEndDate(baseVote, endDate)

  return {
    ...baseVote,
    challengeEndDate: toMs(baseVote.challengeEndDate),
    disputableStatus: DisputableStatusType[baseVote.status],
    endDate: toMs(endDate),
    extendedPeriod: toMs(baseVote.currentQuietEndingExtensionDuration),
    hasEnded: baseVote.hasEnded,
    naysPct: baseVote.naysPct,
    pausedAt: toMs(baseVote.pausedAt),
    quietEndingPeriod: toMs(settings.quietEndingPeriod),
    settings,
    settledAt: toMs(baseVote.settledAt),
    startDate: toMs(baseVote.startDate),
    votingToken,
    yeasPct: baseVote.yeasPct,
    delegatedVotingEndDate: toMs(delegatedVotingEndDate),
    executionDelayEndDate: toMs(executionDelayEndDate),
    isDelayed: baseVote.hasEnded && toMs(executionDelayEndDate) > Date.now(),
  }
}
