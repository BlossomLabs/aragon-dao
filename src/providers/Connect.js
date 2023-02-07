import React from 'react'
import { Connect } from '@1hive/connect-react'
import { env } from '@/environment'

function ConnectProvider({ children }) {
  return (
    <Connect
      location={env('DAO_ID')}
      connector="thegraph"
      options={{
        network: env('CHAIN_ID'),
        ipfs: env('IPFS_RESOLVER') || "https://ipfs.blossom.software/ipfs/{cid}{path}"
      }}
    >
      {children}
    </Connect>
  )
}

export { ConnectProvider }
