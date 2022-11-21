import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react'
import PropTypes from 'prop-types'
import { useConnect } from '@1hive/connect-react'
import { formatTokenAmount } from '@aragon/ui'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { useAppState } from '../providers/VotingProvider'
import { useWallet } from '../../providers/Wallet'
import { useMounted } from '../../hooks/shared/useMounted'
import { useContractReadOnly } from '../../hooks/shared/useContract'
import { useVoterState } from './VoterProvider'
import usePromise from '../hooks/usePromise'
import { getUserBalanceAt } from '../token-utils'
import { getCanUserVoteOnBehalfOf, getCanUserVote } from '../vote-utils'
import votingAbi from '../abi/voting.json'
import minimeTokenAbi from '../../abi/minimeToken.json'

const emptyPromise = defaultValue =>
  new Promise(resolve => resolve(defaultValue))

const SingleVoteSubscriptionContext = React.createContext()

function SingleVoteSubscriptionProvider({ voteId, children }) {
  const { account } = useWallet()
  const { connectedDisputableApp } = useOrganizationState()

  const [vote, voteStatus] = useConnect(() => {
    return connectedDisputableApp?.onVote(
      `${connectedDisputableApp.address}-vote-${voteId}`
    )
  }, [connectedDisputableApp, voteId])

  const voteUpdateValue = JSON.stringify(vote)

  // This is a workaround for receiving the latest vote after an update.
  // Currently just listening for a vote change isn't enough to get all of the latest changes
  // so we use a subscription to castVote which correctly triggers on a full update
  // and use the return value as a dependency when passing down the vote.
  const [castVote, { error: castVoteError }] = useConnect(() => {
    return vote && account ? vote.onCastVote(account) : null
  }, [account, voteUpdateValue])

  // Use caseVote as a dependency value for storing the latest vote
  const castVoteUpdateValue = JSON.stringify(castVote)

  /* eslint-disable react-hooks/exhaustive-deps */
  const latestVote = useMemo(() => vote, [castVoteUpdateValue])
  /* eslint-enable react-hooks/exhaustive-deps */

  const [
    extendedVote,
    { loading: extendedVoteLoading, error: extendedVoteError },
  ] = useExtendVote(latestVote, voteId)

  const error = voteStatus.error || castVoteError || extendedVoteError

  // Throw to boundary if vote doesn't exist
  // TODO: This is super hacky because we can't tell the type of error that occurs.
  // We can improve this as soon as we have typed errors from connect
  // useEffect(() => {
  //   if (!vote && !voteLoading && voteError) {
  //     throw new ProposalNotFound(proposalId)
  //   }
  // }, [vote])

  if (error) {
    // captureErrorWithSentry(error)
    console.error(error)
  }

  const SingleVoteSubscriptionState = useMemo(() => {
    return [
      {
        ...extendedVote,
        voterInfo: {
          ...extendedVote.voterInfo,
          supports: castVote && castVote.supports,
        },
      },
      extendedVoteLoading,
    ]
  }, [extendedVote, extendedVoteLoading, castVote])

  return (
    <SingleVoteSubscriptionContext.Provider value={SingleVoteSubscriptionState}>
      {children}
    </SingleVoteSubscriptionContext.Provider>
  )
}

SingleVoteSubscriptionProvider.propTypes = {
  voteId: PropTypes.string,
  children: PropTypes.node,
}

