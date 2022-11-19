import { useConnect } from '@1hive/connect-react'
import { useMemo } from 'react'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import {
  buildExecutionTarget,
  formatDelayedScript,
  getStatus,
} from '../lib/delay-utils'
import { useNow } from './useNow'

export const useDelayedScripts = () => {
  const { apps, connectedANDelayApp } = useOrganizationState()
  const [rawDelayedScripts = [], { loading, error }] = useConnect(
    () => connectedANDelayApp?.onDelayedScripts({ first: 50 }),
    [connectedANDelayApp]
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
    connectedANDelayApp,
    loading: orgStateLoading,
    error: orgStateError,
  } = useOrganizationState()
  const [
    rawDelayedScript,
    { loading: rawDelayedScriptLoading, error: rawDelayedScriptError },
  ] = useConnect(() => connectedANDelayApp?.onDelayedScript(scriptId), [
    connectedANDelayApp,
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
