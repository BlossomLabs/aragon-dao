import { useEffect, useState } from 'react'
import BN from 'bn.js'
import { useContractReadOnly } from './useContract'
import minimeTokenAbi from '../../abi/minimeToken.json'
import { useWallet } from '@/providers/Wallet'
import { useConnect } from '@1hive/connect-react'

export function useTokenBalanceOf(tokenAddress, account, chainId) {
  const tokenContract = useContractReadOnly(
    tokenAddress,
    minimeTokenAbi,
    chainId
  )

  return useConnect(async () => {
    if (!tokenContract) {
      return
    }

    if (!account) {
      return null
    }

    const result = await tokenContract.balanceOf(account)

    return new BN(result.toString())
  }, [tokenContract, account])
}

export function useTokenBalances(account, token) {
  const { chainId } = useWallet()
  const [balances, setBalances] = useState({
    balance: new BN(-1),
    totalSupply: new BN(-1),
  })
  const [loading, setLoading] = useState(true)
  const tokenContract = useContractReadOnly(token, minimeTokenAbi, chainId)

  useEffect(() => {
    if (!token || !tokenContract) {
      return
    }

    let cancelled = false

    const pollAccountBalance = async () => {
      try {
        let contractNewBalance = new BN(-1)
        if (account) {
          contractNewBalance = await tokenContract.balanceOf(account)
        }

        const contractTotalSupply = await tokenContract.totalSupply()

        if (!cancelled) {
          const newBalance = new BN(contractNewBalance.toString())
          const newTotalSupply = new BN(contractTotalSupply.toString())
          if (
            !newTotalSupply.eq(balances.totalSupply) ||
            !newBalance.eq(balances.balance)
          ) {
            setBalances({
              balance: newBalance,
              totalSupply: newTotalSupply,
            })
            setLoading(false)
          }
        }
      } catch (err) {
        console.error(`Error fetching balance: ${err} retrying...`)
        setLoading(false)
      }
    }

    pollAccountBalance()

    return () => {
      cancelled = true
    }
  }, [account, balances, tokenContract, token])

  return [balances, loading]
}
