import React from 'react'
import { Button, EmptyStateCard, GU, LoadingRing } from '@aragon/ui'
import noVotesPng from '../assets/no-votes.png'
import { useWallet } from '@/providers/Wallet'

const NoVotes = React.memo(function NoVotes({ onNewVote, isSyncing }) {
  const { account } = useWallet()
  return (
    <EmptyStateCard
      text={
        isSyncing ? (
          <div
            css={`
              display: grid;
              align-items: center;
              justify-content: center;
              grid-template-columns: auto auto;
              grid-gap: ${1 * GU}px;
            `}
          >
            <LoadingRing />
            <span>Syncing…</span>
          </div>
        ) : (
          'No proposals here!'
        )
      }
      action={
        account ? (
          <Button wide mode="strong" onClick={onNewVote}>
            Create a new proposal
          </Button>
        ) : null
      }
      illustration={
        <img
          css={`
            margin: auto;
            height: 170px;
          `}
          src={noVotesPng}
          alt="No proposal here"
        />
      }
    />
  )
})

export default NoVotes
