import dayjs from 'dayjs'

import isBetween from 'dayjs/plugin/isBetween'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

import { round } from '@/utils/math-utils'

export const toMs = seconds => seconds * 1000

const KNOWN_FORMATS = {
  onlyDate: 'YYYY/MM/DD',
  standard: 'YYYY/MM/DD HH:mm',
}

// dayjs plugins
dayjs.extend(isBetween)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(utc)

export function dateFormat(date, format = 'onlyDate') {
  return dayjs(date).format(KNOWN_FORMATS[format] || format)
}

export function durationToHours(duration) {
  return round(dayjs.duration(duration).asHours())
}
