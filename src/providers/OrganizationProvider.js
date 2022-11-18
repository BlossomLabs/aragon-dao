import React, { useContext } from 'react'
import { useApps, useConnect } from '@1hive/connect-react'
import connectVoting from '@rperez89/connect-tao-voting'
import connectTokenWrapper from '@rperez89/connect-token-wrapper'

const OrganizationContext = React.createContext()

function OrganizationProvider({ children }) {
  const [org, orgStatus] = useConnect()
  const [apps, appsStatus] = useApps()
  const [permissions, permissionsStatus] = useConnect(org => org.permissions())

  const loading =
    orgStatus.loading || appsStatus.loading || permissionsStatus.loading
  const error = orgStatus.error || appsStatus.error || permissionsStatus.error

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

  console.log('APPSSSSS ', apps)

  return (
    <OrganizationContext.Provider
      value={{
        organization: org,
        apps,
        connectedDisputableApp,
        connectedTokenWrapperApp,
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
