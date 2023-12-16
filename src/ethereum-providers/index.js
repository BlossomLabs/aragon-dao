import { env } from '@/environment'
import { getNetwork } from '@/utils/web3-utils'
import { providers } from 'ethers'

const CHAIN_ID = env('CHAIN_ID')
const ALCHEMY_API_KEY = env('ALCHEMY_API_KEY')
const INFURA_API_KEY = env('INFURA_API_KEY')
const POCKET_API_KEY = env('POCKET_API_KEY')
const ANKR_API_KEY = env('ANKR_API_KEY')

function getProviderRPCUrl() {
  const { type, chainId, ensAddress } = getNetwork()

  const ethersNetwork = {
    name: type,
    chainId,
    ensAddress,
  }

  if (ALCHEMY_API_KEY) {
    return providers.AlchemyProvider.getUrl(ethersNetwork, ALCHEMY_API_KEY).url
  }

  if (INFURA_API_KEY) {
    return providers.InfuraProvider.getUrl(ethersNetwork, INFURA_API_KEY).url
  }

  if (POCKET_API_KEY) {
    return providers.PocketProvider.getUrl(ethersNetwork, POCKET_API_KEY).url
  }

  if (ANKR_API_KEY) {
    return providers.AnkrProvider.getUrl(ethersNetwork, ANKR_API_KEY).url
  }

  console.warn('No provider API key found. WalletConnect will not work.')

  return ''
}

export const connectors = [
  {
    id: 'injected',
    properties: {
      chainId: [CHAIN_ID], // add here to handle more injected chains
    },
  },
  {
    id: 'frame',
    properties: {
      chainId: CHAIN_ID,
    },
  },
  {
    id: 'walletconnect',
    properties: {
      chainId: [CHAIN_ID], // add here to handle more injected chains
      rpc: {
        [`${CHAIN_ID}`]: getProviderRPCUrl(),
      },
    },
  },
].filter(p => p)

// the final data that we pass to use-wallet package.
export const useWalletConnectors = connectors.reduce((current, connector) => {
  current[connector.id] = connector.properties || {}
  return current
}, {})
