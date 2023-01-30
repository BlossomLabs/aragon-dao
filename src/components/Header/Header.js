import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import {
  GU,
  Link,
  IconExternal,
  useTheme,
  unselectable,
  useViewport,
  IconMenu,
  ButtonIcon,
  ButtonBase,
} from '@aragon/ui'
import HeaderLogo from './HeaderLogo'
import LayoutGutter from '../Layout/LayoutGutter'
import AccountModule from '../Account/AccountModule'
import { MAIN_HEADER_HEIGHT } from '@/constants'
import { useAppTheme } from '@/providers/AppTheme'
import { ICON_DARK_MODE } from '@/utils/assets-utils'
import { useAsset } from '@/hooks/shared/useAsset'

const GET_ANT_LINK =
  'https://v2.info.uniswap.org/pair/0x9def9511fec79f83afcbffe4776b1d817dc775ae'

function Header({ showMenu, onMenuClick, ...props }) {
  const theme = useTheme()
  const history = useHistory()
  const { below } = useViewport()
  const { toggleAppearance } = useAppTheme()
  const darkModeIcon = useAsset(ICON_DARK_MODE)

  const compactMode = below('medium')

  const handleLogoClick = useCallback(() => {
    history.push('/')
  }, [history])

  return (
    <header
      css={`
        background-color: ${theme.surface};
      `}
      {...props}
    >
      <LayoutGutter collapseWhenSmall={false}>
        <div
          css={`
            height: ${MAIN_HEADER_HEIGHT + GU}px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
          `}
        >
          <div
            css={`
              display: flex;
              align-items: center;
            `}
          >
            <div
              css={`
                display: flex;
                justify-content: center;
                align-items: center;
              `}
            >
              <Link onClick={handleLogoClick}>
                <HeaderLogo />
              </Link>
            </div>
            <nav
              css={`
                display: inline-grid;
                grid-auto-flow: column;
                grid-gap: ${compactMode ? 2 * GU : 4 * GU}px;
                margin-left: ${compactMode ? 2 * GU : 5 * GU}px;
              `}
            >
              <NavItem>
                <Link
                  href={GET_ANT_LINK}
                  css={`
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    color: ${theme.contentSecondary};
                    padding: ${0.5 * GU}px 0;
                    ${unselectable};
                  `}
                >
                  Get ANT
                  {!compactMode && (
                    <IconExternal
                      size="small"
                      css={`
                        margin-left: ${0.5 * GU}px;
                      `}
                    />
                  )}
                </Link>
              </NavItem>
            </nav>
          </div>

          <div
            css={`
              display: flex;
              justify-content: center;
              align-items: center;
              gap: ${0.5 * GU}px;
            `}
          >
            <AccountModule />
            <ButtonBase
              css={`
                width: ${3 * GU}px;
                height: ${3 * GU}px;
                margin-left: ${compactMode ? 0.5 * GU : 1 * GU}px;
              `}
              onClick={toggleAppearance}
            >
              <img css="width: 100%" src={darkModeIcon} />
            </ButtonBase>
            {showMenu && (
              <ButtonIcon label="Open menu" onClick={onMenuClick}>
                <IconMenu />
              </ButtonIcon>
            )}
          </div>
        </div>
      </LayoutGutter>
    </header>
  )
}

function NavItem({ children }) {
  return (
    <div
      css={`
        display: flex;
        align-items: center;
      `}
    >
      {children}
    </div>
  )
}

export default Header
