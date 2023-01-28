import React, { useState, useCallback, useMemo } from 'react'
import DelegateInitialScreen from './DelegateInitialScren'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import BecomeADelegate from './BecomeADelegate'
import DelegateVotingPower from './DelegateVotingPower'
import useActions from '../../../hooks/useActions'

function DelegateVotingScreens() {
  const [delegateMode, setDelegateMode] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const { votingActions } = useActions()

  const handleOnChooseAction = useCallback(delegate => {
    setDelegateMode(delegate)
  }, [])

  const getTransactions = useCallback(
    async (representative, onComplete) => {
      setTransactionsLoading(true)
      // const choosenDelegate = delegate.current
      await votingActions.delegateVoting(representative, intent => {
        setTransactions(intent)
        onComplete()
      })
      setTransactionsLoading(false)
    },
    [votingActions]
  )

  const screens = useMemo(
    () =>
      delegateMode
        ? [
            {
              title: 'Vote delegation',
              graphicHeader: false,
              content: (
                <DelegateInitialScreen onChooseAction={handleOnChooseAction} />
              ),
            },
            {
              title: 'Delegate your voting power',
              graphicHeader: false,
              content: (
                <DelegateVotingPower onCreateTransaction={getTransactions} />
              ),
            },
          ]
        : [
            {
              title: 'Vote delegation',
              graphicHeader: false,
              content: (
                <DelegateInitialScreen onChooseAction={handleOnChooseAction} />
              ),
            },
            {
              title: 'Become a delegate',
              graphicHeader: false,
              content: <BecomeADelegate />,
            },
          ],
    [delegateMode, getTransactions, handleOnChooseAction]
  )
  return (
    <ModalFlowBase
      loading={transactionsLoading}
      transactions={transactions}
      transactionTitle="Delegate your voting power"
      screens={screens}
      onComplete={() => {}}
      // onCompleteActions={<GoToProposal />}
    />
  )
}

export default DelegateVotingScreens
