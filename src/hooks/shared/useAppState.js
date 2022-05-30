import React, { createContext, useContext, useEffect, useState } from 'react'
import BN from 'bn.js'
import { HashRouter } from 'react-router-dom'
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
} from '@apollo/client'
import appStateReducer from '../../app-state-reducer'

const GET_VOTES = gql`
  query GetDogs {
    votes(
      first: 1000
      where: { appAddress: "0xf20e3d05813ce460d42994d26eb4b7d85381d117" }
      orderBy: voteNum
      orderDirection: desc
    ) {
      voteNum
      originalCreator
      metadata
      executed
      executedAt
      startDate
      snapshotBlock
      supportRequiredPct
      minAcceptQuorum
      yea
      nay
      votingPower
      script
      castVotes {
        supports
        stake
        voter {
          address
        }
      }
    }
  }
`

const AragonContext = createContext()

export const AragonProvider = ({ children }) => {
  const [appState, setAppState] = useState({})
  const APIURL =
    'https://api.thegraph.com/subgraphs/name/1hive/aragon-voting-mainnet'

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: APIURL,
  })

  useEffect(() => {
    client
      .query({ query: GET_VOTES })
      .then(({ data }) => {
        console.log('Subgraph data: ', data)
        const newAppState = {
          isSyncing: false,
          ready: true,
          tokenAddress: '0x87d73E916D7057945c9BcD8cdd94e42A6F47f776', // ?
          tokenDecimals: 18, // ?
          tokenSymbol: 'NFTX', // ?
          pctBase: new BN('1000000000000000000'),
          voteTime: 1 * 24 * 60 * 60 * 1000, // ?
          votes: data.votes.map(vote => ({
            voteId: vote.voteNum,
            data: {
              executed: vote.executed,
              executionDate: parseInt(vote.executedAt) * 1000,
              description: vote.metadata || 'No description',
              creator: vote.originalCreator,
              script: vote.script,
              yea: vote.yea,
              nay: vote.nay,
              votingPower: vote.votingPower,
              minAcceptQuorum: vote.minAcceptQuorum,
              supportRequired: vote.supportRequiredPct,
              snapshotBlock: parseInt(vote.snapshotBlock),
              startDate: parseInt(vote.startDate) * 1000,
              executionTargets: [''],
            },
          })),
          connectedAccountVotes: [],
        }
        console.log(newAppState)
        setAppState(
          appState.votes?.length !== newAppState.votes.length
            ? appStateReducer(newAppState)
            : appState
        )
      })
      .catch(err => {
        console.log('Error fetching data: ', err)
      })
  }, [client])

  return (
    <AragonContext.Provider value={appState}>
      <ApolloProvider client={client}>
        <HashRouter>{children}</HashRouter>
      </ApolloProvider>
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
