import React from 'react'
import { Connect } from '@1hive/connect-react'

function ConnectProvider({ children }) {
  return (
    <Connect
      location={'0xa30c833cb5da03259c7dfbe6a3d0281d9f3b9ea4'} // {'rodrigotest.aragonid.eth'} // for testing purpose.
      connector="thegraph"
      options={{
        network: 100,
      }}
    >
      {children}
    </Connect>
  )
}

export { ConnectProvider }
