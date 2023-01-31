import STATUS from '../delay-status-types'
import { dateToEpoch, timestampToDate, toMilliseconds } from './time-utils'

export function getStatus({ executionTime, pausedAt }, now) {
  if (pausedAt && parseInt(pausedAt)) return STATUS.PAUSED

  if (executionTime <= dateToEpoch(now)) return STATUS.PENDING_EXECUTION

  return STATUS.ONGOING
}

export const formatDelayedScript = delayedScript => {
  const {
    id,
    evmCallScript,
    executionTime,
    pausedAt,
    timeSubmitted,
    totalTimePaused,
  } = delayedScript

  return {
    ...delayedScript,
    id: parseInt(id),
    evmCallScript,
    executionTime: timestampToDate(executionTime),
    pausedAt: timestampToDate(pausedAt),
    timeSubmitted: timestampToDate(timeSubmitted),
    totalTimePaused: toMilliseconds(totalTimePaused),
  }
}
