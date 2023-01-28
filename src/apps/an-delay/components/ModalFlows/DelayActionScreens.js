import { noop } from '@aragon/ui'
import React, { useCallback, useEffect, useState } from 'react'

import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import actions from '../../actions/an-delay-action.types'
import useActions from '../../hooks/useActions'

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

function DelayActionScreens({ action, delayedScript }) {
  const { anDelayActions } = useActions()
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const { modalTitle, fnMethod } = getActionData(action)
  const fullModalTitle = `Delayed Script ${modalTitle}`

  const getTransactions = useCallback(async () => {
    setTransactionsLoading(true)
    await anDelayActions[fnMethod](delayedScript, intent => {
      setTransactions(intent)
    })

    setTransactionsLoading(false)
  }, [delayedScript, anDelayActions, fnMethod])

  useEffect(() => {
    getTransactions(noop)
  }, [getTransactions])

  return (
    <ModalFlowBase
      transactions={transactions}
      loading={transactionsLoading}
      transactionTitle={fullModalTitle}
      screens={[]}
    />
  )
}

export default DelayActionScreens
