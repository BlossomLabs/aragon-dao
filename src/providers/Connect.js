import React from 'react'
import { Connect } from '@aragon/connect-react'

function ConnectProvider({ children }) {
  return (
    <Connect
      location={'0xbaf2eb7b0649b8c28970e7d9e8f5dee9b6f6d9fe'} // for testing purpose.
      connector="thegraph"
    >
      {children}
    </Connect>
  )
}

export { ConnectProvider }
