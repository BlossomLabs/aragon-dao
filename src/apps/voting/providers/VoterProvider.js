import React, { useContext } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useWallet } from '@/providers/Wallet'
import { useOrganizationState } from '@/providers/OrganizationProvider'

const VoterContext = React.createContext()

function VoterProvider({ children }) {
  const { currentConnectedApp } = useOrganizationState()
  const { account } = useWallet()

  const [voter, voterStatus] = useConnect(() => {
    if (!account) {
      return
    }
    return currentConnectedApp?.voter(account)
  }, [currentConnectedApp, account])

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
