import React, { useContext, useEffect, useState } from 'react'
import { useConnect } from '@1hive/connect-react'
import { useMounted } from '@/hooks/shared/useMounted'
import { DisputableStatusType } from '../types/disputable-statuses'
import BN from 'bn.js'
import { useConnectedApp } from '@/providers/ConnectedApp'

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
        hasEnded: vote.hasEnded,
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
  const { connectedApp } = useConnectedApp()
  const [votes, setVotes] = useState([])
  const [representativeManager, status] = useConnect(
    () => connectedApp?._app.ethersContract().representativeManager(),
    [connectedApp]
  )
  const mounted = useMounted()
  const [connectVotes] = useConnect(() => {
    return connectedApp?.onVotes()
  }, [connectedApp])

  const [token, tokenStatus] = useConnect(() => {
    return connectedApp?.token()
  }, [connectedApp])

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
        loading: status.loading || tokenStatus.loading,
        ready: true,
        tokenAddress: token?.id,
        tokenDecimals: new BN(token?.decimals),
        tokenSymbol: token?.symbol,
        pctBase: pctBase,
        voteTime: 432000 * 1000,
        connectedAccountVotes: [],
        numData: {
          pctBase: pctBaseNum,
          tokenDecimals: tokenDecimalsNum,
        },
        votes: votes,
        representativeManager,
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
