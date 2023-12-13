import React, { useCallback, useState } from 'react'
import { Button, IconPlus, useViewport } from '@aragon/ui'
import Balances from './components/Balances'
import Transfers from './components/Transfers'
import useBalances from './hooks/useBalances'
import MultiModal from '@/components/MultiModal/MultiModal'
import NewTransferScreens from './components/ModalFlows/NewTransferScreens'
import AppHeader from '@/components/AppHeader'
import { useWallet } from '@/providers/Wallet'
import LoadingAppScreen from '@/components/Loading/LoadingAppScreen'

const App = () => {
  const { account } = useWallet()
  const { below } = useViewport()
  const compactMode = below('medium')

  const [tokenBalances, { loading: loadingTokenBalances }] = useBalances()
  const [modalVisible, setModalVisible] = useState(false)

  const handleShowModal = useCallback(() => {
    setModalVisible(true)
  }, [])

  const handleHideModal = useCallback(() => {
    setModalVisible(false)
  }, [])

  return (
    <>
      {!tokenBalances ? (
        <LoadingAppScreen isLoading={loadingTokenBalances || !tokenBalances} />
      ) : (
        <>
          <AppHeader
            primary="Finance"
            secondary={
              account && (
                <Button
                  mode="strong"
                  onClick={handleShowModal}
                  label="New transfer"
                  icon={<IconPlus />}
                  display={compactMode ? 'icon' : 'label'}
                />
              )
            }
          />
          <Balances tokenBalances={tokenBalances} />
          <Transfers tokens={tokenBalances} />
        </>
      )}

      <MultiModal visible={modalVisible} onClose={handleHideModal}>
        <NewTransferScreens tokens={tokenBalances} opened={modalVisible} />
      </MultiModal>
    </>
  )
}

function AppWrapper() {
  return <App />
}

export default AppWrapper
