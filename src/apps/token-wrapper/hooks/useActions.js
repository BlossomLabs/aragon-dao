import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { BN } from 'bn.js'
import { useWallet } from '@/providers/Wallet'
import { getContract } from '@/hooks/shared/useContract'
import { useMounted } from '@/hooks/shared/useMounted'
import { encodeFunctionData } from '@/utils/web3-utils'
import radspec from '@/radspec'
import tokenActions from '../actions/token-action-types'

import tokenAllowanceAbi from '../abi/token-allowance.json'
import tokenSymbolAbi from '../abi/token-symbol.json'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { describeIntent } from '@/utils/tx-utils'
import { useNetwork } from '@/hooks/shared'

const tokenAbi = [].concat(tokenAllowanceAbi, tokenSymbolAbi)

export default function useActions() {
  const { chainId } = useNetwork()
  const { account } = useWallet()
  const { connectedApp } = useConnectedApp()
  const mounted = useMounted()

  const getAllowance = useCallback(
    async tokenAddress => {
      const tokenContract = getContract(tokenAddress, tokenAbi, chainId)
      if (!connectedApp || !tokenContract) {
        return
      }
      if (!tokenContract) {
        return
      }

      const allowance = await tokenContract.allowance(
        account,
        connectedApp.address
      )

      return new BN(allowance.toString())
    },
    [account, chainId, connectedApp]
  )

  const wrap = useCallback(
    async ({ amount }, onDone = noop) => {
      let intent = await connectedApp.intent('deposit', [amount], {
        actAs: account,
      })

      intent = describeIntent(intent, radspec[tokenActions.WRAP]())

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, connectedApp, mounted]
  )

  const unwrap = useCallback(
    async ({ amount }, onDone = noop) => {
      let intent = await connectedApp.intent('withdraw', [amount], {
        actAs: account,
      })

      intent = describeIntent(intent, radspec[tokenActions.UNWRAP]())

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, connectedApp, mounted]
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

      return intent
    },
    [account]
  )

  const approveTokenAmount = useCallback(
    async (tokenAddress, depositAmount, onDone = noop) => {
      const tokenContract = getContract(tokenAddress, tokenAbi, chainId)
      if (!tokenContract || !connectedApp) {
        return
      }

      const tokenSymbol = await tokenContract.symbol()

      const trxs = approve(depositAmount, tokenContract, connectedApp.address)

      const description = radspec[tokenActions.APPROVE_TOKEN]({
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
    [approve, chainId, connectedApp, mounted]
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
