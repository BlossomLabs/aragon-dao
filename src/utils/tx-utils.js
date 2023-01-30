export function imposeGasLimit(intent, gasLimit) {
  return {
    ...intent,
    transactions: intent.transactions.map(tx => ({ ...tx, gasLimit })),
  }
}

const KNOWN_DESCRIPTIONS = {
  '0x095ea7b3': 'Approve ANT for required action',
}

export function describeIntent(intent, description) {
  return {
    ...intent,
    transactions: intent.transactions.map(tx => {
      const signature = tx.data.slice(0, 10)
      const knownDescription = KNOWN_DESCRIPTIONS[signature]
      return {
        ...tx,
        description: knownDescription ? knownDescription : description,
      }
    }),
  }
}
