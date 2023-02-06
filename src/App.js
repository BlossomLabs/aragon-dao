import React, { useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { GU, Main, ScrollView, useViewport } from '@aragon/ui'
import { SafeProvider } from '@safe-global/safe-apps-react-sdk'
import { ConnectProvider as Connect } from './providers/Connect'
import { OrganizationProvider } from './providers/OrganizationProvider'
import MainView from './components/MainView'
import Router from './routes/Router'
import MenuPanel from './components/MenuPanel/MenuPanel'
import Header from './components/Header/Header'

import { WalletProvider } from './providers/Wallet'
import { ConnectedAppProvider } from './providers/ConnectedApp'
import { GuardianProvider } from './providers/Guardian'
import { ErrorHandler } from './components/Error/ErrorHandler'
import { useAppTheme } from './providers/AppTheme'

function App() {
  const { below } = useViewport()
  const autoClosingPanel = below('medium')
  const [menuPanelOpen, setMenuPanelOpen] = useState(!autoClosingPanel)

  return (
    <div css="position: relative; z-index: 0">
      <div
        css={`
          display: flex;
          flex-direction: column;
          position: relative;
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
            showMenu={autoClosingPanel}
            onMenuClick={() => setMenuPanelOpen(opened => !opened)}
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
              <MenuPanel
                autoClosing={autoClosingPanel}
                opened={menuPanelOpen}
                onMenuPanelClose={() => setMenuPanelOpen(false)}
                onOpenApp={() =>
                  autoClosingPanel ? setMenuPanelOpen(false) : undefined
                }
                css={`
                  z-index: 3;
                `}
              />

              <div
                css={`
                  position: relative;
                  z-index: 1;
                  flex-grow: 1;
                  overflow: hidden;
                `}
              >
                <ScrollView>
                  <ConnectedAppProvider>
                    <Router />
                  </ConnectedAppProvider>
                </ScrollView>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppWrapper() {
  const { appearance } = useAppTheme()

  return (
    <HashRouter>
      <SafeProvider>
        <Connect>
          <WalletProvider>
            <OrganizationProvider>
              <GuardianProvider>
                <Main
                  assetsUrl="/aragon-ui/"
                  layout={false}
                  scrollView={false}
                  theme={appearance}
                >
                  <MainView>
                    <ErrorHandler>
                      <App />
                    </ErrorHandler>
                  </MainView>
                </Main>
              </GuardianProvider>
            </OrganizationProvider>
          </WalletProvider>
        </Connect>
      </SafeProvider>
    </HashRouter>
  )
}

export default AppWrapper
