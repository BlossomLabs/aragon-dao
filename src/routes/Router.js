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
import AppLayout from '@/components/Layout/AppLayout'

function Router() {
  return (
    <LayoutGutter>
      <LayoutLimiter>
        <AppLayout>
          <Switch>
            <Route exact path="/" component={HomeScreen} />
            <Route path="/delay" component={ANDelayRouter} />
            <Route path="/finance" component={FinanceRouter} />
            <Route path="/voting" component={VotingRouter} />
            <Route path="/token-wrapper" component={TokenWrapperRouter} />
            <Route
              path="*"
              render={props => {
                return (
                  <NotFoundScreen
                    {...props}
                    text="Oops, the current app is not installed on this DAO."
                  />
                )
              }}
            />
          </Switch>
        </AppLayout>
      </LayoutLimiter>
    </LayoutGutter>
  )
}

export default Router
