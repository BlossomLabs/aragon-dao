import { Tabs } from '@aragon/ui'
import React, { useState } from 'react'
import Convert from './Convert'

function WrapUnwrap({ getTransactions }) {
  const [screenIndex, setScreenIndex] = useState(0)

  const mode = screenIndex === 0 ? 'wrap' : 'unwrap'

  return (
    <div>
      <Tabs
        items={['Wrap', 'Unwrap']}
        selected={screenIndex}
        onChange={setScreenIndex}
      />

      <Convert mode={mode} getTransactions={getTransactions} />
    </div>
  )
}

export default WrapUnwrap
