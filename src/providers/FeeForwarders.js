import { useConnect } from '@1hive/connect-react'
import { BN } from 'bn.js'
import React, { useContext, useMemo } from 'react'
import { lazyFetchConnectedApp } from './ConnectedApp'
import { useOrganizationState } from './OrganizationProvider'
import { useWallet } from './Wallet'
import { Contract } from 'ethers'
import { ERC20ABI } from '@/utils/token'

const FeeContext = React.createContext()

function formatDelayData(delayData) {
  return {
    ...delayData,
    executionDelay: parseInt(delayData.executionDelay),
    feeToken: {
      ...delayData.feeToken,
      decimals: parseInt(delayData.feeToken.decimals),
    },
    feeAmount: new BN(delayData.feeAmount),
  }
}

async function getFeeForwarders(apps, ethers) {
  const forwardFees = await Promise.allSettled(
    apps.map(async app => {
      try {
        let token, feeAmount, executionDelay

        if (app.name === 'an-delay') {
          const delayConnector = await lazyFetchConnectedApp(app)

          const delayData = await delayConnector
            ?.appData()
            .then(delayData =>
              delayData ? formatDelayData(delayData) : undefined
            )

          token = delayData?.feeToken?.address
          feeAmount = delayData?.feeAmount
          executionDelay = delayData?.executionDelay
        } else {
          ;[token, feeAmount] = await app.ethersContract().forwardFee()
        }

        return [app, { token, feeAmount, executionDelay }]
      } catch (err) {}
    })
  ).then(results => results.filter(res => res.value).map(res => res.value))

  const feeTokens = await Promise.all(
    [...new Set(forwardFees.map(([, { token }]) => token))].map(
      async feeTokenAddress => {
        const tokenContract = new Contract(feeTokenAddress, ERC20ABI, ethers)

        const [symbol, decimals] = await Promise.all([
          tokenContract.symbol(),
          tokenContract.decimals(),
        ])

        return [feeTokenAddress, { symbol, decimals }]
      }
    )
  )

  return forwardFees.reduce((feeForwarders, [app, feeForwarderData]) => {
    const { token: tokenAddress, feeAmount } = feeForwarderData
    const [, tokenData] =
      feeTokens.find(([feeTokenAddress]) => feeTokenAddress === tokenAddress) ??
      {}

    return {
      ...feeForwarders,
      [app.address]: {
        app,
        ...feeForwarderData,
        feeToken: {
          ...tokenData,
          address: tokenAddress,
        },
        feeAmount: new BN(feeAmount.toString()),
      },
    }
  }, {})
}

function FeeForwardersProvider({ children, type = '' }) {
  const { ethers } = useWallet()
  const { apps } = useOrganizationState()
  const [feeForwarders, feeForwardersStatus] = useConnect(
    () => (apps && ethers ? getFeeForwarders(apps, ethers) : undefined),
    [apps, ethers]
  )

  const loading = feeForwardersStatus.loading
  const error = feeForwardersStatus.error

  return (
    <FeeContext.Provider
      value={useMemo(
        () => ({
          feeForwarders,
          loading,
          error,
        }),
        [feeForwarders, loading, error]
      )}
    >
      {children}
    </FeeContext.Provider>
  )
}

function useFeeForwarders() {
  return useContext(FeeContext)
}

export { FeeForwardersProvider, useFeeForwarders }