function useExtendVote(vote, voteId) {
  const mounted = useMounted()
  const { account } = useWallet()
  const [extendedVote, setExtendedVote] = useState({})
  const [status, setStatus] = useState({ loading: true, error: null })

  const {
    canUserVoteOnBehalfOf,
    canUserVoteOnBehalfOfPromise,
  } = useCanUserVoteOnBehalfOf(vote)

  const { canUserVote, canUserVotePromise } = useCanUserVote(vote)

  const {
    principals,
    principalsBalance,
    principalsBalancePromise,
  } = usePrincipals(vote)

  const getVoterInfo = useCallback(
    async votingToken => {
      if (!account) {
        return {}
      }

      const [
        balance,
        accountBalance,
        hasVoted,
        canExecute,
      ] = await Promise.all([
        votingToken.balance(account),
        vote.formattedVotingPower(account),
        vote.hasVoted(account),
        vote.canExecute(account),
      ])

      return {
        account: account,
        accountBalanceNow: formatTokenAmount(balance, votingToken.decimals),
        accountBalance: accountBalance,
        hasVoted: hasVoted,
        canExecute: canExecute,
        canVote: canUserVote,
        canUserVotePromise,
        canUserVoteOnBehalfOf,
        canUserVoteOnBehalfOfPromise,
        principals,
        principalsBalance,
        principalsBalancePromise,
      }
    },
    [
      account,
      vote,
      canUserVoteOnBehalfOf,
      canUserVoteOnBehalfOfPromise,
      principals,
      principalsBalance,
      principalsBalancePromise,
      canUserVote,
      canUserVotePromise,
    ]
  )

  useEffect(() => {
    async function getExtendedVote() {
      try {
        const votingToken = await vote.token()

        const [settings, voterInfo] = await Promise.all([
          vote.setting(),
          getVoterInfo(votingToken),
        ])

        if (mounted()) {
          setExtendedVote({
            baseVote: vote,
            voterInfo: voterInfo,
            settings: settings,
            votingToken: votingToken,
          })
          setStatus({ loading: false, error: null })
        }
      } catch (err) {
        if (mounted()) {
          setStatus({ loading: false, error: err })
        }
      }
    }

    if (vote) {
      getExtendedVote()
    }
  }, [vote, getVoterInfo, mounted])

  // Force loading state when updating route via the address bar
  useEffect(() => {
    if (mounted()) {
      setStatus({ loading: true, error: null })
    }
  }, [voteId, mounted])

  return [extendedVote, status]
}

function useCanUserVoteOnBehalfOf(vote) {
  const chainId = 100 // TODO- handle chains
  const { account: connectedAccount } = useWallet()
  const { connectedDisputableApp } = useOrganizationState()

  const principals = useUserPrincipals(vote)

  const votingContract = useContractReadOnly(
    connectedDisputableApp?.address,
    votingAbi,
    chainId
  )

  const canUserVoteOnBehalfOfPromise = useMemo(() => {
    return getCanUserVoteOnBehalfOf(
      votingContract,
      vote?.voteId,
      principals,
      connectedAccount
    )
  }, [connectedAccount, principals, votingContract, vote])

  const canUserVoteOnBehalfOf = usePromise(
    canUserVoteOnBehalfOfPromise,
    [],
    false
  )

  return { canUserVoteOnBehalfOf, canUserVoteOnBehalfOfPromise }
}

function usePrincipals(vote) {
  const chainId = 100 // TODO- handle chains
  const {
    tokenAddress,
    numData: { tokenDecimals },
  } = useAppState()

  const principals = useUserPrincipals(vote)
  const tokenContract = useContractReadOnly(
    tokenAddress,
    minimeTokenAbi,
    chainId
  )

  // User balance
  const principalsBalancePromise = useMemo(() => {
    if (!vote?.id || !principals.length) {
      return emptyPromise([])
    }
    return Promise.all(
      principals.map(principal =>
        getUserBalanceAt(
          principal,
          vote.snapshotBlock,
          tokenContract,
          tokenDecimals
        )
      )
    )
  }, [principals, tokenContract, tokenDecimals, vote])
  const principalsBalancesResult = usePromise(principalsBalancePromise, [], [])

  const principalsBalance = useMemo(
    () =>
      principalsBalancesResult.reduce(
        (acc, balance) => acc + Math.max(0, balance),
        0
      ),
    [principalsBalancesResult]
  )

  return { principals, principalsBalance, principalsBalancePromise }
}

function useUserPrincipals(vote) {
  const { voter, voterStatus } = useVoterState()

  // We´ll get all the user principals that haven´t already voted
  const principals = useMemo(() => {
    if (voterStatus.loading || voterStatus.error || !vote) {
      return []
    }
    return (
      voter?.representativeFor
        .filter(
          principal =>
            vote.casts.findIndex(cast => cast.caster === principal.address) ===
            -1
        )
        .map(principal => principal.address) || []
    )
  }, [voterStatus.loading, voterStatus.error, vote, voter])

  return principals
}

export function useCanUserVote(vote) {
  const chainId = 100 // TODO- handle chains
  const { account: connectedAccount } = useWallet()
  const { connectedDisputableApp } = useOrganizationState()

  const votingContract = useContractReadOnly(
    connectedDisputableApp?.address,
    votingAbi,
    chainId
  )

  const canUserVotePromise = useMemo(() => {
    return getCanUserVote(votingContract, vote?.voteId, connectedAccount)
  }, [connectedAccount, votingContract, vote])

  const canUserVote = usePromise(canUserVotePromise, [], false)

  return { canUserVote, canUserVotePromise }
}

function useSingleVoteSubscription() {
  return useContext(SingleVoteSubscriptionContext)
}

export { SingleVoteSubscriptionProvider, useSingleVoteSubscription }
