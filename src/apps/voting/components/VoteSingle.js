import React from 'react'
import { BackButton, Bar } from '@aragon/ui'
import LoadingSection from '@/components/Loading/LoadingSection'
import {
  SingleVoteSubscriptionProvider,
  useSingleVoteSubscription,
} from '../providers/SingleVoteSubscription'
import VoteDetails from './VoteDetails/VoteDetails'
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
  const { vote, voteStatus } = useSingleVoteSubscription()
  const [, navigate] = usePath()
  const title = voteStatus.error ? "Couldn't load vote." : 'Loading vote.'

  return (
    <>
      <AppHeader primary="Voting" />
      <Bar>
        <BackButton onClick={() => navigate('../')} />
      </Bar>
      <LoadingSection show={!vote} title={title} showSpinner={!vote}>
        {vote && <VoteDetails vote={vote} voteStatus={voteStatus} />}
      </LoadingSection>
    </>
  )
}

export default VoteSingle
