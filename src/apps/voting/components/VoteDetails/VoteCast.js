import React from 'react'
import PropTypes from 'prop-types'
import { GU, IconCheck, RADIUS, textStyle, useTheme } from '@aragon/ui'
import { useWallet } from '@/providers/Wallet'
import {
  getAccountCastDelegatedStake,
  getAccountCastStake,
} from '../../vote-utils'
import { formatTokenAmount } from '@/utils/token'
import { useAppState } from '../../providers/VotingProvider'

function VoteCast({ voteSupported, vote }) {
  const { token } = useAppState()
  const theme = useTheme()
  const { account } = useWallet()
  const accountStake = getAccountCastStake(vote, account)

  const accountDelegatedStake = getAccountCastDelegatedStake(vote, account)
  const totalStake = accountStake.add(accountDelegatedStake)

  return (
    <div
      css={`
        display: flex;
        justify-content: center;
        /* margin-top: ${5 * GU}px; */
        background-color: ${theme.background};
        border: 1px solid ${theme.border};
        padding: ${4 * GU}px;
        border-radius: ${RADIUS}px;
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
        `}
      >
        <div
          css={`
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 100%;
            color: ${theme.accent};
            border: 2px solid currentColor;
            width: ${5.5 * GU}px;
            height: ${5.5 * GU}px;
            margin-right: ${2 * GU}px;
            flex-shrink: 0;
          `}
        >
          <IconCheck />
        </div>

        <div>
          <h2
            css={`
              ${textStyle('body1')}
              font-weight: 600;
              margin-bottom: ${0.5 * GU}px;
            `}
          >
            Your vote was cast successfully
          </h2>
          <p
            css={`
            ${textStyle('body2')}
            color: ${theme.surfaceContentSecondary};
          `}
          >
            You voted{' '}
            <span
              css={`
                color: ${theme.surfaceContent};
                font-weight: 600;
                text-transform: uppercase;
              `}
            >
              {voteSupported ? 'yes' : 'no'}
            </span>{' '}
            with{' '}
            <span
              css={`
                color: ${theme.surfaceContent};
                font-weight: 600;
              `}
            >
              {totalStake.eq(0)
                ? '…'
                : formatTokenAmount(totalStake, token.decimals)}{' '}
              {token.symbol}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

VoteCast.propTypes = {
  voteSupported: PropTypes.bool,
  vote: PropTypes.any,
}

export default VoteCast
