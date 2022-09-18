import { getPreferredChain } from '../local-settings'

const DEFAULT_LOCAL_CHAIN = ''
const networks = {
  xdai: {
    chainId: 100,
    ensRegistry: '0xaafca6b0c89521752e559650206d7c925fd0e530',
    name: 'Gnosis Chain',
    type: 'xdai',
    defaultEthNode: 'https://rpc.xdaichain.com',
  },
}

export function getNetworkType(chainId = getPreferredChain()) {
  chainId = String(chainId)

  if (chainId === '1') return 'mainnet'
  if (chainId === '4') return 'rinkeby'
  if (chainId === '100') return 'xdai'
  if (chainId === '137') return 'polygon'

  return DEFAULT_LOCAL_CHAIN
}

export function isLocalOrUnknownNetwork(chainId = getPreferredChain()) {
  return getNetworkType(chainId) === DEFAULT_LOCAL_CHAIN
}

function getNetworkInternalName(chainId = getPreferredChain()) {
  return isLocalOrUnknownNetwork(chainId) ? 'local' : getNetworkType(chainId)
}

export function getNetwork(chainId = getPreferredChain()) {
  return networks[getNetworkInternalName(chainId)]
}
