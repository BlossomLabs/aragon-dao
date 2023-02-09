function processCommaSeparatedValues(value) {
  return value.split(',').map(v => v.trim().toLowerCase())
}

function throwIfNotExists(envName) {
  if (!envName) {
    throw new Error(`Missing required environment variable: ${envName}`)
  }
  return envName
}

const ENV_VARS = {
  CHAIN_ID: parseInt(throwIfNotExists(process.env.CHAIN_ID)),
  DAO_ID: throwIfNotExists(process.env.DAO_ID),
  STATIC_ETH_NODE: throwIfNotExists(process.env.STATIC_ETH_NODE),
  GUARDIANS_TOKEN_MANAGER: throwIfNotExists(
    process.env.GUARDIANS_TOKEN_MANAGER
  ),
  BUDGET_APP_ADDRESSES: processCommaSeparatedValues(
    process.env.BUDGET_APP_ADDRESSES || ''
  ),
  GOVERNANCE_APP_ADDRESSES: processCommaSeparatedValues(
    process.env.GOVERNANCE_APP_ADDRESSES || ''
  ),
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || null,
  ANKR_API_KEY: process.env.ANKR_API_KEY || null,
  INFURA_API_KEY: process.env.INFURA_API_KEY || null,
  POCKET_API_KEY: process.env.POCKET_API_KEY || null,
  IPFS_RESOLVER: process.env.IPFS_RESOLVER || null,
}

export function env(name) {
  return ENV_VARS[name]
}
