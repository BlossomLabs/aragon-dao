import React from 'react'
import { Route, Switch } from 'react-router-dom'

import FinanceRouter from '../apps/finance/routes/Router'
import ANDelayRouter from '../apps/an-delay/routes/Router'
import VotingRouter from '../apps/voting/routes/Router'
import TokenWrapperRouter from '../apps/token-wrapper/routes/Router'
import HomeScreen from '../components/HomeScreen'
import LayoutGutter from '@/components/Layout/LayoutGutter'
import LayoutLimiter from '@/components/Layout/LayoutLimiter'
import App404 from '@/components/App404'

function Router() {
  return (
    <LayoutGutter>
      <LayoutLimiter>
        <Switch>
          <Route exact path="/" component={HomeScreen} />
          <Route path="/delay" component={ANDelayRouter} />
          <Route path="/finance" component={FinanceRouter} />
          <Route path="/voting" component={VotingRouter} />
          <Route path="/wrapper" component={TokenWrapperRouter} />
          <Route path="*" component={App404} />
        </Switch>
      </LayoutLimiter>
    </LayoutGutter>
  )
}

export default Router
