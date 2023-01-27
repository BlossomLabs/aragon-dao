import React, { useContext, useMemo } from 'react'
import { providers as EthersProviders } from 'ethers'
import { UseWalletProvider, useWallet } from 'use-wallet'
import { getDefaultProvider, getEthersNetwork } from '@/utils/web3-utils'
import { useWalletConnectors } from '../ethereum-providers'
import { DEFAULT_CHAIN_ID } from '@/constants'

/* eslint-disable react/prop-types */
const WalletAugmentedContext = React.createContext()

function useWalletAugmented() {
  return useContext(WalletAugmentedContext)
}

// Adds Ethers.js to the useWallet() object
function WalletAugmented({ children }) {
  const wallet = useWallet()
  const { ethereum, isConnected, chainId } = wallet

  const connected = isConnected()

  const chain = connected ? chainId : DEFAULT_CHAIN_ID

  const ethers = useMemo(() => {
    return ethereum
      ? new EthersProviders.Web3Provider(ethereum, getEthersNetwork(chain))
      : getDefaultProvider()
  }, [chain, ethereum])

  const contextValue = useMemo(() => ({ ...wallet, ethers, chainId: chain }), [
    wallet,
    ethers,
    chain,
  ])

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
