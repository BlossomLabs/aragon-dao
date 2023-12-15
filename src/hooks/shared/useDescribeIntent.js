import { useFeeForwarders } from '@/providers/FeeForwarders'
import { addressesEqual } from '@/utils/web3-utils'
import { useCallback } from 'react'

const PRE_ACTION_TYPES = {
  FEE_APPROVE: Symbol('FEE_APPROVE'),
  UNKNOWN: Symbol('UNKNOWN'),
}

function getPreActionType(tx) {
  const signature = tx.data.slice(0, 10)

  switch (signature) {
    case '0x095ea7b3':
      return PRE_ACTION_TYPES.FEE_APPROVE
    default:
      return PRE_ACTION_TYPES.UNKNOWN
  }
}

function getPreActionDescription(type, tx, { feeTokens } = {}) {
  if (type === PRE_ACTION_TYPES.FEE_APPROVE) {
    const feeToken = feeTokens.find(feeToken =>
      addressesEqual(feeToken.address, tx.to)
    )
    return `Approve ${feeToken?.symbol ??
      `Unknown Token (${tx.to})`} fee for required action`
  }

  throw new Error(`Unknown pre action type: ${type}`)
}

export function useDescribeIntent() {
  const { feeForwarders } = useFeeForwarders()

  const describeIntent = useCallback(
    (intent, txDescription) => {
      const feeTokens = Object.keys(feeForwarders ?? {})?.map(
        forwarderAddress => feeForwarders[forwarderAddress].feeToken
      )
      return {
        ...intent,
        transactions: intent.transactions.map(tx => {
          let description = txDescription

          const type = getPreActionType(tx)

          if (type !== PRE_ACTION_TYPES.UNKNOWN) {
            description = getPreActionDescription(type, tx, { feeTokens })
          } else {
            description = txDescription
          }

          return {
            ...tx,
            description,
          }
        }),
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feeForwarders]
  )

  return describeIntent
}
