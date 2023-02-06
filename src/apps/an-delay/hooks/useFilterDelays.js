import { useState, useEffect, useCallback } from 'react'

import { useOrganizationState } from '@/providers/OrganizationProvider'
import STATUS from '../delay-status-types'

const NULL_FILTER_STATE = -1
const STATUS_FILTER_ONGOING = 1
const STATUS_FILTER_PAUSED = 2
const STATUS_FILTER_PENDING = 3

function checkStatusFilter(filter, scriptStatus) {
  return (
    filter === NULL_FILTER_STATE ||
    (filter === STATUS_FILTER_ONGOING && scriptStatus === STATUS.ONGOING) ||
    (filter === STATUS_FILTER_PAUSED && scriptStatus === STATUS.PAUSED) ||
    (filter === STATUS_FILTER_PENDING &&
      scriptStatus === STATUS.PENDING_EXECUTION)
  )
}

function checkAppFilter(filter, script, { apps }) {
  const { executionTargets } = script

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

const useFilterDelays = (delayedScripts, executionTargets) => {
  const { loading } = useOrganizationState()

  const [filteredDelays, setFilteredScripts] = useState(delayedScripts)
  const [statusFilter, setStatusFilter] = useState(NULL_FILTER_STATE)
  // 0: All, 2+: Execution targets, last: External
  const [appFilter, setAppFilter] = useState(NULL_FILTER_STATE)

  const handleClearFilters = useCallback(() => {
    setStatusFilter(NULL_FILTER_STATE)
    setAppFilter(NULL_FILTER_STATE)
  }, [setStatusFilter, setAppFilter])

  useEffect(() => {
    if (loading) {
      setFilteredScripts([])
      return
    }
    const filtered = delayedScripts.filter(script => {
      return (
        checkStatusFilter(statusFilter, script.status) &&
        checkAppFilter(appFilter, script, {
          apps: executionTargets,
        })
      )
    })
    setFilteredScripts(filtered)
  }, [
    statusFilter,
    appFilter,
    loading,
    setFilteredScripts,
    delayedScripts,
    executionTargets,
  ])

  return {
    filteredDelays,
    delayStatusFilter: statusFilter,
    handleDelayStatusFilterChange: useCallback(
      index => {
        setStatusFilter(index || NULL_FILTER_STATE)
      },
      [setStatusFilter]
    ),
    delayAppFilter: appFilter,
    handleDelayAppFilterChange: useCallback(
      index => setAppFilter(index || NULL_FILTER_STATE),
      [setAppFilter]
    ),
    handleClearFilters,
  }
}

export default useFilterDelays
