import React, { useCallback, useState } from 'react'
import { GU, Button, Header, IconPlus, Main } from '@aragon/ui'
import { useGuiStyle } from '@/hooks/shared'
import Balances from './components/Balances'
import Transfers from './components/Transfers'
import useBalances from './hooks/useBalances'
import NoTransfers from './components/NoTransfers'
import MultiModal from '@/components/MultiModal/MultiModal'
import NewTransferScreens from './components/ModalFlows/NewTransferScreens'

const App = () => {
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
          <Header
            primary="Finance"
            secondary={
              <Button
                mode="strong"
                onClick={handleShowModal}
                label="New transfer"
                icon={<IconPlus />}
              />
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

export default () => {
  const { appearance } = useGuiStyle()
  return (
    <Main theme={appearance} assetsUrl="./aragon-ui">
      <App />
    </Main>
  )
}
