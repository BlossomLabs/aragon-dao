import React, { useContext, useMemo } from 'react'
import { providers as EthersProviders } from 'ethers'
import { UseWalletProvider, useWallet } from 'use-wallet'
import { getUseWalletConnectors, getDefaultProvider } from '../utils/web3-utils'
// import { networkEnvironment } from '../current-environment'

/* eslint-disable react/prop-types */
const WalletAugmentedContext = React.createContext()

function useWalletAugmented() {
  return useContext(WalletAugmentedContext)
}

// Adds Ethers.js to the useWallet() object
function WalletAugmented({ children }) {
  const wallet = useWallet()
  const { ethereum } = wallet

  const ethers = useMemo(
    () =>
      ethereum
        ? new EthersProviders.Web3Provider(ethereum)
        : getDefaultProvider(),
    [ethereum]
  )

  const contextValue = useMemo(() => ({ ...wallet, ethers }), [wallet, ethers])

  return (
    <WalletAugmentedContext.Provider value={contextValue}>
      {children}
    </WalletAugmentedContext.Provider>
  )
}

function WalletProvider({ children }) {
  return (
    <UseWalletProvider
      chainId={100} // TODO: handle multiple chains
      connectors={getUseWalletConnectors()}
    >
      <WalletAugmented>{children}</WalletAugmented>
    </UseWalletProvider>
  )
}
/* eslint-disable react/prop-types */

export { useWalletAugmented as useWallet, WalletProvider }
