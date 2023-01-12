import React from 'react'
import { Connect } from '@1hive/connect-react'

function ConnectProvider({ children }) {
  return (
    <Connect
      location={'aragondaodemofinalthistimeforreal.aragonid.eth'}
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
