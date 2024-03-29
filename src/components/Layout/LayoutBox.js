import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Box, useTheme, GU, useViewport } from '@aragon/ui'

function LayoutBox({ children, heading, primary, mode, ...props }) {
  const { below } = useViewport()
  const theme = useTheme()
  const compactMode = below('medium')

  const { backgroundColor, borderColor } = useMemo(() => {
    const attributes = {
      warning: {
        backgroundColor: '#fefdfb',
        borderColor: theme.warning,
      },
      negative: {
        backgroundColor: '#FFFAFA',
        borderColor: '#FF7C7C',
      },
      disabled: {
        backgroundColor: theme.surfacePressed,
        borderColor: theme.border,
      },
    }

    return attributes[mode] || {}
  }, [theme, mode])

  const primaryHeading = (
    <span
      css={`
        padding: 0 ${2 * GU}px;
      `}
    >
      {heading}
    </span>
  )

  return (
    <Box
      {...props}
      heading={heading && primary ? primaryHeading : heading}
      padding={compactMode ? 2 * GU : primary && 5 * GU}
      css={`
        ${backgroundColor ? `background-color: ${backgroundColor};` : ''}
        ${borderColor ? `border-color: ${borderColor};` : ''}
      `}
    >
      {children}
    </Box>
  )
}

LayoutBox.propTypes = {
  children: PropTypes.node,
  heading: PropTypes.node,
  mode: PropTypes.oneOf(['warning', 'negative', 'disabled']),
  primary: PropTypes.bool,
}

export default LayoutBox
