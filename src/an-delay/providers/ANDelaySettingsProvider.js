import { useConnect } from '@1hive/connect-react'
import React, { useContext, useEffect, useState } from 'react'
import { useMounted } from '../../hooks/shared/useMounted'
import { useOrganizationState } from '../../providers/OrganizationProvider'

const ANDelayContext = React.createContext()

const ANDelaySettingsProvider = ({ children }) => {
  const [executionDelay, setExecutionDelay] = useState()
  const mounted = useMounted()
  const { connectedANDelayApp } = useOrganizationState()
  const [appData, appDataStatus] = useConnect(
    () => connectedANDelayApp.appData(),
    [connectedANDelayApp]
  )
  const loading = appDataStatus.loading
  const error = appDataStatus.error

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
        loading,
        error,
      }}
    >
      {children}
    </ANDelayContext.Provider>
  )
}

const useANDelaySettings = () => {
  return useContext(ANDelayContext)
}

export { ANDelaySettingsProvider, useANDelaySettings }
