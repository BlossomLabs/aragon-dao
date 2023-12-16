import React, { useContext, useMemo } from 'react'
import { providers as EthersProviders } from 'ethers'
import { UseWalletProvider, useWallet } from 'use-wallet'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { getEthersNetwork } from '@/utils/web3-utils'
import { useWalletConnectors } from '../ethereum-providers'
import { ethersProvider } from '@/ethers-provider'

/* eslint-disable react/prop-types */
const WalletAugmentedContext = React.createContext()

function useWalletAugmented() {
  return useContext(WalletAugmentedContext)
}

// Adds Ethers.js to the useWallet() object
function WalletAugmented({ children }) {
  const wallet = useWallet()
  const { connected: isSafeConnected, safe } = useSafeAppsSDK()
  const { ethereum, chainId } = wallet

  const ethers = useMemo(() => {
    return ethereum
      ? new EthersProviders.Web3Provider(ethereum, getEthersNetwork(chainId))
      : ethersProvider
  }, [chainId, ethereum])

  const contextValue = useMemo(
    () => ({
      ...wallet,
      account: isSafeConnected ? safe.safeAddress : wallet.account,
      networkName: isSafeConnected ? safe.network : wallet.networkName,
      status: isSafeConnected ? 'connected' : wallet.status,
      ethers,
      chainId: isSafeConnected ? safe.chainId : chainId,
    }),
    [wallet, ethers, chainId, safe, isSafeConnected]
  )

  return (
    <WalletAugmentedContext.Provider value={contextValue}>
      {children}
    </WalletAugmentedContext.Provider>
  )
}

function WalletProvider({ children }) {
  return (
    <UseWalletProvider connectors={useWalletConnectors}>
      <WalletAugmented>{children}</WalletAugmented>
    </UseWalletProvider>
  )
}
/* eslint-disable react/prop-types */

export { useWalletAugmented as useWallet, WalletProvider }
