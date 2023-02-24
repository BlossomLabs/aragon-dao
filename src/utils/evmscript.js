import { decodeForwardingPath } from '@1hive/connect-react'
import { constants } from 'ethers'
import { getAppPresentation, getAppPresentationByAddress } from './app-utils'
import { addressesEqual } from './web3-utils'
import { VOTING_REFERENCE_SEPARATOR } from '@/constants'
import { parseStringWithSeparator } from './text-utils'
import { toUtf8String } from 'ethers/lib/utils'

const CONTEXT_SEPARATOR_REGEX = /\|/

export const EMPTY_CALLSCRIPT = '0x00000001'
export const EMPTY_CALLSCRIPT_UTF8 = '0x30783030303030303031'

const SIGNALING_VOTE_DESCRIPTION_PREFIX = 'Create a new vote about'

export function isEmptyCallScript(script) {
  return (
    script === EMPTY_CALLSCRIPT ||
    script === '0x00' ||
    // Signaling votes contains an utf8-encoded empty callscript
    script === EMPTY_CALLSCRIPT_UTF8
  )
}

export function getDeepestForwardingSteps(steps) {
  if (steps.length > 1) {
    return steps
  }

  const step = steps[0]

  if (step.children) {
    return getDeepestForwardingSteps(step.children)
  }

  return [step]
}

export const buildExecutionTarget = (evmCallScript, installedApps) => {
  if (!evmCallScript || !evmCallScript.length) {
    return {}
  }

  const forwardingPathSteps = decodeForwardingPath(evmCallScript)
  const deepestForwardingPathStep = getDeepestForwardingSteps(
    forwardingPathSteps
  )

  const executionTargetAddresses = new Set(
    deepestForwardingPathStep.map(step => step.to.toLowerCase())
  )

  let targetApp

  if (executionTargetAddresses.length > 1) {
    // If there's multiple targets, make a "multiple" version
    targetApp = {
      address: constants.AddressZero,
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
        iconSrc: null,
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
        iconSrc: appIconSrc,
        name: installedApp.manifest.name,
      }
    }
  }

  let executionTargetData = {}
  if (targetApp) {
    const { address, iconSrc, name } =
      getAppPresentation(targetApp) ?? targetApp
    executionTargetData = {
      address,
      name,
      iconSrc,
      identifier: address,
    }
  }

  return {
    executionTargetData,
    executionTargets: [...executionTargetAddresses.values()],
  }
}

// Reduce the list of installed apps to just those that have been targetted by apps
export const buildExecutionTargetApps = (apps, entities) =>
  apps
    .filter(app =>
      entities?.some(data =>
        data?.executionTargets?.includes(app.address.toLowerCase())
      )
    )
    .map(app => ({
      appAddress: app.address,
      ...getAppPresentation(app),
      identifier: app.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

export function targetDataFromTransactionRequest(apps, describedSteps) {
  const steps = getDeepestForwardingSteps(describedSteps)

  if (steps.length > 1) {
    // If there's multiple targets, make a "multiple" version
    return {
      address: constants.AddressZero,
      name: 'Multiple',
    }
  } else {
    const [{ to: targetAppAddress, name, identifier }] = steps

    // Populate details via our apps list if it's available
    if (apps.some(({ address }) => addressesEqual(address, targetAppAddress))) {
      const appPresentation = getAppPresentationByAddress(
        apps,
        targetAppAddress
      )

      return {
        address: targetAppAddress,
        name: appPresentation !== null ? appPresentation.humanName : '',
        icon: appPresentation !== null ? appPresentation.iconSrc : '',
      }
    }

    // Otherwise provide some fallback values
    return {
      address: targetAppAddress,
      name: name || identifier,
      icon: '',
    }
  }
}

function buildSignalingVoteDescription(context) {
  return `${SIGNALING_VOTE_DESCRIPTION_PREFIX} "${context}"`
}

export function processSignalingVoteDescription(rawDescription) {
  const [, quotedDescription] = rawDescription.split(
    SIGNALING_VOTE_DESCRIPTION_PREFIX
  )

  let unquotedDescription = quotedDescription
    .trim()
    .slice(1, quotedDescription.length - 2)

  if (unquotedDescription.startsWith('0x')) {
    unquotedDescription = toUtf8String(unquotedDescription)
  }

  const [text, reference] = parseContext(unquotedDescription)

  return {
    formattedDescription: buildSignalingVoteDescription(text),
    reference,
  }
}

export function buildContext(title, reference) {
  return title.concat(VOTING_REFERENCE_SEPARATOR, reference)
}

export function parseContext(context) {
  if (!context) {
    return []
  }

  const [title, reference] = parseStringWithSeparator(
    context,
    CONTEXT_SEPARATOR_REGEX
  )

  return [title?.trim(), reference?.trim()]
}
