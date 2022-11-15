import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { ANDelayProvider } from '../providers/ANDelayProvider'
import ANDelayApp from '../App'
import DelayDetail from '../screens/DelayDetail'

const ANDelayRouter = () => (
  <Switch>
    <Route exact path="*/delays/:id" component={DelayDetail} />
    <Route exact path="*/" component={ANDelayApp} />
  </Switch>
)
export default () => (
  <ANDelayProvider>
    <ANDelayRouter />
  </ANDelayProvider>
)
