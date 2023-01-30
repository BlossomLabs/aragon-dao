import React from 'react'
import PropTypes from 'prop-types'
import { ButtonBase, GU, RADIUS, useTheme } from '@aragon/ui'

import { LOGO_TYPE } from '@/utils/assets-utils'
import { useAsset } from '@/hooks/shared/useAsset'

function HomeButton({ onClick, ...props }) {
  const theme = useTheme()
  const logo = useAsset(LOGO_TYPE)
  return (
    <ButtonBase
      onClick={onClick}
      focusRingRadius={RADIUS}
      title="Back to home"
      {...props}
      css={`
        position: absolute;
        top: ${1 * GU}px;
        left: ${1 * GU}px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${1 * GU}px;
        border-radius: ${RADIUS}px;
        &:active {
          background: ${theme.surfacePressed};
        }
      `}
    >
      <img src={logo} width={23 * GU} alt="" />
    </ButtonBase>
  )
}

HomeButton.propTypes = {
  onClick: PropTypes.func,
}

HomeButton.defaultProps = {
  onClick: () => {
    window.location.hash = '/'
  },
}

export default HomeButton
