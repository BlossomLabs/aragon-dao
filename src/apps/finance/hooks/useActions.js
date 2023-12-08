import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { BN } from 'bn.js'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useWallet } from '@/providers/Wallet'
import { useMounted } from '@/hooks/shared/useMounted'
import { encodeFunctionData } from '@/utils/web3-utils'
import radspec from '@/radspec'
import financeActions from '../actions/finance-action-types'

import { Contract, constants } from 'ethers'
import { describeIntent } from '@/utils/tx-utils'
import { erc20ABI } from '@1hive/connect-react'

const CONTRACTS_CACHE = {}

function getContractInstance(address, abi, provider) {
  if (CONTRACTS_CACHE[address]) {
    return CONTRACTS_CACHE[address]
  }

  const contract = new Contract(address, abi, provider)
  CONTRACTS_CACHE[address] = contract

  return contract
}

export default function useActions() {
  const { account, ethers } = useWallet()
  const { connectedApp: connectedFinanceApp } = useConnectedApp()
  const mounted = useMounted()

  const getAllowance = useCallback(
    async tokenAddress => {
      const tokenContract = getContractInstance(tokenAddress, erc20ABI, ethers)

      if (!connectedFinanceApp) {
        return
      }

      const allowance = await tokenContract.allowance(
        account,
        connectedFinanceApp.address
      )

      return new BN(allowance.toString())
    },
    [account, connectedFinanceApp, ethers]
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
      const intent = {
        data: approveData,
        from: account,
        to: tokenContract.address,
      }

      if (mounted()) {
        return intent
      }
    },
    [account, mounted]
  )

  const approveTokenAmount = useCallback(
    async (tokenAddress, depositAmount, onDone = noop) => {
      const tokenContract = getContractInstance(tokenAddress, erc20ABI, ethers)
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
    [approve, connectedFinanceApp, ethers, mounted]
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
