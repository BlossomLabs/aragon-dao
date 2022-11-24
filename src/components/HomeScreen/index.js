import { GU, textStyle } from '@aragon/ui'
import React, { useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { APPS_MENU_PANEL, APPS_ROUTING } from '../../constants'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { getAppPresentation } from '../../utils/app-utils'
import AppIcon from '../AppIcon/AppIcon'
import AppCard from './AppCard'

const HomeScreen = () => {
  const history = useHistory()
  const { apps } = useOrganizationState()
  const menuApps = useMemo(() => {
    if (!apps) {
      return []
    }

    const returned = apps
      .filter(app => APPS_MENU_PANEL.includes(app.name))
      .map(app => {
        const appPresentation = getAppPresentation(app)
        return {
          ...app,
          ...appPresentation,
          icon: <AppIcon app={app} src={appPresentation.iconSrc} size={70} />,
        }
      })
    return returned
  }, [apps])

  const onOpenApp = useCallback(
    app => {
      history.push(`/${app}`)
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
          Select an app
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
              onClick={() => onOpenApp(APPS_ROUTING.get(appName))}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
