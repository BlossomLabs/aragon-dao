import { useEffect, useState } from 'react'
import BN from 'bn.js'
import { useContractReadOnly } from './useContract'
import minimeTokenAbi from '../../abi/minimeToken.json'

export function useTokenBalances(account, token) {
  const [balances, setBalances] = useState({
    balance: new BN(-1),
    totalSupply: new BN(-1),
  })
  const [loading, setLoading] = useState(true)
  const chainId = 100 // TODO: Handle chains
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
