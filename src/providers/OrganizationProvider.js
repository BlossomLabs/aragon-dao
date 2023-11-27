import React, { useContext } from 'react'
import { useConnect } from '@1hive/connect-react'

const OrganizationContext = React.createContext()

function OrganizationProvider({ children }) {
  const [org, orgStatus] = useConnect()
  const [apps, appsStatus] = useConnect(org => org.apps())
  const [permissions, permissionsStatus] = useConnect(org => org.permissions())
  console.log(orgStatus)
  const loading =
    orgStatus.loading || appsStatus.loading || permissionsStatus.loading
  const error = orgStatus.error || appsStatus.error || permissionsStatus.error

  return (
    <OrganizationContext.Provider
      value={{
        organization: org,
        apps,
        appsStatus,
        connection: org?.connection,
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
