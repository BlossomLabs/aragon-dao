import React, { useCallback, useMemo, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import CreateNewVote from './CreateNewVote'

import useActions from '../../../hooks/useActions'

function CreateVoteScreens() {
  const { votingActions } = useActions()
  const [transactions, setTransactions] = useState([])

  const getTransactions = useCallback(
    async (onComplete, question) => {
      await votingActions.newVote(question, intent => {
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
    ]
  }, [getTransactions])

  return (
    <ModalFlowBase
      frontLoad={false}
      transactions={transactions}
      transactionTitle="Create Proposal"
      screens={screens}
    />
  )
}

export default CreateVoteScreens
