import React, { useCallback, useMemo, useRef, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import DepositWithdraw from './DepositWithdraw'
import useActions from '../../hooks/useActions'

import BN from 'bn.js'
import LoadingScreen from '@/components/MultiModal/screens/LoadingScreen'

const ZERO_BN = new BN(0)

function NewTransferScreens({ tokens, opened }) {
  const [transactions, setTransactions] = useState([])
  const [displayErrorScreen, setDisplayErrorScreen] = useState(false)

  const { financeActions } = useActions()

  const temporatyTrx = useRef([])

  const handleOnDeposit = useCallback(
    async (onComplete, tokenAddress, amount, reference) => {
      const bnAmount = new BN(amount)
      const allowance = await financeActions.getAllowance(tokenAddress)
      if (allowance.lt(bnAmount)) {
        if (!allowance.eq(new BN(0))) {
          await financeActions.approveTokenAmount(
            tokenAddress,
            ZERO_BN,
            intent => {
              temporatyTrx.current = temporatyTrx.current.concat(intent)
            }
          )
        }
        await financeActions.approveTokenAmount(
          tokenAddress,
          amount,
          intent => {
            temporatyTrx.current = temporatyTrx.current.concat(intent)
          }
        )
      }
      await financeActions.deposit(
        { tokenAddress, amount, reference },
        intent => {
          temporatyTrx.current = temporatyTrx.current.concat(intent)
        }
      )
      if (!temporatyTrx.current.length) {
        setDisplayErrorScreen(true)
        return
      }

      setTransactions(temporatyTrx.current)
      onComplete()
    },
    [financeActions]
  )

  const handleOnWithdraw = useCallback(
    async (onComplete, tokenAddress, recipient, amount, reference) => {
      await financeActions.withdraw(
        { tokenAddress, recipient, amount, reference },
        intent => {
          if (!intent || !intent.length) {
            setDisplayErrorScreen(true)
            return
          }

          setTransactions(intent)
          onComplete()
        }
      )
    },
    [financeActions]
  )

  const screens = useMemo(() => {
    return [
      {
        title: 'New transfer',
        graphicHeader: false,
        content: (
          <DepositWithdraw
            onDeposit={handleOnDeposit}
            onWithdraw={handleOnWithdraw}
            tokens={tokens}
            opened={opened}
          />
        ),
      },
      {
        content: <LoadingScreen />,
      },
    ]
  }, [handleOnDeposit, handleOnWithdraw, opened, tokens])

  return (
    <ModalFlowBase
      displayErrorScreen={displayErrorScreen}
      transactions={transactions}
      transactionTitle={'New transaction'}
      screens={screens}
    />
  )
}

export default NewTransferScreens
