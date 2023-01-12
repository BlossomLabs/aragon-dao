import { ETHER_TOKEN_VERIFIED_ADDRESSES } from './verified-tokens'
import { toUtf8String } from 'ethers/lib/utils'
import { getContract } from '@/hooks/shared/useContract'
import { getDefaultProvider } from '@/utils/web3-utils'
import tokenAbi from '@/abi/minimeToken.json'

const ANJ_MAINNET_TOKEN_ADDRESS = '0xcD62b1C403fa761BAadFC74C525ce2B51780b184'
const ANT_MAINNET_TOKEN_ADDRESS = '0x960b236a07cf122663c4303350609a66a7b288c0'
const DAI_MAINNET_TOKEN_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
const SAI_MAINNET_TOKEN_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
const USDC_MAINNET_TOKEN_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const ETHER_TOKEN_FAKE_ADDRESS =
  '0x0000000000000000000000000000000000000000'

// "Important" tokens the Finance app should prioritize
const PRESET_TOKENS = new Map([
  [
    'main',
    [
      ETHER_TOKEN_FAKE_ADDRESS,
      ANJ_MAINNET_TOKEN_ADDRESS,
      ANT_MAINNET_TOKEN_ADDRESS,
      DAI_MAINNET_TOKEN_ADDRESS,
      SAI_MAINNET_TOKEN_ADDRESS,
      USDC_MAINNET_TOKEN_ADDRESS,
    ],
  ],
])

// Some known tokens don’t strictly follow ERC-20 and it would be difficult to
// adapt to every situation. The data listed in this map is used as an override
// if either some part of their interface doesn't conform to a standard we
// support.
const KNOWN_TOKENS_OVERRIDE = new Map([
  [
    'main',
    new Map([
      [
        SAI_MAINNET_TOKEN_ADDRESS,
        { symbol: 'SAI', name: 'Sai Stablecoin v1.0', decimals: '18' },
      ],
    ]),
  ],
])

export const isTokenVerified = (tokenAddress, networkType) =>
  // The verified list is without checksums
  networkType === 'main'
    ? ETHER_TOKEN_VERIFIED_ADDRESSES.has(tokenAddress.toLowerCase())
    : true

export const tokenDataOverride = (tokenAddress, fieldName, networkType) => {
  // The override list is without checksums
  const addressWithoutChecksum = tokenAddress.toLowerCase()

  const overridesForNetwork = KNOWN_TOKENS_OVERRIDE.get(networkType)
  if (
    overridesForNetwork == null ||
    !overridesForNetwork.has(addressWithoutChecksum)
  ) {
    return null
  }
  return overridesForNetwork.get(addressWithoutChecksum)[fieldName] || null
}

export async function getTokenSymbol(address) {
  // Symbol is optional; note that aragon.js doesn't return an error (only an falsey value) when
  // getting this value fails
  let tokenSymbol

  try {
    const token = getContract(address, tokenAbi)
    tokenSymbol = await token.symbol()
  } catch (err) {
    // Some tokens (e.g. DS-Token) use bytes32 as the return type for symbol().
    const token = getContract(address, tokenAbi)
    tokenSymbol = toUtf8String(await token.symbol())
  }

  return tokenSymbol || null
}

export async function getTokenName(address) {
  // Name is optional; note that aragon.js doesn't return an error (only an falsey value) when
  // getting this value fails
  let tokenName
  try {
    const token = getContract(address, tokenAbi)
    tokenName = await token.name()
  } catch (err) {
    // Some tokens (e.g. DS-Token) use bytes32 as the return type for name().
    const token = getContract(address, tokenAbi)
    tokenName = toUtf8String(await token.name())
  }

  return tokenName || null
}

export function getPresetTokens(networkType) {
  return PRESET_TOKENS.get(networkType) || [ETHER_TOKEN_FAKE_ADDRESS]
}

export async function getAccountEthBalance(address) {
  const provider = getDefaultProvider()

  return provider.getBalance(address)
}
