import React, { useContext } from 'react'
import { useConnect } from '@1hive/connect-react'
import connectVoting from '@rperez89/connect-tao-voting'
import connectTokenWrapper from '@rperez89/connect-token-wrapper'
import { connectANDelay } from '@blossom-labs/connect-an-delay'
import connectFinance from '@rperez89/connect-finance'

const OrganizationContext = React.createContext()

function OrganizationProvider({ children }) {
  const [org, orgStatus] = useConnect()
  const [apps, appsStatus] = useConnect(org => org.apps())
  const [permissions, permissionsStatus] = useConnect(org => org.permissions())
  const [connectedDisputableApp, connectedDisputableAppStatus] = useConnect(
    org => {
      return connectVoting(org.onApp('blossom-tao-voting'))
    }
  )
  const [connectedTokenWrapperApp, connectedTokenWrapperAppStatus] = useConnect(
    org => {
      return connectTokenWrapper(org.onApp('blossom-token-wrapper'))
    }
  )
  const [connectedANDelayApp, connectedANDelayAppStatus] = useConnect(org =>
    connectANDelay(org.onApp('delay'))
  )

  const [connectedFinanceApp, connectedFinanceAppStatus] = useConnect(org =>
    connectFinance(org.onApp('finance'))
  )

  const loading =
    orgStatus.loading ||
    appsStatus.loading ||
    permissionsStatus.loading ||
    connectedFinanceAppStatus.loading
  const error =
    orgStatus.error ||
    appsStatus.error ||
    permissionsStatus.error ||
    connectedFinanceAppStatus.error

  console.log('apps ', apps)
  return (
    <OrganizationContext.Provider
      value={{
        organization: org,
        apps,
        connection: org?.connection,
        connectedANDelayApp,
        connectedANDelayAppStatus,
        connectedDisputableApp,
        connectedDisputableAppStatus,
        connectedTokenWrapperApp,
        connectedTokenWrapperAppStatus,
        connectedFinanceApp,
        connectedFinanceAppStatus,
        permissions,
        loading,
        error,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

function useOrganizationState() {
  return useContext(OrganizationContext)
}

export { OrganizationProvider, useOrganizationState }
