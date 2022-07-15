import { getPreferredChain } from '../local-settings'

const DEFAULT_LOCAL_CHAIN = ''

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
