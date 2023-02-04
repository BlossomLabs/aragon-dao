import React from 'react'
import {
  IdentityBadge,
  Button,
  ButtonBase,
  GU,
  IconCheck,
  IconCopy,
  RADIUS,
  textStyle,
  useTheme,
} from '@aragon/ui'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { getProviderFromUseWalletId } from 'use-wallet'
import { useCopyToClipboard } from '../../hooks/shared/useCopyToClipboard'
import safeImg from './assets/safe.png'

/* eslint-disable react/prop-types */
function ScreenConnected({ wallet }) {
  const theme = useTheme()
  const { connected: isSafeConnected } = useSafeAppsSDK()
  const copy = useCopyToClipboard()

  const walletNetworkName = wallet.networkName

  const providerInfo = getProviderFromUseWalletId(wallet.connector)

  return (
    <div
      css={`
        padding: ${2 * GU}px;
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          width: 100%;
        `}
      >
        <div
          css={`
            display: flex;
            align-items: center;
            margin-right: ${3 * GU}px;
            gap: ${0.5 * GU}px;
          `}
        >
          <img
            src={isSafeConnected ? safeImg : providerInfo.image}
            alt=""
            css={`
              width: ${2.5 * GU}px;
              height: ${2.5 * GU}px;
              border-radius: ${RADIUS}px;
              margin-right: ${0.5 * GU}px;
              ${isSafeConnected ? '' : `transform: translateY(-2px)`};
            `}
          />
          <span>
            {isSafeConnected
              ? 'Safe'
              : providerInfo.id === 'unknown'
              ? 'Wallet'
              : providerInfo.name}
          </span>
        </div>
        <div
          css={`
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 100%;
          `}
        >
          <ButtonBase
            onClick={() => copy(wallet.account)}
            focusRingRadius={RADIUS}
            css={`
              display: flex;
              align-items: center;
              justify-self: flex-end;
              padding: ${0.5 * GU}px;
              &:active {
                background: ${theme.surfacePressed};
              }
            `}
          >
            <IdentityBadge
              entity={wallet.account}
              compact
              badgeOnly
              css={`
                cursor: pointer;
              `}
              networkType={walletNetworkName}
            />
            <IconCopy
              css={`
                color: ${theme.hint};
              `}
            />
          </ButtonBase>
        </div>
      </div>
      <div
        css={`
          display: flex;
          align-items: center;
          margin-top: ${1 * GU}px;
          color: ${theme.positive};
          ${textStyle('label2')};
        `}
      >
        <IconCheck size="small" />
        <span
          css={`
            margin-left: ${0.5 * GU}px;
          `}
        >
          {`Connected to Ethereum ${walletNetworkName} Network`}
        </span>
      </div>

      {!isSafeConnected && (
        <Button
          onClick={() => wallet.reset()}
          wide
          css={`
            margin-top: ${1 * GU}px;
          `}
        >
          Disconnect wallet
        </Button>
      )}
    </div>
  )
}
/* eslint-disable react/prop-types */

export default ScreenConnected
