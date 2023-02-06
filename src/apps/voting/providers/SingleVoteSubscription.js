import React, { useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useConnect } from '@1hive/connect-react'
import { useConnectedApp } from '@/providers/ConnectedApp'
import {
  getDelegatedVotingEndDate,
  getExecutionDelayEndDate,
} from '../vote-utils'
import { DisputableStatusType } from '../types/disputable-statuses'
import { toMs } from '@/utils/date-utils'

const SingleVoteSubscriptionContext = React.createContext()

function processVote(vote) {
  const endDate = vote.endDate
  const delegatedVotingEndDate = getDelegatedVotingEndDate(vote)
  const executionDelayEndDate = getExecutionDelayEndDate(vote, endDate)

  return {
    ...vote,
    /**
     * Keep track of connector's model object as it
     * has relevant data fetching and formatting methods
     */
    voteEntity: vote,
    disputableStatus: DisputableStatusType[vote.status],
    endDate: toMs(endDate),
    extendedPeriod: toMs(vote.currentQuietEndingExtensionDuration),
    hasEnded: vote.hasEnded,
    naysPct: vote.naysPct,
    quietEndingPeriod: toMs(vote.setting.quietEndingPeriod),
    // settledAt: toMs(vote.settledAt),
    startDate: toMs(vote.startDate),
    yeasPct: vote.yeasPct,
    delegatedVotingEndDate: toMs(delegatedVotingEndDate),
    executionDelayEndDate: toMs(executionDelayEndDate),
    isDelayed: vote.hasEnded && toMs(executionDelayEndDate) > Date.now(),
  }
}

function buildVoteId(connectedApp, voteId) {
  return `${connectedApp.address}-vote-${voteId}`
}

function SingleVoteSubscriptionProvider({ voteId, children }) {
  const { connectedApp } = useConnectedApp()

  const [vote, voteStatus] = useConnect(
    () => connectedApp?.onVote(buildVoteId(connectedApp, voteId)),
    [connectedApp]
  )

  const processedVote = useMemo(() => {
    return vote ? processVote(vote) : undefined
  }, [vote])

  return (
    <SingleVoteSubscriptionContext.Provider
      value={{ vote: processedVote, voteStatus }}
    >
      {children}
    </SingleVoteSubscriptionContext.Provider>
  )
}

SingleVoteSubscriptionProvider.propTypes = {
  voteId: PropTypes.string,
  children: PropTypes.node,
}

function useSingleVoteSubscription() {
  return useContext(SingleVoteSubscriptionContext)
}

export { SingleVoteSubscriptionProvider, useSingleVoteSubscription }
