import React, { useCallback, useState } from 'react'
import { GU, Button, IconPlus, useViewport } from '@aragon/ui'
import Balances from './components/Balances'
import Transfers from './components/Transfers'
import useBalances from './hooks/useBalances'
import NoTransfers from './components/NoTransfers'
import MultiModal from '@/components/MultiModal/MultiModal'
import NewTransferScreens from './components/ModalFlows/NewTransferScreens'
import AppHeader from '@/components/AppHeader'
import { useWallet } from '@/providers/Wallet'

const App = () => {
  const { account } = useWallet()
  const { below } = useViewport()
  const compactMode = below('medium')

  const [tokenBalances, { loading: loadingTokens }] = useBalances()
  const [modalVisible, setModalVisible] = useState(false)

  const handleShowModal = useCallback(() => {
    setModalVisible(true)
  }, [])

  const handleHideModal = useCallback(() => {
    setModalVisible(false)
  }, [])

  return (
    <>
      {loadingTokens ? (
        <div
          css={`
            height: calc(100vh - ${8 * GU}px);
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <NoTransfers isSyncing={loadingTokens} />
        </div>
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

export default App
