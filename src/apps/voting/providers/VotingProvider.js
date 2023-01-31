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

const formatSettings = (settings = {}) => {
  return {
    createdAt: new Date(parseInt(settings.createdAt, 10) * 1000),
    voteTime: parseInt(settings.voteTime, 10),
    executionDelay: parseInt(settings.executionDelay, 10),
    quietEndingPeriod: parseInt(settings.quietEndingPeriod, 10),
    quietEndingExtension: parseInt(settings.quietEndingExtension, 10),
    delegatedVotingPeriod: parseInt(settings.delegatedVotingPeriod, 10),
    minimumAcceptanceQuorumPct: new BN(settings.minimumAcceptanceQuorumPct),
    supportRequiredPct: new BN(settings.supportRequiredPct),
  }
}

function VotingProvider({ children }) {
  const { connectedApp } = useConnectedApp()
  const [votes, setVotes] = useState([])
  const [currentSettings, setCurrentSettings] = useState({})
  const [representativeManager, status] = useConnect(
    () => connectedApp?._app.ethersContract().representativeManager(),
    [connectedApp]
  )
  const [rawSettings, rawSettingsStatus] = useConnect(() => {
    return connectedApp?.currentSetting()
  }, [connectedApp])
  const [token, tokenStatus] = useConnect(() => {
    return connectedApp?.token()
  }, [connectedApp])
  const [connectVotes] = useConnect(() => {
    return connectedApp?.onVotes()
  }, [connectedApp])
  const mounted = useMounted()
  const loading =
    status.loading || tokenStatus.loading || rawSettingsStatus.loading

  useEffect(() => {
    const reducedVotes = reduceVotes(connectVotes)
    if (mounted()) {
      setVotes(reducedVotes)
    }
  }, [connectVotes, mounted])

  useEffect(() => {
    const formattedSettings = formatSettings(rawSettings)

    if (mounted()) {
      setCurrentSettings(formattedSettings)
    }
  }, [rawSettings, mounted])

  return (
    <VotingContext.Provider
      value={{
        isSyncing: loading,
        tokenAddress: token?.id,
        tokenDecimals: new BN(token?.decimals),
        tokenSymbol: token?.symbol,
        pctBase: pctBase,
        currentSettings: currentSettings,
        connectedAccountVotes: [],
        numData: {
          pctBase: pctBaseNum,
          tokenDecimals: tokenDecimalsNum,
        },
        votes,
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
