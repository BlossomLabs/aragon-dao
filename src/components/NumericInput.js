import { TextInput } from '@aragon/ui'
import React from 'react'

function NumericInput(props) {
  return (
    <TextInput
      css={`
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}
      type="number"
      {...props}
    />
  )
}

export default NumericInput
