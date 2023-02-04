import React, { useContext, useMemo } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useWallet } from '@/providers/Wallet'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useUserState } from './User'
import { useAppState } from './VotingProvider'
import { formatTokenAmount, getUserBalanceAt } from '../token-utils'
import { useSingleVoteSubscription } from './SingleVoteSubscription'

const VoterContext = React.createContext()

function VoterProvider({ children }) {
  const [voteSubscription] = useSingleVoteSubscription()
  const { account } = useWallet()
  const { token, tokenContract } = useAppState()
  const { connectedApp } = useConnectedApp()
  const vote = voteSubscription?.baseVote
  const voteId = vote?.voteId

  const [
    castVote,
    { loading: castVoteLoading, error: castVoteError },
  ] = useConnect(() => {
    if (!vote || !account) {
      return null
    }

    return vote.onCastVote(account)
  }, [account, vote])
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
    if (
      !votingContract ||
      !tokenContract ||
      !token ||
      !voteId ||
      !account ||
      !vote
    ) {
      return
    }

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
      vote.formattedVotingPower(account),
      vote.canExecute(account),
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

  const loading =
    castVoteLoading || votingContractStatus.loading || voterDataStatus.loading
  const error =
    castVoteError ||
    votingContractStatus.error ||
    principalsStatus.error ||
    voterDataStatus.error

  const value = useMemo(
    () => [
      voterData
        ? {
            ...voterData,
            principals,
            principalsBalances,
            principalsTotalBalance,
            hasVoted: !!castVote,
            supports: castVote?.supports,
          }
        : undefined,
      { loading, error },
    ],
    [
      voterData,
      castVote,
      principals,
      principalsBalances,
      principalsTotalBalance,
      loading,
      error,
    ]
  )
  return <VoterContext.Provider value={value}>{children}</VoterContext.Provider>
}

function useVoterState() {
  return useContext(VoterContext)
}

function usePrincipals(vote) {
  const { user, userStatus } = useUserState()
  const { tokenContract, token } = useAppState()

  // We´ll get all the user principals that haven´t already voted
  const principals = useMemo(() => {
    if (userStatus.loading || userStatus.error || !vote) {
      return
    }

    return (
      user?.representativeFor
        .filter(
          principal =>
            vote.casts.findIndex(cast => cast.caster === principal.address) ===
            -1
        )
        .map(principal => principal.address) || []
    )
  }, [userStatus.loading, userStatus.error, vote, user])

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
