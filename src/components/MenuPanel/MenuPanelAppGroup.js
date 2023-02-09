import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Spring, animated } from 'react-spring/renderprops'
import { ButtonBase, GU, textStyle, useTheme, springs } from '@aragon/ui'
import MenuPanelAppInstance, {
  MENU_PANEL_APP_INSTANCE_HEIGHT,
} from './MenuPanelAppInstance'
import { addressesEqual } from '@/utils/web3-utils'

export const MENU_ITEM_BASE_HEIGHT = 5 * GU

const { div: AnimDiv } = animated

const MenuPanelAppGroup = React.memo(function MenuPanelAppGroup({
  name,
  humanName,
  icon,
  instances,
  activeInstance,
  active,
  expand,
  onActivate,
}) {
  const theme = useTheme()
  const singleInstance = instances.length === 1

  const handleAppClick = useCallback(() => {
    const instance = instances[0]

    if (instance) {
      onActivate(name, instance)
    }
  }, [instances, name, onActivate])

  const handleInstanceClick = useCallback(
    instanceAddress => onActivate(name, instanceAddress),
    [name, onActivate]
  )

  return (
    <Spring
      config={springs.smooth}
      to={{ openProgress: Number(active && (singleInstance || expand)) }}
      native
    >
      {({ openProgress }) => (
        <div
          css={`
            position: relative;
            width: 100%;

            transition: background 150ms ease-in-out;

            ${active
              ? `
                transition: none;
                background: ${theme.surfacePressed};
              `
              : ''}
            &:active {
              background: ${theme.surfacePressed};
            }

            .instances {
              /* 3GU left padding + 3GU icon + 1GU padding to align instance with menu item */
              padding-left: ${7 * GU}px;
              padding-right: ${2 * GU}px;
              overflow: hidden;
              list-style: none;
            }
          `}
        >
          <AnimDiv
            css={`
              position: absolute;
              left: 0;
              width: 3px;
              height: 100%;
              background: ${theme.accent};
            `}
            style={{
              opacity: openProgress,
              transform: openProgress.interpolate(
                v => `translate3d(-${(1 - v) * 100}%, 0, 0)`
              ),
            }}
          />

          <MenuPanelItem
            active={active}
            icon={icon}
            instanceId={instances[0]}
            name={humanName}
            onClick={handleAppClick}
            openProgress={openProgress}
            singleInstance={singleInstance}
          />

          {instances.length > 1 && (
            <animated.ul
              className="instances"
              style={{
                height: openProgress.interpolate(
                  v =>
                    `${(instances.length * MENU_PANEL_APP_INSTANCE_HEIGHT + 0) *
                      v}px`
                ),
              }}
            >
              {instances.map(address => {
                const label = address
                const active = addressesEqual(address, activeInstance)
                return label ? (
                  <li key={address}>
                    <MenuPanelAppInstance
                      address={address}
                      name={label}
                      active={active}
                      onClick={handleInstanceClick}
                    />
                  </li>
                ) : null
              })}
            </animated.ul>
          )}
        </div>
      )}
    </Spring>
  )
})
MenuPanelAppGroup.propTypes = {
  name: PropTypes.string.isRequired,
  humanName: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  activeInstance: PropTypes.string,
  instances: PropTypes.arrayOf(PropTypes.string).isRequired,
  expand: PropTypes.bool.isRequired,
  icon: PropTypes.object.isRequired,
  onActivate: PropTypes.func.isRequired,
}

const MenuPanelItem = React.memo(function MenuPanelItem({
  active,
  onClick,
  name,
  icon,
  instanceId,
  singleInstance,
}) {
  return (
    <ButtonBase
      onClick={onClick}
      css={`
        display: flex;
        align-items: center;
        height: ${MENU_ITEM_BASE_HEIGHT}px;
        width: 100%;
        padding: 0 ${2 * GU}px 0 ${3 * GU}px;
        border-radius: 0;
        text-align: left;
        ${active ? 'font-weight: 600' : ''}
      `}
    >
      <span>{icon}</span>
      <span
        css={`
          margin-left: ${1 * GU}px;
          overflow: hidden;
          text-overflow: ellipsis;
          ${textStyle('body2')}
        `}
      >
        {name}
      </span>
    </ButtonBase>
  )
})
MenuPanelItem.propTypes = {
  active: PropTypes.bool,
  icon: PropTypes.object.isRequired,
  instanceId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  singleInstance: PropTypes.bool.isRequired,
}

export default MenuPanelAppGroup
