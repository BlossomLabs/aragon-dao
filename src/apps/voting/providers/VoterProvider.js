import React, { useContext } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useWallet } from '@/providers/Wallet'
import { useConnectedApp } from '@/providers/ConnectedApp'

const VoterContext = React.createContext()

function VoterProvider({ children }) {
  const { connectedApp } = useConnectedApp()
  const { account } = useWallet()

  const [voter, voterStatus] = useConnect(() => {
    if (!account) {
      return
    }
    return connectedApp?.voter(account)
  }, [connectedApp, account])

  return (
    <VoterContext.Provider
      value={{
        voter,
        voterStatus,
      }}
    >
      {children}
    </VoterContext.Provider>
  )
}

function useVoterState() {
  return useContext(VoterContext)
}

export { VoterProvider, useVoterState }
