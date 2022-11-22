import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useImageExists, RADIUS } from '@aragon/ui'

import iconSvgDefault from './assets/app-default.svg'

const DEFAULT_SIZE = 24
const DEFAULT_RADIUS = RADIUS

// Delay before we start displaying the fallback
const DISPLAY_FALLBACK_DELAY = 50

const AppIcon = React.memo(function AppIcon({
  app,
  src,
  size,
  radius,
  ...props
}) {
  if (radius === -1) {
    radius = size * (DEFAULT_RADIUS / DEFAULT_SIZE)
  }
  return (
    <div
      css={`
        display: flex;
        align-items: center;
        overflow: hidden;
        border-radius: ${radius}px;
      `}
      {...props}
    >
      <AppIconContent app={app} size={size} src={src} />
    </div>
  )
})

AppIcon.propTypes = {
  app: PropTypes.object,
  src: PropTypes.string,
  radius: PropTypes.number,
  size: PropTypes.number.isRequired,
}

AppIcon.defaultProps = {
  app: null,
  src: null,
  radius: -1,
  size: DEFAULT_SIZE,
}

// Disabling the ESLint prop-types check for internal components.
/* eslint-disable react/prop-types */

const AppIconContent = React.memo(({ app, size, src }) => {
  if (src) {
    return <RemoteIcon src={src} size={size} />
  }
})

// Display a remote icon if found,
// or the provided fallback, or the default icon.
const RemoteIcon = React.memo(({ src, size, children }) => {
  const { exists, loading } = useImageExists(src)
  const [displayFallback, setDisplayFallback] = useState(false)

  useEffect(() => {
    const timer = setTimeout(
      () => setDisplayFallback(true),
      DISPLAY_FALLBACK_DELAY
    )
    return () => clearTimeout(timer)
  }, [])

  // display fallback
  if ((!exists && !loading) || (loading && displayFallback)) {
    return children || <IconBase size={size} src={iconSvgDefault} />
  }

  return <IconBase size={size} src={src} />
})

// Base icon
const IconBase = React.memo(({ src, size, alt = '', ...props }) => (
  <img {...props} src={src} width={size} height={size} alt={alt} />
))

export default AppIcon
