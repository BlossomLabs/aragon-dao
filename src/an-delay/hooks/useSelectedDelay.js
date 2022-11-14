import { useCallback, useMemo } from 'react'
import { usePath } from './shared'

const DELAY_ID_PATH_RE = /^\/delay\/([0-9]+)\/?$/
const NO_DELAY_ID = '-1'

function delayIdFromPath(path) {
  if (!path) {
    return NO_DELAY_ID
  }
  const matches = path.match(DELAY_ID_PATH_RE)
  return matches ? matches[1] : NO_DELAY_ID
}

export default function useSelectedDelay(delayedScripts) {
  const [path, requestPath] = usePath()

  // The memoized delayed script currently selected.
  const selectedScript = useMemo(() => {
    const selectedScriptId = delayIdFromPath(path)
    // The `ready` check prevents a delayed script to be selected
    // until the app state is fully ready.
    if (/* !ready ||  */ selectedScriptId === NO_DELAY_ID) {
      return null
    }
    return (
      delayedScripts.find(script => script.scriptId === selectedScriptId) ||
      null
    )
  }, [path, delayedScripts])

  const selectDelay = useCallback(
    delayId => {
      requestPath(String(delayId) === NO_DELAY_ID ? '' : `/delay/${delayId}/`)
    },
    [requestPath]
  )

  return [selectedScript, selectDelay]
}
