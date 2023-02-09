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
import { FeeProvider } from '@/providers/Fee'

const App = () => {
  const { account } = useWallet()
  const { below } = useViewport()
  const compactMode = below('medium')

  const [tokenBalances, { loading: loadingTokens, error }] = useBalances()
  const [modalVisible, setModalVisible] = useState(false)

  const handleShowModal = useCallback(() => {
    setModalVisible(true)
  }, [])

  const handleHideModal = useCallback(() => {
    setModalVisible(false)
  }, [])

  console.log(tokenBalances)
  console.log(loadingTokens)
  console.log(error)
  console.log('-------------------------------')

  return (
    <>
      {loadingTokens ? (
        <LoadingAppScreen isLoading={loadingTokens} />
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
          <Balances tokenBalances={tokenBalances} loading={loadingTokens} />
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
  return (
    <FeeProvider>
      <App />
    </FeeProvider>
  )
}

export default AppWrapper
