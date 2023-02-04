import React, { useEffect } from 'react'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { useMounted } from '@/hooks/shared/useMounted'
import { useMultiModal } from './MultiModal/MultiModalProvider'
import { normalizeTransaction } from '@/utils/tx-utils'

export default function SafeStep({ transactions }) {
  const mounted = useMounted()
  const { close } = useMultiModal()
  const { connected, sdk } = useSafeAppsSDK()

  useEffect(() => {
    const submitSafeTransactions = async () => {
      try {
        await sdk.txs.send({
          txs: normalizeTransaction(transactions),
        })
      } catch (e) {
        console.error(e)
      }
    }

    if (mounted() && transactions && connected) {
      close()
      submitSafeTransactions()
    }
  }, [connected, close, mounted, sdk.txs, transactions])

  return null
}
