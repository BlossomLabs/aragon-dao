//VER PORQUE CONNECT DISPUTABLE NO TRAE LAS SETTINGS DE LOS VOTOS Y SOLO TRAE DOS SETTINGS

import React, { useContext } from 'react'
import { createAppHook, useApp } from '@aragon/connect-react'
import connectVoting from '@aragon/connect-disputable-voting'
// import BN from 'bn.js'

const VotingContext = React.createContext()
const useVoting = createAppHook(connectVoting)

// const pctBase = new BN('1')

const votingReducer = (err, votes = []) => {
  console.log('REDUCERRRRR ', votes)
  if (err || !votes) {
    return
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
        minAcceptQuorum: parseInt(vote.minimumAcceptanceQuorumPct, 10) / pctBaseNum,
        nay: parseInt(vote.nays, 10) / tokenDecimalsBaseNum,
        supportRequired: parseInt(vote.supportRequiredPct, 10) / pctBaseNum,
        votingPower: parseInt(vote.totalPower, 10) / tokenDecimalsBaseNum,
        yea: parseInt(vote.yeas, 10) / tokenDecimalsBaseNum
      },
    }
  })
  console.log('reducedVotes ', reducedVotes)
  return reducedVotes
}

function VotingProvider({ children }) {
  const [voting] = useApp('disputable-voting')

  const [votes] = useVoting(voting, app => app.onVotes({}, votingReducer), [])

  console.log('votes!! ', votes)

  return (
    <VotingContext.Provider value={{ votes: votes }}>
      {children}
    </VotingContext.Provider>
  )
}

function useVotingState() {
  return useContext(VotingContext)
}

export { VotingProvider, useVotingState }
