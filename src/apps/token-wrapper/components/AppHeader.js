import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  IconPlus,
  Tag,
  textStyle,
  useTheme,
  GU,
  useViewport,
} from '@aragon/ui'
import InnerAppHeader from '@/components/AppHeader'

const AppHeader = React.memo(function AppHeader({ tokenSymbol, onWrapHolder }) {
  const theme = useTheme()
  const { below } = useViewport()
  const compactMode = below('medium')

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
        onWrapHolder && (
          <Button
            mode="strong"
            label="Wrap tokens"
            icon={<IconPlus />}
            onClick={onWrapHolder}
            display={compactMode ? 'icon' : 'label'}
          />
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
