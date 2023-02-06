import React, { useContext } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useWallet } from '@/providers/Wallet'
import { useConnectedApp } from '@/providers/ConnectedApp'

const UserContext = React.createContext()

function VotingUserProvider({ children }) {
  const { connectedApp } = useConnectedApp()
  const { account } = useWallet()

  const [user, userStatus] = useConnect(() => {
    if (!account || !connectedApp) {
      return
    }
    return connectedApp.onVoter(account)
  }, [connectedApp, account])

  return (
    <UserContext.Provider
      value={{
        user,
        userStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

function useUserState() {
  return useContext(UserContext)
}

export { VotingUserProvider, useUserState }
