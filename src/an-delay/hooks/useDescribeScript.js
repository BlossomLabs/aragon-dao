import { decodeForwardingPath, describePath } from '@1hive/connect-react'
import { useEffect, useState } from 'react'
import { useMounted } from '../../hooks/shared/useMounted'
import { useOrganizationState } from '../../providers/OrganizationProvider'

const cachedDescriptions = new Map([])

const isEmptyScript = evmCallScript =>
  evmCallScript === '0x00000001' || evmCallScript === '0x00'

const useDecribeScript = (evmCallScript, scriptId) => {
  const mounted = useMounted()
  const [describedSteps, setDescribedSteps] = useState([])
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)
  const { apps, connection } = useOrganizationState()

  useEffect(() => {
    if (!apps || !connection || !evmCallScript || !scriptId) {
      return
    }

    if (isEmptyScript()) {
      setLoading(false)
      return
    }

    if (cachedDescriptions.has(scriptId)) {
      if (mounted()) {
        setDescribedSteps(cachedDescriptions.get(scriptId))
        setLoading(false)
      }
    }

    async function describe() {
      const steps = await describePath(
        decodeForwardingPath(evmCallScript),
        apps,
        connection.ethersProvider
      )
      setLoading(false)

      if (mounted()) {
        setDescribedSteps(steps)

        cachedDescriptions.set(scriptId, steps)
      }
    }

    describe().catch(err => {
      setError(err)
      setLoading(false)
    })
  }, [apps, connection, evmCallScript, mounted, scriptId])

  return [describedSteps, { loading, error }]
}

export default useDecribeScript
