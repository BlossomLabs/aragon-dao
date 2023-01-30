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
  GUARDIANS_TOKEN_MANAGER: throwIfNotExists(
    process.env.GUARDIANS_TOKEN_MANAGER
  ),
  BUDGET_APP_ADDRESSES: processCommaSeparatedValues(
    process.env.BUDGET_APP_ADDRESSES || ''
  ),
  GOVERNANCE_APP_ADDRESSES: processCommaSeparatedValues(
    process.env.GOVERNANCE_APP_ADDRESSES || ''
  ),
}

export function env(name) {
  return ENV_VARS[name]
}
