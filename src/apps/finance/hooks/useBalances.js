import { useEffect, useMemo, useState } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { getContract } from '@/hooks/shared/useContract'
import { useMounted } from '@/hooks/shared/useMounted'
import BN from 'bn.js'

import vaultBalanceAbi from '../abi/vault-balance.json'
import minimeTokenAbi from '@/abi/minimeToken.json'
import { useNetwork } from '@/hooks/shared'
import { constants } from 'ethers'

const INITIAL_TIMER = 2000

const cachedContracts = new Map([])

const getContractInstance = (address, abi, chainId) => {
  if (cachedContracts.has(address)) {
    return cachedContracts.get(address)
  }
  const contract = getContract(address, abi, chainId)
  cachedContracts.set(contract)
  return contract
}

const useBalances = (timeout = 7000) => {
  const { chainId } = useNetwork()
  const { nativeToken } = useNetwork()
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const [tokenBalances = [], tokenBalancesStatus] = useConnect(
    () => connectedFinanceApp?.onBalance(),
    [connectedFinanceApp]
  )
  const [vaultContract, vaultContractStatus] = useConnect(async () => {
    if (!connectedFinanceApp) {
      return
    }

    const financeContract = connectedFinanceApp._app.ethersContract()
    const vaultAddress = await financeContract.vault()
    return getContract(vaultAddress, vaultBalanceAbi, chainId)
  }, [connectedFinanceApp, chainId])

  const mounted = useMounted()
  const [tokenData, setTokenData] = useState([])
  const [tokenWithBalance, setTokenWithBalance] = useState([])
  const [loadingBalances, setLoadingBalances] = useState(false)
  const loading =
    tokenBalancesStatus.loading ||
    vaultContractStatus.loading ||
    loadingBalances
  const error = tokenBalancesStatus.error || vaultContractStatus.error

  useEffect(() => {
    if (!tokenBalances?.length || !mounted) {
      return
    }
    const getTokenData = async () => {
      try {
        setLoadingBalances(true)
        const tokensWithData = await Promise.all(
          tokenBalances.map(async tokenBalance => {
            const tokenContract = getContractInstance(
              tokenBalance.token,
              minimeTokenAbi,
              chainId
            )

            let decimals
            let symbol
            if (tokenBalance.token === constants.AddressZero) {
              decimals = 18
              symbol = nativeToken
            } else {
              const [dec, symb] = await Promise.all([
                tokenContract.decimals(),
                tokenContract.symbol(),
              ])

              decimals = dec
              symbol = symb
            }

            return {
              address: tokenBalance.token,
              decimals,
              symbol,
            }
          })
        )
        setTokenData(tokensWithData)
      } catch (error) {
        setLoadingBalances(false)
        console.error(`ERROR getting token data : ${error}`)
      }
    }
    getTokenData()
  }, [chainId, mounted, nativeToken, tokenBalances])

  useEffect(() => {
    if (!vaultContract) {
      return
    }

    let cancelled = false
    let timeoutId

    const pollAccountBalance = async () => {
      try {
        setLoadingBalances(true)
        const tokensWithBalances = await Promise.all(
          tokenData.map(async tokenData => {
            const vaultBalance = await vaultContract.balance(tokenData.address)

            return {
              ...tokenData,
              balance: new BN(vaultBalance.toString()),
            }
          })
        )
        if (!cancelled) {
          setTokenWithBalance(tokensWithBalances)
          setLoadingBalances(false)
        }
      } catch (err) {
        setLoadingBalances(false)
        console.error(`Error fetching balance: ${err} retrying...`)
      }
      if (!cancelled) {
        timeoutId = window.setTimeout(pollAccountBalance, timeout)
      }
    }

    timeoutId = window.setTimeout(pollAccountBalance, INITIAL_TIMER)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [chainId, timeout, tokenData, vaultContract])

  const balancesKey = tokenWithBalance
    .map(token => token.balance.toString())
    .map(String)
    .join('')

  return [
    useMemo(() => {
      return tokenWithBalance
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenWithBalance, balancesKey]),
    { loading, error },
  ]
}

export default useBalances
