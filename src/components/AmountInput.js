import React from 'react'
import PropTypes from 'prop-types'
import { ButtonBase, noop, GU, RADIUS } from '@aragon/ui'
import NumericInput from '@/components/NumericInput'

const MAX_BUTTON_WIDTH = 6 * GU

const AmountInput = React.forwardRef(function AmountInput(
  { showMax, onMaxClick, ...props },
  ref
) {
  return (
    <NumericInput
      ref={ref}
      min={0}
      step="any"
      adornment={
        showMax && (
          <ButtonBase
            focusRingRadius={RADIUS}
            onClick={onMaxClick}
            css={`
              width: ${MAX_BUTTON_WIDTH}px;
              height: calc(100% - 2px);
              text-transform: uppercase;
              &:active {
                transform: translate(0.5px, 0.5px);
              }
            `}
          >
            Max
          </ButtonBase>
        )
      }
      adornmentPosition="end"
      adornmentSettings={{ width: MAX_BUTTON_WIDTH, padding: 1 }}
      type="number"
      {...props}
    />
  )
})

AmountInput.propTypes = {
  showMax: PropTypes.bool,
  onMaxClick: PropTypes.func,
}

AmountInput.defaultProps = {
  onMaxClick: noop,
}

export default AmountInput
