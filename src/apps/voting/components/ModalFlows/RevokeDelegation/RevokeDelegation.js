import React, { useCallback } from 'react'
import {
  Button,
  textStyle,
  Field,
  GU,
  Info,
  IdentityBadge,
  useLayout,
} from '@aragon/ui'
import { useVoterState } from '../../../providers/VoterProvider'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'
import { ZERO_ADDR } from '@/constants'

export default function RevokeDelegation({ onCreateTransaction }) {
  const { voter } = useVoterState()
  const { layoutName } = useLayout()
  const multiColumnsMode =
    layoutName === 'max' || layoutName === 'medium' || layoutName === 'large'

  const { prev, next } = useMultiModal()

  const handleOnBack = useCallback(() => {
    prev()
  }, [prev])

  const handleOnRevoke = useCallback(() => {
    onCreateTransaction(() => {
      next()
    }, ZERO_ADDR)
  }, [next, onCreateTransaction])

  return (
    <div>
      <span
        css={`
          ${textStyle('body2')};
        `}
      >
        By performing this action, you will revoke your voting power from your
        delegate account, for all on-going and future votes, so they won’t be
        able to vote on your behalf any more.
      </span>
      <Field
        css={`
          margin-top: ${3 * GU}px;
        `}
        label="Current delegate address"
      >
        <IdentityBadge entity={voter.representative.address} />
      </Field>
      <Info
        css={`
          margin-top: ${3 * GU}px;
        `}
      >
        You can delegate your voting power again at any time to the same or
        different address.
      </Info>

      <div
        css={`
          display: grid;
          grid-auto-flow: ${multiColumnsMode ? 'column' : 'row'};
          grid-gap: ${1 * GU}px;
          margin-top: ${2 * GU}px;
        `}
      >
        <Button onClick={handleOnBack}> Cancel </Button>
        <Button mode="negative" onClick={handleOnRevoke}>
          Revoke delegation
        </Button>
      </div>
    </div>
  )
}
