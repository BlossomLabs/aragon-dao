import React, { useState, useCallback } from 'react'
import RevokeDelegation from './RevokeDelegation'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import useActions from '../../../hooks/useActions'
import LoadingScreen from '@/components/MultiModal/screens/LoadingScreen'

function RevokeDelegationScreens() {
  const [transactions, setTransactions] = useState([])
  const [displayErrorScreen, setDisplayErrorScreen] = useState(false)
  const { votingActions } = useActions()

  const getTransactions = useCallback(
    async (onComplete, representative) => {
      await votingActions.delegateVoting(representative, intent => {
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

  const screens = [
    {
      title: 'Revoke delegation',
      graphicHeader: false,
      content: <RevokeDelegation onCreateTransaction={getTransactions} />,
    },
    {
      content: <LoadingScreen />,
    },
  ]

  return (
    <ModalFlowBase
      displayErrorScreen={displayErrorScreen}
      transactions={transactions}
      transactionTitle="Revoke your delegate"
      screens={screens}
      // onCompleteActions={<GoToProposal />}
    />
  )
}

export default RevokeDelegationScreens
