import React, { useCallback, useState } from 'react'
import {
  Button,
  Header,
  GU,
  IconPlus,
  IconToken,
  Main,
  SyncIndicator,
  useLayout,
} from '@aragon/ui'
import MultiModal from '../components/MultiModal/MultiModal'
import DelegateVotingScreens from './components/ModalFlows/DelegateVotingScreens/DelegateVotingScreens'
import { useGuiStyle } from './hooks/shared'
import NewVotePanel from './components/NewVotePanel'
import useFilterVotes from './hooks/useFilterVotes'
import useScrollTop from './hooks/useScrollTop'
import NoVotes from './screens/NoVotes'
import Votes from './screens/Votes'
import { useAppLogic } from './app-logic'
import { IdentityProvider } from './identity-manager'
import { SettingsProvider } from './vote-settings-manager'
import { VotingProvider } from './providers/VotingProvider'

const App = React.memo(function App() {
  const [voteDelegationModalVisible, setVoteDelegationModalVisible] = useState(
    false
  )
  const {
    actions,
    executionTargets,
    isSyncing,
    newVotePanel,
    selectVote,
    selectedVote,
    votes,
  } = useAppLogic()

  const { appearance } = useGuiStyle()

  const { layoutName } = useLayout()
  const compactMode = layoutName === 'small'

  const {
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
  } = useFilterVotes(votes, executionTargets)

  useScrollTop(selectedVote)

  return (
    <Main theme={appearance} assetsUrl="./aragon-ui">
      <React.Fragment>
        {votes.length === 0 && (
          <div
            css={`
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <NoVotes
              onNewVote={newVotePanel.requestOpen}
              isSyncing={isSyncing}
            />
          </div>
        )}
        {votes.length > 0 && (
          <React.Fragment>
            <SyncIndicator visible={isSyncing} shift={50} />
            <Header
              primary="Voting"
              secondary={
                !selectedVote && (
                  <>
                    <Button
                      mode="normal"
                      onClick={() => setVoteDelegationModalVisible(true)}
                      label="Vote Delegation"
                      icon={<IconToken />}
                      display={compactMode ? 'icon' : 'label'}
                      css={`
                        margin-right: ${1 * GU}px;
                      `}
                    />
                    <Button
                      mode="strong"
                      onClick={newVotePanel.requestOpen}
                      label="New vote"
                      icon={<IconPlus />}
                      display={compactMode ? 'icon' : 'label'}
                    />
                  </>
                )
              }
            />
            <Votes
              votes={votes}
              selectVote={selectVote}
              executionTargets={executionTargets}
              filteredVotes={filteredVotes}
              voteStatusFilter={voteStatusFilter}
              handleVoteStatusFilterChange={handleVoteStatusFilterChange}
              voteOutcomeFilter={voteOutcomeFilter}
              handleVoteOutcomeFilterChange={handleVoteOutcomeFilterChange}
              voteTrendFilter={voteTrendFilter}
              handleVoteTrendFilterChange={handleVoteTrendFilterChange}
              voteAppFilter={voteAppFilter}
              handleVoteAppFilterChange={handleVoteAppFilterChange}
              voteDateRangeFilter={voteDateRangeFilter}
              handleVoteDateRangeFilterChange={handleVoteDateRangeFilterChange}
              handleClearFilters={handleClearFilters}
            />
          </React.Fragment>
        )}
        <NewVotePanel
          onCreateVote={actions.createVote}
          panelState={newVotePanel}
        />
      </React.Fragment>
      <MultiModal
        visible={voteDelegationModalVisible}
        onClose={() => setVoteDelegationModalVisible(false)}
      >
        <DelegateVotingScreens />
      </MultiModal>
    </Main>
  )
})

export default () => (
  <IdentityProvider>
    <VotingProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </VotingProvider>
  </IdentityProvider>
)
