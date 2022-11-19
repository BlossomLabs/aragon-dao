export const toMilliseconds = timestamp => {
  let timestamp_ = timestamp

  if (typeof timestamp === 'string') {
    timestamp_ = parseInt(timestamp)
  }

  return timestamp_ * 1000
}

export const timestampToDate = timestamp => {
  const ms = toMilliseconds(timestamp)

  if (ms === 0) {
    return
  }

  return new Date(ms)
}

export const dateToEpoch = date => Math.round(date.getTime() / 1000)
