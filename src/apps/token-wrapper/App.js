import React, { useCallback, useState } from 'react'
import {
  TokenWrapperProvider,
  useAppState,
} from './providers/TokenWrapperProvider'
import MultiModal from '@/components/MultiModal/MultiModal'
import NoWrappedTokens from './screens/NoWrappedTokens'
import Holders from './screens/Holders'
import AppHeader from './components/AppHeader'
import InfoBox from './components/InfoBox'
import WrapTokenScreens from './components/ModalFlows/WrapTokenScreens/WrapTokenScreens'
import LayoutColumns from '@/components/Layout/LayoutColumns'
import LoadingAppScreen from '@/components/Loading/LoadingAppScreen'
import { useWait } from '@/hooks/shared/useWait'

function App() {
  const [modalMode, setModalMode] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const { depositedToken, holders, isSyncing, wrappedToken } = useAppState()
  const isWaiting = useWait()

  const appStateReady = depositedToken.id && wrappedToken.id
  const showHolders = appStateReady && holders && holders.length > 0
  const isLoading = isSyncing || isWaiting

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
    <>
      {isLoading ? (
        <LoadingAppScreen isLoading={isLoading} />
      ) : (
        <React.Fragment>
          <AppHeader
            onWrapHolder={showHolders ? handleWrapToken : null}
            onUnwrapTokens={handleUnwrapToken}
            tokenSymbol={wrappedToken && wrappedToken.symbol}
          />
          <LayoutColumns
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
        </React.Fragment>
      )}

      <MultiModal
        visible={modalVisible}
        onClose={handleHideModal}
        onClosed={() => setModalMode(null)}
      >
        <WrapTokenScreens mode={modalMode} />
      </MultiModal>
    </>
  )
}

export default function TokenWrapper() {
  return (
    <TokenWrapperProvider>
      <App />
    </TokenWrapperProvider>
  )
}
