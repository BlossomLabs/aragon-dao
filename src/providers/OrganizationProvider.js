import React, { useContext, useMemo } from 'react'
import { useConnect } from '@1hive/connect-react'
import connectVoting from '@rperez89/connect-tao-voting'
import connectTokenWrapper from '@rperez89/connect-token-wrapper'
import { connectANDelay } from '@blossom-labs/connect-an-delay'
import { usePath } from '@/hooks/shared'
import { addressesEqual } from '@/utils/web3-utils'

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
  const [location] = usePath()
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
  const currentConnectedApp = useMemo(() => {
    if (!connectedApps) {
      return
    }

    const [, , currentAppAddress] = location.split('/')
    return connectedApps.find(connectedApp =>
      addressesEqual(connectedApp['_app']?.address, currentAppAddress)
    )
  }, [connectedApps, location])

  const loading =
    orgStatus.loading ||
    appsStatus.loading ||
    permissionsStatus.loading ||
    connectedAppsStatus.loading
  const error =
    orgStatus.error ||
    appsStatus.error ||
    permissionsStatus.error ||
    connectedAppsStatus.error

  return (
    <OrganizationContext.Provider
      value={{
        organization: org,
        apps,
        connection: org?.connection,
        connectedApps,
        currentConnectedApp,
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
