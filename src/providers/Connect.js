import React from 'react'
import { Connect } from '@aragon/connect-react'

function ConnectProvider({ children }) {
  return (
    <Connect
      location={'rodrigotest.aragonid.eth'} // for testing purpose.
      connector="thegraph"
      options={{
        network: 4,
      }}
    >
      {children}
    </Connect>
  )
}

export { ConnectProvider }
