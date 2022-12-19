import React, { useContext } from 'react'
import { useConnect } from '@1hive/connect-react'
import connectVoting from '@rperez89/connect-tao-voting'
import connectTokenWrapper from '@rperez89/connect-token-wrapper'
import { connectANDelay } from '@blossom-labs/connect-an-delay'

const OrganizationContext = React.createContext()

const connectToApps = (apps, appNames, connectAppFns) => () => {
  if (!apps) {
    return
  }

  let connectFns = []

  appNames.forEach((appName, i) => {
    const filteredApps = apps.filter(app => app.name === appName)
    connectFns.push(...filteredApps.map(app => connectAppFns[i](app)))
  })

  return Promise.all(connectFns)
}

function OrganizationProvider({ children }) {
  const [org, orgStatus] = useConnect()
  const [apps, appsStatus] = useConnect(org => org.apps())
  const [permissions, permissionsStatus] = useConnect(org => org.permissions())
  const [connectedApps, connectedAppsStatus] = useConnect(
    connectToApps(
      apps,
      ['an-delay', 'delay', 'blossom-tao-voting', 'blossom-token-wrapper'],
      [connectANDelay, connectANDelay, connectVoting, connectTokenWrapper]
    ),
    [apps]
  )

  const loading =
    orgStatus.loading || appsStatus.loading || permissionsStatus.loading
  const error = orgStatus.error || appsStatus.error || permissionsStatus.error

  return (
    <OrganizationContext.Provider
      value={{
        organization: org,
        apps,
        connection: org?.connection,
        connectedApps,
        connectedAppsStatus,
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
