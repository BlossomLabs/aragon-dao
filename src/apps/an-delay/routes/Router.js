import React from 'react'
import { ANDelaySettingsProvider } from '../providers/ANDelaySettingsProvider'
import Delays from '../screens/Delays'
import DelayDetail from '../screens/DelayDetail'
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

export default () => (
  <ANDelaySettingsProvider>
    <ANDelayRouter />
  </ANDelaySettingsProvider>
)
