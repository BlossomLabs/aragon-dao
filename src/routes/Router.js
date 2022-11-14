import React from 'react'
import { Route, Routes, Switch } from 'react-router-dom'

// import VotingApp from '../voting/App'
import VotingRouter from '../voting/routes/Router'
import TokenWrapperRouter from '../token-wrapper/routes/Router'

function Router() {
  return (
    <Switch>
      <Route exact path="/" component={VotingRouter} />
      <Route path="/votes" component={VotingRouter} />
      <Route path="/wrapper" component={TokenWrapperRouter} />
    </Switch>
  )
}

export default Router
