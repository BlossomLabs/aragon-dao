import React, { useCallback, useState } from 'react'
import {
  Button,
  Header,
  GU,
  IconPlus,
  IconToken,
  Main,
  SyncIndicator,
  Tabs,
  useLayout,
} from '@aragon/ui'
import { useVoterState } from './providers/VoterProvider'
import MultiModal from '../../components/MultiModal/MultiModal'
import DelegateVotingScreens from './components/ModalFlows/DelegateVotingScreens/DelegateVotingScreens'
import { useGuiStyle } from '@/hooks/shared'
import useFilterVotes from './hooks/useFilterVotes'
import useScrollTop from './hooks/useScrollTop'
import NoVotes from './screens/NoVotes'
import Votes from './screens/Votes'
import DelegatedBy from './components/DelegatedBy'
import { useAppLogic } from './app-logic'
import { SettingsProvider } from './vote-settings-manager'
import { useWallet } from '../../providers/Wallet'
import RevokeDelegationScreens from './components/ModalFlows/RevokeDelegation/RevokeDelegationScreens'
import CreateVoteScreens from './components/ModalFlows/NewVote/CreateVoteScreens'

const TAB_ITEMS = account => (account ? ['Votes', 'Delegated'] : ['Votes'])

// const VALUES = Array.from(SECTIONS.values())

const App = React.memo(function App() {
  const [selectedTab, setSelectedTab] = useState(0)
  const { account } = useWallet()

  const [modalMode, setModalMode] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const {
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

  const { voter, voterStatus } = useVoterState()

  const handleShowModal = useCallback(mode => {
    setModalVisible(true)
    setModalMode(mode)
  }, [])

  const handleRevokeDelegation = useCallback(() => {
    handleShowModal('revoke')
  }, [handleShowModal])

  const handleDelegate = useCallback(() => {
    handleShowModal('delegate')
  }, [handleShowModal])

  const handleNewVote = useCallback(() => {
    handleShowModal('newVote')
  }, [handleShowModal])

  const handleHideModal = useCallback(() => {
    setModalVisible(false)
  }, [])

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
                    {account && !voterStatus.loading && (
                      <Button
                        mode="normal"
                        onClick={() =>
                          setModalMode(
                            voter?.representative
                              ? handleRevokeDelegation
                              : handleDelegate
                          )
                        }
                        label={
                          voter?.representative
                            ? 'Revoke Delegation'
                            : 'Vote Delegation'
                        }
                        icon={<IconToken />}
                        display={compactMode ? 'icon' : 'label'}
                        css={`
                          margin-right: ${1 * GU}px;
                        `}
                      />
                    )}
                    <Button
                      mode="strong"
                      onClick={handleNewVote}
                      label="New vote"
                      icon={<IconPlus />}
                      display={compactMode ? 'icon' : 'label'}
                    />
                  </>
                )
              }
            />
            <Tabs
              items={TAB_ITEMS(account)}
              onChange={setSelectedTab}
              selected={selectedTab}
            />
            {selectedTab === 0 ? (
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
                handleVoteDateRangeFilterChange={
                  handleVoteDateRangeFilterChange
                }
                handleClearFilters={handleClearFilters}
              />
            ) : (
              account && <DelegatedBy />
            )}
          </React.Fragment>
        )}
      </React.Fragment>
      <MultiModal
        visible={modalVisible}
        onClose={handleHideModal}
        onClosed={() => setModalMode(null)}
      >
        {modalMode === 'delegate' && <DelegateVotingScreens />}
        {modalMode === 'revoke' && <RevokeDelegationScreens />}
        {modalMode === 'newVote' && <CreateVoteScreens />}
      </MultiModal>
    </Main>
  )
})

export default () => (
  <SettingsProvider>
    <App />
  </SettingsProvider>
)
