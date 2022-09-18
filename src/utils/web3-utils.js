import { ethers, providers as Providers } from 'ethers'
import { getPreferredChain } from '../local-settings'

const DEFAULT_LOCAL_CHAIN = ''
const networks = {
  xdai: {
    chainId: 100,
    ensRegistry: '0xaafca6b0c89521752e559650206d7c925fd0e530',
    name: 'Gnosis Chain',
    type: 'xdai',
    defaultEthNode: 'https://rpc.gnosischain.com',
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

export function getNetworkName(chainId = getPreferredChain()) {
  chainId = String(chainId)

  if (chainId === '1') return 'Mainnet'
  if (chainId === '4') return 'Rinkeby'
  if (chainId === '100') return 'Gnosis'
  if (chainId === '137') return 'Polygon'

  return 'unknown'
}

/**
 * Shorten an Ethereum address. `charsLength` allows to change the number of
 * characters on both sides of the ellipsis.
 *
 * Examples:
 *   shortenAddress('0x19731977931271')    // 0x1973…1271
 *   shortenAddress('0x19731977931271', 2) // 0x19…71
 *   shortenAddress('0x197319')            // 0x197319 (already short enough)
 *
 * @param {string} address The address to shorten
 * @param {number} [charsLength=4] The number of characters to change on both sides of the ellipsis
 * @returns {string} The shortened address
 */
export function shortenAddress(address, charsLength = 4) {
  const prefixLength = 2 // "0x"
  if (!address) {
    return ''
  }
  if (address.length < charsLength * 2 + prefixLength) {
    return address
  }
  return (
    address.slice(0, charsLength + prefixLength) +
    '…' +
    address.slice(-charsLength)
  )
}

export function getUseWalletProviders() {
  const providers = [{ id: 'injected' }, { id: 'frame' }]

  return providers
}

export function getUseWalletConnectors() {
  return getUseWalletProviders().reduce((connectors, provider) => {
    if (provider.useWalletConf) {
      connectors[provider.id] = provider.useWalletConf
    }
    return connectors
  }, {})
}

export function getDefaultProvider(chainId = getPreferredChain()) {
  const { defaultEthNode, type } = getNetwork(chainId)

  return defaultEthNode
    ? new Providers.StaticJsonRpcProvider(defaultEthNode)
    : ethers.getDefaultProvider(type, 'x')
}
