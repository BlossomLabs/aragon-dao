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
import { useMounted } from '@/hooks/shared/useMounted'

export default function useActions() {
  const mounted = useMounted()
  const { account } = useWallet()
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
      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, votingApp, GAS_LIMIT, mounted]
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

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, votingApp, GAS_LIMIT, mounted]
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

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, votingApp, GAS_LIMIT, mounted]
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
        radspec[votingActions.VOTE_ON_BEHALF_OF]({ voteId, supports })
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, votingApp, GAS_LIMIT, mounted]
  )

  const executeVote = useCallback(
    async (voteId, script, onDone = noop) => {
      let intent = await votingApp.intent('executeVote', [voteId, script], {
        actAs: account,
      })

      intent = imposeGasLimit(intent, GAS_LIMIT)

      intent = describeIntent(
        intent,
        radspec[votingActions.ENACT_VOTE]({ voteId })
      )

      if (mounted()) {
        onDone(intent.transactions)
      }
    },
    [account, votingApp, GAS_LIMIT, mounted]
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
