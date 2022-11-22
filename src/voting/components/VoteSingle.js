import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { BackButton, Bar, Header } from '@aragon/ui'
import { SingleVoteSubscriptionProvider } from '../providers/SingleVoteSubscription'
import LayoutGutter from '../../components/Layout/LayoutGutter'
import LayoutLimiter from '../../components/Layout/LayoutLimiter'
import LoadingSection from './Loading/LoadingSection'
import VoteDetails from './VoteDetails/VoteDetails'
import { useSingleVote } from '../hooks/useSingleVote'

function VoteSingle({ match }) {
  const { id } = match.params

  return (
    <SingleVoteSubscriptionProvider voteId={id}>
      <VoteSingleContent />
    </SingleVoteSubscriptionProvider>
  )
}

function VoteSingleContent() {
  const history = useHistory()
  const [vote, loading] = useSingleVote()

  const handleBack = useCallback(() => {
    history.push(`/voting/votes`)
  }, [history])

  return (
    <LayoutGutter>
      <LayoutLimiter>
        <Header primary="Votes" />
        <Bar>
          <BackButton onClick={handleBack} />
        </Bar>
        <LoadingSection loading={loading} title="Loading vote">
          <VoteDetails vote={vote} />
        </LoadingSection>
      </LayoutLimiter>
    </LayoutGutter>
  )
}

export default VoteSingle
