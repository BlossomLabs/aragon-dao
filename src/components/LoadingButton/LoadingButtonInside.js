import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Inside, useInside } from 'use-inside'

export function LoadingButtonInside({ children }) {
  const [currentLoadingButton, setCurrentLoadingButton] = useState()

  return (
    <Inside
      name="LoadingButton"
      data={{ currentLoadingButton, setCurrentLoadingButton }}
    >
      {children}
    </Inside>
  )
}

LoadingButtonInside.propTypes = {
  children: PropTypes.node,
}

export function useLoadingButtonInside() {
  const [, data] = useInside('LoadingButton')

  return data
}
