import React from 'react'
import { Connect } from '@1hive/connect-react'

if (!process.env.DAO_ID) {
  throw new Error('Missing DAO_ID env variable')
}

function ConnectProvider({ children }) {
  return (
    <Connect
      location={process.env.DAO_ID}
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
