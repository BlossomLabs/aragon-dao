import { GU, textStyle, useViewport } from '@aragon/ui'
import React, { useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { APPS_MENU_PANEL } from '../../constants'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { buildAppRoute, getAppPresentation } from '../../utils/app-utils'
import AppIcon from '../AppIcon/AppIcon'
import AppCard from './AppCard'

const HomeScreen = () => {
  const { below } = useViewport()
  const compactMode = below('large')
  const history = useHistory()
  const { apps } = useOrganizationState()
  const menuApps = useMemo(() => {
    if (!apps) {
      return []
    }

    let menuApps = {}
    apps
      .filter(app => APPS_MENU_PANEL.includes(app.name))
      .forEach(app => {
        if (!menuApps[app.codeAddress]) {
          menuApps[app.codeAddress] = app
        }
      })

    return Object.keys(menuApps)

      .map(codeAddress => {
        const app = menuApps[codeAddress]
        const appPresentation = getAppPresentation(app)
        return {
          ...app,
          ...appPresentation,
          icon: <AppIcon app={app} src={appPresentation.iconSrc} size={85} />,
        }
      })
      .sort((app1, app2) => app1.humanName.localeCompare(app2.humanName))
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
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: grid;
          align-items: center;
          justify-content: center;

          overflow: auto;
        `}
      >
        <div
          css={`
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: ${5 * GU}px;
            padding: ${7 * GU}px 0;
          `}
        >
          <div
            css={`
              ${textStyle('title2')};
            `}
          >
            {menuApps.length ? 'Select an app' : 'No apps found'}
          </div>

          <div
            css={`
              display: flex;
              flex-direction: ${compactMode ? 'column' : 'row'};
              gap: ${3 * GU}px;
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
    </div>
  )
}

export default HomeScreen
