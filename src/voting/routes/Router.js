import React from 'react'
import { Route, Switch } from 'react-router-dom'

import VotingApp from '../App'
import VoteSingle from '../components/VoteSingle'
import Test from '../components/Test'
import { VotingProvider } from '../providers/VotingProvider'
import { VoterProvider } from '../providers/VoterProvider'

function VotingRouter() {
  return (
    <Switch>
      {/* <Route path="/votes" component={VotingApp} /> */}
      <Route exact path="*/votes/:id" component={VoteSingle} />
      <Route exact path="*/" component={VotingApp} />
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
