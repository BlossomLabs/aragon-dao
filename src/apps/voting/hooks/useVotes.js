import { useMemo } from 'react'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import { useApp } from '@/hooks/shared'
import { EMPTY_ADDRESS, shortenAddress } from '@/utils/web3-utils'
import { useAppState } from '../providers/VotingProvider'
import { isVoteOpen } from '../vote-utils'
import { VOTE_ABSENT } from '../vote-types'
import useNow from '@/hooks/shared/useNow'

// Decorate the votes array with more information relevant to the frontend
function useDecoratedVotes() {
  const { votes, connectedAccountVotes } = useAppState()
  // TODO: get app by address instead of name
  const { apps } = useOrganizationState()
  const currentApp = useApp('blossom-tao-voting')

  return useMemo(() => {
    // Make sure we have loaded information about the current app and other installed apps before showing votes
    if (!(votes && currentApp && apps)) {
      return [[], []]
    }
    const decoratedVotes = votes.map((vote, i) => {
      const executionTargets = vote.data.executionTargets

      let targetApp
      if (!executionTargets) {
        console.warn(
          `Voting: vote #${vote.voteId} does not list any execution targets. The app's cache is likely corrupted and needs to be reset.`
        )
      } else if (!executionTargets.length) {
        // If there's no execution target, consider it targeting this Voting app
        targetApp = {
          appAddress: currentApp.address,
          name: currentApp.name,
        }
        // Don't attach an identifier for this Voting app
        delete targetApp.identifier
      } else if (executionTargets.length > 1) {
        // If there's multiple targets, make a "multiple" version
        targetApp = {
          appAddress: EMPTY_ADDRESS,
          name: 'Multiple',
        }
      } else {
        // Otherwise, try to find the target from the installed apps
        const [targetAddress] = executionTargets

        targetApp = apps.find(app => app.appAddress === targetAddress)
        if (!targetApp) {
          targetApp = {
            appAddress: targetAddress,
            name: 'External',
          }
        }
      }

      let executionTargetData = null
      if (targetApp) {
        const { appAddress, icon, identifier, name } = targetApp
        executionTargetData = {
          identifier,
          address: appAddress,
          // If the app name was not loaded, use the app's address
          name: name || shortenAddress(appAddress),
          // Only try to get the icon if it's available
          iconSrc: typeof icon === 'function' ? icon(24) : null,
        }
      }

      return {
        ...vote,
        executionTargetData,
        connectedAccountVote: connectedAccountVotes[vote.voteId] || VOTE_ABSENT,
      }
    })

    // Reduce the list of installed apps to just those that have been targetted by apps
    const executionTargets = apps
      .filter(app =>
        votes.some(vote =>
          (vote.data.executionTargets || []).includes(app.appAddress)
        )
      )
      .map(({ appAddress, identifier, name }) => ({
        appAddress,
        identifier,
        // If the app name was not loaded, use the app's address
        name: name || shortenAddress(appAddress),
      }))
      .sort((a, b) => {
        return a.name ? a.name.localeCompare(b.name) : 1
      })

    return [decoratedVotes, executionTargets]
  }, [votes, connectedAccountVotes, currentApp, apps])
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
