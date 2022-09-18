import { DEFAULT_CHAIN_ID } from './constants'

const PREFERRED_CHAIN_ID_KEY = 'CHAIN_ID'

// Get a setting from localStorage
function getLocalStorageSetting(confKey) {
  const storageKey = `${confKey}_KEY`
  return window.localStorage.getItem(storageKey)
}

export function getPreferredChain() {
  return (
    Number(getLocalStorageSetting(PREFERRED_CHAIN_ID_KEY)) || DEFAULT_CHAIN_ID
  )
}
