import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { BN } from 'bn.js'
import { useWallet } from '@/providers/Wallet'
import { getContract } from '@/hooks/shared/useContract'
import { useMounted } from '@/hooks/shared/useMounted'
import { getDefaultProvider, encodeFunctionData } from '@/utils/web3-utils'
import radspec from '@/radspec'
import tokenActions from '../actions/token-action-types'

import tokenAllowanceAbi from '../abi/token-allowance.json'
import tokenSymbolAbi from '../abi/token-symbol.json'
import { useOrganizationState } from '@/providers/OrganizationProvider'

const tokenAbi = [].concat(tokenAllowanceAbi, tokenSymbolAbi)

const APPROVE_GAS_LIMIT = 250000
const WRAP_GAS_LIMIT = 1000000

export default function useActions() {
  const { account } = useWallet()
  const { currentConnectedApp } = useOrganizationState()
  console.log(currentConnectedApp)
  const mounted = useMounted()

  const getAllowance = useCallback(
    async tokenAddress => {
      const tokenContract = getContract(
        tokenAddress,
        tokenAbi,
        getDefaultProvider(100) // TODO- handle chains
      )
      if (!currentConnectedApp || !tokenContract) {
        return
      }
      if (!tokenContract) {
        return
      }

      const allowance = await tokenContract.allowance(
        account,
        currentConnectedApp.address
      )

      return new BN(allowance.toString())
    },
    [account, currentConnectedApp]
  )

  const wrap = useCallback(
    async ({ amount }, onDone = noop) => {
      let intent = await currentConnectedApp.intent('deposit', [amount], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, WRAP_GAS_LIMIT)

      const description = radspec[tokenActions.WRAP]()

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      if (mounted()) {
        onDone(transactions)
      }
    },
    [account, currentConnectedApp, mounted]
  )

  const unwrap = useCallback(
    async ({ amount }, onDone = noop) => {
      let intent = await currentConnectedApp.intent('withdraw', [amount], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, WRAP_GAS_LIMIT)

      const description = radspec[tokenActions.UNWRAP]()

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      if (mounted()) {
        onDone(transactions)
      }
    },
    [account, currentConnectedApp, mounted]
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
      if (!tokenContract || !currentConnectedApp) {
        return
      }

      const tokenSymbol = await tokenContract.symbol()

      const trxs = approve(
        depositAmount,
        tokenContract,
        currentConnectedApp.address
      )

      const description = radspec[tokenActions.APPROVE_TOKEN]({
        tokenSymbol,
      })
      // const type = actions.APPROVE_TOKEN

      const transactions = attachTrxMetadata(trxs, description, '')

      if (mounted()) {
        onDone(transactions)
      }
    },
    [approve, currentConnectedApp, mounted]
  )

  return useMemo(
    () => ({
      tokenWrapperActions: {
        getAllowance,
        approveTokenAmount,
        wrap,
        unwrap,
      },
    }),
    [getAllowance, approveTokenAmount, wrap, unwrap]
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
