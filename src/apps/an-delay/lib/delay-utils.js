import STATUS from '../delay-status-types'
import { dateToEpoch, timestampToDate, toMilliseconds } from './time-utils'
import { parseContext as parseEvmscriptContext } from '@/utils/evmscript'

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

export function parseContext(context) {
  if (!context) {
    return []
  }
  const contextWithNoPrefix = context.replace(VOTING_DESCRIBED_STEP_PREFIX, '')
  const [title, reference] = parseEvmscriptContext(contextWithNoPrefix)

  return [title?.slice(1), reference?.slice(0, -1)]
}
