import React from 'react'
import { unselectable, GU, useViewport } from '@aragon/ui'
import headerLogoSvg from '@/assets/aragonDAOLogo.svg'
import headerDarkLogoSvg from '@/assets/aragonDAODarkLogo.svg'
import headerCompactLogoSvg from '@/assets/aragonDAOCompactLogo.svg'
import headerDarkCompactLogoSvg from '@/assets/aragonDAOCompactDarkLogo.svg'
import { useAppTheme } from '@/providers/AppTheme'

function getLogo(appearance, compactMode) {
  if (compactMode && appearance === 'dark') {
    return headerDarkCompactLogoSvg
  } else if (compactMode && appearance === 'light') {
    return headerCompactLogoSvg
  } else if (!compactMode && appearance === 'dark') {
    return headerDarkLogoSvg
  } else {
    return headerLogoSvg
  }
}

function HeaderLogo() {
  const { appearance } = useAppTheme()
  const { below } = useViewport()
  const compactMode = below('medium')

  return (
    <div
      css={`
        ${unselectable};
        display: flex;
        align-items: center;
      `}
    >
      <img
        alt=""
        src={getLogo(appearance, compactMode)}
        width={compactMode ? 12 * GU : 23 * GU}
      />
    </div>
  )
}

export default HeaderLogo
