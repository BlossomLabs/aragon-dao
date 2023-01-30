export function imposeGasLimit(intent, gasLimit) {
  return {
    ...intent,
    transactions: intent.transactions.map(tx => ({ ...tx, gasLimit })),
  }
}

export function attachTrxMetadata(transactions, description, type) {
  return transactions.map(tx => ({ ...tx, description, type }))
}
