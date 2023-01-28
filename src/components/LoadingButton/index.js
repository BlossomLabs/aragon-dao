import { Button, GU, LoadingRing } from '@aragon/ui'
import React from 'react'
import { useLoadingButtonInside } from './LoadingButtonInside'

function LoadingButton({ id, children, disabled, onClick, ...props }) {
  const {
    currentLoadingButton,
    setCurrentLoadingButton,
  } = useLoadingButtonInside()
  const isLoading = currentLoadingButton === id

  return (
    <Button
      {...props}
      onClick={() => {
        setCurrentLoadingButton(id)
        onClick()
      }}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <div
          css={`
            display: flex;
            align-items: center;
            gap: ${1 * GU}px;
          `}
        >
          <LoadingRing mode="half-circle" />
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  )
}

export default LoadingButton
