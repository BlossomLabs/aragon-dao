import React from 'react'
import { LoadingRing } from '@aragon/ui'
import { useDescribeVote } from '../hooks/useDescribeVote'
import Description from './Description'

function VoteDescription({ vote }) {
  const { data, voteId } = vote
  const { script } = data
  const { description, emptyScript, loading } = useDescribeVote(script, voteId)

  if (loading) {
    return <LoadingRing />
  }

  return (
    <div>
      {emptyScript ? (
        vote.metadata || 'No description'
      ) : (
        <Description
          path={description}
          dotIndicator={false}
          css={`
            -webkit-line-clamp: 1;
            overflow: hidden;
            max-width: 750px;
            -webkit-box-orient: vertical;
            display: -webkit-box;
          `}
          disableBadgeInteraction={false}
        />
      )}
    </div>
  )
}

export default VoteDescription
