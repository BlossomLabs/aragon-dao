import React, { useCallback, useContext, useMemo, useState } from 'react'
import { getAppTheme, setAppTheme } from '../local-settings'

const SETTINGS_THEME = getAppTheme()
const AppThemeContext = React.createContext(SETTINGS_THEME)

function AppThemeProvider({ children }) {
  const [appearance, setAppearance] = useState(SETTINGS_THEME.appearance)
  const [theme, setTheme] = useState(SETTINGS_THEME.theme)

  const toggleAppearance = useCallback(() => {
    const newAppearance = appearance === 'light' ? 'dark' : 'light'
    setAppearance(newAppearance)
    setTheme(null)
    setAppTheme(newAppearance)
  }, [appearance])

  const appTheme = useMemo(
    () => ({
      appearance,
      theme,
      toggleAppearance,
    }),
    [appearance, theme, toggleAppearance]
  )

  return (
    <AppThemeContext.Provider value={appTheme}>
      {children}
    </AppThemeContext.Provider>
  )
}

function useAppTheme() {
  return useContext(AppThemeContext)
}

export { AppThemeProvider, useAppTheme }
