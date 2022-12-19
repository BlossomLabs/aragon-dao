import React from 'react'

import VotingApp from '../App'
import VoteSingle from '../components/VoteSingle'
import { VotingProvider } from '../providers/VotingProvider'
import { VoterProvider } from '../providers/VoterProvider'
import { AppRouting } from '@/components/AppRouting'

function VotingRouter() {
  return (
    <AppRouting
      appName="blossom-tao-voting"
      defaultPath="votes"
      appRoutes={[
        ['votes', VotingApp],
        ['votes/:id', VoteSingle],
      ]}
    />
  )
}

export default () => (
  <VotingProvider>
    <VoterProvider>
      <VotingRouter />
    </VoterProvider>
  </VotingProvider>
)
