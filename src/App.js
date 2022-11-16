import React from 'react'
import { HashRouter } from 'react-router-dom'
import { Main } from '@aragon/ui'
import { ConnectProvider as Connect } from './providers/Connect'
import { OrganizationProvider } from './providers/OrganizationProvider'
import useGuiStyle from './hooks/shared/useGuiStyle'
import MainView from './components/MainView'
import Router from './routes/Router'
import MenuPanel from './components/MenuPanel/MenuPanel'

import { WalletProvider } from './providers/Wallet'

function App() {
  const { appearance } = useGuiStyle()
  return (
    <HashRouter>
      <Connect>
        <WalletProvider>
          <OrganizationProvider>
            <Main
              assetsUrl="/aragon-ui/"
              layout={false}
              scrollView={false}
              theme={appearance}
            >
              <MainView>
                <div css="position: relative; z-index: 0">
                  <MenuPanel />
                </div>
                <Router />
              </MainView>
            </Main>
          </OrganizationProvider>
        </WalletProvider>
      </Connect>
    </HashRouter>
  )
}

export default App
