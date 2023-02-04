import React, { useCallback, useMemo, useRef, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import VoteOnDecision from './Vote'

import useActions from '../../../hooks/useActions'
import LoadingScreen from '@/components/MultiModal/screens/LoadingScreen'

function VoteScreens({
  canUserVote,
  canUserVoteOnBehalfOf,
  vote,
  principals,
  supports,
}) {
  const { votingActions } = useActions()
  const [transactions, setTransactions] = useState([])
  const [displayErrorScreen, setDisplayErrorScreen] = useState(false)

  const temporatyTrx = useRef([])

  const voteOnProposal = useCallback(
    async (voteId, supports) => {
      await votingActions.vote(voteId, supports, intent => {
        temporatyTrx.current = temporatyTrx.current.concat(intent)
      })
    },
    [votingActions]
  )
  const voteOnBehalfOf = useCallback(
    async (voteId, supports, voters) => {
      await votingActions.voteOnBehalfOf(voteId, supports, voters, intent => {
        temporatyTrx.current = temporatyTrx.current.concat(intent)
      })
    },
    [votingActions]
  )

  const getTransactions = useCallback(
    async onComplete => {
      if (canUserVote) {
        await voteOnProposal(vote.voteId, supports)
      }

      if (canUserVoteOnBehalfOf && principals?.length > 0) {
        await voteOnBehalfOf(vote.voteId, supports, principals)
      }

      if (!temporatyTrx.current.length) {
        setDisplayErrorScreen(true)
      }
      setTransactions(temporatyTrx.current)
      onComplete()
    },
    [
      canUserVote,
      canUserVoteOnBehalfOf,
      principals,
      vote,
      supports,
      voteOnProposal,
      voteOnBehalfOf,
    ]
  )

  const screens = useMemo(() => {
    return [
      {
        title: `Vote ${supports ? 'Yes' : 'No'} on proposal`,
        graphicHeader: false,
        content: <VoteOnDecision getTransactions={getTransactions} />,
      },
      {
        content: <LoadingScreen />,
      },
    ]
  }, [getTransactions, supports])

  return (
    <ModalFlowBase
      displayErrorScreen={displayErrorScreen}
      transactions={transactions}
      transactionTitle="Vote on proposal"
      screens={screens}
    />
  )
}

export default VoteScreens
