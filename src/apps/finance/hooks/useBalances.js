import { useEffect, useMemo, useState } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useContractReadOnly, getContract } from '@/hooks/shared/useContract'
import { getAppByName } from '@/utils/app-utils'
import BN from 'bn.js'

import vaultBalanceAbi from '../abi/vault-balance.json'
import minimeTokenAbi from '@/abi/minimeToken.json'
import { useMounted } from '@/hooks/shared/useMounted'

const VAULT_NAME = 'agent'
const INITIAL_TIMER = 2000

const CHAIN_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'

const cachedContracts = new Map([])

const getContractInstance = tokenAddress => {
  if (cachedContracts.has(tokenAddress)) {
    return cachedContracts.get(tokenAddress)
  }
  const tokenContract = getContract(tokenAddress, minimeTokenAbi)
  cachedContracts.set(tokenContract)
  return tokenContract
}

const useBalances = (timeout = 7000) => {
  const { apps } = useOrganizationState()
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const [tokenBalances = [], { loading, error }] = useConnect(
    () => connectedFinanceApp?.onBalance(),
    [connectedFinanceApp]
  )
  const mounted = useMounted()
  const [tokenData, setTokenData] = useState([])
  const [tokenWithBalance, setTokenWithBalance] = useState([])
  const [loadingBalances, setLoadingBalances] = useState(true)

  const chainId = 100 // TODO HANDLE CHAINS
  const vaultContract = useContractReadOnly(
    getAppByName(apps, VAULT_NAME).address,
    vaultBalanceAbi,
    chainId
  )

  useEffect(() => {
    if (!tokenBalances?.length || !mounted) {
      return
    }
    const getTokenData = async () => {
      try {
        const tokensWithData = await Promise.all(
          tokenBalances.map(async tokenBalance => {
            const tokenContract = getContractInstance(tokenBalance.token)

            console.log('token contract ', tokenContract)
            let decimals
            let symbol
            if (tokenBalance.token === CHAIN_TOKEN_ADDRESS) {
              decimals = 18
              symbol = 'Xdai' // Todo: maybe have a network file with all this constants per network
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
  }, [mounted, tokenBalances])

  useEffect(() => {
    if (tokenData.length === 0 || !vaultContract) {
      return
    }

    let cancelled = false
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
  }, [timeout, tokenData, vaultContract])

  const balancesKey = tokenWithBalance
    .map(token => token.balance.toString())
    .map(String)
    .join('')

  return [
    useMemo(() => {
      return tokenWithBalance
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenWithBalance, balancesKey]),
    { loading: loadingBalances, error },
  ]
}

export default useBalances
