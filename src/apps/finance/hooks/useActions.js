import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { BN } from 'bn.js'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useWallet } from '@/providers/Wallet'
import { getContract } from '@/hooks/shared/useContract'
import { useMounted } from '@/hooks/shared/useMounted'
import { getDefaultProvider, encodeFunctionData } from '@/utils/web3-utils'
import radspec from '@/radspec'
import financeActions from '../actions/finance-action-types'

import tokenAbi from '@/abi/minimeToken.json'

const APPROVE_GAS_LIMIT = 250000
const DEPOSIT_GAS_LIMIT = 2000000

export default function useActions() {
  const { account } = useWallet()
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const mounted = useMounted()

  const getAllowance = useCallback(
    async tokenAddress => {
      const tokenContract = getContract(
        tokenAddress,
        tokenAbi,
        getDefaultProvider(100) // TODO- handle chains
      )
      if (!connectedFinanceApp || !tokenContract) {
        return
      }
      if (!tokenContract) {
        return
      }

      const allowance = await tokenContract.allowance(
        account,
        connectedFinanceApp.address
      )

      return new BN(allowance.toString())
    },
    [account, connectedFinanceApp]
  )

  const deposit = useCallback(
    async ({ tokenAddress, amount, reference }, onDone = noop) => {
      let intent = await connectedFinanceApp.intent(
        'deposit',
        [tokenAddress, amount, reference],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, DEPOSIT_GAS_LIMIT)

      const description = radspec[financeActions.DEPOSIT]()

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      if (mounted()) {
        onDone(transactions)
      }
    },
    [account, connectedFinanceApp, mounted]
  )

  const withdraw = useCallback(
    async ({ tokenAddress, recipient, amount, reference }, onDone = noop) => {
      let intent = await connectedFinanceApp.intent(
        'newImmediatePayment',
        [tokenAddress, recipient, amount, reference],
        {
          actAs: account,
        }
      )

      // intent = imposeGasLimit(intent, WRAP_GAS_LIMIT)

      const description = radspec[financeActions.WITHDRAW]()

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      if (mounted()) {
        onDone(transactions)
      }
    },
    [account, connectedFinanceApp, mounted]
  )

  const approve = useCallback(
    (amount, tokenContract, appAddress) => {
      if (!tokenContract || !appAddress) {
        return
      }
      const approveData = encodeFunctionData(tokenContract, 'approve', [
        appAddress,
        amount.toString(10),
      ])
      const intent = [
        {
          data: approveData,
          from: account,
          to: tokenContract.address,
          gasLimit: APPROVE_GAS_LIMIT,
        },
      ]

      return intent
    },
    [account]
  )

  const approveTokenAmount = useCallback(
    async (tokenAddress, depositAmount, onDone = noop) => {
      const tokenContract = getContract(
        tokenAddress,
        tokenAbi,
        getDefaultProvider(100) // TODO- Handle chains
      )
      if (!tokenContract || !connectedFinanceApp) {
        return
      }

      const tokenSymbol = await tokenContract.symbol()

      const trxs = approve(
        depositAmount,
        tokenContract,
        connectedFinanceApp.address
      )

      const description = radspec[financeActions.APPROVE_TOKEN]({
        tokenSymbol,
      })
      // const type = actions.APPROVE_TOKEN

      const transactions = attachTrxMetadata(trxs, description, '')

      if (mounted()) {
        onDone(transactions)
      }
    },
    [approve, connectedFinanceApp, mounted]
  )

  return useMemo(
    () => ({
      financeActions: {
        getAllowance,
        approveTokenAmount,
        deposit,
        withdraw,
      },
    }),
    [getAllowance, approveTokenAmount, deposit, withdraw]
  )
}

function attachTrxMetadata(transactions, description, type) {
  return transactions.map(tx => ({
    ...tx,
    description,
    type,
  }))
}

function imposeGasLimit(intent, gasLimit) {
  return {
    ...intent,
    transactions: intent.transactions.map(tx => ({
      ...tx,
      gasLimit,
    })),
  }
}
