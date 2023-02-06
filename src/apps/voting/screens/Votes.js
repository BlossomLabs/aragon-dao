import React, { useCallback, useMemo } from 'react'
import {
  Box,
  DropDown as AragonDropdown,
  Tag,
  GU,
  textStyle,
  useTheme,
  DateRangePicker,
  useViewport,
} from '@aragon/ui'
import EmptyFilteredVotes from '../components/EmptyFilteredVotes'
import VoteCard from '../components/VoteCard/VoteCard'
import VoteCardGroup from '../components/VoteCard/VoteCardGroup'
import { usePath } from '@/hooks/shared'
import styled from 'styled-components'
import AppBadgeWithSkeleton from '@/components/AppBadgeWithSkeleton'

const sortVotes = (a, b) => {
  const dateDiff = b.data.endDate - a.data.endDate
  // Order by descending voteId if there's no end date difference
  return dateDiff !== 0 ? dateDiff : b.voteId - a.voteId
}

const useVotes = votes => {
  const sortedVotes = votes.sort(sortVotes)
  const openVotes = sortedVotes.filter(vote => !vote.data.hasEnded)
  const closedVotes = sortedVotes.filter(vote => !openVotes.includes(vote))
  return { openVotes, closedVotes }
}

const Votes = React.memo(function Votes({
  votes,
  selectVote,
  executionTargets,
  filteredVotes,
  voteStatusFilter,
  handleVoteStatusFilterChange,
  voteOutcomeFilter,
  handleVoteOutcomeFilterChange,
  voteTrendFilter,
  handleVoteTrendFilterChange,
  voteAppFilter,
  handleVoteAppFilterChange,
  voteDateRangeFilter,
  handleVoteDateRangeFilterChange,
  handleClearFilters,
}) {
  const { below } = useViewport()
  const theme = useTheme()
  const { openVotes, closedVotes } = useVotes(filteredVotes)
  const compactMode = below('large')

  return (
    <React.Fragment>
      <Box
        css={`
          margin-bottom: ${3 * GU}px;
        `}
        padding={1.5 * GU}
      >
        <div
          css={`
            display: flex;
            gap: ${1 * GU}px;
            align-items: center;
            width: 100%;
            flex-wrap: wrap;

            ${Dropdown} {
              ${compactMode ? 'flex-grow: 1' : 'width: 136px'};
            }
          `}
        >
          <Dropdown
            header="Status"
            placeholder="Status"
            selected={voteStatusFilter}
            onChange={handleVoteStatusFilterChange}
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
                  <Tag limitDigits={4} label={votes.length} size="small" />
                </span>
              </div>,
              'Open',
              'Closed',
            ]}
          />
          {voteStatusFilter === 1 && (
            <Dropdown
              header="Trend"
              placeholder="Trend"
              selected={voteTrendFilter}
              onChange={handleVoteTrendFilterChange}
              items={['All', 'Will pass', 'Won’t pass']}
            />
          )}
          {voteStatusFilter !== 1 && (
            <Dropdown
              header="Outcome"
              placeholder="Outcome"
              selected={voteOutcomeFilter}
              onChange={handleVoteOutcomeFilterChange}
              items={['All', 'Passed', 'Rejected', 'Enacted', 'Pending']}
            />
          )}
          <Dropdown
            header="App"
            placeholder="App"
            selected={voteAppFilter}
            onChange={handleVoteAppFilterChange}
            items={[
              'All',
              ...executionTargets.map(({ appAddress, humanName, iconSrc }) => {
                return (
                  <AppBadgeWithSkeleton
                    targetApp={{
                      address: appAddress,
                      name: humanName,
                      icon: iconSrc,
                    }}
                  />
                )
              }),
              'External',
            ]}
          />
          <DateRangePicker
            startDate={voteDateRangeFilter.start}
            endDate={voteDateRangeFilter.end}
            onChange={handleVoteDateRangeFilterChange}
            format={'YYYY/MM/DD'}
          />
        </div>
      </Box>

      {!filteredVotes.length ? (
        <EmptyFilteredVotes onClear={handleClearFilters} />
      ) : (
        <VoteGroups
          openVotes={openVotes}
          closedVotes={closedVotes}
          onSelectVote={selectVote}
        />
      )}
    </React.Fragment>
  )
})

const VoteGroups = React.memo(({ openVotes, closedVotes }) => {
  const [, navigate] = usePath()
  const voteGroups = [
    ['Open votes', openVotes, openVotes.length],
    ['Closed votes', closedVotes, closedVotes.length],
  ]
  const handleVoteClick = useCallback(
    voteId => {
      navigate(`votes/${voteId}`)
    },
    [navigate]
  )

  return (
    <React.Fragment>
      {voteGroups.map(([groupName, votes, length]) =>
        votes.length ? (
          <VoteCardGroup title={groupName} count={length} key={groupName}>
            {votes.map(vote => (
              <VoteCard
                key={vote.voteId}
                vote={vote}
                onVoteClick={handleVoteClick}
              />
            ))}
          </VoteCardGroup>
        ) : null
      )}
    </React.Fragment>
  )
})

/**
 * Wrap the dropdown in a styled component to be able to reference it
 * with the styled component selector (https://styled-components.com/docs/advanced#referring-to-other-components)
 */
const Dropdown = styled(AragonDropdown)``

export default Votes
