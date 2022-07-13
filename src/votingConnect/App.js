import React from 'react'
import { VotingProvider, useVotingState } from './providers/VotingProvider'

// This folder will be called just voting as the normal one after the migration to use connect is finished
function App() {
  const votingState = useVotingState()
  console.log('votingState ', votingState)

  return <> Testing </>
}

export default () => (
  <VotingProvider>
    <App />
  </VotingProvider>
)
