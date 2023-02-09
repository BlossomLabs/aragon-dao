import { env } from '@/environment'

export const connectors = [
  {
    id: 'injected',
    properties: {
      chainId: [env('CHAIN_ID')], // add here to handle more injected chains
    },
  },
  {
    id: 'frame',
    properties: {
      chainId: env('CHAIN_ID'),
    },
  },
  {
    id: 'walletconnect',
    properties: {
      chainId: [env('CHAIN_ID')], // add here to handle more injected chains
      rpc: {
        [env('CHAIN_ID')]: env('STATIC_ETH_NODE'),
      },
    },
  },
].filter(p => p)

// the final data that we pass to use-wallet package.
export const useWalletConnectors = connectors.reduce((current, connector) => {
  current[connector.id] = connector.properties || {}
  return current
}, {})
