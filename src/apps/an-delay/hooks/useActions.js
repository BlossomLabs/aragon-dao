import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { useWallet } from '@/providers/Wallet'
import radspec from '@/radspec'
import anDelayActions from '../actions/an-delay-action.types'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useGuardianState } from '@/providers/Guardian'
import { useANDelaySettings } from '../providers/ANDelaySettingsProvider'
import { useMounted } from '@/hooks/shared/useMounted'
import { useDescribeIntent } from '@/hooks/shared/useDescribeIntent'

export default function useActions() {
  const mounted = useMounted()
  const { account } = useWallet()
  const { callAsGuardian } = useGuardianState()
  const { connectedApp: connectedANDelayApp } = useConnectedApp()
  const { executionDelay } = useANDelaySettings()
  const describeIntent = useDescribeIntent()

  const execute = useCallback(
    async (script, onDone = noop) => {
      let intent = await connectedANDelayApp.intent(
        'execute',
        [script.id, script.evmCallScript],
        {
          actAs: account,
        }
      )

      intent = describeIntent(intent, radspec[anDelayActions.EXECUTE](script))

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, connectedANDelayApp, describeIntent, mounted]
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
    [account, connectedANDelayApp, describeIntent, executionDelay, mounted]
  )

  const pauseExecution = useCallback(
    async (script, onDone = noop) => {
      let intent = callAsGuardian(connectedANDelayApp, 'pauseExecution', [
        script.id,
      ])

      intent = describeIntent(
        intent,
        radspec[anDelayActions.PAUSE_EXECUTION](script)
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [callAsGuardian, connectedANDelayApp, describeIntent, mounted]
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

      intent = describeIntent(
        intent,
        radspec[anDelayActions.RESUME_EXECUTION](script)
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, connectedANDelayApp, describeIntent, mounted]
  )

  const cancelExecution = useCallback(
    async (script, onDone = noop) => {
      let intent = callAsGuardian(connectedANDelayApp, 'cancelExecution', [
        script.id,
      ])

      intent = describeIntent(
        intent,
        radspec[anDelayActions.CANCEL_EXECUTION](script)
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [callAsGuardian, connectedANDelayApp, describeIntent, mounted]
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
