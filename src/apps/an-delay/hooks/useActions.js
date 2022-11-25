import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { useWallet } from '@/providers/Wallet'
import { getAppByName } from '@/utils/app-utils'
import radspec from '@/radspec'
import anDelayActions from '../actions/an-delay-action.types'

const GAS_LIMIT = 550000

export default function useActions() {
  const { account } = useWallet()
  const { apps: installedApps } = useOrganizationState()
  const anDelayApp = getAppByName(installedApps, 'delay') // TODO move the app name to an env variable

  const execute = useCallback(
    async (scriptId, onDone = noop) => {
      let intent = await anDelayApp.intent('execute', [scriptId], {
        actAs: account,
      })
      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.EXECUTE]({
        scriptId,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, anDelayApp]
  )

  const delayExecution = useCallback(
    async (evmCallScript, onDone = noop) => {
      let intent = await anDelayApp.intent('delayExecution', [evmCallScript], {
        actAs: account,
      })

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
    [account, anDelayApp]
  )

  const pauseExecution = useCallback(
    async (scriptId, onDone = noop) => {
      let intent = await anDelayApp.intent('pauseExecution', [scriptId], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.PAUSE_EXECUTION]({
        scriptId,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, anDelayApp]
  )

  const resumeExecution = useCallback(
    async (scriptId, onDone = noop) => {
      let intent = await anDelayApp.intent('resumeExecution', [scriptId], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.RESUME_EXECUTION]({
        scriptId,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, anDelayApp]
  )

  const cancelExecution = useCallback(
    async (scriptId, onDone = noop) => {
      let intent = await anDelayApp.intent('cancelExecution', [scriptId], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[anDelayActions.CANCEL_EXECUTION]({
        scriptId,
      })

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, anDelayApp]
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
