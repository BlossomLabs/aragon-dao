import React from 'react'
import { Route, Routes, Switch } from 'react-router-dom'

// import VotingApp from '../voting/App'
import VotingRouter from '../voting/routes/Router'

function Router() {
  return (
    <Switch>
      <Route exact path="/" component={VotingRouter} />
      <Route path="/votes" component={VotingRouter} />
    </Switch>
  )
}

export default Router
