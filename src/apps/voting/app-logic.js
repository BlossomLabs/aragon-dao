import { useCallback, useMemo } from 'react'
import { useApi, usePath } from '@/hooks/shared'
import { useAppState } from './providers/VotingProvider'
import { EMPTY_CALLSCRIPT } from './evmscript-utils'
import useVotes from './hooks/useVotes'
import { noop } from './utils'
import { VOTE_YEA } from './vote-types'

const VOTE_ID_PATH_RE = /^\/vote\/([0-9]+)\/?$/
const NO_VOTE_ID = '-1'

function voteIdFromPath(path) {
  if (!path) {
    return NO_VOTE_ID
  }
  const matches = path.match(VOTE_ID_PATH_RE)
  return matches ? matches[1] : NO_VOTE_ID
}

// Get the vote currently selected, or null otherwise.
export function useSelectedVote(votes) {
  const [path, requestPath] = usePath()

  // The memoized vote currently selected.
  const selectedVote = useMemo(() => {
    const voteId = voteIdFromPath(path)

    if (voteId === NO_VOTE_ID) {
      return null
    }

    return votes.find(vote => vote.voteId === voteId) || null
  }, [path, votes])

  const selectVote = useCallback(
    voteId => {
      requestPath(String(voteId) === NO_VOTE_ID ? '' : `/vote/${voteId}/`)
    },
    [requestPath]
  )

  return [selectedVote, selectVote]
}

// Create a new vote
export function useCreateVoteAction(onDone = noop) {
  const api = useApi()
  return useCallback(
    question => {
      if (api) {
        // Don't care about response
        api['newVote(bytes,string)'](EMPTY_CALLSCRIPT, question).toPromise()
        onDone()
      }
    },
    [api, onDone]
  )
}

// Vote (the action) on a vote
export function useVoteAction(onDone = noop) {
  const api = useApi()
  return useCallback(
    (voteId, voteType, executesIfDecided = true) => {
      // Don't care about response
      api.vote(voteId, voteType === VOTE_YEA, executesIfDecided).toPromise()
      onDone()
    },
    [api, onDone]
  )
}

// Execute a vote
export function useExecuteAction(onDone = noop) {
  const api = useApi()
  return useCallback(
    voteId => {
      // Don't care about response
      api.executeVote(voteId).toPromise()
      onDone()
    },
    [api, onDone]
  )
}

// Handles the main logic of the app.
export function useAppLogic() {
  const { isSyncing } = useAppState()

  const [votes, executionTargets] = useVotes()
  const [selectedVote, selectVote] = useSelectedVote(votes)

  const actions = {
    createVote: useCreateVoteAction(),
    vote: useVoteAction(),
    execute: useExecuteAction(),
  }

  return {
    actions,
    executionTargets,
    isSyncing,
    selectVote,
    selectedVote,
    votes,
  }
}
