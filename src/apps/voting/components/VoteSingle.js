import React from 'react'
import { BackButton, Bar, Header } from '@aragon/ui'
import LayoutGutter from '@/components/Layout/LayoutGutter'
import LayoutLimiter from '@/components/Layout/LayoutLimiter'
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
    <LayoutGutter>
      <LayoutLimiter>
        <Header primary="Votes" />
        <Bar>
          <BackButton onClick={() => navigate('../')} />
        </Bar>
        <LoadingSection show={loading} title="Loading vote">
          <VoteDetails vote={vote} />
        </LoadingSection>
      </LayoutLimiter>
    </LayoutGutter>
  )
}

export default VoteSingle
