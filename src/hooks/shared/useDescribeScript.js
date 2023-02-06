import { decodeForwardingPath, describePath } from '@1hive/connect-react'
import { useEffect, useMemo, useState } from 'react'
import { useMounted } from '@/hooks/shared/useMounted'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { toUtf8String } from 'ethers/lib/utils'
import {
  isEmptyCallScript,
  targetDataFromTransactionRequest,
} from '@/utils/evmscript'

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

const useDecribeScript = (evmCallScript, scriptId) => {
  const mounted = useMounted()
  const [describedSteps, setDescribedSteps] = useState([])
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const { apps, connection } = useOrganizationState()
  const emptyScript = isEmptyCallScript(evmCallScript)

  // Populate target app data from transaction request
  const targetApp = useMemo(
    () =>
      describedSteps.length
        ? targetDataFromTransactionRequest(apps, describedSteps)
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

export default useDecribeScript
