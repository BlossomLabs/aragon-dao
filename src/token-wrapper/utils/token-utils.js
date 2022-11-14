import { round } from './math-utils'

export async function getUserBalanceAt(
  connectedAccount,
  snapshotBlock,
  tokenContract,
  tokenDecimals
) {
  if (!tokenContract || !connectedAccount) {
    return -1
  }

  const balance = await tokenContract.balanceOfAt(
    connectedAccount,
    snapshotBlock
  )

  return Math.floor(parseInt(balance, 10) / Math.pow(10, tokenDecimals))
}

export async function getUserBalanceNow(
  connectedAccount,
  tokenContract,
  tokenDecimals
) {
  if (!tokenContract || !connectedAccount) {
    return -1
  }

  const balance = await tokenContract.balanceOf(connectedAccount).toPromise()

  return Math.floor(parseInt(balance, 10) / Math.pow(10, tokenDecimals))
}

export function formatDecimals(value, digits) {
  try {
    return value.toLocaleString('en-US', {
      style: 'decimal',
      maximumFractionDigits: digits,
    })
  } catch (err) {
    if (err.name === 'RangeError') {
      // Fallback to Number.prototype.toString()
      // if the language tag is not supported.
      return value.toString()
    }
    throw err
  }
}

export function formatTokenAmount(
  amount,
  decimals = 0,
  isIncoming,
  displaySign = false,
  { rounding = 2, commas = true, replaceZeroBy = '0' } = {}
) {
  const roundedAmount = round(amount / Math.pow(10, decimals), rounding)
  const formattedAmount = formatDecimals(roundedAmount, 18)

  if (formattedAmount === '0') {
    return replaceZeroBy
  }

  return (
    (displaySign ? (isIncoming ? '+' : '-') : '') +
    (commas ? formattedAmount : formattedAmount.replace(',', ''))
  )
}
