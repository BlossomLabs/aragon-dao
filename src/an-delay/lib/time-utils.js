export const toMilliseconds = timestamp => {
  let timestamp_ = timestamp

  if (typeof timestamp === 'string') {
    timestamp_ = parseInt(timestamp)
  }

  return timestamp_ * 1000
}

export const timestampToDate = timestamp => new Date(toMilliseconds(timestamp))
