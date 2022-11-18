import { decodeForwardingPath } from '@1hive/connect-react'
import STATUS from '../delay-status-types'
import { addressesEqual, EMPTY_ADDRESS } from '../web3-utils'
import { dateToEpoch, timestampToDate, toMilliseconds } from './time-utils'

export const buildExecutionTarget = (evmCallScript, installedApps) => {
  if (!evmCallScript || !evmCallScript.length) {
    return {}
  }

  const forwardingPathSteps = decodeForwardingPath(evmCallScript)
  const executionTargetAddresses = new Set(
    forwardingPathSteps.map(step => step.to.toLowerCase())
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
      let appIconSrc = null

      if (appIcons && appIcons.length) {
        let appIcon = appIcons.find(icon => icon.sizes === '24x24')

        if (!appIcon) {
          appIcon = appIcons[0]
        }

        appIconSrc = appIcon.src
      }

      targetApp = {
        address: installedApp.address,
        icon: appIconSrc,
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
    executionTargets: [...executionTargetAddresses.values()],
  }
}

export function getStatus({ executionTime, pausedAt }, now) {
  if (pausedAt && parseInt(pausedAt)) return STATUS.PAUSED

  if (executionTime <= dateToEpoch(now)) return STATUS.PENDING_EXECUTION

  return STATUS.ONGOING
}

export const formatDelayedScript = delayedScript => {
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
