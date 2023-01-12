import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { useWallet } from '@/providers/Wallet'
import radspec from '@/radspec'
import anDelayActions from '../actions/an-delay-action.types'
import { useConnectedApp } from '@/providers/ConnectedApp'

const GAS_LIMIT = 550000

export default function useActions() {
  const { account } = useWallet()
  const { connectedApp: connectedANDelayApp } = useConnectedApp()

  const execute = useCallback(
    async ({ id, evmCallScript }, onDone = noop) => {
      let intent = await connectedANDelayApp.intent(
        'execute',
        [id, evmCallScript],
        {
          actAs: account,
        }
      )
      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.EXECUTE]({
        id,
        evmCallScript,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, connectedANDelayApp]
  )

  const delayExecution = useCallback(
    async ({ evmCallScript }, onDone = noop) => {
      let intent = await connectedANDelayApp.intent(
        'delayExecution',
        [evmCallScript],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.DELAY_EXECUTION]({
        // TODO: replace with non-hardcoded value
        executionDelay: 3600,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, connectedANDelayApp]
  )

  const pauseExecution = useCallback(
    async ({ id }, onDone = noop) => {
      let intent = await connectedANDelayApp.intent('pauseExecution', [id], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.PAUSE_EXECUTION]({
        id,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, connectedANDelayApp]
  )

  const resumeExecution = useCallback(
    async ({ id }, onDone = noop) => {
      let intent = await connectedANDelayApp.intent('resumeExecution', [id], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.RESUME_EXECUTION]({
        id,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, connectedANDelayApp]
  )

  const cancelExecution = useCallback(
    async ({ id }, onDone = noop) => {
      let intent = await connectedANDelayApp.intent('cancelExecution', [id], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.CANCEL_EXECUTION]({
        id,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, connectedANDelayApp]
  )

  return useMemo(
    () => ({
      anDelayActions: {
        execute,
        delayExecution,
        pauseExecution,
        resumeExecution,
        cancelExecution,
      },
    }),
    [execute, delayExecution, pauseExecution, resumeExecution, cancelExecution]
  )
}

function imposeGasLimit(intent, gasLimit) {
  return {
    ...intent,
    transactions: intent.transactions.map(tx => ({
      ...tx,
      gasLimit,
    })),
  }
}

function attachTrxMetadata(transactions, description, type) {
  return transactions.map(tx => ({
    ...tx,
    description,
    type,
  }))
}
