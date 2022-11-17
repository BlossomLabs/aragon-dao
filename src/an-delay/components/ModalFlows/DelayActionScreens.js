import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ModalFlowBase from '../../../components/MultiModal/ModalFlowBase'

import actions from '../../actions/an-delay-action.types'
import useActions from '../../hooks/useActions'
import { useMultiModal } from '../../../components/MultiModal/MultiModalProvider'
import { IconWarning, Info } from '@aragon/ui'

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
    getTransactions(transactionsExists => {
      if (transactionsExists) {
        next()
      }
    })
  }, [getTransactions, next])

  return (
    <div>
      <Info
        mode="warning"
        title={
          <div
            css={`
              display: flex;
              align-items: center;
            `}
          >
            <IconWarning />{' '}
            <div
              css={`
                vertical-align: 'middle';
              `}
            >
              Action Impossible
            </div>
          </div>
        }
      >
        The action failed to execute. You may not have the required permissions.
      </Info>
    </div>
  )
})

function DelayActionScreens({ action, delayedScript: { id } }) {
  const { anDelayActions } = useActions()
  const [transactions, setTransactions] = useState([])
  const { modalTitle, fnMethod } = getActionData(action)
  const fullModalTitle = `Delayed Script ${modalTitle}`

  const temporatyTrx = useRef([])

  const performAction = useCallback(
    async scriptId => {
      await anDelayActions[fnMethod](scriptId, intent => {
        temporatyTrx.current = temporatyTrx.current.concat(intent)
      })
    },
    [anDelayActions, fnMethod]
  )

  const getTransactions = useCallback(
    async onComplete => {
      await performAction(id)

      setTransactions(temporatyTrx.current)
      onComplete(temporatyTrx.current.length)
    },
    [performAction, id]
  )

  const screens = useMemo(() => {
    return [
      {
        title: fullModalTitle,
        graphicHeader: false,
        content: <ActionScreen getTransactions={getTransactions} />,
      },
    ]
  }, [getTransactions, fullModalTitle])

  return (
    <ModalFlowBase
      frontLoad={false}
      transactions={transactions}
      transactionTitle={fullModalTitle}
      screens={screens}
    />
  )
}

export default DelayActionScreens
