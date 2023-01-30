import React, { useCallback, useContext, useEffect, useState } from 'react'
import { utils } from 'ethers'
import { encodeCallScript } from '@1hive/connect-react'
import { useContract } from '@/hooks/shared/useContract'
import tokenManagerAbi from '@/abi/tokenManager.json'
import { env } from '@/environment'
import { useWallet } from './Wallet'

let GUARDIANS_TOKEN_MANAGER = env('GUARDIANS_TOKEN_MANAGER')

if (!GUARDIANS_TOKEN_MANAGER) {
  throw new Error('Missing GUARDIANS_TOKEN_MANAGER env variable')
}

const TOKEN_MANAGER_INTERFACE = new utils.Interface(tokenManagerAbi)

const GuardianContext = React.createContext()

function GuardianProvider({ children }) {
  const wallet = useWallet()
  const { account } = wallet
  const [loading, setLoading] = useState()
  const [isGuardian, setIsGuardian] = useState(false)
  const guardiansTokenManager = useContract(
    GUARDIANS_TOKEN_MANAGER,
    tokenManagerAbi
  )

  useEffect(() => {
    if (!guardiansTokenManager || !account) {
      return
    }

    async function checkIfIsGuardian() {
      setLoading(true)
      /**
       * Pass an empty evm script as token manager doesn't use
       * it to perform a canForward check
       */
      try {
        const canForward = await guardiansTokenManager.canForward(account, '0x')
        setIsGuardian(canForward)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkIfIsGuardian()
  }, [guardiansTokenManager, account])

  const callAsGuardian = useCallback(
    (app, method, params) => {
      if (!isGuardian) {
        throw new Error('Connected account is not guardian')
      }
      const appInterface = app.ethersInterface()

      const script = encodeCallScript([
        {
          to: app.address,
          data: appInterface.encodeFunctionData(method, params),
        },
      ])

      return {
        to: GUARDIANS_TOKEN_MANAGER,
        data: TOKEN_MANAGER_INTERFACE.encodeFunctionData('forward', [script]),
        from: account,
      }
    },
    [account, isGuardian]
  )

  return (
    <GuardianContext.Provider value={{ isGuardian, callAsGuardian, loading }}>
      {children}
    </GuardianContext.Provider>
  )
}

function useGuardianState() {
  return useContext(GuardianContext)
}

export { GuardianProvider, useGuardianState }
