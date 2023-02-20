import STATUS from '../delay-status-types'
import { dateToEpoch, timestampToDate, toMilliseconds } from './time-utils'
import {
  getReferenceFromContext,
  getTitleFromContext,
} from '@/utils/text-utils'

export const VOTING_DESCRIBED_STEP_PREFIX = 'Create a new vote about '

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

export function getReference(text) {
  const context = text.replace(VOTING_DESCRIBED_STEP_PREFIX, '')
  const parsedValue = getReferenceFromContext(context)
  return parsedValue?.slice(0, -1)
}

export function getTitle(text) {
  const context = text.replace(VOTING_DESCRIBED_STEP_PREFIX, '')
  const parsedValue = getTitleFromContext(context)
  return parsedValue?.slice(1)
}
