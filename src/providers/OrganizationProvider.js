import React, { useContext } from 'react'
import { useApps, useConnect } from '@1hive/connect-react'
import connectVoting from '@rperez89/connect-tao-voting'
import connectTokenWrapper from '@rperez89/connect-token-wrapper'
import { connectANDelay } from '@blossom-labs/connect-an-delay'

const OrganizationContext = React.createContext()

function OrganizationProvider({ children }) {
  const [org, orgStatus] = useConnect()
  const [apps, appsStatus] = useApps()
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
  const [connectANDelayApp, connectedANDelayAppStatus] = useConnect(org =>
    connectANDelay(org.onApp('delay'))
  )
  const loading =
    orgStatus.loading || appsStatus.loading || permissionsStatus.loading
  const error = orgStatus.error || appsStatus.error || permissionsStatus.error

  return (
    <OrganizationContext.Provider
      value={{
        organization: org,
        apps,
        connectANDelayApp,
        connectedANDelayAppStatus,
        connectedDisputableApp,
        connectedTokenWrapperApp,
        connectedDisputableAppStatus,
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
