import React, { useContext } from 'react'
import { createAppHook, useApp } from '@aragon/connect-react'
import connectVoting from '@aragon/connect-voting'

const VotingContext = React.createContext()
const useVoting = createAppHook(connectVoting)

function VotingProvider({ children }) {
  const [voting] = useApp('voting')

  const [votes] = useVoting(voting, app => app.onVotes(), [])

  return (
    <VotingContext.Provider value={{ votes: votes }}>
      {children}
    </VotingContext.Provider>
  )
}

function useVotingState() {
  return useContext(VotingContext)
}

export { VotingProvider, useVotingState }
