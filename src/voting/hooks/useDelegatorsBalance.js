import { useMemo, useState } from 'react'
import BN from 'bn.js'
import { useAppState } from '../providers/VotingProvider'
import { useContractReadOnly } from '../../hooks/shared/useContract'
import usePromise from './usePromise'
import minimeTokenAbi from '../../abi/minimeToken.json'

const emptyPromise = defaultValue =>
  new Promise(resolve => resolve(defaultValue))

export default function useDelegatorsBalance(delegators) {
  const [loading, setLoading] = useState(true)
  const { tokenAddress } = useAppState()
  const chainId = 100 // TODO: Handle chains
  const tokenContract = useContractReadOnly(
    tokenAddress,
    minimeTokenAbi,
    chainId
  )

  const delegatorsBalancePromise = useMemo(() => {
    if (!delegators?.length) {
      return emptyPromise([])
    }
    return Promise.all(
      delegators.map(async delegator => {
        const contractNewBalance = await tokenContract.balanceOf(
          delegator.address
        )
        const accountBalance = new BN(contractNewBalance.toString())
        return accountBalance
      })
    )
  }, [delegators, tokenContract])

  const principalsBalancesResult = usePromise(delegatorsBalancePromise, [], [])

  const delegatorsWithBalances = useMemo(() => {
    if (!principalsBalancesResult.length) {
      return []
    }
    const result = delegators.map((delegator, index) => {
      return [delegator.address, principalsBalancesResult[index]]
    })
    setLoading(false)
    return result
  }, [delegators, principalsBalancesResult])

  return [delegatorsWithBalances, loading]
}
