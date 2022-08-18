import React from 'react'
import { Field, GU, textStyle } from '@aragon/ui'
import { useAppState } from '../../../providers/VotingProvider'

function DelegateVotingPower() {
  const appState = useAppState()
  console.log('app state ', appState)
  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        ${textStyle('body2')};
      `}
    >
      Allow another account to vote on your behalf.
      <Field
        css={`
          margin-top: ${2 * GU}px;
        `}
        label="Voting power (with enabled account)"
      />
    </div>
  )
}

export default DelegateVotingPower
