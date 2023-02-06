import React, { useContext, useMemo } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useWallet } from '@/providers/Wallet'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useUserState } from './User'
import { useAppState } from './VotingProvider'
import { formatTokenAmount, getUserBalanceAt } from '@/utils/token'
import { useSingleVoteSubscription } from './SingleVoteSubscription'
import { addressesEqual } from '@/utils/web3-utils'

const VoterContext = React.createContext()

function VoterProvider({ children }) {
  const { vote } = useSingleVoteSubscription()
  const { account } = useWallet()
  const { token, tokenContract } = useAppState()
  const { connectedApp } = useConnectedApp()
  const voteId = vote?.voteId
  const [votingContract, votingContractStatus] = useConnect(() => {
    if (!connectedApp) {
      return
    }
    return connectedApp._app.ethersContract()
  }, [connectedApp])
  const [
    { principals, principalsBalances, principalsTotalBalance },
    principalsStatus,
  ] = usePrincipals(vote)
  const [voterData, voterDataStatus] = useConnect(async () => {
    // Returning null sets the status loading to false
    if (!account) {
      return null
    }

    if (!votingContract || !tokenContract || !token || !voteId || !vote) {
      return
    }

    const voteEntity = vote.voteEntity
    const [
      canVoteOnBehalfOf,
      balance,
      accountBalance,
      canExecute,
      canVote,
    ] = await Promise.all([
      principals?.length
        ? votingContract.canVoteOnBehalfOf(voteId, principals, account)
        : Promise.resolve(false),
      tokenContract.balanceOf(account),
      voteEntity.formattedVotingPower(account),
      voteEntity.canExecute(account),
      votingContract.canVote(voteId, account),
    ])

    return {
      account,
      canVoteOnBehalfOf,
      accountBalance,
      accountBalanceNow: formatTokenAmount(balance, token.decimals),
      canExecute,
      canVote,
    }
  }, [votingContract, tokenContract, vote, voteId, principals, account, token])

  const loading = votingContractStatus.loading || voterDataStatus.loading
  const error =
    votingContractStatus.error ||
    principalsStatus.error ||
    voterDataStatus.error

  const value = useMemo(() => {
    const voterCast = vote?.casts.find(cast =>
      addressesEqual(cast.caster, account)
    )

    return [
      voterData
        ? {
            ...voterData,
            principals,
            principalsBalances,
            principalsTotalBalance,
            hasVoted: !!voterCast,
            supports: voterCast?.supports,
          }
        : undefined,
      { loading, error },
    ]
  }, [
    account,
    vote,
    voterData,
    principals,
    principalsBalances,
    principalsTotalBalance,
    loading,
    error,
  ])

  return <VoterContext.Provider value={value}>{children}</VoterContext.Provider>
}

function useVoterState() {
  return useContext(VoterContext)
}

function usePrincipals(vote) {
  const { user } = useUserState()
  const { tokenContract, token } = useAppState()

  // We´ll get all the user principals that haven´t already voted
  const principals = useMemo(() => {
    if (!user || !vote) {
      return
    }

    return (
      user.representativeFor
        .filter(
          principal =>
            vote.casts.findIndex(cast =>
              addressesEqual(cast.caster, principal.address)
            ) === -1
        )
        .map(principal => principal.address) || []
    )
  }, [vote, user])

  const [principalsBalances, principalsBalancesStatus] = useConnect(() => {
    if (
      !vote?.snapshotBlock ||
      !principals?.length ||
      !tokenContract ||
      !token
    ) {
      return
    }

    return Promise.all(
      principals.map(principal =>
        getUserBalanceAt(
          principal,
          vote.snapshotBlock,
          tokenContract,
          token.decimals
        )
      )
    )
  }, [vote?.snapshotBlock, principals, tokenContract, token])
  const principalsTotalBalance = useMemo(() => {
    if (!principalsBalances) {
      return
    }

    return principalsBalances.reduce(
      (acc, balance) => acc + Math.max(0, balance),
      0
    )
  }, [principalsBalances])

  return [
    { principals, principalsBalances, principalsTotalBalance },
    principalsBalancesStatus,
  ]
}

export { VoterProvider, useVoterState }
