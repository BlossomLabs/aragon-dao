import { env } from '@/environment'
import { useTokenBalanceOf } from '@/hooks/shared/useAccountTokenBalance'
import { useConnect } from '@1hive/connect-react'
import { BN } from 'bn.js'
import React, { useContext, useMemo } from 'react'
import { rawLoadOrCreateConnectedApp } from './ConnectedApp'
import { useOrganizationState } from './OrganizationProvider'
import { useWallet } from './Wallet'

const FeeContext = React.createContext()

const FORWARDER_FEE_APP_NAME = 'an-delay'

const ZERO_BN = new BN(0)

const BUDGET_APP_ADDRESSES = env('BUDGET_APP_ADDRESSES')
const GOVERNANCE_APP_ADDRESSES = env('GOVERNANCE_APP_ADDRESSES')

function FeeProvider({ children, type = '' }) {
  const { account } = useWallet()
  const { apps } = useOrganizationState()
  const [delayData, delayDataStatus] = useConnect(async () => {
    if (!apps) {
      return
    }

    const delays = apps.filter(app => app.name === FORWARDER_FEE_APP_NAME)
    let labeledAppAddresses
    let delay
    if (type.toLowerCase() === 'budget') {
      labeledAppAddresses = BUDGET_APP_ADDRESSES
    } else if (type.toLowerCase() === 'governance') {
      labeledAppAddresses = GOVERNANCE_APP_ADDRESSES
    }

    if (!labeledAppAddresses) {
      throw new Error('Unknown provided type')
    }

    delay = delays.find(delay =>
      labeledAppAddresses.includes(delay.address.toLowerCase())
    )

    const delayConnector = await rawLoadOrCreateConnectedApp(delay)

    return delayConnector?.appData()
  }, [apps, type])
  const [feeTokenBalance, balanceStatus] = useTokenBalanceOf(
    delayData?.feeToken?.address,
    account
  )
  const hasFeeTokens = !!feeTokenBalance && feeTokenBalance.gt(ZERO_BN)
  const loading = delayDataStatus.loading || balanceStatus.loading
  const error = delayDataStatus.error || balanceStatus.error

  return (
    <FeeContext.Provider
      value={useMemo(
        () => ({
          executionDelay: delayData?.executionDelay,
          feeToken: delayData?.feeToken,
          feeAmount: delayData?.feeAmount,
          feeTokenBalance,
          hasFeeTokens,
          loading,
          error,
        }),
        [delayData, feeTokenBalance, hasFeeTokens, loading, error]
      )}
    >
      {children}
    </FeeContext.Provider>
  )
}

function useFee() {
  return useContext(FeeContext)
}

export { FeeProvider, useFee }
