import React, { useCallback, useState } from 'react'
import { Main, Split, SyncIndicator, GU } from '@aragon/ui'
import { IdentityProvider } from './components/IdentityManager/IdentityManager'
import {
  TokenWrapperProvider,
  useAppState,
} from './providers/TokenWrapperProvider'
import MultiModal from '../components/MultiModal/MultiModal'
import useGuiStyle from './hooks/useGuiStyle'
import { AppLogicProvider, useAppLogic } from './app-logic'
import NoWrappedTokens from './screens/NoWrappedTokens'
import Holders from './screens/Holders'
import Panel from './components/ActionsPanel'
import AppHeader from './components/AppHeader'
import InfoBox from './components/InfoBox'
import WrapTokenScreens from './components/ModalFlows/WrapTokenScreens/WrapTokenScreens'

function App() {
  const [modalMode, setModalMode] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const { appearance } = useGuiStyle()
  const { depositedToken, holders, isSyncing, wrappedToken } = useAppState()
  const { actions, wrapTokensPanel, unwrapTokensPanel } = useAppLogic()

  const appStateReady = depositedToken.id && wrappedToken.id
  const showHolders = appStateReady && holders && holders.length > 0

  const handleShowModal = useCallback(mode => {
    setModalVisible(true)
    setModalMode(mode)
  }, [])

  const handleWrapToken = useCallback(() => {
    handleShowModal('wrap')
  }, [handleShowModal])

  const handleUnwrapToken = useCallback(() => {
    handleShowModal('unwrap')
  }, [handleShowModal])

  const handleHideModal = useCallback(() => {
    setModalVisible(false)
  }, [])

  return (
    <Main theme={appearance}>
      {showHolders && <SyncIndicator visible={isSyncing} />}
      <AppHeader
        onWrapHolder={showHolders ? handleWrapToken : null}
        tokenSymbol={wrappedToken && wrappedToken.symbol}
      />
      <Split
        primary={
          showHolders ? (
            <Holders
              holders={holders}
              onUnwrapTokens={unwrapTokensPanel.requestOpen}
              wrappedToken={wrappedToken}
            />
          ) : (
            <NoWrappedTokens
              isSyncing={isSyncing}
              onWrapTokens={appStateReady ? wrapTokensPanel.requestOpen : null}
            />
          )
        }
        secondary={
          appStateReady && (
            <InfoBox
              depositedToken={depositedToken}
              wrappedToken={wrappedToken}
            />
          )
        }
      />

      {appStateReady && (
        <React.Fragment>
          <Panel
            action="Wrap"
            depositedToken={depositedToken}
            info={
              <React.Fragment>
                <p>
                  Wrap {depositedToken.symbol} into an ERC20-compliant token
                  used for governance within this organization.
                </p>
                <p
                  css={`
                    margin-top: ${1 * GU}px;
                  `}
                >
                  1 {depositedToken.symbol} = 1 {wrappedToken.symbol}.
                </p>
              </React.Fragment>
            }
            onAction={actions.wrapTokens}
            panelState={wrapTokensPanel}
            wrappedToken={wrappedToken}
          />
          <Panel
            action="Unwrap"
            depositedToken={depositedToken}
            info={`Recover your ${depositedToken.symbol} by unwrapping ${wrappedToken.symbol}.`}
            onAction={actions.unwrapTokens}
            panelState={unwrapTokensPanel}
            wrappedToken={wrappedToken}
          />
        </React.Fragment>
      )}
      <MultiModal
        visible={modalVisible}
        onClose={handleHideModal}
        onClosed={() => setModalMode(null)}
      >
        <WrapTokenScreens mode={modalMode} />
      </MultiModal>
    </Main>
  )
}

export default function TokenWrapper() {
  return (
    <AppLogicProvider>
      <TokenWrapperProvider>
        <IdentityProvider>
          <App />
        </IdentityProvider>
      </TokenWrapperProvider>
    </AppLogicProvider>
  )
}
