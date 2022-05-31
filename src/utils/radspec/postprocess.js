import { addressesEqual } from '../../web3-utils'
import { utils } from 'ethers'

const CORE_NAMESPACE = utils.solidityKeccak256(['string'], ['core'])
const APP_ADDR_NAMESPACE = utils.solidityKeccak256(['string'], ['app'])
const APP_BASES_NAMESPACE = utils.solidityKeccak256(['string'], ['base'])
const KERNEL_NAMESPACES_NAMES = new Map([
  [CORE_NAMESPACE, 'Core'],
  [APP_ADDR_NAMESPACE, 'Default apps'],
  [APP_BASES_NAMESPACE, 'App code'],
])

function getKernelNamespace(hash) {
  return KERNEL_NAMESPACES_NAMES.has(hash)
    ? { name: KERNEL_NAMESPACES_NAMES.get(hash), hash }
    : null
}

/**
 * Look for known addresses and roles in a radspec description and substitute them with a human string
 *
 * @param  {string} description d
 * @param  {Array<Object>} apps d
 * @return {Promise<Object>} Description and annotated description
 */
export async function postprocessRadspecDescription(description, apps) {
  const addressRegexStr = '0x[a-fA-F0-9]{40}'
  const addressRegex = new RegExp(`^${addressRegexStr}$`)
  const bytes32RegexStr = '0x[a-f0-9]{64}'
  const bytes32Regex = new RegExp(`^${bytes32RegexStr}$`)
  const combinedRegex = new RegExp(
    `\\b(${addressRegexStr}|${bytes32RegexStr})\\b`
  )

  const tokens = description
    .split(combinedRegex)
    .map(token => token.trim())
    .filter(token => token)

  if (tokens.length < 1) {
    return { description }
  }

  const roles = apps
    .map(({ roles }) => roles || [])
    .reduce((acc, roles) => acc.concat(roles), []) // flatten

  const annotateAddress = input => {
    if (addressesEqual(input, utils.AddressZero)) {
      return [
        input,
        '“Any account”',
        { type: 'any-account', value: utils.AddressZero },
      ]
    }

    const app = apps.find(({ proxyAddress }) =>
      addressesEqual(proxyAddress, input)
    )
    if (app) {
      const replacement = `${app.name}${
        app.identifier ? ` (${app.identifier})` : ''
      }`
      return [input, `“${replacement}”`, { type: 'app', value: app }]
    }

    return [input, input, { type: 'address', value: input }]
  }

  const annotateBytes32 = input => {
    const role = roles.find(({ bytes }) => bytes === input)

    if (role && role.name) {
      return [input, `“${role.name}”`, { type: 'role', value: role }]
    }

    const app = apps.find(({ appId }) => appId === input)

    if (app) {
      // return the entire app as it contains APM package details
      return [input, `“${app.appName}”`, { type: 'apmPackage', value: app }]
    }

    const namespace = getKernelNamespace(input)
    if (namespace) {
      return [
        input,
        `“${namespace.name}”`,
        { type: 'kernelNamespace', value: namespace },
      ]
    }

    return [input, input, { type: 'bytes32', value: input }]
  }

  const annotateText = input => {
    return [input, input, { type: 'text', value: input }]
  }

  const annotatedTokens = tokens.map(token => {
    if (addressRegex.test(token)) {
      return annotateAddress(token)
    }
    if (bytes32Regex.test(token)) {
      return annotateBytes32(token)
    }
    return annotateText(token)
  })

  const compiled = annotatedTokens.reduce(
    (acc, [_, replacement, annotation]) => {
      acc.description.push(replacement)
      acc.annotatedDescription.push(annotation)
      return acc
    },
    {
      annotatedDescription: [],
      description: [],
    }
  )

  return {
    annotatedDescription: compiled.annotatedDescription,
    description: compiled.description.join(' '),
  }
}
