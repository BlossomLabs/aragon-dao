import React, { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  CardLayout,
  DropDown,
  GU,
  useTheme,
  Tag,
  textStyle,
  useViewport,
} from '@aragon/ui'

import STATUS from '../delay-status-types'
import DelayCard from '../components/DelayCard'
import EmptyFilteredDelays from '../components/EmptyFilteredDelays'
import { useDelayedScripts } from '../hooks/useDelayedScripts'
import useFilterDelays from '../hooks/useFilterDelays'
import NoDelays from './NoDelays'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import DelayHeader from '../components/DelayHeader'

const classifyDelays = delays => {
  const ongoingDelays = delays.filter(delay => delay.status === STATUS.ONGOING)
  const pausedDelays = delays.filter(delay => delay.status === STATUS.PAUSED)
  const pendingDelays = delays.filter(
    delay => delay.status === STATUS.PENDING_EXECUTION
  )

  return { ongoingDelays, pausedDelays, pendingDelays }
}

const DelaysWrapper = () => {
  const [isWaiting, setIsWaiting] = useState(false)
  const { apps = [] } = useOrganizationState()
  // TODO: handle error case
  const [delays, { loading: delaysLoading }] = useDelayedScripts()
  const executionTargetApps = useMemo(
    () =>
      apps
        .filter(app =>
          (delays || []).some(delay =>
            delay.executionTargets.includes(app.address.toLowerCase())
          )
        )
        .map(({ address, name }) => ({
          appAddress: address,
          name,
          // TODO: find proper identifier
          // identifier:
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [apps, delays]
  )

  useEffect(() => {
    /**
     * Get a smoother transition from the empty state card
     * to a fast-loaded delays list by setting a minimum wait
     * time
     */
    const timer = setTimeout(() => setIsWaiting(true), 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div>
      {!isWaiting || delaysLoading || !delays.length ? (
        <div
          css={`
            height: calc(100vh - ${8 * GU}px);
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <NoDelays isSyncing={delaysLoading || !isWaiting} />
        </div>
      ) : (
        <Delays delays={delays} executionTargetApps={executionTargetApps} />
      )}
    </div>
  )
}

const Delays = React.memo(({ delays, executionTargetApps }) => {
  const {
    filteredDelays,
    delayStatusFilter,
    handleDelayStatusFilterChange,
    delayAppFilter,
    handleDelayAppFilterChange,
    handleClearFilters,
  } = useFilterDelays(delays, executionTargetApps)

  const theme = useTheme()

  const { ongoingDelays, pausedDelays, pendingDelays } = classifyDelays(
    filteredDelays
  )

  const multipleOfTarget = executionTargetApps.reduce((map, { name }) => {
    map.set(name, map.has(name))
    return map
  }, new Map())

  return (
    <React.Fragment>
      <DelayHeader />
      <Bar>
        <div
          css={`
            height: ${8 * GU}px;
            display: grid;
            grid-template-columns: auto auto auto 1fr;
            grid-gap: ${1 * GU}px;
            align-items: center;
            padding-left: ${3 * GU}px;
          `}
        >
          <DropDown
            header="Status"
            placeholder="Status"
            selected={delayStatusFilter}
            onChange={handleDelayStatusFilterChange}
            items={[
              <div>
                All
                <span
                  css={`
                    margin-left: ${1.5 * GU}px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: ${theme.info};
                    ${textStyle('label3')};
                  `}
                >
                  <Tag limitDigits={4} label={delays.length} size="small" />
                </span>
              </div>,
              'Ongoing',
              'Paused',
              'Pending',
            ]}
            width="128px"
          />

          <DropDown
            header="App"
            placeholder="App"
            selected={delayAppFilter}
            onChange={handleDelayAppFilterChange}
            items={[
              'All',
              <ThisApp showTag={multipleOfTarget.get('Delay')} />,
              ...executionTargetApps.map(
                ({ name, identifier }) =>
                  `${name}${
                    multipleOfTarget.get(name) && identifier
                      ? ` (${identifier})`
                      : ''
                  }`
              ),
              'External',
            ]}
            width="128px"
          />
        </div>
      </Bar>

      <React.Fragment>
        {!filteredDelays.length ? (
          <EmptyFilteredDelays onClear={handleClearFilters} />
        ) : (
          <DelayGroups
            ongoingDelays={ongoingDelays}
            pausedDelays={pausedDelays}
            pendingDelays={pendingDelays}
          />
        )}
      </React.Fragment>
    </React.Fragment>
  )
})

const ThisApp = ({ showTag }) => (
  <div
    css={`
      display: flex;
      align-items: center;
    `}
  >
    Delay
    {showTag && (
      <Tag
        size="small"
        css={`
          margin-left: ${1 * GU}px;
        `}
      >
        this app
      </Tag>
    )}
  </div>
)

const DelayGroups = ({ ongoingDelays, pausedDelays, pendingDelays }) => {
  const { below } = useViewport()
  const compactMode = below('medium')
  const rowHeight = compactMode ? null : 240

  const groups = [
    ['Pending', pendingDelays],
    ['Ongoing', ongoingDelays],
    ['Paused', pausedDelays],
  ]

  return (
    <React.Fragment>
      {groups.map(([groupName, delays]) =>
        delays.length ? (
          <section key={groupName}>
            <GroupName
              title={groupName}
              count={delays.length}
              compactMode={compactMode}
            />
            <CardLayout columnWidthMin={30 * GU} rowHeight={rowHeight}>
              {delays.map(delay => {
                return <DelayCard key={delay.id} delay={delay} />
              })}
            </CardLayout>
          </section>
        ) : null
      )}
    </React.Fragment>
  )
}

const GroupName = ({ title, count, compactMode }) => {
  const theme = useTheme()

  return (
    <h2
      css={`
        display: flex;
        align-items: center;
        margin-bottom: ${3 * GU}px;
        ${compactMode ? `padding: 0 ${2 * GU}px;` : ''}
      `}
    >
      <div
        css={`
          ${textStyle('body2')};
          color: ${theme.content};
        `}
      >
        {title}
      </div>
      <span
        css={`
          margin-left: ${1 * GU}px;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <Tag limitDigits={4} label={count} size="small" />
      </span>
    </h2>
  )
}

export default DelaysWrapper
