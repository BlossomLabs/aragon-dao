import React, { useEffect } from 'react'

import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'

function Enact({ getTransactions }) {
  const { next } = useMultiModal()

  useEffect(() => {
    next()
    getTransactions(() => {
      next()
    })
  }, [getTransactions, next])

  return <div />
}

export default Enact
