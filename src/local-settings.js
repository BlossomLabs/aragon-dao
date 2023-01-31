const APP_THEME = 'THEME'

// Get a setting from localStorage
function getLocalStorageSetting(confKey) {
  const storageKey = `${confKey}_KEY`
  return window.localStorage.getItem(storageKey)
}

function setLocalSetting(confKey, value) {
  const storageKey = `${confKey}_KEY`
  return window.localStorage.setItem(storageKey, value)
}

export function getAppTheme() {
  const storedAppTheme = getLocalStorageSetting(APP_THEME)
  if (storedAppTheme) {
    try {
      return JSON.parse(storedAppTheme)
    } catch (err) {}
  }
  return {
    // To be replaced by an “auto” state
    appearance: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
    theme: null,
  }
}

export function setAppTheme(appearance, theme = null) {
  return setLocalSetting(APP_THEME, JSON.stringify({ appearance, theme }))
}
