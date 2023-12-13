import { useMemo } from 'react'
import { Contract } from 'ethers'
import { useWallet } from '../../providers/Wallet'

export function useContractReadOnly(address, abi) {
  const { ethers } = useWallet()

  return useMemo(() => {
    if (!address || !ethers || !abi) {
      return null
    }

    return new Contract(address, abi, ethers)
  }, [abi, address, ethers])
}

export function useContract(address, abi, signer) {
  const { account, ethers } = useWallet()

  return useMemo(() => {
    // Apparently .getSigner() returns a new object every time, so we use the
    // connected account as memo dependency.

    if (!address || !ethers || !account) {
      return null
    }

    return new Contract(address, abi, signer ? ethers.getSigner() : ethers)
  }, [abi, account, address, ethers, signer])
}
