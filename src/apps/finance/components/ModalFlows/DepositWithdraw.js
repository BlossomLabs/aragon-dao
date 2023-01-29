import React, { useState } from 'react'
import styled from 'styled-components'
import { SidePanel, Tabs, GU } from '@aragon/ui'
import Deposit from './Deposit'
import Withdrawal from './Withdrawal'

const PanelContent = ({ onWithdraw, onDeposit, opened, tokens }) => {
  const [screenIndex, setScreenIndex] = useState(0)

  return (
    <div>
      <TabsWrapper>
        <Tabs
          items={['Deposit', 'Withdrawal']}
          selected={screenIndex}
          onChange={setScreenIndex}
        />
      </TabsWrapper>

      {screenIndex === 0 && (
        <Deposit opened={opened} tokens={tokens} onDeposit={onDeposit} />
      )}
      {screenIndex === 1 && (
        <Withdrawal tokens={tokens} onWithdraw={onWithdraw} />
      )}
    </div>
  )
}

const TabsWrapper = styled.div`
  margin: 0 -${SidePanel.HORIZONTAL_PADDING}px ${3 * GU}px;
`

export default PanelContent
