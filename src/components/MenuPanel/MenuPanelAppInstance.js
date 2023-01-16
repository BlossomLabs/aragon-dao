import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { ButtonBase, GU, useTheme } from '@aragon/ui'
import { utils } from 'ethers'
import { APPS_PANEL_INSTANCE_NAMES } from '@/constants'

export const MENU_PANEL_APP_INSTANCE_HEIGHT = 4 * GU

const shortenAddress = address => `${address.slice(0, 8)}…${address.slice(-6)}`

const MenuPanelAppInstance = React.memo(function MenuPanelAppInstance({
  active,
  address,
  name,
  onClick,
}) {
  const theme = useTheme()
  const handleClick = useCallback(() => {
    onClick(address)
  }, [address, onClick])

  return (
    <ButtonBase
      onClick={handleClick}
      css={`
        display: flex;
        align-items: center;
        height: ${MENU_PANEL_APP_INSTANCE_HEIGHT}px;
        width: 100%;
        border-radius: 0;
        text-align: left;
        cursor: pointer;
        ${active ? 'font-weight: 800;' : ''}
        color: ${active ? theme.content : theme.contentSecondary};
      `}
    >
      <span
        css={`
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        `}
      >
        {APPS_PANEL_INSTANCE_NAMES.get(name)
          ? APPS_PANEL_INSTANCE_NAMES.get(name)
          : utils.isAddress(name)
          ? shortenAddress(name)
          : name}
      </span>
    </ButtonBase>
  )
})
MenuPanelAppInstance.propTypes = {
  active: PropTypes.bool.isRequired,
  address: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default MenuPanelAppInstance
