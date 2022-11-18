import React from 'react'
import { HashRouter } from 'react-router-dom'
import { GU, Main } from '@aragon/ui'
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
                  <div
                    css={`
                      display: flex;
                      flex-direction: column;
                      position: relative;
                      z-index: 0;
                      height: 100vh;
                      min-width: ${45 * GU}px;
                    `}
                  >
                    <div
                      css={`
                        flex-grow: 1;
                        overflow-y: hidden;
                        margin-top: 2px;
                      `}
                    >
                      <div
                        css={`
                          display: flex;
                          height: 100%;
                        `}
                      >
                        <MenuPanel />

                        <Router />
                      </div>
                    </div>
                  </div>
                </div>
              </MainView>
            </Main>
          </OrganizationProvider>
        </WalletProvider>
      </Connect>
    </HashRouter>
  )
}

export default App
