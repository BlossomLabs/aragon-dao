import React, { useCallback, useMemo, useRef, useState } from 'react'
import ModalFlowBase from '@/components/MultiModal/ModalFlowBase'
import DepositWithdraw from './DepositWithdraw'
import useActions from '../../hooks/useActions'

import BN from 'bn.js'

const ZERO_BN = new BN(0)

function NewTransferScreens({ tokens, opened }) {
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  const { financeActions } = useActions()

  const temporatyTrx = useRef([])

  const handleOnDeposit = useCallback(
    async (onComplete, tokenAddress, amount, reference) => {
      setTransactionsLoading(true)
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
      setTransactions(temporatyTrx.current)
      setTransactionsLoading(false)
      onComplete()
    },
    [financeActions]
  )

  const handleOnWithdraw = useCallback(
    async (onComplete, tokenAddress, recipient, amount, reference) => {
      setTransactionsLoading(true)
      await financeActions.withdraw(
        { tokenAddress, recipient, amount, reference },
        intent => {
          setTransactions(intent)
          onComplete()
        }
      )
      setTransactionsLoading(false)
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
    ]
  }, [handleOnDeposit, handleOnWithdraw, opened, tokens])

  return (
    <ModalFlowBase
      transactions={transactions}
      loading={transactionsLoading}
      transactionTitle={'New transaction'}
      screens={screens}
    />
  )
}

export default NewTransferScreens
