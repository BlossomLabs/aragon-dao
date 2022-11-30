import React from 'react'
import { Route, Switch } from 'react-router-dom'

import ANDelayRouter from '../apps/an-delay/routes/Router'
import VotingRouter from '../apps/voting/routes/Router'
import TokenWrapperRouter from '../apps/token-wrapper/routes/Router'
import HomeScreen from '../components/HomeScreen'

function Router() {
  return (
    <Switch>
      <Route exact path="/" component={HomeScreen} />
      <Route path="/delay" component={ANDelayRouter} />
      <Route path="/voting" component={VotingRouter} />
      <Route path="/wrapper" component={TokenWrapperRouter} />
    </Switch>
  )
}

export default Router
