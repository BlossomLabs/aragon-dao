import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  GU,
  IconCheck,
  IconConnect,
  IconCross,
  Info,
  noop,
  RADIUS,
  textStyle,
  useTheme,
} from '@aragon/ui'
import { useWallet } from '../../../../providers/Wallet'
import { dateFormat } from '../../utils/date-utils'
import { getConnectedAccountCast } from '../../vote-utils'
import { VOTE_YEA, VOTE_NAY } from '../../vote-types'

function VoteActions({ vote, onVote, onExecute }) {
  const theme = useTheme()
  const { snapshotBlock, startDate, hasEnded, voterInfo, votingToken } = vote
  const { account: connectedAccount } = useWallet()

  const connectedAccountCast = getConnectedAccountCast(vote, connectedAccount)

  const isAccountVoteCasted = [VOTE_YEA, VOTE_NAY].includes(
    connectedAccountCast.vote
  )

  const handleVoteYes = useCallback(
    () =>
      onVote({
        canUserVote: voterInfo.canVote,
        canUserVoteOnBehalfOf: voterInfo.canUserVoteOnBehalfOf,
        supports: true,
        principals: voterInfo.principals,
      }),
    [voterInfo, onVote]
  )

  const handleVoteNo = useCallback(
    () =>
      onVote({
        canUserVote: voterInfo.canVote,
        canUserVoteOnBehalfOf: voterInfo.canUserVoteOnBehalfOf,
        supports: false,
        principals: voterInfo.principals,
      }),
    [voterInfo, onVote]
  )

  if (!voterInfo.account) {
    return (
      <div
        css={`
          border-radius: ${RADIUS}px;
          background: ${theme.background};
          padding: ${3.5 * GU}px ${10 * GU}px;
          text-align: center;
        `}
      >
        <p
          css={`
            ${textStyle('body1')};
          `}
        >
          You must enable your account to vote on this proposal
        </p>
        <p
          css={`
            color: ${theme.surfaceContentSecondary};
            margin-top: ${1 * GU}px;
          `}
        >
          Connect to your Ethereum provider by clicking on the{' '}
          <strong
            css={`
              display: inline-flex;
              align-items: center;
              position: relative;
              top: ${1 * GU}px;
            `}
          >
            <IconConnect /> Connect account
          </strong>{' '}
          button on the header. You may be temporarily redirected to a new
          screen.
        </p>
      </div>
    )
  }

  if (hasEnded) {
    return (
      <>
        {voterInfo.canExecute && (
          <>
            <Button mode="strong" onClick={onExecute} wide>
              Enact this vote
            </Button>
            <Info>
              The voting period is closed and the vote has passed.{' '}
              <strong>Anyone</strong> can now enact this vote to execute its
              action.
            </Info>
          </>
        )}
      </>
    )
  }

  if (voterInfo.canVote || voterInfo.canUserVoteOnBehalfOf) {
    return (
      <>
        <Buttons onVoteYes={handleVoteYes} onVoteNo={handleVoteNo} />
        <TokenReference
          snapshotBlock={snapshotBlock}
          startDate={startDate}
          tokenSymbol={votingToken.symbol}
          accountBalance={voterInfo.accountBalance}
          accountBalanceNow={voterInfo.accountBalanceNow}
          canUserVoteOnBehalfOf={voterInfo.canUserVoteOnBehalfOf}
          principalsBalance={voterInfo.principalsBalance}
        />
        {voterInfo.canVote && isAccountVoteCasted && (
          <Info mode="warning">
            <strong>
              Although your delegate has voted on your behalf, you can always
              override their vote.
            </strong>
          </Info>
        )}
      </>
    )
  }
  if (isAccountVoteCasted) {
    return (
      <div>
        <Buttons disabled />
        <Info mode="warning">
          You have already voted and changing vote is not allowed.
        </Info>
      </div>
    )
  }

  return (
    <div>
      <Buttons disabled />
      <Info mode="warning">
        {voterInfo.accountBalanceNow > 0
          ? 'Although the currently connected account holds tokens, it'
          : 'The currently connected account'}{' '}
        did not hold any <strong>{votingToken.symbol}</strong> tokens when this
        vote began ({dateFormat(startDate)}) and therefore cannot participate in
        this vote. Make sure your accounts are holding{' '}
        <strong>{votingToken.symbol}</strong> at the time a vote begins if you'd
        like to vote using this Voting app.
      </Info>
    </div>
  )
}

/* eslint-disable react/prop-types */
const Buttons = ({ onVoteYes, onVoteNo, disabled = false }) => (
  <div
    css={`
      display: flex;
      margin-bottom: ${2 * GU}px;
    `}
  >
    <Button
      mode="positive"
      wide
      disabled={disabled}
      onClick={onVoteYes}
      css={`
        ${textStyle('body2')};
        width: 50%;
        &:first-child {
          margin-right: ${1 * GU}px;
        }
      `}
    >
      <IconCheck
        size="small"
        css={`
          margin-right: ${1 * GU}px;
        `}
      />
      Yes
    </Button>
    <Button
      mode="negative"
      wide
      disabled={disabled}
      onClick={onVoteNo}
      css={`
        ${textStyle('body2')};
        width: 50%;
        &:first-child {
          margin-right: ${1 * GU}px;
        }
      `}
    >
      <IconCross
        size="small"
        css={`
          margin-right: ${1 * GU}px;
        `}
      />
      No
    </Button>
  </div>
)

const TokenReference = ({
  snapshotBlock,
  startDate,
  tokenSymbol,
  accountBalance,
  accountBalanceNow,
  canUserVoteOnBehalfOf,
  principalsBalance,
}) => {
  return (
    <Info>
      <div>
        Voting with{' '}
        <strong>
          {accountBalance} {tokenSymbol}
        </strong>{' '}
        . This was your balance when the vote started (block{' '}
        <strong>{snapshotBlock}</strong>, mined at{' '}
        <strong>{dateFormat(startDate)}</strong>).{' '}
        {accountBalance !== accountBalanceNow ? (
          <span>
            Your current balance is{' '}
            <strong>
              {accountBalanceNow} {tokenSymbol}
            </strong>
            )
          </span>
        ) : (
          ''
        )}
      </div>
      {canUserVoteOnBehalfOf && principalsBalance > 0 && (
        <div>
          Delegated voting power:{' '}
          <strong>
            {principalsBalance} {tokenSymbol}
          </strong>
        </div>
      )}
    </Info>
  )
}

/* eslint-disable react/prop-types */

VoteActions.propTypes = {
  vote: PropTypes.object.isRequired,
  onVote: PropTypes.func,
  onExecute: PropTypes.func,
}

VoteActions.defaultProps = {
  onVoteYes: noop,
  onVoteNo: noop,
  onExecute: noop,
}

export default VoteActions
