const DEFAULT_GAS_LIMIT = 450000
const DEFAULT_GAS_FUZZ_FACTOR = 1.5
const BLOCK_GAS_LIMIT_FACTOR = 0.95

const NETWORK_GAS_DATA = {
  1: {
    blockGasLimit: 15000000,
    gasLimit: DEFAULT_GAS_LIMIT,
    gasFuzzFactor: 1.25,
  },
  10: {
    blockGasLimit: 30_000_000,
    gasLimit: DEFAULT_GAS_LIMIT,
    gasFuzzFactor: DEFAULT_GAS_FUZZ_FACTOR,
  },
  100: {
    blockGasLimit: 30000000,
    gasLimit: DEFAULT_GAS_LIMIT,
    gasFuzzFactor: DEFAULT_GAS_FUZZ_FACTOR,
  },
}

const KNOWN_DESCRIPTIONS = {
  '0x095ea7b3': 'Approve ANT for required action',
}

export async function getRecommendedGasLimit(chainId, provider, tx) {
  const { blockGasLimit, gasLimit, gasFuzzFactor } = NETWORK_GAS_DATA[chainId]
  let estimatedGas

  try {
    estimatedGas = await provider.estimateGas(tx)
  } catch (err) {
    console.error(`Couldn't estimate gas: ${err.message}`)
    return gasLimit
  }
  const upperGasLimit = Math.round(blockGasLimit * BLOCK_GAS_LIMIT_FACTOR)

  if (estimatedGas > upperGasLimit) {
    return estimatedGas
  }

  const bufferedGasLimit = Math.round(estimatedGas * gasFuzzFactor)

  return Math.min(bufferedGasLimit, upperGasLimit)
}

export function describeIntent(intent, description) {
  return {
    ...intent,
    transactions: intent.transactions.map(tx => {
      const signature = tx.data.slice(0, 10)
      const knownDescription = KNOWN_DESCRIPTIONS[signature]
      return {
        ...tx,
        description: knownDescription ?? description,
      }
    }),
  }
}
