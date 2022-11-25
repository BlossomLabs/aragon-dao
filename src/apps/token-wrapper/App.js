import React, { useCallback, useState } from 'react'
import { Main, Split, SyncIndicator } from '@aragon/ui'
import { IdentityProvider } from './components/IdentityManager/IdentityManager'
import {
  TokenWrapperProvider,
  useAppState,
} from './providers/TokenWrapperProvider'
import MultiModal from '@/components/MultiModal/MultiModal'
import useGuiStyle from './hooks/useGuiStyle'
import NoWrappedTokens from './screens/NoWrappedTokens'
import Holders from './screens/Holders'
import AppHeader from './components/AppHeader'
import InfoBox from './components/InfoBox'
import WrapTokenScreens from './components/ModalFlows/WrapTokenScreens/WrapTokenScreens'

function App() {
  const [modalMode, setModalMode] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const { appearance } = useGuiStyle()
  const { depositedToken, holders, isSyncing, wrappedToken } = useAppState()

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
              onUnwrapTokens={handleUnwrapToken}
              wrappedToken={wrappedToken}
            />
          ) : (
            <NoWrappedTokens
              isSyncing={isSyncing}
              onWrapTokens={appStateReady ? handleWrapToken : null}
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
    <TokenWrapperProvider>
      <IdentityProvider>
        <App />
      </IdentityProvider>
    </TokenWrapperProvider>
  )
}
