import { useConnect } from '@1hive/connect-react'
import { useMemo } from 'react'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import {
  buildExecutionTarget,
  formatDelayedScript,
  getStatus,
} from '../lib/delay-utils'
import useNow from '@/hooks/shared/useNow'

export const useDelayedScripts = () => {
  const { apps, currentConnectedApp } = useOrganizationState()
  const [rawDelayedScripts = [], { loading, error }] = useConnect(
    () => currentConnectedApp?.onDelayedScripts({ first: 50 }),
    [currentConnectedApp]
  )
  const now = useNow()
  const delayStatus = (rawDelayedScripts || []).map(script =>
    getStatus(script, now)
  )
  const delayStatusKey = delayStatus.map(String).join('')

  return [
    useMemo(
      () =>
        rawDelayedScripts.map((script, index) => ({
          ...formatDelayedScript(script),
          ...buildExecutionTarget(script.evmCallScript, apps),
          status: delayStatus[index],
        })),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [apps, rawDelayedScripts, delayStatusKey]
    ),
    { loading, error },
  ]
}

export const useDelayedScript = scriptId => {
  const {
    apps,
    currentConnectedApp,
    loading: orgStateLoading,
    error: orgStateError,
  } = useOrganizationState()
  const [
    rawDelayedScript,
    { loading: rawDelayedScriptLoading, error: rawDelayedScriptError },
  ] = useConnect(() => currentConnectedApp?.onDelayedScript(scriptId), [
    currentConnectedApp,
    scriptId,
  ])
  const now = useNow()
  const loading = orgStateLoading || rawDelayedScriptLoading
  const error = orgStateError || rawDelayedScriptError
  const status = rawDelayedScript ? getStatus(rawDelayedScript, now) : null

  return [
    useMemo(
      () =>
        rawDelayedScript
          ? {
              ...formatDelayedScript(rawDelayedScript),
              ...buildExecutionTarget(rawDelayedScript.evmCallScript, apps),
              status,
            }
          : undefined,
      [apps, rawDelayedScript, status]
    ),
    { loading, error },
  ]
}
