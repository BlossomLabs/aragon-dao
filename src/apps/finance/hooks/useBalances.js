import { useMemo, useState } from 'react'
import { erc20ABI, useConnect } from '@1hive/connect-react'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useMounted } from '@/hooks/shared/useMounted'
import BN from 'bn.js'

import { useNetwork } from '@/hooks/shared'
import { Contract, constants } from 'ethers'
import { useInterval } from '@/hooks/shared/useInterval'
import { useWallet } from '@/providers/Wallet'

const CONTRACTS_CACHE = {}

const getContractInstance = (address, abi, provider) => {
  if (CONTRACTS_CACHE[address]) {
    return CONTRACTS_CACHE[address]
  }

  const contract = new Contract(address, abi, provider)
  CONTRACTS_CACHE[address] = contract

  return contract
}

const useBalances = (pollingTime = 5000) => {
  const [tokens, setTokens] = useState()
  const [isFirstBalanceFetching, setIsFirstBalancesFetching] = useState(true)
  const { ethers } = useWallet()
  const mounted = useMounted()
  const { nativeToken: nativeTokenSymbol } = useNetwork()
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const [vaultAddress, vaultAddressStatus] = useConnect(async () => {
    if (!connectedFinanceApp) {
      return
    }

    const financeContract = getContractInstance(
      connectedFinanceApp.address,
      connectedFinanceApp._app.abi,
      ethers
    )
    const vaultAddress = await financeContract.vault()

    return vaultAddress
  }, [connectedFinanceApp, ethers])
  const [tokensData, tokensDataStatus] = useConnect(async () => {
    if (!connectedFinanceApp || !ethers) {
      return
    }

    const financeTokenBalances = await connectedFinanceApp?.balanceForApp()
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

        const tokenContract = getContractInstance(
          tokenBalance.token,
          erc20ABI,
          ethers
        )
        const [decimals, symbol] = await Promise.all([
          tokenContract.decimals(),

          tokenContract.symbol(),
        ])

        return {
          address: tokenBalance.token,
          decimals,
          symbol,
        }
      })
    )

    return tokensWithData
  }, [connectedFinanceApp, ethers])
  const startBalancesFetching = tokensData && vaultAddress
  const pollingTime_ = startBalancesFetching
    ? isFirstBalanceFetching
      ? 0
      : pollingTime
    : null
  const loading = tokensDataStatus.loading || vaultAddressStatus.loading
  const error = tokensDataStatus.error || vaultAddressStatus.error

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

          const vaultBalance = await getContractInstance(
            tokenData.token,
            erc20ABI,
            ethers
          ).balanceOf(vaultAddress)

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

  return [useMemo(() => tokens, [tokens]), { loading, error }]
}

export default useBalances
