import { useConnect } from '@1hive/connect-react'
import { useMemo } from 'react'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { buildExecutionTarget, getStatus } from '../lib/delay-utils'
import { useNow } from './useNow'

export const useDelayedScripts = () => {
  const { apps, connectedANDelayApp } = useOrganizationState()
  const [delayedScripts = [], { loading, error }] = useConnect(
    () => connectedANDelayApp?.onDelayedScripts({ first: 50 }),
    [connectedANDelayApp]
  )
  const now = useNow()
  const delayStatus = (delayedScripts || []).map(script =>
    getStatus(script, now)
  )
  const delayStatusKey = delayStatus.map(String).join('')

  return [
    useMemo(
      () =>
        delayedScripts.map((script, index) => ({
          ...script,
          ...buildExecutionTarget(script.evmCallScript, apps),
          status: delayStatus[index],
        })),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [apps, delayedScripts, delayStatusKey]
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
    delayedScript = {},
    { loading: rawDelayedScriptLoading, error: rawDelayedScriptError },
  ] = useConnect(() => connectedANDelayApp?.onDelayedScript(scriptId), [
    connectedANDelayApp,
    scriptId,
  ])
  const now = useNow()
  const loading = orgStateLoading || rawDelayedScriptLoading
  const error = orgStateError || rawDelayedScriptError
  const status = getStatus(delayedScript, now)

  return [
    useMemo(
      () => ({
        ...delayedScript,
        ...buildExecutionTarget(delayedScript.evmCallScript, apps),
        status,
      }),
      [apps, delayedScript, status]
    ),
    { loading, error },
  ]
}
