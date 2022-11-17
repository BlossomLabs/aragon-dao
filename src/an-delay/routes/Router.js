import React from 'react'
import { Header, Main, Tag } from '@aragon/ui'
import { Route, Switch } from 'react-router-dom'
import {
  ANDelaySettingsProvider,
  useANDelaySettings,
} from '../providers/ANDelaySettingsProvider'
import Delays from '../screens/Delays'
import DelayDetail from '../screens/DelayDetail'
import Title from '../components/Title'
import { IdentityProvider } from '../identity-manager'
import { useGuiStyle } from '../hooks/shared'
import { formatTime } from '../lib/math-utils'

const ANDelayRouter = () => (
  <Switch>
    <Route exact path="*/delays/:id" component={DelayDetail} />
    <Route exact path="*/" component={Delays} />
  </Switch>
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
  <IdentityProvider>
    <ANDelaySettingsProvider>
      <App />
    </ANDelaySettingsProvider>
  </IdentityProvider>
)
