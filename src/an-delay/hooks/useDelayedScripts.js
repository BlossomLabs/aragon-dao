import { addressesEqual, useConnect } from '@1hive/connect-react'
import { useEffect, useMemo, useState } from 'react'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { getStatus } from '../lib/delay-utils'
import { timestampToDate, toMilliseconds } from '../lib/time-utils'
import { EMPTY_ADDRESS } from '../web3-utils'
import { useNow } from './utils-hooks'

const formatDelayedScript = delayedScript => {
  const {
    id,
    evmCallScript,
    executionTime,
    pausedAt,
    timeSubmitted,
    totalTimePaused,
  } = delayedScript

  return {
    ...delayedScript,
    id: parseInt(id),
    evmCallScript,
    executionTime: timestampToDate(executionTime),
    pausedAt: timestampToDate(pausedAt),
    timeSubmitted: timestampToDate(timeSubmitted),
    totalTimePaused: toMilliseconds(totalTimePaused),
  }
}

const buildExecutionTarget = (forwardingPathDescription, installedApps) => {
  const executionTargetAddresses = new Set(
    forwardingPathDescription.describedSteps.map(step => step.to)
  )
  let targetApp

  if (executionTargetAddresses.length > 1) {
    // If there's multiple targets, make a "multiple" version
    targetApp = {
      address: EMPTY_ADDRESS,
      name: 'Multiple',
    }
  } else {
    // Otherwise, try to find the target from the installed apps
    const [targetAddress] = executionTargetAddresses

    const installedApp = installedApps.find(app =>
      addressesEqual(app.address, targetAddress)
    )

    if (!installedApp) {
      targetApp = {
        address: targetAddress,
        icon: null,
        name: 'External',
      }
    } else {
      const appIcons = installedApp.manifest.icons
      const appIcon =
        appIcons && appIcons.length
          ? appIcons.find(icon => icon.sizes === '24x24')?.src ??
            appIcons[0].src
          : null
      targetApp = {
        address: installedApp.address,
        icon: appIcon,
        name: installedApp.name,
      }
    }
  }

  let executionTargetData = {}

  if (targetApp) {
    const { address, icon, name } = targetApp
    executionTargetData = {
      address,
      name,
      iconSrc: icon,
      identifier: address,
    }
  }

  return {
    executionTargetData,
    executionTargetAddresses: [...executionTargetAddresses.values()],
  }
}

const buildDecoratedDelayedScripts = async (
  delayedScripts,
  installedApps,
  org
) => {
  const forwardingPathDescriptions = await Promise.all(
    delayedScripts.map(script => org.describeScript(script.evmCallScript))
  )

  return delayedScripts.map((s, i) => {
    const forwardingPathDescription = forwardingPathDescriptions[i]
    const {
      executionTargetAddresses,
      executionTargetData,
    } = buildExecutionTarget(forwardingPathDescription, installedApps)
    return {
      ...formatDelayedScript(s),
      path: forwardingPathDescription.describedSteps,
      executionTargets: executionTargetAddresses,
      executionTargetData,
    }
  })
}

export const useDelayedScripts = () => {
  const [decoratedDelayedScripts, setDecoratedDelayedScripts] = useState([])
  const [loading, setLoading] = useState(false)
  const { connectedANDelayApp, organization } = useOrganizationState()
  const [installedApps] = useConnect(org => org.apps())
  const [rawDelayedScripts, rawDelayedScriptsStatus] = useConnect(
    () => connectedANDelayApp.onDelayedScripts({ first: 50 }),
    [connectedANDelayApp]
  )
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

  useEffect(() => {
    if (!installedApps || !organization || !rawDelayedScripts) {
      return
    }

    async function decorate() {
      setLoading(true)
      const result = await buildDecoratedDelayedScripts(
        rawDelayedScripts,
        installedApps,
        organization
      )
      setDecoratedDelayedScripts(result)
      setLoading(false)
    }

    decorate()
  }, [rawDelayedScripts, installedApps, organization])

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
    { loading: rawDelayedScriptsStatus.loading || loading },
  ]
}
