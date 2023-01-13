import React from 'react'
import { Header, Main, Tag } from '@aragon/ui'
import {
  ANDelaySettingsProvider,
  useANDelaySettings,
} from '../providers/ANDelaySettingsProvider'
import Delays from '../screens/Delays'
import DelayDetail from '../screens/DelayDetail'
import Title from '../components/Title'
import { useGuiStyle } from '@/hooks/shared'
import { AppRouting } from '@/components/AppRouting'
import { formatTime } from '@/utils/time-utils'

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
  const { executionDelay } = useANDelaySettings()

  const { appearance } = useGuiStyle()

  return (
    <Main theme={appearance} assetsUrl="./aragon-ui">
      <Header
        primary={
          <Title
            text="Delay"
            after={
              executionDelay && (
                <Tag mode="identifier" uppercase={false}>
                  {formatTime(executionDelay)}
                </Tag>
              )
            }
          />
        }
      />
      <ANDelayRouter />
    </Main>
  )
}
export default () => (
  <ANDelaySettingsProvider>
    <App />
  </ANDelaySettingsProvider>
)
