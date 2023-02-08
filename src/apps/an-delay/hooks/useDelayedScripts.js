import { useConnect } from '@1hive/connect-react'
import { useMemo } from 'react'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { formatDelayedScript, getStatus } from '../lib/delay-utils'
import useNow from '@/hooks/shared/useNow'
import { useConnectedApp } from '@/providers/ConnectedApp'
import {
  buildExecutionTarget,
  buildExecutionTargetApps,
} from '@/utils/evmscript'

export const useDelayedScripts = () => {
  const { apps } = useOrganizationState()
  const { connectedApp } = useConnectedApp()

  const [rawDelayedScripts = [], rawDelayedScriptsStatus] = useConnect(
    () => connectedApp?.onDelayedScripts({ first: 50 }),
    [connectedApp]
  )
  const now = useNow()
  const delayStatus = (rawDelayedScripts || []).map(script =>
    getStatus(script, now)
  )

  return useMemo(() => {
    const decoratedDelayScripts = rawDelayedScripts.map((script, index) => ({
      ...formatDelayedScript(script),
      ...buildExecutionTarget(script.evmCallScript, apps),
      status: delayStatus[index],
    }))

    const executionTargetApps = buildExecutionTargetApps(
      apps,
      decoratedDelayScripts
    )

    return [decoratedDelayScripts, executionTargetApps, rawDelayedScriptsStatus]
  }, [apps, rawDelayedScripts, delayStatus, rawDelayedScriptsStatus])
}

export const useDelayedScript = scriptId => {
  const {
    apps,
    loading: orgStateLoading,
    error: orgStateError,
  } = useOrganizationState()
  const { connectedApp } = useConnectedApp()
  const [
    rawDelayedScript,
    { loading: rawDelayedScriptLoading, error: rawDelayedScriptError },
  ] = useConnect(() => connectedApp?.onDelayedScript(scriptId), [
    connectedApp,
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
