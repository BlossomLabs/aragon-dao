import { useMemo } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { useConnectedApp } from '@/providers/ConnectedApp'
import BN from 'bn.js'
import { toMs } from '@/utils/date-utils'

export const useTransactions = () => {
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const [transactions = [], { loading, error }] = useConnect(
    () => connectedFinanceApp?.onTransactions(),
    [connectedFinanceApp]
  )

  const transactionsKey = transactions.length.toString()

  return [
    useMemo(() => {
      return transactions.map(transaction => ({
        ...transaction,
        amount: new BN(transaction.amount),
        date: toMs(transaction.date),
      }))
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions, transactionsKey]),
    { loading, error },
  ]
}

export default useTransactions
