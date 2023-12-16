import { env } from '@/environment'
import { getEthersNetwork } from './utils/web3-utils'
import { ethers } from 'ethers'

const CHAIN_ID = env('CHAIN_ID')
const ALCHEMY_API_KEY = env('ALCHEMY_API_KEY')
const INFURA_API_KEY = env('INFURA_API_KEY')
const POCKET_API_KEY = env('POCKET_API_KEY')
const ANKR_API_KEY = env('ANKR_API_KEY')

function buildProviderAPIKeys() {
  const apiKeysDefined =
    ALCHEMY_API_KEY || INFURA_API_KEY || POCKET_API_KEY || ANKR_API_KEY

  if (!apiKeysDefined) {
    return undefined
  }

  /**
   * Selectively use providers with defined API keys. Undefined keys are replaced with a dash ('-')
   * to prevent ethers.js from defaulting to shared API keys. This ensures ethers.js only attempts
   * JSON-RPC requests with specified providers.
   */
  return {
    alchemy: ALCHEMY_API_KEY ?? '-',
    infura: INFURA_API_KEY ?? '-',
    pocket: POCKET_API_KEY ?? '-',
    ankr: ANKR_API_KEY ?? '-',
    etherscan: '-',
  }
}

function getDefaultProvider(chainId = CHAIN_ID) {
  return ethers.getDefaultProvider(
    getEthersNetwork(chainId),
    buildProviderAPIKeys()
  )
}

export const ethersProvider = getDefaultProvider()
