import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Spring, animated } from 'react-spring/renderprops'
import { GU, springs, textStyle, unselectable, useTheme } from '@aragon/ui'
import { useHistory, useLocation } from 'react-router'
import { lerp } from '../../utils/math-utils'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import MenuPanelAppGroup from './MenuPanelAppGroup'
import AppIcon from '../AppIcon/AppIcon'
import { buildAppRoute, getAppPresentation } from '../../utils/app-utils'
import { APPS_MENU_PANEL } from '../../constants'
import { addressesEqual } from '@/utils/web3-utils'

export const MENU_PANEL_SHADOW_WIDTH = 3
export const MENU_PANEL_WIDTH = 28 * GU

const { div: AnimDiv } = animated

function MenuPanel({
  appInstanceGroups,
  appsStatus,
  daoAddress,
  daoStatus,
  // onOpenApp,
  showOrgSwitcher,
}) {
  const { apps } = useOrganizationState()
  const history = useHistory()
  const location = useLocation()
  const [activeInstaceAddress, setActiveInstanceAddress] = useState()

  useEffect(() => {
    const parts = location.pathname.split('/')
    const appAddress = parts.length >= 2 ? parts[2] : null

    setActiveInstanceAddress(appAddress)
  }, [location])

  const onOpenApp = useCallback(
    (name, address) => {
      if (activeInstaceAddress === address) {
        return
      }

      setActiveInstanceAddress(address)
      history.push(buildAppRoute(name, address))
    },
    [activeInstaceAddress, history]
  )

  const menuApps = useMemo(() => {
    if (!apps) {
      return []
    }

    const appInstances = {}
    const allowedMenuApps = apps.filter(app =>
      APPS_MENU_PANEL.includes(app.name)
    )
    const appsSet = []

    allowedMenuApps.forEach(app => {
      if (!appInstances[app.codeAddress]) {
        appInstances[app.codeAddress] = []
        appsSet.push(app)
      }

      appInstances[app.codeAddress].push(app.address)
    })

    return appsSet
      .map(app => ({
        appId: app.appId,
        icon: <AppIcon app={app} src={getAppPresentation(app).iconSrc} />,
        name: getAppPresentation(app).humanName,
        appName: getAppPresentation(app).appName,
        instances: appInstances[app.codeAddress],
      }))
      .sort((app1, app2) => app1.name.localeCompare(app2.name))
  }, [apps])

  const renderAppGroup = useCallback(
    app => {
      const { appId, name, icon, appName, instances } = app

      const isActive =
        instances.findIndex(instance =>
          addressesEqual(instance, activeInstaceAddress)
        ) !== -1

      return (
        <div key={appId}>
          <MenuPanelAppGroup
            name={appName}
            humanName={name}
            icon={icon}
            instances={instances}
            activeInstance={activeInstaceAddress}
            onActivate={onOpenApp}
            active={isActive}
            expand={isActive}
          />
        </div>
      )
    },
    [activeInstaceAddress, onOpenApp]
  )

  return (
    <Main>
      <div
        css={`
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          flex-shrink: 1;
          box-shadow: 2px 0 ${MENU_PANEL_SHADOW_WIDTH}px rgba(0, 0, 0, 0.05);
        `}
      >
        <nav
          css={`
            overflow-y: auto;
            flex: 1 1 0;
            padding-top: ${(showOrgSwitcher ? 1 : 3) * GU}px;
          `}
        >
          <Heading label="Apps" />
          <div
            css={`
              margin-top: ${0.5 * GU}px;
            `}
          >
            {menuApps.map((app, index) => renderAppGroup(app, index))}
          </div>
        </nav>
      </div>
    </Main>
  )
}

// MenuPanel.propTypes = {
//   appInstanceGroups: PropTypes.arrayOf(AppInstanceGroupType).isRequired,
//   appsStatus: AppsStatusType.isRequired,
//   daoAddress: DaoAddressType.isRequired,
//   daoStatus: DaoStatusType.isRequired,
//   onOpenApp: PropTypes.func.isRequired,
//   showOrgSwitcher: PropTypes.bool,
// }

function AnimatedMenuPanel({
  autoClosing,
  className,
  // onMenuPanelClose,
  opened,
  ...props
}) {
  const theme = useTheme()
  const [animate, setAnimate] = useState(autoClosing)

  useEffect(() => {
    // If autoClosing has changed, it means we are switching from autoClosing
    // to fixed or the opposite, and we should stop animating the panel for a
    // short period of time.
    setAnimate(false)
    const animateTimer = setTimeout(() => setAnimate(true), 0)
    return () => clearTimeout(animateTimer)
  }, [autoClosing])

  return (
    <Spring
      from={{ menuPanelProgress: 0 }}
      to={{ menuPanelProgress: Number(opened) }}
      config={springs.lazy}
      immediate={!animate}
      native
    >
      {({ menuPanelProgress }) => (
        <div
          className={className}
          css={`
            /* When the panel is autoclosing, we want it over the top bar as well */
            ${autoClosing
              ? `
                position: absolute;
                height: 100%;
                width: 100%;
                top: 0;
                ${!opened ? 'pointer-events: none' : ''}
              `
              : ''}
          `}
        >
          {autoClosing && (
            <AnimDiv
              // onClick={onMenuPanelClose}
              css={`
                position: absolute;
                height: 100%;
                width: 100%;
                background: ${theme.overlay.alpha(0.9)};
                ${!opened ? 'pointer-events: none' : ''}
              `}
              style={{
                opacity: menuPanelProgress,
              }}
            />
          )}
          <AnimDiv
            css={`
              width: ${MENU_PANEL_WIDTH}px;
              height: 100%;
              flex: none;
            `}
            style={{
              position: autoClosing ? 'absolute' : 'relative',
              transform: menuPanelProgress.interpolate(
                v =>
                  `translate3d(
                    ${lerp(
                      v,
                      -(MENU_PANEL_WIDTH + MENU_PANEL_SHADOW_WIDTH),
                      0
                    )}px, 0, 0)`
              ),
            }}
          >
            <MenuPanel showOrgSwitcher={autoClosing} {...props} />
          </AnimDiv>
        </div>
      )}
    </Spring>
  )
}
AnimatedMenuPanel.propTypes = {
  autoClosing: PropTypes.bool,
  className: PropTypes.string,
  // onMenuPanelClose: PropTypes.func.isRequired,
  opened: PropTypes.bool,
  ...MenuPanel.propTypes,
}

function Main(props) {
  const theme = useTheme()
  return (
    <div
      css={`
        background: ${theme.surface};
        width: 100%;
        height: 100%;
        display: flex;
        flex: none;
        flex-direction: column;
        ${unselectable};
      `}
      {...props}
    />
  )
}

function Heading({ label, children, ...props }) {
  const theme = useTheme()
  return (
    <h1
      css={`
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: ${3 * GU}px;
        margin-left: ${3 * GU}px;
        color: ${theme.surfaceContentSecondary};
        ${textStyle('label2')}
        font-weight: 400;
      `}
      {...props}
    >
      <div
        css={`
          margin-top: 2px;
        `}
      >
        {label}
      </div>
      {children && <div>{children}</div>}
    </h1>
  )
}
Heading.propTypes = {
  children: PropTypes.node,
  label: PropTypes.node,
}

export default AnimatedMenuPanel
