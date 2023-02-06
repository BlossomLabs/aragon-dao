import { useState, useEffect, useCallback } from 'react'
import { startOfDay, endOfDay, isAfter, isBefore } from 'date-fns'
import {
  VOTE_STATUS_ONGOING,
  VOTE_STATUS_REJECTED,
  VOTE_STATUS_ACCEPTED,
  VOTE_STATUS_PENDING_ENACTMENT,
  VOTE_STATUS_ENACTED,
} from '../vote-types'
import { getVoteStatus } from '../vote-utils'
import { useAppState } from '../providers/VotingProvider'
import { useOrganizationState } from '@/providers/OrganizationProvider'

const NULL_FILTER_STATE = -1
const STATUS_FILTER_OPEN = 1
const STATUS_FILTER_CLOSED = 2
const TREND_FILTER_WILL_PASS = 1
const TREND_FILTER_WILL_NOT_PASS = 2
const OUTCOME_FILTER_PASSED = 1
const OUTCOME_FILTER_REJECTED = 2
const OUTCOME_FILTER_ENACTED = 3
const OUTCOME_FILTER_PENDING = 4

function testStatusFilter(filter, voteStatus) {
  return (
    filter === NULL_FILTER_STATE ||
    (filter === STATUS_FILTER_OPEN && voteStatus === VOTE_STATUS_ONGOING) ||
    (filter === STATUS_FILTER_CLOSED && voteStatus !== VOTE_STATUS_ONGOING)
  )
}

function testTrendFilter(filter, vote) {
  const { open, yea, nay } = vote.data
  return (
    filter === NULL_FILTER_STATE ||
    (open &&
      ((filter === TREND_FILTER_WILL_PASS && yea.gt(nay)) ||
        (filter === TREND_FILTER_WILL_NOT_PASS && yea.lte(nay))))
  )
}

function testOutcomeFilter(filter, voteStatus) {
  return (
    filter === NULL_FILTER_STATE ||
    (filter === OUTCOME_FILTER_PASSED &&
      (voteStatus === VOTE_STATUS_ACCEPTED ||
        voteStatus === VOTE_STATUS_PENDING_ENACTMENT ||
        voteStatus === VOTE_STATUS_ENACTED)) ||
    (filter === OUTCOME_FILTER_REJECTED &&
      voteStatus === VOTE_STATUS_REJECTED) ||
    (filter === OUTCOME_FILTER_ENACTED && voteStatus === VOTE_STATUS_ENACTED) ||
    (filter === OUTCOME_FILTER_PENDING &&
      voteStatus === VOTE_STATUS_PENDING_ENACTMENT)
  )
}

function testAppFilter(filter, vote, { apps }) {
  const { executionTargets } = vote

  if (filter === NULL_FILTER_STATE) {
    return true
  }

  // Filter order is all, ...apps, external so we sub 1 to adjust the index to the apps
  filter -= 1
  if (filter === apps.length) {
    // Only return true if there's a difference between the set of execution targets and apps
    const appsSet = new Set(apps.map(({ appAddress }) => appAddress))
    return executionTargets.filter(target => !appsSet.has(target)).length
  }

  return executionTargets.includes(apps[filter].appAddress)
}

function testDateRangeFilter(filter, vote) {
  const { start, end } = filter
  const { endDate, startDate } = vote.data
  return (
    !start ||
    !end ||
    (isAfter(startDate, startOfDay(start)) && isBefore(endDate, endOfDay(end)))
  )
}

const useFilterVotes = (votes, executionTargets) => {
  const { loading } = useOrganizationState()
  const state = useAppState()
  const { pctBase } = state

  const [filteredVotes, setFilteredVotes] = useState(votes)
  const [statusFilter, setStatusFilter] = useState(NULL_FILTER_STATE)
  const [trendFilter, setTrendFilter] = useState(NULL_FILTER_STATE)
  const [outcomeFilter, setOutcomeFilter] = useState(NULL_FILTER_STATE)
  // 0: All, 1: Voting (this), 2+: Execution targets, last: External
  const [appFilter, setAppFilter] = useState(NULL_FILTER_STATE)
  // Date range
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: null,
    end: null,
  })

  const handleClearFilters = useCallback(() => {
    setStatusFilter(NULL_FILTER_STATE)
    setTrendFilter(NULL_FILTER_STATE)
    setOutcomeFilter(NULL_FILTER_STATE)
    setAppFilter(NULL_FILTER_STATE)
    setDateRangeFilter({ start: null, end: null })
  }, [
    setStatusFilter,
    setTrendFilter,
    setOutcomeFilter,
    setAppFilter,
    setDateRangeFilter,
  ])

  useEffect(() => {
    if (loading) {
      setFilteredScripts([])
      return
    }

    const filtered = votes.filter(vote => {
      const voteStatus = getVoteStatus(vote, pctBase)
      return (
        testStatusFilter(statusFilter, voteStatus) &&
        testTrendFilter(trendFilter, vote) &&
        testOutcomeFilter(outcomeFilter, voteStatus) &&
        testAppFilter(appFilter, vote, {
          apps: executionTargets,
        }) &&
        testDateRangeFilter(dateRangeFilter, vote)
      )
    })
    setFilteredVotes(filtered)
  }, [
    statusFilter,
    outcomeFilter,
    trendFilter,
    appFilter,
    dateRangeFilter,
    pctBase,
    setFilteredVotes,
    votes,
    executionTargets,
  ])

  return {
    filteredVotes,
    voteStatusFilter: statusFilter,
    handleVoteStatusFilterChange: useCallback(
      index => {
        setStatusFilter(index || NULL_FILTER_STATE)
        setTrendFilter(NULL_FILTER_STATE)
      },
      [setStatusFilter, setTrendFilter]
    ),
    voteOutcomeFilter: outcomeFilter,
    handleVoteOutcomeFilterChange: useCallback(
      index => setOutcomeFilter(index || NULL_FILTER_STATE),
      [setOutcomeFilter]
    ),
    voteTrendFilter: trendFilter,
    handleVoteTrendFilterChange: useCallback(
      index => setTrendFilter(index || NULL_FILTER_STATE),
      [setTrendFilter]
    ),
    voteAppFilter: appFilter,
    handleVoteAppFilterChange: useCallback(
      index => setAppFilter(index || NULL_FILTER_STATE),
      [setAppFilter]
    ),
    voteDateRangeFilter: dateRangeFilter,
    handleVoteDateRangeFilterChange: setDateRangeFilter,
    handleClearFilters,
  }
}

export default useFilterVotes
