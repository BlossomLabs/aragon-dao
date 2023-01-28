import { Button, GU, LoadingRing } from '@aragon/ui'
import React from 'react'
import { useLoadingButtonInside } from './LoadingButtonInside'

function LoadingButton({ id, children, label, disabled, onClick, ...props }) {
  const {
    currentLoadingButton,
    setCurrentLoadingButton,
  } = useLoadingButtonInside()
  const isLoading = currentLoadingButton === id
  const content = label ?? children
  /**
   * The button may be part of a form that uses the onSubmit event
   * so prevent setting the onClick handler if it's not provided
   */
  const clickProp = onClick
    ? {
        onClick: () => {
          setCurrentLoadingButton(id)
          onClick()
        },
      }
    : {}

  return (
    <Button {...props} {...clickProp} disabled={isLoading || disabled}>
      {isLoading ? (
        <div
          css={`
            display: flex;
            align-items: center;
            gap: ${1 * GU}px;
          `}
        >
          <LoadingRing mode="half-circle" />
          {content}
        </div>
      ) : (
        content
      )}
    </Button>
  )
}

export default LoadingButton
