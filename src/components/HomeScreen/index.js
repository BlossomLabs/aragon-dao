import { GU, textStyle } from '@aragon/ui'
import React, { useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { APPS_MENU_PANEL } from '../../constants'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { buildAppRoute, getAppPresentation } from '../../utils/app-utils'
import AppIcon from '../AppIcon/AppIcon'
import AppCard from './AppCard'

const HomeScreen = () => {
  const history = useHistory()
  const { apps } = useOrganizationState()
  const menuApps = useMemo(() => {
    if (!apps) {
      return []
    }

    let menuApps = {}
    apps
      .filter(app => APPS_MENU_PANEL.includes(app.name))
      .sort((app1, app2) => {
        return app1.name.localeCompare(app2.name)
      })
      .forEach(app => {
        if (!menuApps[app.codeAddress]) {
          menuApps[app.codeAddress] = app
        }
      })

    return Object.keys(menuApps).map(codeAddress => {
      const app = menuApps[codeAddress]
      const appPresentation = getAppPresentation(app)
      return {
        ...app,
        ...appPresentation,
        icon: <AppIcon app={app} src={appPresentation.iconSrc} size={70} />,
      }
    })
  }, [apps])

  const onOpenApp = useCallback(
    (name, address) => {
      history.push(buildAppRoute(name, address))
    },
    [history]
  )

  return (
    <div>
      <div
        css={`
          height: 100vh;
          display: flex;
          gap: ${6 * GU}px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `}
      >
        <div
          css={`
            ${textStyle('title3')};
          `}
        >
          {menuApps.length ? 'Select an app' : 'No apps found'}
        </div>
        <div
          css={`
            display: flex;
            gap: ${4 * GU}px;
          `}
        >
          {menuApps.map(({ address, appName, humanName, icon }) => (
            <AppCard
              key={address}
              name={humanName}
              icon={icon}
              onClick={() => onOpenApp(appName, address)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
