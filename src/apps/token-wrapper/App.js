import React, { useCallback, useState } from 'react'
import {
  TokenWrapperProvider,
  useAppState,
} from './providers/TokenWrapperProvider'
import MultiModal from '@/components/MultiModal/MultiModal'
import Holders from './screens/Holders'
import AppHeader from './components/AppHeader'
import InfoBox from './components/InfoBox'
import WrapTokenScreens from './components/ModalFlows/WrapTokenScreens/WrapTokenScreens'
import LayoutColumns from '@/components/Layout/LayoutColumns'
import LoadingAppScreen from '@/components/Loading/LoadingAppScreen'
import { useWait } from '@/hooks/shared/useWait'

function App() {
  const [modalVisible, setModalVisible] = useState(false)
  const { depositedToken, holders, isSyncing, wrappedToken } = useAppState()
  const isWaiting = useWait()

  const appStateReady = depositedToken?.id && wrappedToken?.id
  const isLoading = isSyncing || isWaiting

  const handleShowModal = useCallback(() => {
    setModalVisible(true)
  }, [])

  const handleConvertTokens = useCallback(() => {
    handleShowModal()
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
            onConvertTokens={handleConvertTokens}
            tokenSymbol={wrappedToken && wrappedToken.symbol}
          />
          <LayoutColumns
            primary={<Holders holders={holders} wrappedToken={wrappedToken} />}
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

      <MultiModal visible={modalVisible} onClose={handleHideModal}>
        <WrapTokenScreens />
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
