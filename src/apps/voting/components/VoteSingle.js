import React from 'react'
import { BackButton, Bar } from '@aragon/ui'
import LoadingSection from '@/components/Loading/LoadingSection'
import { SingleVoteSubscriptionProvider } from '../providers/SingleVoteSubscription'
import VoteDetails from './VoteDetails/VoteDetails'
import { useSingleVote } from '../hooks/useSingleVote'
import { usePath } from '@/hooks/shared'
import AppHeader from '@/components/AppHeader'
import { VoterProvider } from '../providers/Voter'

function VoteSingle({ match }) {
  const { id } = match.params
  return (
    <SingleVoteSubscriptionProvider voteId={id}>
      <VoterProvider>
        <VoteSingleContent />
      </VoterProvider>
    </SingleVoteSubscriptionProvider>
  )
}

function VoteSingleContent() {
  const [, navigate] = usePath()
  const [vote, voteStatus] = useSingleVote()
  const title = voteStatus.error ? "Couldn't load vote." : 'Loading vote.'

  return (
    <>
      <AppHeader primary="Voting" />
      <Bar>
        <BackButton onClick={() => navigate('../')} />
      </Bar>
      <LoadingSection show={!vote} title={title} showSpinner={!vote}>
        {vote && <VoteDetails vote={vote} />}
      </LoadingSection>
    </>
  )
}

export default VoteSingle
