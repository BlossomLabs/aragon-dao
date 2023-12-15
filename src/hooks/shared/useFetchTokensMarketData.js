import { env } from '@/environment'
import useNetwork from './useNetwork'
import { useConnect } from '@1hive/connect-react'

const BASE_API_URL = 'https://api.portals.fi/v2'

const PORTALS_API_KEY = env('PORTALS_API_KEY')

function normalizeTokenAddresses(tokenAddressOrAddresses) {
  if (!tokenAddressOrAddresses) {
    return
  }

  const normalizedTokens = Array.isArray(tokenAddressOrAddresses)
    ? [...tokenAddressOrAddresses]
    : [tokenAddressOrAddresses]

  // Remove duplicates
  return [
    ...new Set(
      normalizedTokens.map(tokenAddress => tokenAddress.toLowerCase())
    ),
  ]
}

async function fetchTokensMarketData(tokenAddresses, network) {
  const normalizedTokenAddresses = normalizeTokenAddresses(tokenAddresses)
  const tokenIds = normalizedTokenAddresses
    .map(address => `${network}:${address}`)
    .join(',')
  const apiEndpoint = `${BASE_API_URL}/tokens?ids=${tokenIds}`

  const response = await fetch(apiEndpoint, {
    headers: {
      Authorization: `Bearer ${PORTALS_API_KEY}`,
    },
  }).then(res => res.json())

  const addressToTokenData = response?.tokens.reduce(
    (prevTokens, tokenData) => ({
      ...prevTokens,
      [tokenData.address]: {
        logo: tokenData.image,
        price: tokenData.price,
      },
    }),
    {}
  )

  return addressToTokenData
}

export function useFetchTokensMarketData(tokenAddressOrAddresses) {
  const { network } = useNetwork()
  const tokensKey = tokenAddressOrAddresses?.join('-')

  return useConnect(
    () =>
      PORTALS_API_KEY && tokenAddressOrAddresses?.length && network
        ? fetchTokensMarketData(tokenAddressOrAddresses, network)
        : undefined,
    [tokensKey, network]
  )
}
