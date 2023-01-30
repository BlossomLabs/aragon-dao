import { useCallback, useMemo } from 'react'
import { noop } from '@aragon/ui'
import { utils } from 'ethers'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useWallet } from '@/providers/Wallet'
import radspec from '@/radspec'
import { describeIntent, imposeGasLimit } from '@/utils/tx-utils'
import { useGasLimit } from '@/hooks/shared/useGasLimit'

import votingActions from '../actions/voting-action-types'

import { EMPTY_CALLSCRIPT } from '../evmscript-utils'

export default function useActions() {
  const { account, ethers } = useWallet()
  const { connectedApp: votingApp } = useConnectedApp()
  const [GAS_LIMIT] = useGasLimit()

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

      intent = describeIntent(
        intent,
        radspec[votingActions.DELEGATE_VOTING]({
          representative,
        })
      )

      onDone(intent.transactions)
    },
    [account, votingApp]
  )

  const vote = useCallback(
    async (voteId, supports, onDone = noop) => {
      let intent = await votingApp.intent('vote', [voteId, supports], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(
        intent,
        radspec[votingActions.VOTE_ON_PROPOSAL]({
          voteId,
          supports,
        })
      )

      onDone(intent.transactions)
    },
    [account, votingApp]
  )

  const newVote = useCallback(
    async (question, onDone = noop) => {
      let intent = await votingApp.intent(
        'newVote',
        [utils.toUtf8Bytes(EMPTY_CALLSCRIPT), utils.toUtf8Bytes(question)],
        {
          actAs: account,
        }
      )

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(intent, radspec[votingActions.NEW_VOTE]())

      onDone(intent.transactions)
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

      intent = describeIntent(
        intent,
        radspec[votingActions.VOTE_ON_BEHALF_OF](voteId, supports)
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
        newVote,
      },
    }),
    [delegateVoting, executeVote, newVote, vote, voteOnBehalfOf]
  )
}

export async function sendIntent(app, fn, params, { ethers, from, gasLimit }) {
  try {
    const intent = await app.intent(fn, params, { actAs: from })
    const { to, data } = intent.transactions[0]

    ethers.getSigner().sendTransaction({ data, to, gasLimit })
  } catch (err) {
    console.error('Could not create tx:', err)
  }
}
