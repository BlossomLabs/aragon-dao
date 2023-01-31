import { useTokenBalanceOf } from '@/hooks/shared/useAccountTokenBalance'
import { useConnect } from '@1hive/connect-react'
import { BN } from 'bn.js'
import React, { useContext, useMemo } from 'react'
import { useOrganizationState } from './OrganizationProvider'
import { useWallet } from './Wallet'

const FeeContext = React.createContext()

const FORWARDER_FEE_APP_NAME = 'an-delay'

const ZERO_BN = new BN(0)

function FeeProvider({ children }) {
  const { account } = useWallet()
  const { apps } = useOrganizationState()
  const [feeTokenAddress, tokenStatus] = useConnect(async () => {
    const app = apps.find(app => app.name === FORWARDER_FEE_APP_NAME)

    if (!app) {
      return
    }

    const feeTokenAddress = await app.ethersContract().feeToken()

    return feeTokenAddress
  }, [apps])
  const [feeTokenBalance, balanceStatus] = useTokenBalanceOf(
    feeTokenAddress,
    account
  )
  const hasFeeTokens = !!feeTokenBalance && feeTokenBalance.gt(ZERO_BN)
  const loading = tokenStatus.loading || balanceStatus.loading
  const error = tokenStatus.error || balanceStatus.error

  return (
    <FeeContext.Provider
      value={useMemo(
        () => ({ feeTokenBalance, hasFeeTokens, loading, error }),
        [feeTokenBalance, hasFeeTokens, loading, error]
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
