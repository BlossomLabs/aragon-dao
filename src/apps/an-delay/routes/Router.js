import React from 'react'
import { Main } from '@aragon/ui'
import { ANDelaySettingsProvider } from '../providers/ANDelaySettingsProvider'
import Delays from '../screens/Delays'
import DelayDetail from '../screens/DelayDetail'
import { useGuiStyle } from '@/hooks/shared'
import { AppRouting } from '@/components/AppRouting'

const ANDelayRouter = () => (
  <AppRouting
    appName="an-delay"
    defaultPath="scripts"
    appRoutes={[
      ['scripts', Delays],
      ['scripts/:id', DelayDetail],
    ]}
  />
)

const App = () => {
  const { appearance } = useGuiStyle()

  return (
    <Main theme={appearance} assetsUrl="./aragon-ui">
      <ANDelayRouter />
    </Main>
  )
}
export default () => (
  <ANDelaySettingsProvider>
    <App />
  </ANDelaySettingsProvider>
)
