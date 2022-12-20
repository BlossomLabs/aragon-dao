import { useConnect } from '@1hive/connect-react'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import BN from 'bn.js'
import { toMs } from '@/utils/date-utils'

export const useTransactions = () => {
  const { connectedFinanceApp } = useOrganizationState()
  const [transactions = [], { loading, error }] = useConnect(
    () => connectedFinanceApp?.onTransactions(),
    [connectedFinanceApp]
  )

  const reducedTransactions = transactions
    ? transactions.map(transaction => ({
        ...transaction,
        amount: new BN(transaction.amount),
        date: toMs(transaction.date),
      }))
    : []

  return [reducedTransactions, { loading, error }]
}

export default useTransactions
