import React, { useCallback } from 'react'
import { Button, GU, textStyle, useLayout, Info } from '@aragon/ui'
import { useMultiModal } from '../../../../components/MultiModal/MultiModalProvider'

function BecomeADelegate() {
  const { layoutName } = useLayout()
  const multiColumnsMode =
    layoutName === 'max' || layoutName === 'medium' || layoutName === 'large'
  const { prev } = useMultiModal()

  const handleOnBack = useCallback(() => {
    prev()
  }, [prev])

  return (
    <div
      css={`
        ${textStyle('body2')};
        display: flex;
        flex-direction: column;
      `}
    >
      <span>
        Allow other people to delegate their voting power to your account so you
        can cast votes on their behalf. You can do this by simply sharing your
        Ethereum address with them.
      </span>
      <Info
        css={`
          margin-top: ${2 * GU}px;
        `}
      >
        Once voters delegate their voting power to your account, you can choose
        if you wish to cast your vote with the total voting power, a % of it, or
        only yours. Keep in mind that voters can override your decision at any
        time.
      </Info>
      <div
        css={`
          display: grid;
          grid-auto-flow: ${multiColumnsMode ? 'column' : 'row'};
          grid-gap: ${1 * GU}px;
          margin-top: ${2 * GU}px;
        `}
      >
        <Button onClick={handleOnBack}> Back </Button>
        <Button mode="strong">Learn more</Button>
      </div>
    </div>
  )
}

export default BecomeADelegate
