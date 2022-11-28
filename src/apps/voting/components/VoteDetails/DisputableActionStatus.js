import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Box, GU, LoadingRing, textStyle, Timer, useTheme } from '@aragon/ui'
import { dateFormat } from '../../utils/date-utils'

const DATE_FORMAT = 'YYYY/MM/DD , HH:mm'

function DisputableActionStatus({ vote }) {
  const voteEndPeriodNode = usePeriod(vote, vote.endDate)
  const delegatedVotingEndPeriodNode = usePeriod(
    vote,
    vote.delegatedVotingEndDate
  )
  const executionDelayEndPeriodNode = usePeriod(
    vote,
    vote.executionDelayEndDate
  )

  return (
    <Box heading="Status">
      <div
        css={`
          display: grid;
          grid-gap: ${2 * GU}px;
        `}
      >
        {vote.isDelayed && (
          <DataField
            label="Execution delay"
            value={executionDelayEndPeriodNode}
          />
        )}
        <DataField label={`Voting period`} value={voteEndPeriodNode} />
        <DataField
          label="Delegated voting period"
          value={delegatedVotingEndPeriodNode}
        />
      </div>
    </Box>
  )
}

function DataField({ label, value, loading = false }) {
  const theme = useTheme()

  return (
    <div>
      <h2
        css={`
          ${textStyle('label1')};
          font-weight: 200;
          color: ${theme.surfaceContentSecondary};
          margin-bottom: ${1 * GU}px;
        `}
      >
        {label}
      </h2>

      {loading ? (
        <LoadingRing />
      ) : (
        <div
          css={`
            ${textStyle('body2')};
          `}
        >
          {value}
        </div>
      )}
    </div>
  )
}

function usePeriod(proposal, periodEndDate) {
  const theme = useTheme()

  return useMemo(() => {
    return periodEndDate < Date.now() ? (
      <span>
        Ended{' '}
        <span
          css={`
            color: ${theme.contentSecondary};
          `}
        >
          ({dateFormat(periodEndDate, DATE_FORMAT)})
        </span>
      </span>
    ) : (
      <Timer end={periodEndDate} />
    )
  }, [periodEndDate, theme])
}
/* eslint-enable react/prop-types */

DisputableActionStatus.propTypes = {
  vote: PropTypes.object.isRequired,
}

export default DisputableActionStatus
