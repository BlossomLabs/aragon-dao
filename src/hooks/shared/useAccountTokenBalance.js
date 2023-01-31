import { useEffect, useState } from 'react'
import BN from 'bn.js'
import { useContractReadOnly } from './useContract'
import minimeTokenAbi from '../../abi/minimeToken.json'
import { useWallet } from '@/providers/Wallet'
import { useMounted } from './useMounted'

export function useTokenBalanceOf(tokenAddress, account, chainId) {
  const mounted = useMounted()
  const [balance, setBalance] = useState(new BN(-1))
  const tokenContract = useContractReadOnly(
    tokenAddress,
    minimeTokenAbi,
    chainId
  )

  useEffect(() => {
    if (!tokenContract || !account) {
      return
    }

    const fetchTokenBalanceOf = async () => {
      const result = await tokenContract.balanceOf(account)

      if (mounted()) {
        setBalance(new BN(result.toString()))
      }
    }

    fetchTokenBalanceOf()
  }, [mounted, account, tokenContract])

  return balance
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
