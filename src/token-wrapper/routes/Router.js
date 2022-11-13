import React from 'react'
import { Route, Switch } from 'react-router-dom'

import TokenWrapperApp from '../App'

function TokenWrapperRouter() {
  console.log('ROUTER!!!!!!')
  return (
    <Switch>
      <Route path="*/" component={TokenWrapperApp} />
    </Switch>
  )
}

export default TokenWrapperRouter
