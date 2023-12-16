import React from 'react'
import { unselectable, GU, useViewport } from '@aragon/ui'
import { LOGO_TYPE, LOGO_TYPE_COMPACT } from '@/utils/assets-utils'
import { useAsset } from '@/hooks/shared/useAsset'

function HeaderLogo() {
  const { below } = useViewport()
  const compactMode = below('medium')
  const logoType = useAsset(LOGO_TYPE)
  const logoTypeCompact = useAsset(LOGO_TYPE_COMPACT)

  const logo = compactMode ? logoTypeCompact : logoType

  return (
    <div
      css={`
        ${unselectable};
        display: flex;
        align-items: center;
      `}
    >
      <img alt="" src={logo} width={compactMode ? 6 * GU : 23 * GU} />
    </div>
  )
}

export default HeaderLogo
