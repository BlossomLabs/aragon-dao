import { ethers, providers as Providers } from 'ethers'
import { env } from '@/environment'
import {
  BLOCKSCOUT_NETWORK_TYPES,
  BLOCKSCOUT_TYPES,
  ETHERSCAN_NETWORK_TYPES,
  ETHERSCAN_TYPES,
} from './explorers'

const DEFAULT_LOCAL_CHAIN = '1337'

const networks = {
  optimism: {
    chainId: 10,
    ensRegistry: '0x6f2CA655f58d5fb94A08460aC19A552EB19909FD',
    name: 'Optimism',
    type: 'optimism',
    network: 'optimism',
    explorer: 'etherscan',
    nativeToken: 'ETH',
  },
  xdai: {
    chainId: 100,
    ensRegistry: '0xaafca6b0c89521752e559650206d7c925fd0e530',
    name: 'Gnosis Chain',
    type: 'xdai',
    explorer: 'blockscout',
    nativeToken: 'xDAI',
  },
  main: {
    chainId: 1,
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    name: 'Mainnet',
    type: 'main',
    network: 'homestead',
    explorer: 'etherscan',
    nativeToken: 'ETH',
  },
  local: {
    chainId: 1337,
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    name: 'local',
    type: 'main',
    network: 'dev',
    explorer: 'etherscan',
    nativeToken: 'ETH',
  },
}

const ETH_ADDRESS_SPLIT_REGEX = /(0x[a-fA-F0-9]{40}(?:\b|\.|,|\?|!|;))/g
const ETH_ADDRESS_TEST_REGEX = /(0x[a-fA-F0-9]{40}(?:\b|\.|,|\?|!|;))/g

const CHAIN_ID = env('CHAIN_ID')
const STATIC_ETH_NODE = env('STATIC_ETH_NODE')
const LOCAL_ETH_NODES = ['http://127.0.0.1:8545', 'http://localhost:8545']

const ETHERS_UNSUPPORTED_CHAIN_IDS = [100]

let STATIC_PROVIDER = null

export function getNetworkType(chainId = CHAIN_ID) {
  chainId = String(chainId)

  switch (chainId) {
    case '1':
      return 'main'
    case '10':
      return 'optimism'
    case '100':
      return 'xdai'
    default:
      return DEFAULT_LOCAL_CHAIN
  }
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

export function getEthersNetwork(chainId) {
  const { network, ensRegistry } = getNetwork(chainId)

  return {
    name: network,
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

export const getStaticProvider = () => {
  if (STATIC_PROVIDER) {
    return STATIC_PROVIDER
  }

  const provider = new Providers.StaticJsonRpcProvider(STATIC_ETH_NODE)

  STATIC_PROVIDER = provider

  return provider
}

function buildProviderAPIKeys() {
  const alchemy = env('ALCHEMY_API_KEY')
  const infura = env('INFURA_API_KEY')
  const pocket = env('POCKET_API_KEY')
  const ankr = env('ANKR_API_KEY')

  const apiKeysDefined = alchemy || infura || pocket || ankr

  if (!apiKeysDefined) {
    return undefined
  }

  /**
   * Selectively use providers with defined API keys. Undefined keys are replaced with a dash ('-')
   * to prevent ethers.js from defaulting to shared API keys. This ensures ethers.js only attempts
   * JSON-RPC requests with specified providers.
   */
  return {
    alchemy: alchemy ?? '-',
    infura: infura ?? '-',
    pocket: pocket ?? '-',
    ankr: ankr ?? '-',
    etherscan: '-',
  }
}

export function getDefaultProvider(chainId = CHAIN_ID) {
  if (
    ETHERS_UNSUPPORTED_CHAIN_IDS.includes(chainId) ||
    LOCAL_ETH_NODES.includes(STATIC_ETH_NODE)
  ) {
    return getStaticProvider()
  }

  return ethers.getDefaultProvider(
    getEthersNetwork(chainId),
    buildProviderAPIKeys()
  )
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
}

export function blockExplorerUrl(
  type,
  value,
  { networkType = 'main', provider = 'etherscan' } = {}
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
