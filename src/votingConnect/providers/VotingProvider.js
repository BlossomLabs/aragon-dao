import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useConnect } from '@rperez89/connect-react'
import connectVoting from '@rperez89/connect-disputable-voting'
import { useMounted } from '../../hooks/shared/useMounted'
import BN from 'bn.js'

const VotingContext = React.createContext()
// const useVoting = createAppHook(connectVoting)

const pctBase = new BN('1000000000000000000')
const pctBaseNum = parseInt(pctBase, 10)
const tokenDecimalsNum = parseInt(18, 10)
const tokenDecimalsBaseNum = Math.pow(10, tokenDecimalsNum)

const reduceVotes = ((votes = []) => {
  if (!votes) {
    return []
  }
  const reducedVotes = votes.map(vote => {
    return {
      voteId: vote.voteId,
      data: {
        executed: vote.status === 'Executed',
        executionDate: parseInt(vote.executedAt),
        creator: vote.creator,
        script: vote.script,
        yea: vote.yeas,
        nay: vote.nays,
        votingPower: vote.totalPower,
        minAcceptQuorum: vote.minimumAcceptanceQuorumPct,
        supportRequired: vote.supportRequiredPct,
        snapshotBlock: parseInt(vote.snapshotBlock),
        startDate: parseInt(vote.startDate) * 1000,
        executionTargets: [''],
      },
      numData: {
        minAcceptQuorum:
          parseInt(vote.minimumAcceptanceQuorumPct, 10) / pctBaseNum,
        nay: parseInt(vote.nays, 10) / tokenDecimalsBaseNum,
        supportRequired: parseInt(vote.supportRequiredPct, 10) / pctBaseNum,
        votingPower: parseInt(vote.totalPower, 10) / tokenDecimalsBaseNum,
        yea: parseInt(vote.yeas, 10) / tokenDecimalsBaseNum,
      },
    }
  })

   return reducedVotes
})

function VotingProvider({ children }) {
  const [votes, setVotes] = useState([])
  const mounted = useMounted()
  const [voting, votingStatus] = useConnect((org) => {
    return connectVoting(org.onApp('disputable-voting'))
  })

  const [connectVotes, voteStatus] = useConnect(() => {
     return voting?.onVotes()
  }, [voting])

  useEffect(() => {
    const reducedVotes = reduceVotes(connectVotes)
    if(mounted()){
      setVotes(reducedVotes)
    }
  }, [connectVotes])

  console.log('VOTES ', votes)

  return (
    <VotingContext.Provider
      value={{
        isSyncing: false,
        ready: true,
        tokenAddress: '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9', // ?
        tokenDecimals: new BN(18),
        tokenSymbol: 'HNY', // ?
        pctBase,
        voteTime: 432000 * 1000,
        numData: {
          pctBase: pctBaseNum,
          tokenDecimals: tokenDecimalsNum,
        },

        votes: votes,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

function useVotingState() {
  return useContext(VotingContext)
}

export { VotingProvider, useVotingState }
