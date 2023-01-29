import { decodeForwardingPath, describePath } from '@1hive/connect-react'
import { useEffect, useMemo, useState } from 'react'
import { useMounted } from '@/hooks/shared/useMounted'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { addressesEqual } from '@/utils/web3-utils'
import { getAppPresentationByAddress } from '@/utils/app-utils'
import { toUtf8String } from 'ethers/lib/utils'

const cachedDescriptions = new Map([])

const formatNewVoteStep = step => {
  const formattedDescription = formatDescription(step.description ?? '')
  const formattedAnnotatedDescription = step.annotatedDescription?.length
    ? step.annotatedDescription.map(item => {
        const newItem = { ...item }
        switch (item.type) {
          case 'bytes32':
            newItem.value = toUtf8String(item.value)
            break
          case 'text':
            newItem.value = formatDescription(item.value)
            break
        }

        return newItem
      })
    : undefined

  return {
    ...step,
    annotatedDescription: formattedAnnotatedDescription,
    description: formattedDescription,
  }
}

const isNewVoteStep = step => {
  const sigHash = step.data.substring(0, 10)

  return sigHash === '0x0a0932da' // sig hash for "newVote(bytes,bytes)""
}

const formatDescription = rawDescription => {
  return rawDescription
    .split('"')
    .map(fragment =>
      fragment.startsWith('0x') ? toUtf8String(fragment) : fragment
    )
    .join('"')
}

// TODO: temporary solution for steps of new votes with context until
// the contract's  newVote function's radspec is fixed
const patchSteps = steps => {
  return steps.map(step => {
    if (isNewVoteStep(step)) {
      return formatNewVoteStep(step)
    }

    return step
  })
}

const isEmptyScript = evmCallScript =>
  evmCallScript === '0x00000001' || evmCallScript === '0x00'

const useDecribeScript = (evmCallScript, scriptId) => {
  const mounted = useMounted()
  const [describedSteps, setDescribedSteps] = useState([])
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const { apps, connection } = useOrganizationState()
  const emptyScript = isEmptyScript(evmCallScript)

  // Populate target app data from transaction request
  const targetApp = useMemo(
    () =>
      describedSteps.length
        ? targetDataFromTransactionRequest(apps, describedSteps[0])
        : null,
    [apps, describedSteps]
  )

  useEffect(() => {
    if (
      !mounted() ||
      !apps ||
      !connection ||
      !evmCallScript ||
      !scriptId ||
      emptyScript
    ) {
      return
    }

    setLoading(true)

    if (cachedDescriptions.has(scriptId)) {
      setDescribedSteps(cachedDescriptions.get(scriptId))
      setLoading(false)
    }

    async function describe() {
      const steps = patchSteps(
        await describePath(
          decodeForwardingPath(evmCallScript),
          apps,
          connection.ethersProvider
        )
      )

      if (mounted()) {
        setLoading(false)
        setDescribedSteps(steps)

        cachedDescriptions.set(scriptId, steps)
      }
    }

    describe().catch(err => {
      if (mounted()) {
        setError(err)
        setLoading(false)
      }
    })
  }, [apps, connection, evmCallScript, mounted, scriptId, emptyScript])

  return { describedSteps, targetApp, emptyScript, loading, error }
}

function targetDataFromTransactionRequest(apps, transactionRequest) {
  const { to: targetAppAddress, name, identifier } = transactionRequest

  // Populate details via our apps list if it's available
  if (apps.some(({ address }) => addressesEqual(address, targetAppAddress))) {
    const appPresentation = getAppPresentationByAddress(apps, targetAppAddress)

    return {
      address: targetAppAddress,
      name: appPresentation !== null ? appPresentation.humanName : '',
      icon: appPresentation !== null ? appPresentation.iconSrc : '',
    }
  }

  // Otherwise provide some fallback values
  return {
    address: targetAppAddress,
    name: name || identifier,
    icon: '',
  }
}

export default useDecribeScript
