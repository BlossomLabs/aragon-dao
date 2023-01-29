import React, { useCallback, useMemo, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import CreateNewVote from './CreateNewVote'

import useActions from '../../../hooks/useActions'
import LoadingScreen from '@/components/MultiModal/screens/LoadingScreen'

function CreateVoteScreens() {
  const { votingActions } = useActions()
  const [displayErrorScreen, setDisplayErrorScreen] = useState(false)
  const [transactions, setTransactions] = useState([])

  const getTransactions = useCallback(
    async (onComplete, question) => {
      await votingActions.newVote(question, intent => {
        if (!intent || !intent.length) {
          setDisplayErrorScreen(true)
          return
        }

        setTransactions(intent)
        onComplete()
      })
    },
    [votingActions]
  )

  const screens = useMemo(() => {
    return [
      {
        title: 'New Proposal',
        graphicHeader: false,
        content: <CreateNewVote getTransactions={getTransactions} />,
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

export default CreateVoteScreens
