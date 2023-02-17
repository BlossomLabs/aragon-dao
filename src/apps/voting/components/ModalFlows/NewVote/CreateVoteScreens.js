import React, { useCallback, useMemo, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import CreateNewVote from './CreateNewVote'

import LoadingScreen from '@/components/MultiModal/screens/LoadingScreen'
import { useAppState } from '@/apps/voting/providers/VotingProvider'
import { capitalizeFirstLetter } from '@/utils/format'
import useActions from '../../../hooks/useActions'

function CreateVoteScreens() {
  const { type } = useAppState()
  const { votingActions } = useActions()
  const [displayErrorScreen, setDisplayErrorScreen] = useState(false)
  const [transactions, setTransactions] = useState([])
  const proposalType = capitalizeFirstLetter(type)

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
        title: `New ${proposalType} Proposal`,
        graphicHeader: false,
        content: <CreateNewVote getTransactions={getTransactions} />,
      },
      {
        content: <LoadingScreen />,
      },
    ]
  }, [proposalType, getTransactions])

  return (
    <ModalFlowBase
      displayErrorScreen={displayErrorScreen}
      transactions={transactions}
      transactionTitle={`Create ${proposalType} Proposal`}
      screens={screens}
    />
  )
}

export default CreateVoteScreens
