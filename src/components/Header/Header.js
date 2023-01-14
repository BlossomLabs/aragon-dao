import React, { useCallback } from 'react'
import { useRouteMatch, useHistory } from 'react-router-dom'
import {
  GU,
  Link,
  IconExternal,
  useTheme,
  unselectable,
  useViewport,
  IconMenu,
  ButtonIcon,
} from '@aragon/ui'
import HeaderLogo from './HeaderLogo'
import LayoutGutter from '../Layout/LayoutGutter'
import AccountModule from '../Account/AccountModule'

function Header({ showMenu, onMenuClick, ...props }) {
  const theme = useTheme()
  const history = useHistory()
  const { below } = useViewport()
  const compactMode = below('medium')

  const handleLogoClick = useCallback(() => {
    history.push('/')
  }, [history])

  return (
    <header
      css={`
        box-shadow: 0px 0px 10px rgba(160, 168, 194, 0.3);
        background-color: ${theme.surface};
      `}
      {...props}
    >
      <LayoutGutter collapseWhenSmall={false}>
        <div
          css={`
            height: ${8 * GU}px;
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
                margin-left: ${1 * GU}px;
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
                  href="https://app.uniswap.org/#/swap?outputCurrency=0x960b236A07cf122663c4303350609A66A7B288C0"
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
              gap: ${2 * GU}px;
              margin-right: ${1 * GU}px;
            `}
          >
            <AccountModule />
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

/* eslint-disable react/prop-types */
function InteralLink({ to, children }) {
  const history = useHistory()
  const theme = useTheme()
  const active = useRouteMatch(to) !== null

  const handlePageRequest = useCallback(() => {
    history.push(to)
  }, [history, to])

  return (
    <Link
      onClick={handlePageRequest}
      css={`
        ${unselectable};
        padding: ${0.5 * GU}px 0;
        text-decoration: none;
        color: ${theme.contentSecondary};

        ${active ? `color: ${theme.content}` : ''};
      `}
    >
      {children}
    </Link>
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
/* eslint-enable react/prop-types */

export default Header
