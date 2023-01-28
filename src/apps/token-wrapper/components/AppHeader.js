import React from 'react'
import PropTypes from 'prop-types'
import BN from 'bn.js'
import {
  Button,
  IconPlus,
  IconMinus,
  Tag,
  textStyle,
  useTheme,
  GU,
  useViewport,
} from '@aragon/ui'
import InnerAppHeader from '@/components/AppHeader'
import { useWallet } from '@/providers/Wallet'
import { useAppState } from '../providers/TokenWrapperProvider'

const AppHeader = React.memo(function AppHeader({
  tokenSymbol,
  onWrapHolder,
  onUnwrapTokens,
}) {
  const { account } = useWallet()
  const { wrappedToken } = useAppState()
  const { accountBalance } = wrappedToken
  const theme = useTheme()
  const { below } = useViewport()
  const compactMode = below('medium')

  const canUnwrap = accountBalance && accountBalance.gt(new BN(0))

  return (
    <InnerAppHeader
      primary={
        <div
          css={`
            display: flex;
            align-items: center;
            flex: 1 1 auto;
            width: 0;
          `}
        >
          <h1
            css={`
              ${textStyle(compactMode ? 'title3' : 'title2')};
              flex: 0 1 auto;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: ${theme.content};
              margin-right: ${1 * GU}px;
            `}
          >
            Token Wrapper
          </h1>
          <div css="flex-shrink: 0">
            {tokenSymbol && <Tag mode="identifier">{tokenSymbol}</Tag>}
          </div>
        </div>
      }
      secondary={
        account && (
          <div
            css={`
              display: flex;
            `}
          >
            <Button
              mode="strong"
              label="Wrap tokens"
              icon={<IconPlus />}
              onClick={onWrapHolder}
              display={compactMode ? 'icon' : 'label'}
            />
            {canUnwrap && (
              <Button
                mode="strong"
                label="Unwrap tokens"
                icon={<IconMinus />}
                onClick={onUnwrapTokens}
                display={compactMode ? 'icon' : 'label'}
                css={`
                  margin-left: ${1 * GU}px;
                `}
              />
            )}
          </div>
        )
      }
    />
  )
})
AppHeader.propTypes = {
  onWrapHolder: PropTypes.func,
  tokenSymbol: PropTypes.string,
}

export default AppHeader
