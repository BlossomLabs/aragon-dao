import React, { useCallback, useMemo, useRef, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import WrapUnwrap from './WrapUnwrap'
import { useAppState } from '../../../providers/TokenWrapperProvider'
import useActions from '../../../hooks/useActions'

import BN from 'bn.js'
import LoadingScreen from '@/components/MultiModal/screens/LoadingScreen'

const ZERO_BN = new BN(0)

function WrapTokenScreens() {
  const [transactions, setTransactions] = useState([])
  const [displayErrorScreen, setDisplayErrorScreen] = useState(false)
  const { depositedToken } = useAppState()

  const { tokenWrapperActions } = useActions()

  const temporatyTrx = useRef([])

  const getWrapTransactions = useCallback(
    async (onComplete, amount) => {
      const bnAmount = new BN(amount)

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
      if (!temporatyTrx.current.length) {
        setDisplayErrorScreen(true)
        return
      }
      setTransactions(temporatyTrx.current)
      onComplete()
    },
    [depositedToken.id, tokenWrapperActions]
  )

  const getUnwrapTransactions = useCallback(
    async (onComplete, amount) => {
      await tokenWrapperActions.unwrap({ amount }, intent => {
        if (!intent || !intent.length) {
          setDisplayErrorScreen(true)
          return
        }

        setTransactions(intent)
        onComplete()
      })
    },
    [tokenWrapperActions]
  )

  const getTransactions = useCallback(
    (mode, onComplete, amount) => {
      if (mode === 'wrap') {
        getWrapTransactions(onComplete, amount)
      } else {
        getUnwrapTransactions(onComplete, amount)
      }
    },
    [getWrapTransactions, getUnwrapTransactions]
  )

  const screens = useMemo(() => {
    return [
      {
        title: 'Convert tokens',
        graphicHeader: false,
        content: <WrapUnwrap getTransactions={getTransactions} />,
      },
      {
        content: <LoadingScreen />,
      },
    ]
  }, [getTransactions])

  return (
    <ModalFlowBase
      displayErrorScreen={displayErrorScreen}
      transactions={transactions}
      transactionTitle={'Convert Tokens'}
      screens={screens}
    />
  )
}

export default WrapTokenScreens
