import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { useWallet } from '@/providers/Wallet'
import radspec from '@/radspec'
import anDelayActions from '../actions/an-delay-action.types'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useGuardianState } from '@/providers/Guardian'
import { useANDelaySettings } from '../providers/ANDelaySettingsProvider'
import { useGasLimit } from '@/hooks/shared/useGasLimit'
import { describeIntent, imposeGasLimit } from '@/utils/tx-utils'
import { useMounted } from '@/hooks/shared/useMounted'

export default function useActions() {
  const mounted = useMounted()
  const { account } = useWallet()
  const { callAsGuardian } = useGuardianState()
  const { connectedApp: connectedANDelayApp } = useConnectedApp()
  const { executionDelay } = useANDelaySettings()
  const [GAS_LIMIT] = useGasLimit()

  const execute = useCallback(
    async (script, onDone = noop) => {
      let intent = await connectedANDelayApp.intent(
        'execute',
        [script.id, script.evmCallScript],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(intent, radspec[anDelayActions.EXECUTE](script))

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, connectedANDelayApp, GAS_LIMIT, mounted]
  )

  const delayExecution = useCallback(
    async (script, onDone = noop) => {
      let intent = await connectedANDelayApp.intent(
        'delayExecution',
        [script.evmCallScript],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(
        intent,
        radspec[anDelayActions.DELAY_EXECUTION]({
          id: script.id,
          executionDelay,
        })
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, connectedANDelayApp, executionDelay, GAS_LIMIT, mounted]
  )

  const pauseExecution = useCallback(
    async (script, onDone = noop) => {
      let intent = await connectedANDelayApp.intent(
        'pauseExecution',
        [script.id],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(
        intent,
        radspec[anDelayActions.PAUSE_EXECUTION](script)
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, connectedANDelayApp, GAS_LIMIT, mounted]
  )

  const resumeExecution = useCallback(
    async (script, onDone = noop) => {
      let intent = await connectedANDelayApp.intent(
        'resumeExecution',
        [script.id],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(
        intent,
        radspec[anDelayActions.RESUME_EXECUTION](script)
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, connectedANDelayApp, GAS_LIMIT, mounted]
  )

  const cancelExecution = useCallback(
    async (script, onDone = noop) => {
      let intent = {
        transactions: [
          callAsGuardian(connectedANDelayApp, 'cancelExecution', [script.id]),
        ],
      }

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(
        intent,
        radspec[anDelayActions.CANCEL_EXECUTION](script)
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [connectedANDelayApp, callAsGuardian, GAS_LIMIT, mounted]
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
