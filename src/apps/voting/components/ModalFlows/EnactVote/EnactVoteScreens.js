import React, { useCallback, useMemo, useState } from 'react'

import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import LoadingScreen from '@/components/MultiModal/screens/LoadingScreen'
import useActions from '../../../hooks/useActions'
import Enact from './Enact'

function EnactVoteScreens({ vote }) {
  const { votingActions } = useActions()
  const [displayErrorScreen, setDisplayErrorScreen] = useState(false)
  const [transactions, setTransactions] = useState([])

  const getTransactions = useCallback(
    async onComplete => {
      await votingActions.executeVote(vote.voteId, vote.script, intent => {
        if (!intent || !intent.length) {
          setDisplayErrorScreen(true)
          return
        }

        setTransactions(intent)
        onComplete()
      })
    },
    [votingActions, vote.voteId, vote.script]
  )

  const screens = useMemo(() => {
    return [
      {
        title: 'Enact Vote',
        graphicHeader: false,
        content: <Enact getTransactions={getTransactions} />,
      },
      {
        content: <LoadingScreen />,
      },
    ]
  }, [getTransactions])

  return (
    <ModalFlowBase
      displayErrorScreen={displayErrorScreen}
      transactions={transactions}
      transactionTitle="Create Proposal"
      screens={screens}
    />
  )
}

export default EnactVoteScreens
