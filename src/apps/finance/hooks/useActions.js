import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { BN } from 'bn.js'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useWallet } from '@/providers/Wallet'
import { getContract } from '@/hooks/shared/useContract'
import { useMounted } from '@/hooks/shared/useMounted'
import { encodeFunctionData } from '@/utils/web3-utils'
import radspec from '@/radspec'
import financeActions from '../actions/finance-action-types'

import tokenAbi from '@/abi/minimeToken.json'
import { constants } from 'ethers'
import { useGasLimit } from '@/hooks/shared/useGasLimit'
import { describeIntent, imposeGasLimit } from '@/utils/tx-utils'

export default function useActions() {
  const { account, chainId } = useWallet()
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const mounted = useMounted()
  const [GAS_LIMIT, APPROVE_GAS_LIMIT] = useGasLimit(2000000)

  const getAllowance = useCallback(
    async tokenAddress => {
      const tokenContract = getContract(tokenAddress, tokenAbi, chainId)
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
    [account, chainId, connectedFinanceApp]
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

      intent = imposeGasLimit(intent, GAS_LIMIT)

      /**
       * We need to add the amount as tx value when depositting
       * native tokens
       */
      if (
        tokenAddress === constants.AddressZero &&
        intent.transactions.length
      ) {
        intent.transactions[intent.transactions.length - 1].value = amount
      }

      intent = describeIntent(intent, radspec[financeActions.DEPOSIT]())

      if (mounted()) {
        onDone(intent.transactions)
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

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(intent, radspec[financeActions.WITHDRAW]())

      if (mounted()) {
        onDone(intent.transactions)
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
      const tokenContract = getContract(tokenAddress, tokenAbi, chainId)
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

      const transactions = {
        ...trxs,
        description,
      }

      if (mounted()) {
        onDone(transactions)
      }
    },
    [approve, chainId, connectedFinanceApp, mounted]
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
