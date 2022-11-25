import { decodeCallScript, isCallScript } from './utils/callscript'
import { isValidForwardCall, parseForwardCall } from './utils/forwarding'
import { tryEvaluatingRadspec } from './utils/radspec'
import { postprocessRadspecDescription } from './utils/radspec/postprocess'

export const EMPTY_CALLSCRIPT = '0x00000001'

/**
 * Decodes an EVM callscript and returns the transaction path it describes.
 *
 * @param  {string} script EVM callscript
 * @return {Array<Object>} An array of Ethereum transactions that describe each step in the path
 */
export function decodeTransactionPath(script) {
  // In the future we may support more EVMScripts, but for now let's just assume we're only
  // dealing with call scripts
  if (!isCallScript(script)) {
    throw new Error(`Script could not be decoded: ${script}`)
  }

  const path = decodeCallScript(script)
  return path.map(segment => {
    const { data } = segment

    if (isValidForwardCall(data)) {
      const forwardedEvmScript = parseForwardCall(data)

      try {
        segment.children = decodeTransactionPath(forwardedEvmScript)
      } catch (err) {}
    }

    return segment
  })
}

/**
 * Use radspec to create a human-readable description for each transaction in the given `path`
 *
 * @param  {Array<Object>} path List of encoded transactions
 * @param  {Array<Object>} apps List of DAO apps
 * @param  {Object} provider Ethers provider
 * @return {Promise<Array<Object>>} The given `path`, with decorated with descriptions at each step
 */
export async function describeTransactionPath(path, apps, provider) {
  return Promise.all(
    path.map(async step => {
      let decoratedStep

      if (Array.isArray(step)) {
        // Intent basket with multiple transactions in a single callscript
        // First see if the step can be handled with a specialized descriptor
        // try {
        //   decoratedStep = await tryDescribingUpgradeOrganizationBasket(step, this)
        // } catch (err) {}

        // If the step wasn't handled, just individually describe each of the transactions
        return decoratedStep || describeTransactionPath(step)
      }

      // Single transaction step
      // First see if the step can be handled with a specialized descriptor
      // try {
      //   decoratedStep = await tryDescribingUpdateAppIntent(step, this)
      // } catch (err) {}

      // Finally, if the step wasn't handled yet, evaluate via radspec normally
      if (!decoratedStep) {
        try {
          decoratedStep = await tryEvaluatingRadspec(step, apps, provider)
        } catch (err) {}
      }

      // Annotate the description, if one was found
      if (decoratedStep) {
        if (decoratedStep.description) {
          try {
            const processed = await postprocessRadspecDescription(
              decoratedStep.description,
              apps
            )
            decoratedStep.description = processed.description
            decoratedStep.annotatedDescription = processed.annotatedDescription
          } catch (err) {}
        }

        if (decoratedStep.children) {
          decoratedStep.children = await describeTransactionPath(
            decoratedStep.children
          )
        }
      }

      return decoratedStep || step
    })
  )
}

export async function describeScript(request, apps, provider) {
  const script = request.params[0]

  const describedPath = await describeTransactionPath(
    decodeTransactionPath(script),
    apps,
    provider
  )

  return describedPath

  // Add name and identifier decoration
  // TODO: deprecate this now that the app has enough information to get this information itself
  // through getApps()
  // const identifiers = await wrapper.appIdentifiers.pipe(first()).toPromise()
  // return Promise.all(
  //   describedPath.map(async (step) => {
  //     const app = await wrapper.getApp(step.to)

  //     if (app) {
  //       return {
  //         ...step,
  //         identifier: identifiers[step.to],
  //         name: app.name
  //       }
  //     }

  //     return step
  //   })
  // )
}
