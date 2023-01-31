import React from 'react'
import { BackButton, Bar } from '@aragon/ui'
import LoadingSection from '@/components/Loading/LoadingSection'
import { SingleVoteSubscriptionProvider } from '../providers/SingleVoteSubscription'
import VoteDetails from './VoteDetails/VoteDetails'
import { useSingleVote } from '../hooks/useSingleVote'
import { usePath } from '@/hooks/shared'
import AppHeader from '@/components/AppHeader'

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
  const [vote, loading, error] = useSingleVote()
  const title = error ? "Couldn't load vote." : 'Loading vote.'

  return (
    <>
      <AppHeader primary="Voting" />
      <Bar>
        <BackButton onClick={() => navigate('../')} />
      </Bar>
      <LoadingSection
        show={loading || !!error}
        title={title}
        showSpinner={!error && loading}
      >
        {vote && <VoteDetails vote={vote} />}
      </LoadingSection>
    </>
  )
}

export default VoteSingle
