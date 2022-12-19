import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import VotingApp from '../App'
import VoteSingle from '../components/VoteSingle'
import { VotingProvider } from '../providers/VotingProvider'
import { VoterProvider } from '../providers/VoterProvider'

function VotingRouter() {
  return (
    <Switch>
      <Redirect
        exact
        path="/voting/:appAddress"
        to={'/voting/:appAddress/votes'}
      />
      <Route
        exact
        path="*/voting/:appAddress/votes/:id"
        component={VoteSingle}
      />
      <Route exact path="*/voting/:appAddress/votes" component={VotingApp} />
    </Switch>
  )
}

export default () => (
  <VotingProvider>
    <VoterProvider>
      <VotingRouter />
    </VoterProvider>
  </VotingProvider>
)
