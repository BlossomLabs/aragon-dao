import React from 'react'
import { BackButton, Bar, Header } from '@aragon/ui'
import LoadingSection from '@/components/Loading/LoadingSection'
import { SingleVoteSubscriptionProvider } from '../providers/SingleVoteSubscription'
import VoteDetails from './VoteDetails/VoteDetails'
import { useSingleVote } from '../hooks/useSingleVote'
import { usePath } from '@/hooks/shared'

function VoteSingle({ match }) {
  const { id } = match.params
  return (
    <SingleVoteSubscriptionProvider voteId={id}>
      <VoteSingleContent />
    </SingleVoteSubscriptionProvider>
  )
}

function VoteSingleContent() {
  const [, navigate] = usePath()
  const [vote, loading] = useSingleVote()

  return (
    <>
      <Header primary="Voting" />
      <Bar>
        <BackButton onClick={() => navigate('../')} />
      </Bar>
      <LoadingSection show={loading} title="Loading vote">
        <VoteDetails vote={vote} />
      </LoadingSection>
    </>
  )
}

export default VoteSingle
