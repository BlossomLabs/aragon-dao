import { useCallback, useMemo } from 'react'
import { noop } from '@1hive/1hive-ui'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { useWallet } from '../../providers/Wallet'
import { getAppByName } from '../../utils/app-utils'
import radspec from '../../radspec'
import votingActions from '../actions/voting-actions-types'

const GAS_LIMIT = 550000

export default function useActions() {
  const { account, ethers } = useWallet()
  const { apps: installedApps } = useOrganizationState()
  const votingApp = getAppByName(installedApps, 'disputable-voting') // TODO move the app name to an env variable

  const delegateVoting = useCallback(
    async (representative, onDone = noop) => {
      let intent = await votingApp.intent(
        'setRepresentative',
        [representative],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[votingActions.DELEGATE_VOTING]({
        representative,
      })
      // const type = actions.DELEGATE_VOTING

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, votingApp]
  )

  return useMemo(
    () => ({
      votingActions: {
        delegateVoting,
      },
    }),
    [delegateVoting]
  )
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

function attachTrxMetadata(transactions, description, type) {
  return transactions.map(tx => ({
    ...tx,
    description,
    type,
  }))
}
