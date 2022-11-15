import { useConnect } from '@1hive/connect-react'
import { useEffect, useMemo, useState } from 'react'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { decorateDelayedScript, getStatus } from '../lib/delay-utils'
import { useNow } from './utils-hooks'

const useDecoratedDelayedScripts = delayedScriptOrScripts => {
  const [
    decoratedDelayedScriptOrScripts,
    setDecoratedDelayedScriptOrScripts,
  ] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState()
  const {
    organization,
    loading: orgStateLoading,
    error: orgStateError,
  } = useOrganizationState()
  const [
    installedApps,
    { loading: appsLoading, error: appsError },
  ] = useConnect(org => org.apps())
  const loading = isLoading || orgStateLoading || appsLoading
  const error = orgStateError || appsError || errorMsg

  useEffect(() => {
    if (!installedApps || !organization || !delayedScriptOrScripts) {
      return
    }

    async function decorate() {
      setIsLoading(true)
      if (Array.isArray(delayedScriptOrScripts)) {
        const decoratedDelayedScripts = await Promise.all(
          delayedScriptOrScripts.map(s =>
            decorateDelayedScript(s, installedApps, organization)
          )
        )
        setDecoratedDelayedScriptOrScripts(decoratedDelayedScripts)
      } else {
        const decoratedDelayedScript = await decorateDelayedScript(
          delayedScriptOrScripts,
          installedApps,
          organization
        )
        setDecoratedDelayedScriptOrScripts(decoratedDelayedScript)
      }
      setIsLoading(false)
    }

    decorate().catch(err => {
      console.error(err)
      setErrorMsg(err.message)
    })
  }, [installedApps, organization, delayedScriptOrScripts])

  return [decoratedDelayedScriptOrScripts, { loading, error }]
}

export const useDelayedScripts = () => {
  const { connectedANDelayApp } = useOrganizationState()
  const [installedApps] = useConnect(org => org.apps())
  const [
    rawDelayedScripts,
    { loading: delayedScriptsLoading, error: delayedScriptsError },
  ] = useConnect(() => connectedANDelayApp?.onDelayedScripts({ first: 50 }), [
    connectedANDelayApp,
  ])
  const [
    decoratedDelayedScripts = [],
    { loading: decorateLoading, error: decorateError },
  ] = useDecoratedDelayedScripts(rawDelayedScripts)
  const now = useNow()
  const delayStatus = (rawDelayedScripts || []).map(script =>
    getStatus(script, now)
  )
  const delayStatusKey = delayStatus.map(String).join('')
  const executionTargets = (installedApps || [])
    .filter(app =>
      decoratedDelayedScripts.some(({ executionTargets }) =>
        executionTargets.includes(app.address)
      )
    )
    .map(({ address, name }) => ({
      appAddress: address,
      identifier: address,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const loading = delayedScriptsLoading || decorateLoading
  const error = delayedScriptsError || decorateError

  return [
    [
      useMemo(
        () =>
          decoratedDelayedScripts.map((s, index) => ({
            ...s,
            status: delayStatus[index],
          })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [decoratedDelayedScripts, delayStatusKey]
      ),
      executionTargets,
    ],
    { loading, error },
  ]
}

export const useDelayedScript = scriptId => {
  const {
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
  const [
    decoratedDelayedScript,
    { loading: decorateLoading, error: decorateError },
  ] = useDecoratedDelayedScripts(rawDelayedScript)
  const now = useNow()
  const status = rawDelayedScript ? getStatus(rawDelayedScript, now) : undefined

  const loading = orgStateLoading || rawDelayedScriptLoading || decorateLoading
  const error = orgStateError || rawDelayedScriptError || decorateError

  return useMemo(() => {
    return [
      decoratedDelayedScript
        ? {
            ...decoratedDelayedScript,
            status,
          }
        : undefined,
      { loading, error },
    ]
  }, [decoratedDelayedScript, status, loading, error])
}
