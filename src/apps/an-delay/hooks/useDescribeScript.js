import { decodeForwardingPath, describePath } from '@1hive/connect-react'
import { useEffect, useState } from 'react'
import { useMounted } from '@/hooks/shared/useMounted'
import { useOrganizationState } from '@/providers/OrganizationProvider'

const cachedDescriptions = new Map([])

const isEmptyScript = evmCallScript =>
  evmCallScript === '0x00000001' || evmCallScript === '0x00'

const useDecribeScript = (evmCallScript, scriptId) => {
  const mounted = useMounted()
  const [describedSteps, setDescribedSteps] = useState([])
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const { apps, connection } = useOrganizationState()

  useEffect(() => {
    if (!mounted() || !apps || !connection || !evmCallScript || !scriptId) {
      return
    }

    if (isEmptyScript()) {
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
  }, [apps, connection, evmCallScript, mounted, scriptId])

  return [describedSteps, { loading, error }]
}

export default useDecribeScript
