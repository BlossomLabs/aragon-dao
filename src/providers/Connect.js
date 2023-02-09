import React from 'react'
import { Connect } from '@1hive/connect-react'
import { env } from '@/environment'
import { getStaticProvider } from '@/utils/web3-utils'

function ConnectProvider({ children }) {
  return (
    <Connect
      location={env('DAO_ID')}
      connector="thegraph"
      options={{
        network: env('CHAIN_ID'),
        ipfs:
          env('IPFS_RESOLVER') ||
          'https://ipfs.blossom.software/ipfs/{cid}{path}',
        ethereum: getStaticProvider(),
      }}
    >
      {children}
    </Connect>
  )
}

export { ConnectProvider }
