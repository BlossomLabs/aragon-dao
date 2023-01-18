import React from 'react'
import { Route, Switch } from 'react-router-dom'

import FinanceRouter from '../apps/finance/routes/Router'
import ANDelayRouter from '../apps/an-delay/routes/Router'
import VotingRouter from '../apps/voting/routes/Router'
import TokenWrapperRouter from '../apps/token-wrapper/routes/Router'
import HomeScreen from '../components/HomeScreen'
import LayoutGutter from '@/components/Layout/LayoutGutter'
import LayoutLimiter from '@/components/Layout/LayoutLimiter'
import NotFoundScreen from '@/components/NotFoundScreen'

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
          <Route
            path="*"
            render={props => (
              <NotFoundScreen
                {...props}
                text="Oops, we couldn't find an app installed here."
              />
            )}
          />
        </Switch>
      </LayoutLimiter>
    </LayoutGutter>
  )
}

export default Router
