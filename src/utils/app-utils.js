import { APPS_ROUTING, APP_CUSTOM_NAME } from '@/constants'
import { env } from '@/environment'
import { getIpfsUrlFromUri } from '../utils/ipfs-utils'

export function getAppPresentationByAddress(apps, appAddress) {
  const app = apps.find(({ address }) => address === appAddress)
  return app !== undefined ? getAppPresentation(app) : null
}

export function getAppPresentation(app) {
  const { contentUri, name, manifest } = app
  // Get human readable name and icon from manifest if available
  if (manifest && contentUri) {
    const { name: humanName, icons } = manifest
    const iconPath = icons && icons[0].src

    return {
      humanName: APP_CUSTOM_NAME.get(humanName) || humanName,
      iconSrc: iconPath ? getIpfsUrlFromUri(contentUri) + iconPath : '',
      name,
      appName: app.name,
      // shortenedName: SHORTENED_APPS_NAMES.get(name) || name,
    }
  }

  return null
}

export function getAppByName(apps, appName) {
  return apps.find(({ name }) => name === appName) || null
}

export function getAppLabel(appAddress) {
  const appAddress_ = appAddress.toLowerCase()
  if (env('BUDGET_APP_ADDRESSES').includes(appAddress_)) {
    return 'Budget'
  } else if (env('GOVERNANCE_APP_ADDRESSES').includes(appAddress_)) {
    return 'Governance'
  } else {
    return appAddress
  }
}

export function buildAppRoute(appName, appAddress) {
  return `/${APPS_ROUTING.get(appName)}/${appAddress}`
}

export const buildAppInstanceRoute = appName =>
  `/${APPS_ROUTING.get(appName)}/:appAddress`
