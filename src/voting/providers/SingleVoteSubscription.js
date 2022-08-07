import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react'
import PropTypes from 'prop-types'
import { useConnect } from '@rperez89/connect-react'
// import connectVoting from '@aragon/connect-disputable-voting'
import { formatTokenAmount } from '@aragon/ui'
import { useOrganizationState } from '../../providers/OrganizationProvider'
// import { captureErrorWithSentry } from '../sentry'
// import { connectorConfig } from '../current-environment'
// import { ProposalNotFound } from '../errors'
// import { useWallet } from '../providers/Wallet'
import { useMounted } from '../../hooks/shared/useMounted'

const SingleVoteSubscriptionContext = React.createContext()

function SingleVoteSubscriptionProvider({ voteId, children }) {
  console.log('SUBSCRIPTIONNNNNNNNN!!!!')
  const account = '0xdf8f53B9f83e611e1154402992c6F6CB7Daf246c' // TODO- implement wallet provider
  const { connectedDisputableApp } = useOrganizationState()

  const [vote, voteStatus] = useConnect(() => {
    return connectedDisputableApp?.onVote(
      `${connectedDisputableApp.address}-vote-${voteId}`
    )
  }, [connectedDisputableApp, voteId])

  console.log('vote ', vote)

  const voteUpdateValue = JSON.stringify(vote)

  // This is a workaround for receiving the latest vote after an update.
  // Currently just listening for a vote change isn't enough to get all of the latest changes
  // so we use a subscription to castVote which correctly triggers on a full update
  // and use the return value as a dependency when passing down the vote.
  const [castVote, { error: castVoteError }] = useConnect(() => {
    return vote && account ? vote.onCastVote(account) : null
  }, [account, voteUpdateValue])

  console.log('Cast vote ', castVote)

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

  console.log('extended vote ', extendedVote)

  if (error) {
    // captureErrorWithSentry(error)
    console.error(error)
  }

  const SingleVoteSubscriptionState = useMemo(() => {
    return [extendedVote, extendedVoteLoading]
  }, [extendedVote, extendedVoteLoading])

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

function useExtendVote(vote, proposalId) {
  const mounted = useMounted()
  const account = '0xdf8f53B9f83e611e1154402992c6F6CB7Daf246c' // TODO- implement wallet provider
  const [extendedVote, setExtendedVote] = useState({})
  const [status, setStatus] = useState({ loading: true, error: null })

  const getFeeInfo = useCallback(async () => {
    const [submitterFee, challengerFee] = await Promise.all([
      vote.submitterArbitratorFee(),
      vote.challengerArbitratorFee(),
    ])

    return {
      submitter: submitterFee,
      challenger: challengerFee,
    }
  }, [vote])

  const getCollateralInfo = useCallback(async () => {
    const collateral = await vote.collateralRequirement()
    const collateralToken = await collateral.token()

    return {
      ...collateral,
      token: collateralToken,
    }
  }, [vote])

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
        canVote,
      ] = await Promise.all([
        votingToken.balance(account),
        vote.formattedVotingPower(account),
        vote.hasVoted(account),
        vote.canExecute(account),
        vote.canVote(account),
      ])

      return {
        account: account,
        accountBalanceNow: formatTokenAmount(balance, votingToken.decimals),
        accountBalance: accountBalance,
        hasVoted: hasVoted,
        canExecute: canExecute,
        canVote: canVote,
      }
    },
    [vote, account]
  )

  useEffect(() => {
    async function getExtendedVote() {
      try {
        const votingToken = await vote.token()

        const [
          settings,
          feeInfo,
          collateralInfo,
          voterInfo,
        ] = await Promise.all([
          vote.setting(),
          getFeeInfo(),
          getCollateralInfo(),
          getVoterInfo(votingToken),
        ])

        if (mounted()) {
          setExtendedVote({
            baseVote: vote,
            voterInfo: voterInfo,
            settings: settings,
            collateral: collateralInfo,
            votingToken: votingToken,
            fees: feeInfo,
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
  }, [vote, getFeeInfo, getCollateralInfo, getVoterInfo, mounted])

  // Force loading state when updating route via the address bar
  useEffect(() => {
    if (mounted()) {
      setStatus({ loading: true, error: null })
    }
  }, [proposalId, mounted])

  return [extendedVote, status]
}

function useSingleVoteSubscription() {
  return useContext(SingleVoteSubscriptionContext)
}

export { SingleVoteSubscriptionProvider, useSingleVoteSubscription }
