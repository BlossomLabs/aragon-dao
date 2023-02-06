import BN from 'bn.js'
import { useAppState } from '../providers/VotingProvider'
import { useConnect } from '@1hive/connect-react'

export default function useDelegatorsBalance(delegators) {
  const { tokenContract } = useAppState()
  return useConnect(async () => {
    if (!tokenContract || !delegators) {
      return
    }

    if (!delegators.length) {
      return []
    }

    const principalsBalances = await Promise.all(
      delegators.map(async delegator => {
        const contractNewBalance = await tokenContract.balanceOf(
          delegator.address
        )
        const accountBalance = new BN(contractNewBalance.toString())
        return accountBalance
      })
    )

    return delegators.map((delegator, index) => {
      return [delegator.address, principalsBalances[index]]
    })
  }, [tokenContract, delegators])
}
