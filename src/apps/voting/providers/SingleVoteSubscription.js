import React, { useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useConnect } from '@1hive/connect-react'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useAppState } from './VotingProvider'

function buildVoteId(connectedApp, voteId) {
  return `${connectedApp.address}-vote-${voteId}`
}

const SingleVoteSubscriptionContext = React.createContext()

function SingleVoteSubscriptionProvider({ voteId, children }) {
  const { isSyncing, token } = useAppState()
  const { connectedApp } = useConnectedApp()

  const [vote, { loading: voteLoading, error: voteError }] = useConnect(() => {
    return connectedApp?.onVote(buildVoteId(connectedApp, voteId))
  }, [connectedApp, voteId])

  const [extendedVote, extendedVoteStatus] = useExtendVote(vote, voteId)

  const loading = voteLoading || extendedVoteStatus.loading || isSyncing
  const error = voteError || extendedVoteStatus.error

  const SingleVoteSubscriptionState = useMemo(
    () => [
      {
        voteEntity: vote,
        ...(extendedVote ?? {}),
        votingToken: token,
      },
      { loading, error },
    ],
    [vote, extendedVote, loading, error, token]
  )

  return (
    <SingleVoteSubscriptionContext.Provider value={SingleVoteSubscriptionState}>
      {children}
    </SingleVoteSubscriptionContext.Provider>
  )
}

SingleVoteSubscriptionProvider.propTypes = {
  voteId: PropTypes.string,
  children: PropTypes.node,
}

function useExtendVote(vote) {
  const [voteExtraData, voteExtraDataStatus] = useConnect(async () => {
    if (!vote) {
      return
    }

    const [settings] = await Promise.all([vote.setting()])

    return {
      settings,
    }
  }, [vote])
  const extendedVote = useMemo(
    () => ({
      baseVote: vote,
      ...(voteExtraData ?? {}),
    }),
    [vote, voteExtraData]
  )

  return [extendedVote, voteExtraDataStatus]
}

function useSingleVoteSubscription() {
  return useContext(SingleVoteSubscriptionContext)
}

export { SingleVoteSubscriptionProvider, useSingleVoteSubscription }
