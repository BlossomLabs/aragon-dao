import React from 'react'
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
import DelayHeader from '../components/DelayHeader'
import LoadingAppScreen from '@/components/Loading/LoadingAppScreen'
import { useWait } from '@/hooks/shared/useWait'
import AppBadgeWithSkeleton from '@/components/AppBadgeWithSkeleton'

const classifyDelays = delays => {
  const ongoingDelays = delays.filter(delay => delay.status === STATUS.ONGOING)
  const pausedDelays = delays.filter(delay => delay.status === STATUS.PAUSED)
  const pendingDelays = delays.filter(
    delay => delay.status === STATUS.PENDING_EXECUTION
  )

  return { ongoingDelays, pausedDelays, pendingDelays }
}

const DelaysWrapper = () => {
  const [
    delays,
    executionTargetApps,
    { loading: delaysLoading },
  ] = useDelayedScripts()

  const isWaiting = useWait()
  const isLoading = delaysLoading || isWaiting

  return (
    <div>
      {!delays?.length || isLoading ? (
        <LoadingAppScreen
          emptyStateLabel="No delayed scripts yet"
          isLoading={isLoading}
        />
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
              ...executionTargetApps.map(
                ({ appAddress, humanName, iconSrc }) => {
                  return (
                    <AppBadgeWithSkeleton
                      targetApp={{
                        address: appAddress,
                        name: humanName,
                        icon: iconSrc,
                      }}
                    />
                  )
                }
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
