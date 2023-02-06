import React from 'react'
import PropTypes from 'prop-types'
import {
  GU,
  IconCheck,
  IconClock,
  IconClose,
  IconCross,
  textStyle,
  useTheme,
} from '@aragon/ui'
import {
  VOTE_ACCEPTED,
  VOTE_SCHEDULED,
  VOTE_CANCELLED,
  VOTE_EXECUTED,
  VOTE_PENDING_EXECUTION,
  VOTE_REJECTED,
} from '../types/disputable-statuses'

function getAttributes(status, theme) {
  const attributes = {
    [VOTE_SCHEDULED]: {
      label: 'Scheduled',
      Icon: IconClock,
      color: theme.content,
    },
    [VOTE_ACCEPTED]: {
      background: theme.surface,
      label: 'Passed',
      Icon: IconCheck,
      color: theme.positive,
    },
    [VOTE_CANCELLED]: {
      background: theme.surfaceUnder,
      label: 'Cancelled',
      Icon: IconClose,
      color: theme.disabledContent,
    },
    [VOTE_PENDING_EXECUTION]: {
      background: theme.surface,
      label: 'Passed (pending)',
      Icon: IconCheck,
      color: theme.positive,
    },
    [VOTE_EXECUTED]: {
      background: '#CADFAB',
      label: 'Passed (enacted)',
      Icon: IconCheck,
      color: theme.positive,
    },
    [VOTE_REJECTED]: {
      background: theme.surface,
      label: 'Rejected',
      Icon: IconCross,
      color: theme.negative,
    },
  }

  return attributes[status]
}

function StatusLabel({ status }) {
  const theme = useTheme()
  const { Icon, color, label } = getAttributes(status, theme)

  return (
    <div
      css={`
        ${textStyle('body2')};
        color: ${color || theme.surfaceContentSecondary};
        display: flex;
        align-items: center;
      `}
    >
      <Icon size="small" />
      <div
        css={`
          margin-left: ${0.5 * GU}px;
          line-height: 1;
        `}
      >
        {label}
      </div>
    </div>
  )
}

StatusLabel.propTypes = {
  status: PropTypes.oneOf([
    VOTE_ACCEPTED,
    VOTE_SCHEDULED,
    VOTE_CANCELLED,
    VOTE_EXECUTED,
    VOTE_REJECTED,
    VOTE_PENDING_EXECUTION,
  ]),
}

export default StatusLabel
