import React from 'react'
import { HashRouter } from 'react-router-dom'
import { Main } from '@aragon/ui'
import { ConnectProvider as Connect } from './providers/Connect'
import { OrganizationProvider } from './providers/OrganizatioProvider'
import useGuiStyle from './hooks/shared/useGuiStyle'
import Router from './routes/Router'

function App() {
  const { appearance } = useGuiStyle()
  return (
    <HashRouter>
      <Connect>
        <OrganizationProvider>
          <Main theme={appearance} assetsUrl="./aragon-ui">
            <Router />
          </Main>
        </OrganizationProvider>
      </Connect>
    </HashRouter>
  )
}

export default App
