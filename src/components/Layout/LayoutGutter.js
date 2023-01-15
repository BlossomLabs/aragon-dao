import React from 'react'
import PropTypes from 'prop-types'
import { GU, useViewport } from '@aragon/ui'

function LayoutGutter({ children, collapseWhenSmall, ...props }) {
  const { below } = useViewport()
  const compactMode = below('medium')
  const smallPaddingAmount = collapseWhenSmall ? 0 : 2 * GU
  const paddingAmount = compactMode ? `${smallPaddingAmount}px` : '1%'

  return (
    <div
      css={`
        padding-left: ${paddingAmount};
        padding-right: ${paddingAmount};
      `}
      {...props}
    >
      {children}
    </div>
  )
}

LayoutGutter.propTypes = {
  children: PropTypes.node,
  collapseWhenSmall: PropTypes.bool,
}

LayoutGutter.defaultProps = {
  collapseWhenSmall: true,
}

export default LayoutGutter
