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

const cachedContracts = new Map([])

const getContractInstance = (address, abi, chainId) => {
  if (cachedContracts.has(address)) {
    return cachedContracts.get(address)
  }
  const contract = getContract(address, abi, chainId)
  cachedContracts.set(contract)
  return contract
}

const useBalances = (timeout = 5000) => {
  const mounted = useMounted()
  const [polledTokenBalances, setPolledTokenBalances] = useState()
  const { chainId } = useNetwork()
  const { nativeToken } = useNetwork()
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const [tokenBalances, tokenBalancesStatus] = useConnect(
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
  const [tokenData, tokenDataStatus] = useConnect(async () => {
    if (!vaultContract || !tokenBalances) {
      return
    }

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

    return tokensWithData
  }, [vaultContract, tokenBalances])
  const loading =
    tokenBalancesStatus.loading ||
    vaultContractStatus.loading ||
    tokenDataStatus.loading
  const error =
    tokenBalancesStatus.error ||
    vaultContractStatus.error ||
    tokenDataStatus.error

  useEffect(() => {
    if (!vaultContract || !tokenData) {
      return
    }

    let timeoutId

    const pollAccountBalance = async () => {
      try {
        const tokensWithBalances = await Promise.all(
          tokenData.map(async tokenData => {
            const vaultBalance = await vaultContract.balance(tokenData.address)

            return {
              ...tokenData,
              balance: new BN(vaultBalance.toString()),
            }
          })
        )

        if (mounted()) {
          setPolledTokenBalances(tokensWithBalances)
        }
      } catch (err) {
        console.error(`Error fetching balance: ${err} retrying...`)
      }

      if (mounted()) {
        timeoutId = window.setTimeout(pollAccountBalance, timeout)
      }
    }

    pollAccountBalance()

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [chainId, timeout, tokenData, vaultContract, mounted])

  const balancesKey = polledTokenBalances
    ?.map(token => token.balance.toString())
    .map(String)
    .join('')

  return [
    useMemo(() => {
      return polledTokenBalances
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balancesKey]),
    { loading, error },
  ]
}

export default useBalances
