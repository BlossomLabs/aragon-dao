import React, { useState, useCallback } from 'react'
import RevokeDelegation from './RevokeDelegation'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import useActions from '../../../hooks/useActions'

function RevokeDelegationScreens() {
  const [transactions, setTransactions] = useState([])
  const { votingActions } = useActions()

  const getTransactions = useCallback(
    async (onComplete, representative) => {
      await votingActions.delegateVoting(representative, intent => {
        setTransactions(intent)
        onComplete()
      })
    },
    [votingActions]
  )

  const screens = [
    {
      title: 'Revoke delegation',
      graphicHeader: false,
      content: <RevokeDelegation onCreateTransaction={getTransactions} />,
    },
  ]

  return (
    <ModalFlowBase
      frontLoad
      // loading={loading}
      transactions={transactions}
      transactionTitle="Revoke your delegate"
      screens={screens}
      onComplete={() => {}}
      // onCompleteActions={<GoToProposal />}
    />
  )
}

export default RevokeDelegationScreens
