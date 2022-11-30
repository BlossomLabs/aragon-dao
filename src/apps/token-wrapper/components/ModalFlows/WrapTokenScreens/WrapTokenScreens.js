import React, { useCallback, useMemo, useRef, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import WrapUnwrap from './WrapUnwrap'
import { useAppState } from '../../../providers/TokenWrapperProvider'
import useActions from '../../../hooks/useActions'

import BN from 'bn.js'

const ZERO_BN = new BN(0)

function WrapTokenScreens({ mode }) {
  const [transactions, setTransactions] = useState([])
  const { wrappedToken, depositedToken } = useAppState()

  const { tokenWrapperActions } = useActions()

  const temporatyTrx = useRef([])

  const getTransactions = useCallback(
    async (onComplete, amount) => {
      const bnAmount = new BN(amount)
      if (mode === 'wrap') {
        const allowance = await tokenWrapperActions.getAllowance(
          depositedToken.id
        )
        if (allowance.lt(bnAmount)) {
          if (!allowance.eq(new BN(0))) {
            await tokenWrapperActions.approveTokenAmount(
              depositedToken.id,
              ZERO_BN,
              intent => {
                temporatyTrx.current = temporatyTrx.current.concat(intent)
              }
            )
          }
          await tokenWrapperActions.approveTokenAmount(
            depositedToken.id,
            amount,
            intent => {
              temporatyTrx.current = temporatyTrx.current.concat(intent)
            }
          )
        }
        await tokenWrapperActions.wrap({ amount }, intent => {
          temporatyTrx.current = temporatyTrx.current.concat(intent)
        })
        setTransactions(temporatyTrx.current)
        onComplete()
      }
      if (mode === 'unwrap') {
        await tokenWrapperActions.unwrap({ amount }, intent => {
          setTransactions(intent)
          onComplete()
        })
      }
    },
    [depositedToken.id, mode, tokenWrapperActions]
  )

  const title =
    mode === 'wrap'
      ? `Wrap ${depositedToken.symbol} to receive ${wrappedToken.symbol}`
      : `Unwrap ${wrappedToken.symbol} to receive ${depositedToken.symbol}`

  const screens = useMemo(() => {
    return [
      {
        title: title,
        graphicHeader: false,
        content: <WrapUnwrap mode={mode} getTransactions={getTransactions} />,
      },
    ]
  }, [getTransactions, mode, title])

  return (
    <ModalFlowBase
      frontLoad={false}
      transactions={transactions}
      transactionTitle={mode === 'wrap' ? 'Wrap token' : 'Unwrap token'}
      screens={screens}
    />
  )
}

export default WrapTokenScreens
