import { useWallet } from '@/providers/Wallet'

const GAS_LIMIT = 550000
const APPROVE_GAS_LIMIT = 250000

export function useGasLimit(gasLimit = GAS_LIMIT) {
  const { type } = useWallet()

  /*
   * When we use wallet connect with a safe contract we need to set gas limit
   * to 0 avoiding an issue that sets safeTxGas wrongly provoking a revert
   * that is not right.
   */
  return [type === 'contract' ? 0 : gasLimit, APPROVE_GAS_LIMIT]
}
