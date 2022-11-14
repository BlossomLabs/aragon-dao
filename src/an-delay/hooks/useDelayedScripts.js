import { useConnect } from '@1hive/connect-react'
import { useEffect, useMemo, useState } from 'react'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { getStatus } from '../lib/delay-utils'
import { timestampToDate, toMilliseconds } from '../lib/time-utils'
import { useNow } from './utils-hooks'

const formatDelayedScript = ({
  id,
  evmCallScript,
  executionTime,
  pausedAt,
  timeSubmitted,
  totalTimePaused,
}) => ({
  id: parseInt(id),
  evmCallScript,
  executionTime: timestampToDate(executionTime),
  pausedAt: timestampToDate(pausedAt),
  timeSubmitted: timestampToDate(timeSubmitted),
  totalTimePaused: timestampToDate(totalTimePaused),
})

const buildDecoratedDelayedScripts = async (delayedScripts, org) => {
  const forwardingPathDescriptions = await Promise.all(
    delayedScripts.map(script => org.describeScript(script.evmCallScript))
  )

  return delayedScripts.map((s, i) => ({
    ...formatDelayedScript(s),
    path: forwardingPathDescriptions[i],
    executionTargetData: {
      address: '',
      iconSrc: '',
      identifier: '',
      name: 'name',
    },
  }))
}

export const useDelayedScripts = () => {
  const [decoratedDelayedScripts, setDecoratedDelayedScripts] = useState([])
  const [loading, setLoading] = useState(false)
  const { connectedANDelayApp, organization } = useOrganizationState()
  const [rawDelayedScripts, rawDelayedScriptsStatus] = useConnect(
    () => connectedANDelayApp.onDelayedScripts({ first: 50 }),
    [connectedANDelayApp]
  )
  const now = useNow()
  const delayStatus = (rawDelayedScripts || []).map(script =>
    getStatus(script, now)
  )
  const delayStatusKey = delayStatus.map(String).join('')

  useEffect(() => {
    if (!organization || !rawDelayedScripts) {
      return
    }

    console.log('onDelayedScripts executed')
    async function decorate() {
      setLoading(true)
      const result = await buildDecoratedDelayedScripts(
        rawDelayedScripts,
        organization
      )
      setDecoratedDelayedScripts(result)
      setLoading(false)
    }

    decorate()
  }, [rawDelayedScripts, organization])

  return [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() =>
      decoratedDelayedScripts.map(
        (s, index) => ({
          ...s,
          status: delayStatus[index],
        }),
        [decoratedDelayedScripts, delayStatusKey]
      )
    ),
    { loading: rawDelayedScriptsStatus.loading || loading },
  ]
}
