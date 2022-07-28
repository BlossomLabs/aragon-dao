import React, { useContext } from 'react'
import {
  useApps,
  useConnect,
  // usePermissions,
} from '@rperez89/connect-react'

const OrganizationContext = React.createContext()

function OrganizationProvider({ children }) {
  const [org, orgStatus] = useConnect()
  const [apps, appsStatus] = useApps()
  const [permissions, permissionsStatus] = useConnect(org => org.permissions())

  console.log('apps ', apps)

  const loading =
    orgStatus.loading || appsStatus.loading || permissionsStatus.loading
  const error = orgStatus.error || appsStatus.error || permissionsStatus.error

  return (
    <OrganizationContext.Provider
      value={{ organization: org, apps, permissions, loading, error }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

function useOrganizationState() {
  return useContext(OrganizationContext)
}

export { OrganizationProvider, useOrganizationState }
