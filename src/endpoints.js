import { isLocalOrUnknownNetwork } from './utils/web3-utils'

export const IPFS_ENDPOINT = {
  read: isLocalOrUnknownNetwork()
    ? 'http://127.0.0.1:8080/ipfs'
    : 'https://ipfs.blossom.software/ipfs',
  upload: 'https://ipfs.infura.io:5001/api/v0/add',
}
