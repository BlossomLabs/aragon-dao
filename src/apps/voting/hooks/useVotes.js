import { useMemo } from 'react'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { useAppState } from '../providers/VotingProvider'
import { isVoteOpen } from '../vote-utils'
import useNow from '@/hooks/shared/useNow'
import { useConnectedApp } from '@/providers/ConnectedApp'
import {
  buildExecutionTarget,
  buildExecutionTargetApps,
  isEmptyCallScript,
} from '@/utils/evmscript'
import { getAppPresentation } from '@/utils/app-utils'

// Decorate the votes array with more information relevant to the frontend
function useDecoratedVotes() {
  const { votes } = useAppState()
  const { apps } = useOrganizationState()
  const { connectedApp } = useConnectedApp()

  return useMemo(() => {
    // Make sure we have loaded information about the current app and other installed apps before showing votes
    if (!(votes && connectedApp && apps)) {
      return [[], []]
    }

    const { iconSrc, name } = getAppPresentation(connectedApp)

    const connectedAppData = {
      address: connectedApp.address,
      name,
      iconSrc,
      identifier: connectedApp.address,
    }

    const decoratedVotes = votes.map(vote => {
      const executionTarget = isEmptyCallScript(vote.data.script)
        ? {
            executionTargetData: connectedAppData,
            executionTargets: [connectedApp.address],
          }
        : {
            ...buildExecutionTarget(vote.data.script, apps),
          }

      return {
        ...vote,
        ...executionTarget,
      }
    })

    const executionTargets = buildExecutionTargetApps(apps, decoratedVotes)

    return [decoratedVotes, executionTargets]
  }, [votes, connectedApp, apps])
}

// Get the votes array ready to be used in the app.
export default function useVotes() {
  const [votes, executionTargets] = useDecoratedVotes()
  const now = useNow()

  const openedStates = votes.map(v => isVoteOpen(v, now))
  const openedStatesKey = openedStates.join('')

  return [
    useMemo(() => {
      return votes.map((vote, i) => ({
        ...vote,
        data: {
          ...vote.data,
          open: openedStates[i],
        },
      }))
    }, [votes, openedStatesKey]), // eslint-disable-line react-hooks/exhaustive-deps
    executionTargets,
  ]
}
