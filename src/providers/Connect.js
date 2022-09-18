import React from 'react'
import { Connect } from '@rperez89/connect-react'

function ConnectProvider({ children }) {
  return (
    <Connect
      location={'0x8ccbeab14b5ac4a431fffc39f4bec4089020a155'} // {'rodrigotest.aragonid.eth'} // for testing purpose.
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
