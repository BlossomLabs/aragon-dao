import React, { useContext, useEffect, useState } from 'react'
import { useConnect } from '@rperez89/connect-react'
import { useOrganizationState } from '../../providers/OrganizationProvider'
import { useMounted } from '../../hooks/shared/useMounted'
import { DisputableStatusType } from '../types/disputable-statuses'
import BN from 'bn.js'

const VotingContext = React.createContext()

const pctBase = new BN('1000000000000000000')
const pctBaseNum = parseInt(pctBase, 10)
const tokenDecimalsNum = parseInt(18, 10)
const tokenDecimalsBaseNum = Math.pow(10, tokenDecimalsNum)

const reduceVotes = (votes = []) => {
  if (!votes) {
    return []
  }
  const reducedVotes = votes.map(vote => {
    return {
      voteId: vote.voteId,
      id: vote.id,
      data: {
        status: DisputableStatusType[vote.status],
        context: vote.context,
        // description: JSON.stringify(decodeTransactionPath(vote.script)),
        executed: vote.status === 'Executed',
        executionDate: vote.executedAt && new Date(vote.executedAt),
        creator: vote.creator,
        script: vote.script,
        yea: new BN(vote.yeas),
        nay: new BN(vote.nays),
        votingPower: new BN(vote.totalPower),
        minAcceptQuorum: new BN(vote.minimumAcceptanceQuorumPct),
        supportRequired: new BN(vote.supportRequiredPct),
        snapshotBlock: parseInt(vote.snapshotBlock),
        startDate: new Date(parseInt(vote.startDate) * 1000),
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
}

function VotingProvider({ children }) {
  const [votes, setVotes] = useState([])
  const mounted = useMounted()
  const { connectedDisputableApp } = useOrganizationState()

  const [connectVotes, voteStatus] = useConnect(() => {
    return connectedDisputableApp?.onVotes()
  }, [connectedDisputableApp])

  console.log('connectedDisputableApp ', connectedDisputableApp?.address)
  useEffect(() => {
    const reducedVotes = reduceVotes(connectVotes)
    if (mounted()) {
      setVotes(reducedVotes)
    }
  }, [connectVotes, mounted])

  return (
    <VotingContext.Provider
      value={{
        isSyncing: false,
        ready: true,
        tokenAddress: '0xcbaef99fbd8b360258e20db4c5ff175cd9dcc218', // ?
        tokenDecimals: new BN(18),
        tokenSymbol: 'wANT', // ?
        pctBase: pctBase,
        voteTime: 432000 * 1000,
        connectedAccountVotes: [],
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

function useAppState() {
  return useContext(VotingContext)
}

export { VotingProvider, useAppState }
