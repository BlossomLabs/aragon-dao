import React from 'react'
import { APPS_ROUTING } from '@/constants'
import { Redirect, Route, Switch } from 'react-router-dom'
import { buildAppInstanceRoute } from '@/utils/app-utils'
import { useOrganizationState } from '@/providers/OrganizationProvider'

export const AppRouting = ({ appName, defaultPath, appRoutes, children }) => {
  const { apps } = useOrganizationState()

  const app = apps.filter(app => app.name === appName)
  const defaultAppAddress = app?.address ?? ''
  const appRoutingName = APPS_ROUTING.get(appName)
  const appInstancePath = buildAppInstanceRoute(appName)

  return (
    <Switch>
      <Redirect
        exact
        path={`/${appRoutingName}`}
        to={`/${appRoutingName}/${defaultAppAddress}`}
      />
      {defaultPath && (
        <Redirect
          exact
          path={appInstancePath}
          to={`${appInstancePath}/${defaultPath}`}
        />
      )}
      {appRoutes.map(([path, component]) => (
        <Route
          key={path}
          exact
          path={`*${appInstancePath}/${path}`}
          component={component}
        />
      ))}
      {children}
    </Switch>
  )
}
