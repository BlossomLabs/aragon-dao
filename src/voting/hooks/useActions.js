import { useCallback, useMemo } from 'react'
import { noop } from '@1hive/1hive-ui'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { useWallet } from '../../providers/Wallet'
import { getAppByName } from '../../utils/app-utils'
import radspec from '../../radspec'
import votingActions from '../actions/voting-action-types'

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

  const vote = useCallback(
    async (voteId, supports, onDone = noop) => {
      let intent = await votingApp.intent('vote', [voteId, supports], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[actions.VOTE]({
        voteId,
        supports,
      })
      // const type = actions.VOTE_ON_DECISION

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, votingApp]
  )

  const voteOnBehalfOf = useCallback(
    async (voteId, supports, voters, onDone = noop) => {
      let intent = await votingApp.intent(
        'voteOnBehalfOf',
        [voteId, supports, voters],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, GAS_LIMIT)

      const description = radspec[votingActions.VOTE_ON_BEHALF_OF]({
        voteId,
        supports,
      })
      // const type = votingActions.VOTE_ON_BEHALF_OF

      const transactions = attachTrxMetadata(
        intent.transactions,
        description,
        ''
      )

      onDone(transactions)
    },
    [account, votingApp]
  )

  const executeVote = useCallback(
    (voteId, script) => {
      sendIntent(votingApp, 'executeVote', [voteId, script], {
        ethers,
        from: account,
      })
    },
    [account, ethers, votingApp]
  )

  return useMemo(
    () => ({
      votingActions: {
        delegateVoting,
        executeVote,
        vote,
        voteOnBehalfOf,
      },
    }),
    [delegateVoting, executeVote, vote, voteOnBehalfOf]
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

async function sendIntent(
  app,
  fn,
  params,
  { ethers, from, gasLimit = GAS_LIMIT }
) {
  try {
    const intent = await app.intent(fn, params, { actAs: from })
    const { to, data } = intent.transactions[0] // TODO: Handle errors when no tx path is found

    ethers.getSigner().sendTransaction({ data, to, gasLimit })
  } catch (err) {
    console.error('Could not create tx:', err)
  }
}
