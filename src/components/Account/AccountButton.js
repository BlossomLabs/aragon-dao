import React from 'react'
import PropTypes from 'prop-types'
import {
  ButtonBase,
  EthIdenticon,
  IconDown,
  GU,
  RADIUS,
  textStyle,
  useTheme,
  useViewport,
} from '@aragon/ui'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { useWallet } from '@/providers/Wallet'
import { shortenAddress } from '@/utils/web3-utils'
import safeImg from './assets/safe.png'

function AccountButton({ onClick }) {
  const theme = useTheme()
  const wallet = useWallet()
  const { connected: isSafeConnected } = useSafeAppsSDK()

  const { below } = useViewport()
  const compactMode = below('medium')

  return (
    <ButtonBase
      onClick={onClick}
      css={`
        height: 100%;
        padding: 0 ${1 * GU}px;
        &:active {
          background: ${theme.surfacePressed};
        }
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          text-align: left;
          padding: 0 ${1 * GU}px;
        `}
      >
        <div
          css={`
            position: relative;
          `}
        >
          {isSafeConnected ? (
            <img
              src={safeImg}
              height={24}
              width={24}
              alt=""
              css={`
                border-radius: ${RADIUS}px;
                display: block;
                object-fit: cover;
              `}
            />
          ) : (
            <EthIdenticon address={wallet.account || ''} radius={RADIUS} />
          )}
          <div
            css={`
              position: absolute;
              bottom: -3px;
              right: -3px;
              width: 10px;
              height: 10px;
              background: ${theme.positive};
              border: 2px solid ${theme.surface};
              border-radius: 50%;
            `}
          />
        </div>
        {!compactMode && (
          <>
            <div
              css={`
                padding-left: ${1 * GU}px;
                padding-right: ${0.5 * GU}px;
              `}
            >
              <div
                css={`
                  margin-bottom: -5px;
                  ${textStyle('body2')}
                `}
              >
                {shortenAddress(wallet.account)}
              </div>
              <div
                css={`
                  font-size: 11px; /* doesn’t exist in aragonUI */
                  color: ${theme.positive};
                `}
              >
                Connected
              </div>
            </div>
            <IconDown
              size="small"
              css={`
                color: ${theme.surfaceIcon};
              `}
            />
          </>
        )}
      </div>
    </ButtonBase>
  )
}
AccountButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export default AccountButton
