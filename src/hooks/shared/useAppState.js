import React, { createContext, useContext } from 'react'
import BN from 'bn.js'
import { HashRouter } from 'react-router-dom'
import appStateReducer from '../../app-state-reducer'

const AragonContext = createContext()

const appState = appStateReducer({
  isSyncing: false,
  ready: true,
  tokenAddress: '0x',
  tokenDecimals: 18,
  tokenSymbol: 'HNY',
  pctBase: new BN('1000000000000000000'),
  voteTime: 1,
  votes: [
    {
      voteId: '0',
      data: {
        executed: false,
        description: 'bla',
        creator: '0x946fF42F745b2573c540fDAaE584e3DE48bE77C0',
        script: '0x00',
        yea: '2',
        minAcceptQuorum: '100000000000000000',
        nay: '8',
        supportRequired: '500000000000000000',
        votingPower: '10',
        executionTargets: [''],
        snapshotBlock: 0,
        startDate: new Date().getTime(),
      },
    },
  ],
  connectedAccountVotes: [],
})

export const AragonProvider = ({ children }) => {
  return (
    <AragonContext.Provider value={appState}>
      <HashRouter>{children}</HashRouter>
    </AragonContext.Provider>
  )
}

export default function useAppState() {
  const context = useContext(AragonContext)
  if (!context) {
    throw new Error('useAppState hook must be used inside an AragonProvider')
  }
  return context
}
