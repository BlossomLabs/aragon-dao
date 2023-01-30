import { useCallback, useMemo } from 'react'
import { usePath } from '@/hooks/shared'
import { useAppState } from './providers/VotingProvider'
import useVotes from './hooks/useVotes'

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

// Handles the main logic of the app.
export function useAppLogic() {
  const { isSyncing } = useAppState()

  const [votes, executionTargets] = useVotes()
  const [selectedVote, selectVote] = useSelectedVote(votes)

  return {
    executionTargets,
    isSyncing,
    selectVote,
    selectedVote,
    votes,
  }
}
