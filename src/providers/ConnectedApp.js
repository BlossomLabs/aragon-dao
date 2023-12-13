import React, { createContext, useContext } from 'react'
import connectVoting from '@blossom-labs/connect-bl-tao-voting'
import connectFinance from '@blossom-labs/connect-finance'
import { connectANDelay } from '@blossom-labs/connect-an-delay'
import { isAddress } from 'ethers/lib/utils'
import { addressesEqual } from '@/utils/web3-utils'
import { useConnect } from '@1hive/connect-react'
import { useCurrentApp } from '@/hooks/shared/useCurrentApp'

const AppConnectorContext = createContext()

const getConnector = appName => {
  switch (appName) {
    case 'blossom-tao-voting':
      return connectVoting
    case 'an-delay':
    case 'delay':
      return connectANDelay
    case 'finance':
      return connectFinance
  }
}

const CONNECTED_APPS_CACHE = {}

async function lazyFetchConnectedApp(app) {
  const connect = getConnector(app.name)

  if (!app || !connect) {
    return
  }

  const connectedApp = await connect(app)

  CONNECTED_APPS_CACHE[app.address] = connectedApp

  return connectedApp
}

async function lazyFetchConnectedAppByAddress(appAddress, apps) {
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

  return lazyFetchConnectedApp(app)
}

function ConnectedAppProvider({ children }) {
  const currentApp = useCurrentApp()
  const [connectedApp, connectedAppStatus] = useConnect(() => {
    if (!currentApp) {
      return
    }
    return lazyFetchConnectedApp(currentApp)
  }, [currentApp])

  return (
    <AppConnectorContext.Provider value={{ connectedApp, connectedAppStatus }}>
      {children}
    </AppConnectorContext.Provider>
  )
}

function useConnectedApp() {
  return useContext(AppConnectorContext)
}

export {
  ConnectedAppProvider,
  useConnectedApp,
  lazyFetchConnectedAppByAddress,
  lazyFetchConnectedApp,
}
