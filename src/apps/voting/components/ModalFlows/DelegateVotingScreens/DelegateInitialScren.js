import React, { useCallback } from 'react'
import { Card, textStyle, GU, useLayout } from '@aragon/ui'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'
import becomeDelegate from '../../../assets/becomeDelegate.svg'
import voteDelegate from '../../../assets/voteDelegate.svg'

function DelegateInitialScreen({ onChooseAction }) {
  const { layoutName } = useLayout()
  const { next } = useMultiModal()
  const multiColumnsMode =
    layoutName === 'max' || layoutName === 'medium' || layoutName === 'large'

  const handleOnChooseAction = useCallback(
    option => {
      onChooseAction(option)
      next()
    },
    [next, onChooseAction]
  )

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
      `}
    >
      <div>
        <span
          css={`
            ${textStyle('body2')}
          `}
        >
          Vote delegation is a way for tokenholders to allow others to vote on
          their behalf, this allows them to delegate some responsibility of
          participation to an entity they trust to represent their interests.
        </span>
      </div>
      <div
        css={`
          display: grid;
          grid-auto-flow: ${multiColumnsMode ? 'column' : 'row'};
          grid-gap: ${1 * GU}px;
          margin-top: ${4 * GU}px;
          justify-content: center;
        `}
      >
        <Card onClick={() => handleOnChooseAction(false)}>
          <div
            css={`
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            `}
          >
            <img src={becomeDelegate} alt="" width="147" height="144" />
            <div
              css={`
                display: flex;
                flex-direction: column;
                margin-top: ${3 * GU}px;
              `}
            >
              <span
                css={`
                  ${textStyle('body2')};
                  font-weight: 800;
                `}
              >
                Become a delegate
              </span>
              <span
                css={`
                  ${textStyle('body2')};
                  margin-top: ${2 * GU}px;
                `}
              >
                Allow other people to delegate their voting power to your
                account.
              </span>
            </div>
          </div>
        </Card>
        <Card onClick={() => handleOnChooseAction(true)}>
          <div
            css={`
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            `}
          >
            <img src={voteDelegate} alt="" width="147" height="144" />
            <div
              css={`
                display: flex;
                flex-direction: column;
                margin-top: ${3 * GU}px;
              `}
            >
              <span
                css={`
                  ${textStyle('body2')};
                  font-weight: 800;
                `}
              >
                Delegate your voting power
              </span>
              <span
                css={`
                  ${textStyle('body2')};
                  margin-top: ${2 * GU}px;
                `}
              >
                Allow another account to vote on your behalf. You can overrule
                these votes at any time
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div />
    </div>
  )
}

export default DelegateInitialScreen
