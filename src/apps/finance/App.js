import React, { useCallback, useState } from 'react'
import { Button, IconPlus, useViewport } from '@aragon/ui'
import Balances from './components/Balances'
import Transfers from './components/Transfers'
import useVaultTokens from './hooks/useVaultTokens'
import MultiModal from '@/components/MultiModal/MultiModal'
import NewTransferScreens from './components/ModalFlows/NewTransferScreens'
import AppHeader from '@/components/AppHeader'
import { useWallet } from '@/providers/Wallet'
import LoadingAppScreen from '@/components/Loading/LoadingAppScreen'

const App = () => {
  const { account } = useWallet()
  const { below } = useViewport()
  const compactMode = below('medium')

  const [vaultTokens, { loading: loadingVaultTokens }] = useVaultTokens()
  const [modalVisible, setModalVisible] = useState(false)

  const handleShowModal = useCallback(() => {
    setModalVisible(true)
  }, [])

  const handleHideModal = useCallback(() => {
    setModalVisible(false)
  }, [])

  return (
    <>
      {!vaultTokens ? (
        <LoadingAppScreen isLoading={loadingVaultTokens || !vaultTokens} />
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
          <Balances tokenBalances={vaultTokens} />
          <Transfers tokens={vaultTokens} />
        </>
      )}

      <MultiModal visible={modalVisible} onClose={handleHideModal}>
        <NewTransferScreens tokens={vaultTokens} opened={modalVisible} />
      </MultiModal>
    </>
  )
}

function AppWrapper() {
  return <App />
}

export default AppWrapper
