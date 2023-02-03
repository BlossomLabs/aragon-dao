import React, { createContext, useCallback, useContext } from 'react'
import { useOrganizationState } from './OrganizationProvider'
import connectVoting from '@blossom-labs/connect-bl-tao-voting'
import connectTokenWrapper from '@blossom-labs/connect-token-wrapper'
import connectFinance from '@blossom-labs/connect-finance'
import { connectANDelay } from '@blossom-labs/connect-an-delay'
import { usePath } from '@/hooks/shared'
import { isAddress } from 'ethers/lib/utils'
import { addressesEqual } from '@/utils/web3-utils'
import { useConnect } from '@1hive/connect-react'

const AppConnectorContext = createContext()

const getConnector = appName => {
  switch (appName) {
    case 'blossom-tao-voting':
      return connectVoting
    case 'an-delay':
    case 'delay':
      return connectANDelay
    case 'blossom-token-wrapper':
      return connectTokenWrapper
    case 'finance':
      return connectFinance
  }
}

const CONNECTED_APPS_CACHE = {}

async function loadOrCreateConnectedApp(appAddress, apps) {
  if (!apps) {
    return
  }

  if (appAddress && CONNECTED_APPS_CACHE[appAddress]) {
    return CONNECTED_APPS_CACHE[appAddress]
  }

  if (!isAddress(appAddress)) {
    return
  }

  const app = apps.find(app => addressesEqual(app.address, appAddress))
  const connect = getConnector(app.name)

  if (!app || !connect) {
    return
  }

  const connectedApp = await connect(app)

  CONNECTED_APPS_CACHE[appAddress] = connectedApp

  return connectedApp
}

function ConnectedAppProvider({ children }) {
  const [path] = usePath()

  const { apps } = useOrganizationState()
  const [connectedApp, connectedAppStatus] = useConnect(() => {
    const [, , currentAppAddress] = path.split('/')
    return loadOrCreateConnectedApp(currentAppAddress, apps)
  }, [apps, path])

  const getConnectedApp = useCallback(
    appAddress => {
      return loadOrCreateConnectedApp(appAddress, apps)
    },
    [apps]
  )

  return (
    <AppConnectorContext.Provider
      value={{ connectedApp, connectedAppStatus, getConnectedApp }}
    >
      {children}
    </AppConnectorContext.Provider>
  )
}

function useConnectedApp() {
  return useContext(AppConnectorContext)
}

export { ConnectedAppProvider, useConnectedApp }
