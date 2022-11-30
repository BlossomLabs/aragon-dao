import { decodeForwardingPath, describePath } from '@1hive/connect-react'
import { useEffect, useMemo, useState } from 'react'
import { useMounted } from '@/hooks/shared/useMounted'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { addressesEqual } from '@/utils/web3-utils'
import { getAppPresentationByAddress } from '@/utils/app-utils'

const cachedDescriptions = new Map([])

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
      const steps = await describePath(
        decodeForwardingPath(evmCallScript),
        apps,
        connection.ethersProvider
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
