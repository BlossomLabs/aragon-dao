import { utils as ethersUtils } from 'ethers'
import { useEffect, useState } from 'react'
import { useFeeForwarders } from '@/providers/FeeForwarders'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { addressesEqual } from '@/utils/web3-utils'
import { useTokenBalanceOf } from './useAccountTokenBalance'
import { useWallet } from '@/providers/Wallet'
import { useCurrentApp } from './useCurrentApp'
import { ZERO_BN } from '@/utils/math-utils'

function resolveRole(roleOrRoleHash) {
  if (roleOrRoleHash.startsWith('0x')) {
    return roleOrRoleHash
  }

  return ethersUtils.id(roleOrRoleHash)
}

export function useRequiredFeesForAction({
  role: roleOrRoleHash,
  app,
  account,
}) {
  const [feeForwarder, setFeeForwarder] = useState()
  const currentApp = useCurrentApp()
  const { account: connectedAccount } = useWallet()
  const { permissions } = useOrganizationState()
  const {
    feeForwarders,
    loading: feeForwardersLoading,
    error: feeForwardersError,
  } = useFeeForwarders()
  const [tokenBalance, tokenBalanceStatus] = useTokenBalanceOf(
    feeForwarder?.feeToken.address,
    account ?? connectedAccount
  )
  const enoughFeeTokenBalance =
    feeForwarder === null ||
    feeForwarder?.feeAmount.eq(ZERO_BN) ||
    (tokenBalance &&
      feeForwarder &&
      feeForwarder.feeAmount &&
      tokenBalance.gte(feeForwarder.feeAmount))

  const app_ = app ?? currentApp?.address
  const loading = tokenBalanceStatus.loading || feeForwardersLoading
  const error = tokenBalanceStatus.error || feeForwardersError

  useEffect(() => {
    if (!permissions || !app_ || !feeForwarders) {
      return
    }

    const role = resolveRole(roleOrRoleHash)
    const feeForwarderAddresses = Object.keys(feeForwarders)
    const requiredFeeForwarderAddress = feeForwarderAddresses.find(
      feeForwarderAddress => {
        const grantedPermissions = permissions.find(
          ({ appAddress: permissionAppAddress, roleHash, granteeAddress }) =>
            addressesEqual(permissionAppAddress, app_) &&
            roleHash === role &&
            addressesEqual(feeForwarderAddress, granteeAddress)
        )

        return !!grantedPermissions
      }
    )

    setFeeForwarder(
      requiredFeeForwarderAddress
        ? feeForwarders[requiredFeeForwarderAddress]
        : null
    )
  }, [app_, feeForwarders, permissions, roleOrRoleHash])

  return [
    {
      feeForwarder,
      enoughFeeTokenBalance,
      tokenBalance,
    },
    { loading, error },
  ]
}
