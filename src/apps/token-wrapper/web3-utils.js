import { isAddress } from 'web3-utils'

// Check address equality
export function addressesEqual(first, second) {
  return (
    isAddress(first) &&
    isAddress(second) &&
    first.toLowerCase() === second.toLowerCase()
  )
}

export function encodeFunctionData(contract, functionName, params) {
  return contract.interface.encodeFunctionData(functionName, params)
}

// Re-export some web3-utils functions
export { isAddress } from 'web3-utils'
