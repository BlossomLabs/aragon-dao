import React from 'react'
import styled from 'styled-components'

import { GU, textStyle } from '@aragon/ui'
import LoadingButton from '@/components/LoadingButton'

function DelayButton({ label, beforeIcon, css, ...props }) {
  return (
    <CustomButton id={label} wide css={css} {...props}>
      {beforeIcon && (
        <img
          src={beforeIcon}
          alt={label}
          width={14}
          css={`
            margin-right: 8px;
          `}
        />
      )}
      {label}
    </CustomButton>
  )
}

const CustomButton = styled(LoadingButton)`
  ${textStyle('body2')};
  &:first-child {
    margin-right: ${GU / 2}px;
  }
`

export default DelayButton
