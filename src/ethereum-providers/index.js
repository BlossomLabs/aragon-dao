import frame from './icons/Frame.png'
import cipher from './icons/Cipher.png'
import metamask from './icons/Metamask.png'
import status from './icons/Status.png'
import wallet from './icons/wallet.svg'
import fortmatic from './icons/Fortmatic.svg'
import portis from './icons/Portis.svg'

export const connectors = [
  {
    id: 'injected',
    properties: {
      chainId: [100], // add here to handle more injected chains
    },
  },
  {
    id: 'frame',
    properties: {
      chainId: 100,
    },
  },
  {
    id: 'walletconnect',
    properties: {
      chainId: [100], // add here to handle more injected chains
      rpc: {
        '100': 'https://rpc.gnosischain.com',
      },
    },
  },
].filter(p => p)

// the final data that we pass to use-wallet package.
export const useWalletConnectors = connectors.reduce((current, connector) => {
  current[connector.id] = connector.properties || {}
  return current
}, {})
