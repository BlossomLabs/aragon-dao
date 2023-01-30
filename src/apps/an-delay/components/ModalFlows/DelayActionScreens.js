import React, { useCallback, useEffect, useMemo, useState } from 'react'

import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import actions from '../../actions/an-delay-action.types'
import useActions from '../../hooks/useActions'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'
import LoadingScreen from '@/components/MultiModal/screens/LoadingScreen'

const getActionData = action => {
  switch (action) {
    case actions.CANCEL_EXECUTION:
      return { modalTitle: 'Cancellation', fnMethod: 'cancelExecution' }
    case actions.EXECUTE:
      return { modalTitle: 'Execution', fnMethod: 'execute' }
    case actions.PAUSE_EXECUTION:
      return { modalTitle: 'Pausation', fnMethod: 'pauseExecution' }
    case actions.RESUME_EXECUTION:
      return { modalTitle: 'Resumption', fnMethod: 'resumeExecution' }
    default:
      throw new Error(`Action ${action} unknown`)
  }
}

const ActionScreen = React.memo(({ getTransactions }) => {
  const { next } = useMultiModal()

  useEffect(() => {
    next()
    getTransactions(() => {
      next()
    })
  }, [getTransactions, next])

  return <div />
})

function DelayActionScreens({ action, delayedScript }) {
  const { anDelayActions } = useActions()
  const [transactions, setTransactions] = useState([])
  const [displayErrorScreen, setDisplayErrorScreen] = useState(false)

  const { modalTitle, fnMethod } = getActionData(action)
  const fullModalTitle = `Delayed Script ${modalTitle}`

  const getTransactions = useCallback(
    async onComplete => {
      await anDelayActions[fnMethod](delayedScript, intent => {
        if (!intent || !intent.length) {
          setDisplayErrorScreen(true)
          return
        }

        setTransactions(intent)
        onComplete()
      })
    },
    [delayedScript, anDelayActions, fnMethod]
  )

  const screens = useMemo(
    () => [
      {
        title: fullModalTitle,
        content: <ActionScreen getTransactions={getTransactions} />,
      },
      {
        content: <LoadingScreen />,
      },
    ],
    [fullModalTitle, getTransactions]
  )
  return (
    <ModalFlowBase
      displayErrorScreen={displayErrorScreen}
      transactions={transactions}
      transactionTitle={fullModalTitle}
      screens={screens}
    />
  )
}

export default DelayActionScreens
