import { useConnect } from '@1hive/connect-react'
import React, { useContext, useEffect, useState } from 'react'
import { useMounted } from '../../hooks/shared/useMounted'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { useDelayedScripts } from '../hooks/useDelayedScripts'

const ANDelayContext = React.createContext()

const ANDelayProvider = ({ children }) => {
  const [executionDelay, setExecutionDelay] = useState()
  const mounted = useMounted()
  const { connectedANDelayApp } = useOrganizationState()
  const [appData, appDataStatus] = useConnect(
    () => connectedANDelayApp.appData(),
    [connectedANDelayApp]
  )
  const loading = appDataStatus.loading
  const error = appDataStatus.error
  const [delayedScripts, status] = useDelayedScripts()

  useEffect(() => {
    if (!mounted() || loading || error) {
      return
    }

    setExecutionDelay(parseInt(appData.executionDelay))
  }, [appData, error, loading, mounted])

  return (
    <ANDelayContext.Provider
      value={{
        executionDelay,
        delayedScripts,
        executionTargets: [],
        loading: loading || status.loading,
      }}
    >
      {children}
    </ANDelayContext.Provider>
  )
}

const useAppState = () => {
  return useContext(ANDelayContext)
}

export { ANDelayProvider, useAppState }
