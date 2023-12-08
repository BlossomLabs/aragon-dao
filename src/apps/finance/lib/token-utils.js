import { ETHER_TOKEN_VERIFIED_ADDRESSES } from './verified-tokens'
import { toUtf8String } from 'ethers/lib/utils'
import { getContract } from '@/hooks/shared/useContract'
import { erc20ABI } from '@1hive/connect-react'

export const ETHER_TOKEN_FAKE_ADDRESS =
  '0x0000000000000000000000000000000000000000'

export const isTokenVerified = (tokenAddress, networkType) =>
  // The verified list is without checksums
  networkType === 'main'
    ? ETHER_TOKEN_VERIFIED_ADDRESSES.has(tokenAddress.toLowerCase())
    : true

export async function getTokenSymbol(address) {
  // Symbol is optional; note that aragon.js doesn't return an error (only an falsey value) when
  // getting this value fails
  let tokenSymbol

  try {
    const token = getContract(address, erc20ABI)
    tokenSymbol = await token.symbol()
  } catch (err) {
    // Some tokens (e.g. DS-Token) use bytes32 as the return type for symbol().
    const token = getContract(address, erc20ABI)
    tokenSymbol = toUtf8String(await token.symbol())
  }

  return tokenSymbol || null
}
