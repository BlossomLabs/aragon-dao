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
      humanName,
      iconSrc: iconPath ? getIpfsUrlFromUri(contentUri) + iconPath : '',
      name,
      // shortenedName: SHORTENED_APPS_NAMES.get(name) || name,
    }
  }

  return null
}
