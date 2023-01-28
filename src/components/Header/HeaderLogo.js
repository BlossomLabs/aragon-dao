import React from 'react'
import { unselectable, GU } from '@aragon/ui'
import headerLogoSvg from '../../assets/aragonDAOLogo.svg'

function HeaderLogo() {
  return (
    <div
      css={`
        ${unselectable};
        display: flex;
        align-items: center;
      `}
    >
      <img alt="" src={headerLogoSvg} width={23 * GU} />
    </div>
  )
}

export default HeaderLogo
