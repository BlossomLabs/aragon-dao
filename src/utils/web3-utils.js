import { ethers, providers as Providers } from 'ethers'
import { env } from '@/environment'
import {
  ARBISCAN_NETWORK_TYPES,
  ARBISCAN_TYPES,
  BLOCKSCOUT_NETWORK_TYPES,
  BLOCKSCOUT_TYPES,
  ETHERSCAN_NETWORK_TYPES,
  ETHERSCAN_TYPES,
  POLYGONSCAN_NETWORK_TYPES,
  POLYGONSCAN_TYPES,
} from './provider-types'

const DEFAULT_LOCAL_CHAIN = ''

const networks = {
  xdai: {
    chainId: 100,
    ensRegistry: '0xaafca6b0c89521752e559650206d7c925fd0e530',
    name: 'Gnosis Chain',
    type: 'xdai',
    defaultEthNode: 'https://rpc.gnosis.gateway.fm/',
    explorer: 'blockscout',
    nativeToken: 'Xdai',
  },
  main: {
    chainId: 1,
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    name: 'Mainnet',
    type: 'main',
    defaultEthNode: 'https://eth-rpc.gateway.pokt.network',
    explorer: 'etherscan',
    nativeToken: 'ETH',
  },
}

const ETH_ADDRESS_SPLIT_REGEX = /(0x[a-fA-F0-9]{40}(?:\b|\.|,|\?|!|;))/g
const ETH_ADDRESS_TEST_REGEX = /(0x[a-fA-F0-9]{40}(?:\b|\.|,|\?|!|;))/g

export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

const CHAIN_ID = env('CHAIN_ID')

export function getNetworkType(chainId = CHAIN_ID) {
  chainId = String(chainId)

  if (chainId === '1') return 'main'
  if (chainId === '4') return 'rinkeby'
  if (chainId === '100') return 'xdai'
  if (chainId === '137') return 'polygon'

  return DEFAULT_LOCAL_CHAIN
}

export function isLocalOrUnknownNetwork(chainId = CHAIN_ID) {
  return getNetworkType(chainId) === DEFAULT_LOCAL_CHAIN
}

function getNetworkInternalName(chainId = CHAIN_ID) {
  return isLocalOrUnknownNetwork(chainId) ? 'local' : getNetworkType(chainId)
}

export function getNetwork(chainId = CHAIN_ID) {
  return networks[getNetworkInternalName(chainId)]
}

export function getNetworkName(chainId = CHAIN_ID) {
  chainId = String(chainId)

  if (chainId === '1') return 'Mainnet'
  if (chainId === '4') return 'Rinkeby'
  if (chainId === '100') return 'Gnosis'
  if (chainId === '137') return 'Polygon'

  return 'unknown'
}

export function getEthersNetwork(chainId) {
  const { type, ensRegistry } = getNetwork(chainId)
  return {
    name: type,
    chainId: chainId,
    ensAddress: ensRegistry,
  }
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

export function getDefaultProvider(chainId = CHAIN_ID) {
  const { defaultEthNode, type } = getNetwork(chainId)

  return defaultEthNode
    ? new Providers.StaticJsonRpcProvider(defaultEthNode)
    : ethers.getDefaultProvider(type, 'x')
}

export function encodeFunctionData(contract, functionName, params) {
  return contract.interface.encodeFunctionData(functionName, params)
}

/**
 * Check address equality without checksums
 * @param {string} first First address
 * @param {string} second Second address
 * @returns {boolean} Address equality
 */
export function addressesEqual(first, second) {
  first = first && first.toLowerCase()
  second = second && second.toLowerCase()
  return first === second
}

// Detect Ethereum addresses in a string and transform each part.
//
// `callback` is called on every part with two params:
//   - The string of the current part.
//   - A boolean indicating if it is an address.
//
export function transformAddresses(str, callback) {
  return str
    .split(ETH_ADDRESS_SPLIT_REGEX)
    .map((part, index) =>
      callback(part, ETH_ADDRESS_TEST_REGEX.test(part), index)
    )
}

const BLOCK_EXPLORERS = {
  etherscan: ({ type, value, networkType }) => {
    if (networkType === 'private') {
      return ''
    }

    if (!ETHERSCAN_NETWORK_TYPES.has(networkType)) {
      throw new Error('provider not supported.')
    }
    if (!ETHERSCAN_TYPES.has(type)) {
      throw new Error('type not supported.')
    }

    const subdomain = ETHERSCAN_NETWORK_TYPES.get(networkType)
    const typePart = ETHERSCAN_TYPES.get(type)
    return `https://${subdomain}etherscan.io/${typePart}/${value}`
  },
  blockscout: ({ type, value, networkType }) => {
    if (networkType === 'private') {
      return ''
    }

    if (!BLOCKSCOUT_NETWORK_TYPES.has(networkType)) {
      throw new Error('provider not supported.')
    }

    if (!BLOCKSCOUT_TYPES.has(type)) {
      throw new Error('type not supported.')
    }

    const networkName = BLOCKSCOUT_NETWORK_TYPES.get(networkType)
    const typePart = BLOCKSCOUT_TYPES.get(type)
    return `https://blockscout.com/poa/${networkName}/${typePart}/${value}`
  },
  polygonscan: ({ type, value, networkType }) => {
    if (networkType === 'private') {
      return ''
    }

    if (!POLYGONSCAN_NETWORK_TYPES.has(networkType)) {
      throw new Error('provider not supported.')
    }
    if (!POLYGONSCAN_TYPES.has(type)) {
      throw new Error('type not supported.')
    }

    const subdomain = POLYGONSCAN_NETWORK_TYPES.get(networkType)
    const typePart = POLYGONSCAN_TYPES.get(type)
    return `https://${subdomain}polygonscan.com/${typePart}/${value}`
  },
  arbiscan: ({ type, value, networkType }) => {
    if (networkType === 'private') {
      return ''
    }

    if (!ARBISCAN_NETWORK_TYPES.has(networkType)) {
      throw new Error('provider not supported.')
    }
    if (!ARBISCAN_TYPES.has(type)) {
      throw new Error('type not supported.')
    }

    const subdomain = ARBISCAN_NETWORK_TYPES.get(networkType)
    const typePart = ARBISCAN_TYPES.get(type)
    return `https://${subdomain}arbiscan.com/${typePart}/${value}`
  },
}

export function blockExplorerUrl(
  type,
  value,
  { networkType = 'xdai', provider = 'blockscout' } = {}
) {
  const explorer = BLOCK_EXPLORERS[provider]

  if (!explorer) {
    console.error('blockExplorerUrl(): provider not supported.')
    return ''
  }

  try {
    return explorer({ type, value, networkType })
  } catch (err) {
    console.error(`blockExplorerUrl(): ${err.message}`)
    return ''
  }
}

export { getAddress as toChecksumAddress } from 'ethers/lib/utils'
