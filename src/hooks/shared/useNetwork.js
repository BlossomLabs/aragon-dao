import { useWallet } from '@/providers/Wallet'
import { getNetwork } from '@/utils/web3-utils'

export default function useNetwork() {
  const { chainId } = useWallet()
  return getNetwork(chainId)
}
