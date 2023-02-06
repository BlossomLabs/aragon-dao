import React, { useContext, useMemo } from 'react'
import { providers as EthersProviders } from 'ethers'
import { UseWalletProvider, useWallet } from 'use-wallet'
import { getDefaultProvider, getEthersNetwork } from '@/utils/web3-utils'
import { useWalletConnectors } from '../ethereum-providers'

/* eslint-disable react/prop-types */
const WalletAugmentedContext = React.createContext()

function useWalletAugmented() {
  return useContext(WalletAugmentedContext)
}

// Adds Ethers.js to the useWallet() object
function WalletAugmented({ children }) {
  const wallet = useWallet()
  const { ethereum, chainId } = wallet

  const ethers = useMemo(() => {
    return ethereum
      ? new EthersProviders.Web3Provider(ethereum, getEthersNetwork(chainId))
      : getDefaultProvider()
  }, [chainId, ethereum])

  const contextValue = useMemo(() => ({ ...wallet, ethers }), [wallet, ethers])

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
