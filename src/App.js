import React from 'react'
import { HashRouter } from 'react-router-dom'
import { GU, Main, ScrollView, Root } from '@aragon/ui'
import { ConnectProvider as Connect } from './providers/Connect'
import { OrganizationProvider } from './providers/OrganizationProvider'
import useGuiStyle from './hooks/shared/useGuiStyle'
import MainView from './components/MainView'
import Router from './routes/Router'
import MenuPanel from './components/MenuPanel/MenuPanel'
import Header from './components/Header/Header'

import { WalletProvider } from './providers/Wallet'

const RootProvider = Root.Provider

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
                <div id="HELLO" css="position: relative; z-index: 0">
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
                        display: flex;
                        flex-direction: column;
                        position: relative;
                        height: 100%;
                        width: 100%;
                      `}
                    >
                      <Header
                        css={`
                          position: relative;
                          z-index: 1;
                          flex-shrink: 0;
                        `}
                      />
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

                          <div
                            css={`
                              position: relative;
                              z-index: 1;
                              flex-grow: 1;
                              overflow: hidden;
                            `}
                          >
                            <ScrollView>
                              <Router />
                            </ScrollView>
                          </div>
                        </div>
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
