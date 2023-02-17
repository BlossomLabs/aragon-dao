import BN from 'bn.js'
import React, { useContext, useEffect, useState } from 'react'
import { useConnect } from '@1hive/connect-react'

import { useMounted } from '@/hooks/shared/useMounted'
import { DisputableStatusType } from '../types/disputable-statuses'
import minimeTokenAbi from '@/abi/minimeToken.json'
import { useConnectedApp } from '@/providers/ConnectedApp'
import { useContractReadOnly } from '@/hooks/shared/useContract'
import { constants } from 'ethers'
import { useNetwork } from '@/hooks/shared'
import { getAppType } from '@/utils/app-utils'

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
        minAcceptQuorum: new BN(vote.setting.minimumAcceptanceQuorumPct),
        supportRequired: new BN(vote.setting.supportRequiredPct),
        snapshotBlock: parseInt(vote.snapshotBlock),
        startDate: new Date(parseInt(vote.startDate) * 1000),
        executionTargets: [''],
        hasEnded: vote.hasEnded,
      },
      numData: {
        minAcceptQuorum:
          parseInt(vote.setting.minimumAcceptanceQuorumPct, 10) / pctBaseNum,
        nay: parseInt(vote.nays, 10) / tokenDecimalsBaseNum,
        supportRequired:
          parseInt(vote.setting.supportRequiredPct, 10) / pctBaseNum,
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

const formatAppData = rawAppData => {
  const { token, setting, representativeManager } = rawAppData
  return {
    ...rawAppData,
    representativeManager:
      representativeManager.address ?? constants.AddressZero,
    currentSettings: formatSettings(setting),
    token: {
      address: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
    },
  }
}

function VotingProvider({ children }) {
  const { chainId } = useNetwork()
  const { connectedApp } = useConnectedApp()
  const [votes, setVotes] = useState([])
  const [appData, appDataStatus] = useConnect(async () => {
    if (!connectedApp) {
      return
    }
    const rawAppData = await connectedApp.taoVoting()
    return formatAppData(rawAppData)
  }, [connectedApp])
  const tokenContract = useContractReadOnly(
    appData?.token.address,
    minimeTokenAbi,
    chainId
  )
  const [rawVotes, rawVotesStatus] = useConnect(() => connectedApp?.onVotes(), [
    connectedApp,
  ])
  const mounted = useMounted()
  const loading = appDataStatus.loading || rawVotesStatus.loading

  useEffect(() => {
    const reducedVotes = reduceVotes(rawVotes)
    if (mounted()) {
      setVotes(reducedVotes)
    }
  }, [rawVotes, mounted])

  return (
    <VotingContext.Provider
      value={{
        ...appData,
        isSyncing: loading,
        tokenContract,
        votes,
        pctBase,
        type: getAppType(connectedApp?.address) ?? '',
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
