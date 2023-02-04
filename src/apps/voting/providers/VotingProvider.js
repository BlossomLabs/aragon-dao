import BN from 'bn.js'
import React, { useContext, useEffect, useState } from 'react'
import { useConnect } from '@1hive/connect-react'

import { useMounted } from '@/hooks/shared/useMounted'
import { DisputableStatusType } from '../types/disputable-statuses'
import minimeTokenAbi from '@/abi/minimeToken.json'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useContractReadOnly } from '@/hooks/shared/useContract'
import { useWallet } from '@/providers/Wallet'

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
  const { chainId } = useWallet()
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
  const [token, tokenStatus] = useConnect(async () => {
    if (!connectedApp) {
      return
    }
    const rawToken = await connectedApp.token()

    return {
      address: rawToken.id,
      decimals: parseInt(rawToken.decimals),
      symbol: rawToken.symbol,
    }
  }, [connectedApp])
  const tokenContract = useContractReadOnly(
    token?.address,
    minimeTokenAbi,
    chainId
  )
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
        token,
        tokenContract,
        pctBase: pctBase,
        currentSettings,
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
