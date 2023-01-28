import React, { useCallback, useMemo, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import CreateNewVote from './CreateNewVote'

import useActions from '../../../hooks/useActions'

function CreateVoteScreens() {
  const { votingActions } = useActions()
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  const getTransactions = useCallback(
    async (onComplete, question) => {
      setTransactionsLoading(true)
      await votingActions.newVote(question, intent => {
        console.log(intent)
        setTransactions(intent)
        onComplete()
      })
      setTransactionsLoading(false)
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
      loading={transactionsLoading}
      transactions={transactions}
      transactionTitle="Create Proposal"
      transactionsLoading={transactionsLoading}
      screens={screens}
    />
  )
}

export default CreateVoteScreens
