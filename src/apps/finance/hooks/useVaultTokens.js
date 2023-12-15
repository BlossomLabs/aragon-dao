import { useMemo, useState } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useMounted } from '@/hooks/shared/useMounted'
import BN from 'bn.js'

import { useNetwork } from '@/hooks/shared'
import { Contract, constants } from 'ethers'
import { useInterval } from '@/hooks/shared/useInterval'
import { useWallet } from '@/providers/Wallet'
import { ERC20ABI } from '@/utils/token'
import { useFetchTokensMarketData } from '@/hooks/shared/useFetchTokensMarketData'
import { getConvertedAmount } from '../lib/conversion-utils'

const TOKENS_CACHE = {}

async function getOrLoadToken(address, provider) {
  if (TOKENS_CACHE[address]) {
    return TOKENS_CACHE[address]
  }

  const tokenContract = new Contract(address, ERC20ABI, provider)
  const [decimals, symbol] = await Promise.all([
    tokenContract.decimals(),
    tokenContract.symbol(),
  ])

  TOKENS_CACHE[address] = {
    tokenContract,
    decimals,
    symbol,
  }

  return TOKENS_CACHE[address]
}

const useVaultTokens = (pollingTime = 5000) => {
  const [tokens, setTokens] = useState()
  const [isFirstBalanceFetching, setIsFirstBalancesFetching] = useState(true)
  const { ethers } = useWallet()
  const mounted = useMounted()
  const { nativeToken: nativeTokenSymbol } = useNetwork()
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const [vaultAddress, vaultAddressStatus] = useConnect(
    () => connectedFinanceApp?._app.ethersContract().vault(),
    [connectedFinanceApp]
  )
  const [financeTokenBalances, financeTokenBalancesStatus] = useConnect(
    () => connectedFinanceApp?.onBalanceForApp(),
    [connectedFinanceApp]
  )
  const [tokensData, tokensDataStatus] = useConnect(async () => {
    if (!financeTokenBalances || !ethers) {
      return
    }

    const tokensWithData = await Promise.all(
      financeTokenBalances.map(async tokenBalance => {
        const isNativeToken = tokenBalance.token === constants.AddressZero

        if (isNativeToken) {
          return {
            address: tokenBalance.token,
            decimals: 18,
            symbol: nativeTokenSymbol,
          }
        }

        const { symbol, decimals } = await getOrLoadToken(
          tokenBalance.token,
          ethers
        )

        return {
          address: tokenBalance.token,
          decimals,
          symbol,
        }
      })
    )

    return tokensWithData
  }, [connectedFinanceApp, ethers, financeTokenBalances])
  const [tokensMarketData, tokensMarketDataStatus] = useFetchTokensMarketData(
    tokensData?.map(({ address }) => address)
  )
  const startBalancesFetching = tokensData && vaultAddress
  const pollingTime_ = startBalancesFetching
    ? isFirstBalanceFetching
      ? 0
      : pollingTime
    : null
  const loading =
    tokensDataStatus.loading ||
    vaultAddressStatus.loading ||
    financeTokenBalancesStatus.loading ||
    tokensMarketDataStatus.loading
  const error =
    tokensDataStatus.error ||
    vaultAddressStatus.error ||
    financeTokenBalancesStatus.error ||
    tokensMarketDataStatus.error
  const tokensKey = tokens?.map(({ balance }) => balance.toString()).join('-')

  useInterval(async () => {
    if (isFirstBalanceFetching && mounted()) {
      setIsFirstBalancesFetching(prevFirstFetch => !prevFirstFetch)
    }

    try {
      const tokensWithBalances = await Promise.all(
        tokensData.map(async tokenData => {
          const isNativeToken = tokenData.address === constants.AddressZero

          if (isNativeToken) {
            const vaultBalance = await ethers.getBalance(vaultAddress)
            return {
              ...tokenData,
              balance: new BN(vaultBalance.toString()),
            }
          }

          const { tokenContract } = await getOrLoadToken(
            tokenData.address,
            ethers
          )
          const vaultBalance = await tokenContract.balanceOf(vaultAddress)

          return {
            ...tokenData,
            balance: new BN(vaultBalance.toString()),
          }
        })
      )

      if (mounted()) {
        setTokens(tokensWithBalances)
      }
    } catch (err) {
      console.error(`Error fetching balance: ${err} retrying...`)
    }
  }, pollingTime_)

  return [
    useMemo(
      () =>
        tokens?.map(t => {
          const marketData = tokensMarketData?.[t.address]
            ? {
                convertedAmount: getConvertedAmount(
                  t.balance,
                  tokensMarketData[t.address].price,
                  t.decimals
                ),
                logoUrl: tokensMarketData[t.address].logo,
              }
            : {
                convertedAmount: new BN('-1'),
              }

          return {
            ...t,
            ...marketData,
          }
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [tokensKey, tokensMarketData]
    ),
    { loading, error },
  ]
}

export default useVaultTokens
