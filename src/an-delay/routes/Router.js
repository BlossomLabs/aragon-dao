import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { ANDelayProvider } from '../providers/ANDelayProvider'
import ANDelayApp from '../App'

const ANDelayRouter = () => (
  <Switch>
    <Route exact path="*/" component={ANDelayApp} />
  </Switch>
)
export default () => (
  <ANDelayProvider>
    <ANDelayRouter />
  </ANDelayProvider>
)
