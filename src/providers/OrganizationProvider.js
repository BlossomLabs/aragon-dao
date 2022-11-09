import React, { useContext } from 'react'
import { useApps, useConnect } from '@1hive/connect-react'
import connectVoting from '@rperez89/connect-tao-voting'

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

  return (
    <OrganizationContext.Provider
      value={{
        organization: org,
        apps,
        connectedDisputableApp,
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
