import React, { useContext } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useCurrentConnectedApp } from '@/hooks/shared/useCurrentConnectedApp'
import { useWallet } from '@/providers/Wallet'

const VoterContext = React.createContext()

function VoterProvider({ children }) {
  const connectedApp = useCurrentConnectedApp()
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
